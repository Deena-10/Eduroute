# Migration: MySQL → PostgreSQL

This project has been migrated from MySQL to PostgreSQL.

## Summary of Changes

### Node.js Backend
- **Config:** `backend/config/postgres.js` - PostgreSQL connection using `pg`
- **Packages:** Replaced `mysql2` with `pg` in `backend/package.json`
- **All routes/controllers** now use PostgreSQL with `$1`, `$2` parameter placeholders

### Python AI Service
- **DB module:** `backend/service/db_postgres.py` - uses `psycopg2-binary`
- **Packages:** Replaced `mysql-connector-python` with `psycopg2-binary` in `backend/service/requirements.txt`
- **Imports:** `application.py`, `events.py`, `projects.py` now use `db_postgres`

### Database
- **Schema:** `database/schema_postgres.sql` - full PostgreSQL schema
- **Setup script:** `backend/setup-database-postgres.js`
- **Test user:** `backend/create-test-user-postgres.js`

## Setup Instructions

### 1. Install PostgreSQL
- Download and install PostgreSQL from https://www.postgresql.org/
- Default port: 5432

### 2. Create Database
```bash
# Using psql or pgAdmin
createdb edurouteai
createdb career_roadmap   # For Python AI service
```

Or run the setup script:
```bash
cd backend
npm install
node setup-database-postgres.js
```

### 3. Environment Variables

**Backend (.env):**
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_postgres_password
DB_NAME=edurouteai
```

**Python AI Service (backend/service/.env):**
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=career_roadmap
```

**Note:** Node backend uses `edurouteai`, Python service uses `career_roadmap` by default. You can use the same database if desired.

### 4. Install Dependencies
```bash
# Node.js
cd backend && npm install

# Python
cd backend/service && pip install -r requirements.txt
```

### 5. Create Test User (optional)
```bash
cd backend
node create-test-user-postgres.js
```

## Running the Application
```bash
# Start backend
cd backend && npm start

# Start AI service (separate terminal)
cd backend/service && python application.py
```

## Data Migration (if migrating existing MySQL data)
Use tools like `pgloader` or manual export/import:
```bash
# Example with pgloader
pgloader mysql://user:pass@localhost/edurouteai postgresql://user:pass@localhost/edurouteai
```
