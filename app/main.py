from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from . import database, models, schemas, crud
from .database import engine, get_db, SessionLocal, Base

# -------------------------------------------------
# CREATE DATABASE TABLES
# -------------------------------------------------
Base.metadata.create_all(bind=engine)

app = FastAPI()

# -------------------------------------------------
# CORS (allow React to call FastAPI)
# -------------------------------------------------
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


# ---------- AUTH DEPENDENCY ----------
from fastapi import Request

def get_current_user(request: Request, db: Session = Depends(get_db)):
    user_id = request.headers.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        user_id = int(user_id)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid user_id")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


# ---------- OPTIONAL: SEED INITIAL TENANTS + DEMO USERS ----------

def seed_initial_data():
    db = SessionLocal()
    try:
        # Tenants
        tenants_seed = [
            ("Home Depot", "home_depot", "#F96302"),
            ("Walmart", "walmart", "#0071CE"),
            ("Target", "target", "#CC0000"),
        ]

        for name, code, color in tenants_seed:
            tenant = crud.get_tenant_by_code(db, code)
            if not tenant:
                crud.create_tenant(db, name=name, code=code, primary_color=color)

        # Demo password — short & safe for bcrypt/argon
        DEMO_PASSWORD = "pass1234"

        # Simple demo users
        demo_users = [
            ("Home Depot Rep", "rep@homedepot.com", "home_depot"),
            ("Walmart Rep", "rep@walmart.com", "walmart"),
            ("Target Rep", "rep@target.com", "target"),
        ]

        for full_name, email, tenant_code in demo_users:
            existing = crud.get_user_by_email(db, email)
            if existing:
                continue

            user_create = schemas.UserCreate(
                full_name=full_name,
                email=email,
                password=DEMO_PASSWORD,
                role="rep",
                tenant_code=tenant_code,
            )

            hashed_pw = pwd_context.hash(DEMO_PASSWORD)
            crud.create_user(db, user_create, hashed_pw)

    finally:
        db.close()


# You *could* call this on startup if you want:
# seed_initial_data()


# -------------------------------------------------
# ROOT
# -------------------------------------------------
@app.get("/")
def root():
    return {"message": "CRM backend running with multitenancy!"}


# -------------------------------------------------
# AUTH / LOGIN
# -------------------------------------------------
@app.post("/auth/login", response_model=schemas.LoginResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    # Debug log so we see exactly what's coming from frontend
    print("LOGIN PAYLOAD:", payload.dict())

    user = crud.get_user_by_email(db, payload.email)
    if not user or not pwd_context.verify(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Grab tenant from relationship (superadmin should still have master tenant)
    tenant = user.tenant

    # SUPERADMIN: bypass tenant_code matching, but still return its tenant row
    if user.role == "superadmin":
        if not tenant:
            raise HTTPException(status_code=500, detail="Superadmin has no tenant assigned")
        return schemas.LoginResponse(user=user, tenant=tenant)

    # Normal users must have a tenant
    if not tenant:
        raise HTTPException(status_code=400, detail="User has no tenant assigned")

    # Normal users must match selected tenant_code
    if not payload.tenant_code:
        raise HTTPException(status_code=400, detail="Tenant code is required for this user")

    if payload.tenant_code != tenant.code:
        raise HTTPException(status_code=401, detail="Invalid tenant selected")

    return schemas.LoginResponse(user=user, tenant=tenant)


# -------------------------------------------------
# USERS
# -------------------------------------------------
@app.post("/users/", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "superadmin":
        raise HTTPException(status_code=403, detail="Only superadmin can create users")

    hashed_pw = pwd_context.hash(user.password)
    db_user = crud.create_user(db, user, hashed_pw)
    return db_user

@app.get("/users/", response_model=List[schemas.UserOut])
def list_users(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "superadmin":
        raise HTTPException(status_code=403, detail="Only superadmin can list users")

    return crud.get_all_users(db)
# -------------------------------------------------
# TENANTS (Needed for Admin Dashboard)
# -------------------------------------------------

@app.get("/tenants", response_model=List[schemas.TenantOut])
def list_tenants(db: Session = Depends(get_db)):
    return crud.get_all_tenants(db)


@app.post("/tenants", response_model=schemas.TenantOut)
def create_tenant(tenant: schemas.TenantCreate, db: Session = Depends(get_db)):
    # Check if tenant code already exists
    existing = crud.get_tenant_by_code(db, tenant.code)
    if existing:
        raise HTTPException(status_code=400, detail=f"Tenant with code '{tenant.code}' already exists")
    
    db_tenant = crud.create_tenant(db, tenant.name, tenant.code, tenant.primary_color)
    return db_tenant



# -------------------------------------------------
# LEGACY CUSTOMERS (your original CRM screen)
# -------------------------------------------------
@app.post("/customers/", response_model=schemas.CustomerOut)
def add_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    """
    Add a new customer/contact to the tenant's CRM.
    """
    tenant_code = customer.tenant_code
    if not tenant_code:
        raise HTTPException(status_code=400, detail="tenant_code is required")
    
    tenant = crud.get_tenant_by_code(db, tenant_code)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    return crud.create_customer(db, customer, tenant)


@app.get("/customers/", response_model=List[schemas.CustomerOut])
def get_customers(tenant_code: str, db: Session = Depends(get_db)):
    """
    Fetch ALL customers that belong ONLY to this tenant.
    """
    tenant = crud.get_tenant_by_code(db, tenant_code)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    return crud.get_customers(db, tenant)

# -------------------------------------------------
# CONTACTS
# -------------------------------------------------
@app.post("/contacts/", response_model=schemas.ContactOut)
def create_contact(contact: schemas.ContactCreate, db: Session = Depends(get_db)):
    tenant_code = contact.tenant_code or "home_depot"
    tenant = crud.get_tenant_by_code(db, tenant_code)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    db_contact = crud.create_contact(db, contact, tenant=tenant)
    return crud.contact_to_contact_out(db_contact)


@app.get("/contacts/", response_model=List[schemas.ContactOut])
def list_contacts(
    tenant_code: str = "home_depot",
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    tenant = crud.get_tenant_by_code(db, tenant_code)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    contacts = crud.list_contacts(db, tenant=tenant, search=search)
    return [crud.contact_to_contact_out(c) for c in contacts]


@app.get("/contacts/{contact_id}", response_model=schemas.ContactOut)
def get_contact(
    contact_id: int,
    tenant_code: str = "home_depot",
    db: Session = Depends(get_db),
):
    tenant = crud.get_tenant_by_code(db, tenant_code)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    contact = crud.get_contact(db, contact_id, tenant=tenant)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    return crud.contact_to_contact_out(contact)
