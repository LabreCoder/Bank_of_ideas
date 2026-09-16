<div align="center">

# 📅 Content Planner

**A self-hosted content planning system — from idea to scheduled post.**

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

</div>

---

## 📖 About

**Content Planner** helps you organize the full lifecycle of content creation — from a raw idea to a scheduled post — in one place. It was built to solve a simple problem: ideas get lost in notes apps, spreadsheets get outdated, and nobody remembers what's due for publishing this week.

The system is split into four core areas:

- 💡 **Ideas** — register, edit, and activate/deactivate raw content ideas as they come to mind.
- 🗂️ **Planning** — turn an idea into an actionable plan: details, dates, status, and a checklist (each item with its own optional due date).
- 🔄 **Cycles** — group several plannings under a shared time window (e.g. "August LinkedIn posts") to plan and track batches of content without conflicts or overload.
- 📊 **Dashboard** — indicator cards (ideas, execution status, plannings by status, checklist progress) plus a calendar highlighting upcoming due dates.

---

## ✨ Features

- ✅ Full CRUD for ideas (create, edit, activate/deactivate)
- ✅ Categories and Owners management (Settings)
- ✅ One planning per idea, with details, start/due dates, status (`Not Started`, `Under Review`, `Started`, `In Development`, `Completed`, `Cancelled`), and a checklist with per-item due dates
- ✅ Cycles: bind multiple plannings to a shared date range, with an automatically derived status (`Waiting Start` / `In Progress` / `Finished`) and progress tracking
- ✅ Dashboard with summary indicators and a due-date calendar
- ✅ Light / dark theme toggle
- ✅ Optional ambient sound player
- ✅ Fully containerized (API + database + frontend) with a single command

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python · FastAPI · Pydantic · Uvicorn |
| **Database** | PostgreSQL |
| **Frontend** | React · Vite · React Router · Tailwind CSS |
| **Infrastructure** | Docker · Docker Compose |

---

## 📂 Project Structure

```bash
.
├── backend
│   └── app
│       ├── database     # DB connection setup
│       ├── models       # SQLAlchemy models (idea, planning, checklist, cycle, category, owner)
│       ├── schemas      # Pydantic request/response schemas
│       ├── routes       # API endpoints
│       └── services     # Business logic / data access
├── database
│   ├── schema.sql       # Table definitions
│   └── seeds.sql        # Initial seed data
├── frontend
│   └── src
│       ├── components   # UI pieces, grouped by domain (Ideas, Planning, Cycle, Dashboard, Settings, ...)
│       ├── context      # Theme and ambient sound providers
│       ├── hooks        # Shared hooks (e.g. filters)
│       ├── layouts      # Shared page layout (Topbar, Sidebar)
│       ├── pages        # Dashboard, Ideas, Planning, Cycles, Settings
│       ├── router       # Route and navigation definitions
│       ├── services     # API clients, one per resource
│       └── utils        # Date/calendar helpers, shared status maps
└── docker-compose.yml
```

---

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose installed
- A `.env` file in the project root (see below)

### Environment variables

Create a `.env` file in the project root:

```env
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=content_planner
DB_HOST=your_host
DB_PORT=your_port
```

### Running the project

```bash
# Clone the repository
git clone https://github.com/LabreCoder/content-planner.git
cd content-planner

# Build and start all services (database, API, and frontend)
docker compose up --build
```

Once everything is up:

| Service | URL | Purpose |
|---|---|---|
| Frontend | http://localhost:5173 | The actual web app UI |
| API | http://localhost:8000 | Backend REST API |
| API Docs | http://localhost:8000/docs | Interactive Swagger UI |

---

## 📡 API Examples

> These are illustrative examples of how the Ideas endpoints are consumed. Refer to `/docs` for the full, up-to-date contract across all resources (Ideas, Planning, Cycles, Categories, Owners).

**Create a new idea**

```bash
curl -X POST http://localhost:8000/ideas/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "5 tips for organizing a home office",
    "description": "Short-form post with practical setup tips",
    "category_id": 2,
    "owner_id": 1
  }'
```

**List all active ideas**

```bash
curl "http://localhost:8000/ideas/?active=true"
```

**Toggle an idea's active status**

```bash
curl -X PATCH http://localhost:8000/ideas/14/toggle-active
```

---

## 🗺️ Roadmap

- [ ] Drag-and-drop calendar for rescheduling posts
- [ ] Multi-user support with authentication
- [ ] Notifications for upcoming post deadlines
- [ ] Kanban view for Cycles (alternative to the current timeline view)

---

## 🤝 Contributing

This is currently a personal project, but suggestions and issues are welcome — feel free to open an issue or a pull request.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

<div align="center">

Made by [**LabreCoder**](https://github.com/LabreCoder)

</div>