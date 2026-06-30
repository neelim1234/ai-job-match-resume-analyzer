# AI Job Match & Resume Analyzer 

A **portfolio-grade full-stack application** that uses Google Gemini AI to analyze how well a resume matches a job description. Built with FastAPI, PostgreSQL, and React + TypeScript.

---

##  Features

- **JWT Authentication** — Register, login, protected routes
- **Resume Upload** — Upload PDF resumes with automatic text extraction via `pdfplumber`
- **Job Description Manager** — Save and manage job postings
- **AI Match Analysis** — Powered by Gemini 2.5 Flash:
  - Match score (0–100)
  - Strengths & weaknesses
  - Missing skills
  - ATS keywords to add
  - Actionable improvement suggestions
- **Analysis History** — View and revisit all past analyses
- **Clean Dark UI** — Premium React + TypeScript frontend

---

##  Project Structure

```
job_descriptor/
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/routes/       # auth, resumes, jobs, analyses
│   │   ├── core/             # config, database, security
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   └── services/         # business logic + AI
│   ├── alembic/              # DB migrations
│   ├── uploads/resumes/      # local PDF storage
│   ├── .env                  # environment variables
│   └── requirements.txt
└── frontend/                 # React + TypeScript (Vite)
    └── src/
        ├── api/              # Axios client
        ├── components/       # Navbar, ProtectedRoute
        ├── context/          # AuthContext
        ├── pages/            # all page components
        └── types/            # shared TS interfaces
```

---

##  Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI (Python 3.11+) |
| ORM | SQLAlchemy 2.0 (async) |
| Database | PostgreSQL |
| Migrations | Alembic |
| Auth | JWT (python-jose) + bcrypt |
| AI | Google Gemini 2.5 Flash |
| PDF Parsing | pdfplumber |
| Frontend | React 18 + TypeScript + Vite |
| State | TanStack React Query |
| HTTP | Axios |
| Styling | Vanilla CSS (custom design system) |

---

##  Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (running locally)
- A [Gemini API key](https://aistudio.google.com/app/apikey)

### 1. Clone & Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Copy env file and fill in values
cp .env.example .env
# Edit .env: set DATABASE_URL, SECRET_KEY, GEMINI_API_KEY
```

### 2. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE job_matcher;"

# Run migrations
alembic upgrade head
```

### 3. Start Backend

```bash
uvicorn app.main:app --port 8000 --reload
# API: http://127.0.0.1:8000
# Docs: http://127.0.0.1:8000/api/docs
```

### 4. Setup & Start Frontend

```bash
cd frontend
npm install
npm run dev
# App: http://localhost:5173
```

---

##  Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
DATABASE_URL=postgresql+asyncpg://postgres:<password>@localhost:5432/job_matcher
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GEMINI_API_KEY=your-gemini-api-key-here
UPLOAD_DIR=uploads/resumes
MAX_FILE_SIZE_MB=10
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Login, get JWT |
| `GET` | `/api/auth/me` | Current user |
| `POST` | `/api/resumes` | Upload PDF resume |
| `GET` | `/api/resumes` | List resumes |
| `DELETE` | `/api/resumes/{id}` | Delete resume |
| `POST` | `/api/jobs` | Save job description |
| `GET` | `/api/jobs` | List job descriptions |
| `DELETE` | `/api/jobs/{id}` | Delete job |
| `POST` | `/api/analyses` | Run AI analysis |
| `GET` | `/api/analyses` | Analysis history |
| `GET` | `/api/analyses/{id}` | Analysis detail |
| `DELETE` | `/api/analyses/{id}` | Delete analysis |

Full interactive docs at `/api/docs` (Swagger UI).

---

##  How the AI Analysis Works

1. User selects a saved resume + job description
2. Backend fetches both from the database
3. Resume text + job description are sent to **Gemini 2.5 Flash** with a structured prompt
4. Gemini returns a JSON object with score, strengths, gaps, and suggestions
5. The response is validated with Pydantic and saved to PostgreSQL
6. Frontend renders the result with a visual score gauge

---

##  Database Schema

```
users          — id, email, hashed_password, full_name, created_at
resumes        — id, user_id, file_name, file_path, parsed_text, label, created_at
job_descriptions — id, user_id, title, company, raw_text, created_at
analyses       — id, user_id, resume_id, job_description_id,
                 match_score, strengths, weaknesses, missing_skills,
                 improvement_suggestions, ats_keywords, ai_raw_response, created_at
```

---

##  Future Improvements (Phase 4+)

- [ ] Export analysis as PDF report
- [ ] Email notifications for analyses
- [ ] Cloud storage (AWS S3) for resumes
- [ ] Bulk upload multiple resumes
- [ ] Team/recruiter view
- [ ] Resume scoring trends over time

---


