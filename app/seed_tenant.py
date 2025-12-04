from app.database import SessionLocal
from app import models

db = SessionLocal()

def seed_tenants():
    tenants = [
        ("Home Depot", "home_depot", "#F96302"),
        ("Walmart", "walmart", "#0071CE"),
        ("Target", "target", "#CC0000"),
    ]

    for name, code, color in tenants:
        existing = db.query(models.Tenant).filter_by(code=code).first()
        if existing:
            print(f"Tenant already exists: {name}")
            continue
        
        tenant = models.Tenant(
            name=name,
            code=code,
            primary_color=color
        )
        db.add(tenant)

    db.commit()
    print("Tenants seeded successfully!")

if __name__ == "__main__":
    seed_tenants()
