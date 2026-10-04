# Qbag Application Documentation

> Documentation of the implementation currently present in this repository. It describes observed behavior rather than intended future behavior.

## 1. Application overview

Qbag is a web application for uploading, reviewing, searching, and viewing university exam-question images. It has a React single-page frontend and a FastAPI backend backed by PostgreSQL.

The platform supports:

- User registration, login, JWT-based authentication, and profiles.
- Authenticated image uploads with university/course metadata.
- Pending and approved moderation workflows.
- A free single-question search and a coin-priced premium search.
- Expiring coin packages, transactions, and time-limited search purchases.
- Screenshot capture, crop selection, and OCR text extraction.
- Pricing, purchase history, coin balance, and transaction views.
- An admin panel for moderation, bulk OCR import, users, coins, statistics, and backups.

## 2. Repository layout

```text
backend/
  alembic/versions/       Database migrations
  app/
    config/               Coin and business configuration
    controllers/          Request parsing/controller orchestration
    core/                 Settings
    models/               SQLAlchemy models
    routers/              FastAPI HTTP endpoints
    schemas/              Pydantic schemas
    services/             Coin, OCR, expiration, scheduling
    main.py               FastAPI application
    database.py           Database engine/session
    dependencies.py       Authentication dependencies
frontend/
  src/
    api/                  Shared Axios client
    components/           Layout, ads, timer, screenshot/OCR UI
    contexts/             Authentication context
    layouts/              Main shell
    pages/                Route-level screens
  vite.config.js          Dev proxy/build configuration
.github/workflows/deploy.yml
backend/Dockerfile
backend/docker-compose.yml
```

`backend/env/` is a local Python virtual environment, not application source. Generated uploads, backups, and other runtime data are not source artifacts.

## 3. Technology stack

### Frontend

- React 18 with Vite and React Router.
- Axios for HTTP requests.
- CSS and browser media capture/canvas APIs.
- `html2canvas` is listed for image composition.

### Backend

- Python and FastAPI.
- SQLAlchemy ORM with PostgreSQL/psycopg.
- Pydantic schemas and JWT-style bearer tokens.
- `passlib`/`bcrypt` for password hashing.
- Google Generative AI (`google-generativeai`) for OCR.
- APScheduler for expiration and Alembic for migrations.

## 4. Runtime architecture

The browser loads the React SPA. The Axios client points to a configurable API base and, in local development, Vite proxies API requests to FastAPI. FastAPI validates requests, applies authentication/admin guards, and delegates substantial behavior to services and controllers.

Controllers/services use synchronous SQLAlchemy sessions even where handlers are declared `async`. PostgreSQL stores users, questions, images, coin packages, transactions, purchases, and result snapshots. Images are written to the backend `uploads/` directory and exposed through `/uploads/{filename}`.

The scheduler periodically expires coin packages and search purchases. Some operations also update expiration lazily.

## 5. Frontend pages

| Route | Page | Purpose |
|---|---|---|
| `/` | Home | Search approved questions, display a free result, link to premium/upload. |
| `/premium` | PremiumSearch | Choose metadata, preview coin cost, purchase a search. |
| `/premium/search` | PremiumQuestions | View purchases and open purchased result sets. |
| `/upload` | UploadQuestion | Upload images with metadata; handle pending/duplicates. |
| `/user` | Auth | Register or log in. |
| `/profile` | Profile | Profile, coin summary, packages, and transactions. |
| `/pricing` | Pricing | Present coin packages and recharge options. |
| `/smg998-1030/admin` | AdminPanel | Moderation, import, users, coins, stats, backups. |

The admin route is a UI convention, not sufficient security; server-side admin guards are authoritative.

Shared UI includes navbar, responsive layout, ad banner, countdown timer, login UI, and floating screenshot controls. The screenshot modal uses `getDisplayMedia`, canvas cropping, OCR, clipboard support, zoom, and keyboard shortcuts.

## 6. Authentication and authorization

Registration accepts username, email, and password. Passwords are hashed and login returns a bearer token plus user information. The frontend stores its session in browser storage and adds `Authorization: Bearer <token>` to protected calls. `AuthContext` restores the user through `/user/is_auth`.

Principal endpoints:

- `POST /user/registar` - register (existing spelling).
- `POST /user/login` - authenticate.
- `GET /user/is_auth` - validate token and return current user.
- `GET /user/me` - return current user.

Admin routes use a `/smg998-1030` prefix and server-side admin validation. The frontend also embeds this path in admin calls, so deployment proxies must preserve it.

## 7. Question lifecycle

1. An authenticated user selects university, subject, course, year, semester, and exam type.
2. Images are submitted to `POST /upload_file/`.
3. Files are validated/saved and a `Question` plus `QuestionImage` records are created.
4. New normal uploads start with `pending` status.
5. An admin reviews, optionally edits, then approves or rejects them.
6. Approved questions become available to search.
7. Rejection records a reason; deletion removes database content and image files.
8. Bulk admin import OCRs images, groups recognized questions, optionally skips duplicate hashes, and reports per-file results.

