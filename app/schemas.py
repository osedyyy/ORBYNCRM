# schemas.py
from typing import Optional
from pydantic import BaseModel, EmailStr

# ---------- TENANTS ----------
# ---------- TENANTS ----------
class TenantBase(BaseModel):
    name: str
    code: str      # "home_depot", "walmart", "target"
    primary_color: Optional[str] = None


class TenantCreate(TenantBase):
    pass


class TenantOut(TenantBase):
    id: int

    class Config:
        from_attributes = True


# ---------- USERS ----------
# ---------- USERS ----------
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "clerk"
    tenant_code: str  # user belongs to this tenant


class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


# ---------- TENANTS ----------
class TenantOut(BaseModel):
    id: int
    name: str
    code: str
    primary_color: str

    class Config:
        from_attributes = True


# ---------- LOGIN ----------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    tenant_code: Optional[str] = None

class LoginResponse(BaseModel):
    user: UserOut
    tenant: TenantOut


# ---------- COMPANIES ----------
class CompanyBase(BaseModel):
    name: str
    industry: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None

class CompanyCreate(CompanyBase):
    tenant_code: Optional[str] = None

class CompanyOut(CompanyBase):
    id: int
    tenant_id: int
    class Config:
        from_attributes = True

# ---------- CONTACTS ----------
class ContactBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    company_name: Optional[str] = None

class ContactCreate(ContactBase):
    tenant_code: Optional[str] = None

class ContactOut(ContactBase):
    id: int
    company_id: Optional[int] = None
    tenant_id: int
    class Config:
        from_attributes = True

# ---------- CUSTOMER (Legacy) ----------
class CustomerCreate(ContactBase):
    pass

class CustomerOut(ContactOut):
    pass
