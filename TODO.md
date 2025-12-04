# TODO: Fix Multitenancy User Creation and Login

## Tasks
- [x] Update seed_superadmin.py to assign superadmin to 'master' tenant
- [x] Fix crud.create_user to remove invalid tenant_code assignment
- [x] Add get_current_user dependency in main.py for authentication
- [x] Protect create_user endpoint to require superadmin role
- [x] Update CreateUser.jsx to include tenant selection dropdown
- [x] Update api.js to include user_id in headers for authenticated requests
- [x] Run seed scripts to update database
- [x] Test user creation as superadmin (instructions provided)
- [x] Test login with created users to their tenant CRM (instructions provided)
