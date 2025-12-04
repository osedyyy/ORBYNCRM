from app.database import SessionLocal
from app import models, crud
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
db = SessionLocal()

def seed_superadmin():
    existing = db.query(models.User).filter_by(email="admin@crm.com").first()
    if existing:
        print("Superadmin already exists.")
        return

    # Get the master tenant
    master_tenant = crud.get_tenant_by_code(db, "master")
    if not master_tenant:
        print("Master tenant not found. Please run seed_master.py first.")
        return

    hashed_pw = pwd_context.hash("admin123")

    super_admin = models.User(
        full_name="System Admin",
        email="admin@crm.com",
        password_hash=hashed_pw,
        role="superadmin",
        tenant_id=master_tenant.id
    )

    db.add(super_admin)
    db.commit()
    print("Superadmin created successfully!")

if __name__ == "__main__":
    seed_superadmin()
