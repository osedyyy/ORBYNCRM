from app.database import SessionLocal
from app import models

db = SessionLocal()

# 1. Create MASTER tenant
master = models.Tenant(name="Master Admin", code="master")
db.add(master)
db.commit()
db.refresh(master)

print("Created MASTER tenant:", master.id)
