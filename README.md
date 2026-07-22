# Sabzi Mandi ERP

A bilingual English/Urdu ERP built with React, TypeScript, Tailwind CSS, Django REST Framework, PostgreSQL, Redis, and Docker.

## Included modules

- JWT authentication
- English/Urdu language switching
- RTL/LTR layout
- Dashboard
- Clients
- Purchases / Sorting
- Recovery ledger
- Inventory
- Expenses
- Reports
- Users and roles foundation
- Audit-ready backend structure

## Quick start with Docker

```bash
cp .env.example .env
docker compose up --build
```

Open:

- Frontend: http://localhost:5173
- API: http://localhost:8000/api/
- Admin: http://localhost:8000/admin/
- API docs: http://localhost:8000/api/docs/

Create an admin user:

```bash
docker compose exec backend python manage.py createsuperuser
```

## Default demo credentials

After migrations, create a superuser using the command above.

## Manual development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## GitHub push

```bash
git init
git remote add origin git@github.com:maroofsangi/erp_project_sabzi.git
git add .
git commit -m "Initial full ERP MVP"
git branch -M main
git push -u origin main
```
