# crud.py
from typing import List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session
from . import models, schemas

# ---------- TENANTS ----------
def get_tenant_by_code(db: Session, code: str):
    return db.query(models.Tenant).filter(models.Tenant.code == code).first()

def get_all_tenants(db: Session):
    return db.query(models.Tenant).all()

def create_tenant(db: Session, name: str, code: str, primary_color: str = None):
    db_tenant = models.Tenant(name=name, code=code, primary_color=primary_color)
    db.add(db_tenant)
    db.commit()
    db.refresh(db_tenant)
    return db_tenant

# ---------- USERS ----------
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_all_users(db: Session):
    return db.query(models.User).all()

def create_user(db: Session, user: schemas.UserCreate, password_hash: str):
    tenant = get_tenant_by_code(db, user.tenant_code)
    if not tenant:
        raise ValueError(f"Tenant with code '{user.tenant_code}' not found")

    db_user = models.User(
        full_name=user.full_name,
        email=user.email,
        password_hash=password_hash,
        role=user.role,
        tenant_id=tenant.id
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# ---------- COMPANIES ----------
def get_or_create_company(db, company_name, tenant):
    if not company_name:
        return None

    company = (
        db.query(models.Company)
        .filter(models.Company.name == company_name,
                models.Company.tenant_id == tenant.id)
        .first()
    )

    if company:
        return company

    company = models.Company(
        name=company_name,
        tenant_id=tenant.id,
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company

def create_company(db: Session, company_in: schemas.CompanyCreate, tenant):
    company = models.Company(
        name=company_in.name,
        industry=company_in.industry,
        website=company_in.website,
        address=company_in.address,
        tenant_id=tenant.id,
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company

def list_companies(db: Session, tenant):
    return (
        db.query(models.Company)
        .filter(models.Company.tenant_id == tenant.id)
        .order_by(models.Company.name)
        .all()
    )

# ---------- CONTACTS ----------
def create_contact(db: Session, contact_in: schemas.ContactCreate, tenant):
    company = get_or_create_company(db, contact_in.company_name, tenant)

    contact = models.Contact(
        name=contact_in.name,
        email=contact_in.email,
        phone=contact_in.phone,
        address=contact_in.address,
        company_id=company.id if company else None,
        tenant_id=tenant.id,
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact

def list_contacts(db: Session, tenant, search: Optional[str] = None):
    query = db.query(models.Contact).filter(models.Contact.tenant_id == tenant.id)
    query = query.outerjoin(models.Company)

    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(
                models.Contact.name.ilike(like),
                models.Contact.email.ilike(like),
                models.Contact.phone.ilike(like),
                models.Company.name.ilike(like),
            )
        )

    return query.order_by(models.Contact.created_at.desc()).all()

# ---------- SHAPER ----------
def contact_to_contact_out(contact):
    company_name = contact.company.name if contact.company else None
    return schemas.ContactOut(
        id=contact.id,
        name=contact.name,
        email=contact.email,
        phone=contact.phone,
        address=contact.address,
        company_name=company_name,
        company_id=contact.company_id,
        tenant_id=contact.tenant_id,
    )

# ---------- CUSTOMER (Legacy) ----------
def create_customer(db: Session, customer_in: schemas.CustomerCreate, tenant):
    customer_dict = customer_in.dict()
    if not customer_dict.get('tenant_code'):
        customer_dict['tenant_code'] = tenant.code
    
    contact_in = schemas.ContactCreate(**customer_dict)
    contact = create_contact(db, contact_in, tenant)
    return contact_to_contact_out(contact)

def get_customers(db: Session, tenant):
    contacts = list_contacts(db, tenant)
    return [contact_to_contact_out(c) for c in contacts]