## 8. HTTP API reference

### User and upload

| Method and path | Auth | Description |
|---|---|---|
| `POST /user/registar` | No | Create account; returns user data with HTTP 201. |
| `POST /user/login` | No | Validate credentials and return token/user. |
| `GET /user/is_auth` | Bearer | Validate session and return user. |
| `GET /user/me` | Bearer | Return current user/profile. |
| `POST /upload_file/` | Bearer | Multipart metadata plus repeated `files`; creates pending content, detects duplicates, and may return HTTP 409. |

Upload metadata fields are `university`, `subject`, `course`, `year`, `semester`, and `exam_type`. The page also permits locally adding previously unseen option values.

### Search and catalog

| Method and path | Auth | Description |
|---|---|---|
| `GET /fetch/question` | No | Free search; returns one approved question/image using optional filters. |
| `GET /fetch/premium_question` | No in router | Flatten approved images with optional filters; returns 404 when empty. |
| `GET /fetch/subjects/{university}` | No | Subjects for a university. |
| `GET /fetch/years/{university}/{subject}` | No | Approved years for university/subject. |
| `GET /fetch/semesters/{university}/{subject}` | No | Approved semesters. |
| `GET /fetch/exam_types/{university}/{subject}` | No | Approved exam types. |
| `GET /fetch/upload/universities` | No | Distinct university values. |
| `GET /fetch/upload/subjects` | No | Distinct subjects. |
| `GET /fetch/upload/courses` | No | Distinct courses. |
| `GET /fetch/upload/semesters` | No | Distinct semesters. |
| `GET /fetch/upload/exam_types` | No | Distinct exam types. |
| `GET /fetch/upload/years` | No | Distinct years. |

## 9. Coins and premium searches

Premium prices are configured in `backend/app/config/coin_config.py` by exam type. Unknown/missing exam types default to the configured quiz price. The UI labels package amounts in Bangladeshi Taka.

- Packages contain a grant, validity period, remaining balance, and active state.
- Transactions record additions/deductions, type, description, and relevant package.
- Deduction consumes active, unexpired packages ordered by earliest expiry.
- A package becomes inactive at zero balance or expiration.
- A search finds approved questions matching university and subject plus optional filters.
- Each question costs its exam-type price; coins are deducted and a time-limited purchase is created.
- A background task snapshots matching questions and schedules expiration.
- Purchase history exposes remaining seconds, hours, and days.

| Method and path | Auth | Description |
|---|---|---|
| `GET /premium-search/coins` | Bearer | Total and package-level balance. |
| `GET /premium-search/pricing` | Public | Coin package definitions. |
| `POST /premium-search/recharge` | Bearer | Credit a package; no payment gateway is integrated. |
| `POST /premium-search/search` | Bearer | Search, price, deduct, and create a purchase. |
| `GET /premium-search/purchases` | Bearer | Purchases and remaining access time. |
| `GET /premium-search/purchases/{purchase_id}` | Bearer | Owned, unexpired results. |
| `POST /premium-search/coins/check-expiry` | Bearer | Schedule expiration processing. |

## 10. OCR and screenshot workflow

The upload page can capture a display with `getDisplayMedia`, select a video frame, and render it as a high-resolution PNG data URL. The user zooms and drags a crop rectangle; the backend charges the configured OCR coin cost, calls the configured generative model, and returns recognized text plus coins spent. The UI displays/copies the result.

Keyboard shortcuts include Escape to close, Enter to crop, `P` to toggle preview, and `+`/`-`/`0` for zoom. OCR endpoints under `/ocr` require authentication. Admin bulk import uses a separate upload pipeline with OCR and duplicate handling.

## 11. Data model

| Table/model | Purpose |
|---|---|
| `user_table` / `UserModel` | Identity, contact data, password hash, admin/balance state, timestamps. |
| `questions` / `Question` | Academic metadata, moderation status/reason, timestamps, image relationship. |
| `question_images` / `QuestionImage` | Stored filename/path, MIME data, question relationship. |
| `coin_transactions` / `CoinTransaction` | Coin ledger, amount/type/description, package/user references. |
| `user_coin_packages` / `UserCoinPackage` | Granted/remaining coins, activation, purchase/expiry dates. |
| `search_purchases` / `SearchPurchase` | Criteria, count, coins spent, status, purchase/expiry dates. |
| `search_results` / `SearchResult` | Purchase/question snapshot association. |

Alembic owns schema versioning. Use `alembic upgrade head`; do not assume a recreated development database is equivalent to migrated production state.



## 12. Administration

The admin panel supports:

- Listing/filtering questions and reviewing pending content.
- Editing metadata, approving, rejecting with a reason, and deleting questions/files.
- Bulk uploading up to 100 PNG/JPEG/WEBP files, each at most 10 MB, with OCR and optional duplicate skipping.
- Listing/searching users and viewing balances.
- Adding standard or custom coins and deducting user coins.
- Dashboard totals for users, questions/statuses, and coins.
- Creating, listing, downloading, and deleting PostgreSQL backups.

Admin calls use multipart forms in several workflows. Backup and bulk operations are privileged and should be restricted to trusted operators.

## 13. Health, deployment, and maintenance

The health router provides an unauthenticated service/database-oriented health response. FastAPI exposes interactive API documentation while development docs are enabled.

`.github/workflows/deploy.yml` builds/publishes the backend container for deployment. Production must provide PostgreSQL connectivity, secrets, OCR credentials, persistent upload/backup storage, and correct CORS/API origin settings. Stateless API scaling is limited by local image and backup files unless shared persistent storage is supplied.

Scheduled expiration requires the API process/scheduler to be running. A multi-worker deployment should account for duplicate scheduler execution unless job coordination is changed.

## 14. Configuration and secrets

Backend settings cover database connectivity, authentication/security values, paths, OCR, and CORS. Frontend Vite variables control the API base and build-time behavior. Never put secrets in source, documentation, or browser bundles.

Operational configuration includes:

- PostgreSQL `DATABASE_URL` and database credentials.
- JWT/security secret and authentication settings.
- Frontend API origin/development proxy.
- Google Generative AI API key/model configuration for OCR.
- Upload, backup, and allowed-origin settings.

Exact names are defined by `backend/app/core/settings.py`, Alembic configuration, `frontend/vite.config.js`, and `frontend/src/api/client.js`. Keep local environment files untracked and inject deployment secrets securely.

## 15. Local development

Backend, from `c:\Users\User\OneDrive\Desktop\Qbag\backend`:

```bat
python -m venv env
env\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Run Alembic from the backend directory. FastAPI's `/docs` and `/redoc` provide interactive API documentation in development.

Frontend, from `c:\Users\User\OneDrive\Desktop\Qbag\frontend`:

```bat
npm install
npm run dev
npm run build
npm run preview
```

Vite serves the SPA and proxies configured API traffic. `npm run build` creates the production bundle. Docker assets are in `backend/Dockerfile` and `backend/docker-compose.yml`; provide secrets before `docker compose up`.

## 16. Validation

Before deployment, validate at minimum:

1. `alembic upgrade head` against empty and representative databases.
2. Startup/docs, health, registration, login, and token-protected profile calls.
3. Representative uploads, duplicates, rejection, and moderation approval.
4. Recharge, earliest-expiry deduction, insufficient balance, OCR charge, purchase expiry, and ownership isolation.
5. Admin authorization, bulk limits, backup restoration, and file deletion.
6. `npm run build` plus browser checks for routes, responsiveness, token expiry, and capture denial.
7. CORS, proxy, persistent volumes, scheduler behavior, and production secrets.

No dedicated first-party automated test suite was identified during this review.

## 17. Implementation notes and operational risks

Observed characteristics, not proposed changes:

- Browser-stored bearer tokens have normal theft/XSS impact.
- `GET /fetch/premium_question` has no router-level authentication dependency.
- Some catalog routes use all questions while final search only accepts approved records.
- Recharge credits coins locally; it is not a verified payment flow.
- OCR depends on external Google service availability and credentials.
- Local image/backup paths limit horizontal scaling without shared storage.
- Expiration is scheduler-driven and partly lazy; stopping all API processes delays changes.
- Async handlers call synchronous database/external-service code and require concurrency testing.
- Legacy route spellings/paths such as `registar` are part of the client contract.
- The admin URL segment is not an authorization mechanism; server guards must remain authoritative.
- Commented route implementations exist; active decorators define the API.
- Backend validation must remain authoritative despite frontend checks.
- App-created backups contain sensitive data and require tested restore procedures.

## 18. Source-of-truth files

- Backend startup/configuration: `backend/app/main.py`, `core/settings.py`, `database.py`.
- Domain model/schema: `backend/app/models/models.py`, `schemas/schemas.py`.
- Business logic: `backend/app/services/`.
- HTTP API: `backend/app/routers/`.
- Frontend routing/state/API: `frontend/src/App.jsx`, `contexts/AuthContext.jsx`, `api/client.js`.
- Workflows: `frontend/src/pages/` and `frontend/src/components/`.
- Dependencies/build: `backend/requirements.txt`, `frontend/package.json`, `frontend/vite.config.js`.
- Container/deployment: `backend/Dockerfile`, `backend/docker-compose.yml`, `.github/workflows/deploy.yml`.

