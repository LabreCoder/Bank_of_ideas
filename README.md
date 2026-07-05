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

The system is split into three core areas:

- 💡 **Ideas** — register, edit, and activate/deactivate content ideas as they come to mind.
- 🗂️ **Planning** — organize ideas into content plans, giving structure to what gets published and when.
- 📊 **Dashboard** — track key indicators at a glance, with a calendar view showing which posts are coming up.

---

## ✨ Features

- ✅ Full CRUD for ideas (create, edit, activate/deactivate)
- ✅ Assign ideas to existing content plans
- ✅ Calendar view of scheduled posts
- ✅ Indicator widgets on the dashboard
- ✅ Fully containerized (API + database + frontend) with a single command
- 🚧 More indicators and reporting features — *in progress*

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

```
.
├── backend
│   └── app
│       ├── database     # DB connection setup
│       ├── models       # Pydantic schemas
│       ├── routes       # API endpoints
│       └── services     # Business logic / data access
├── database
│   ├── schema.sql       # Table definitions
│   └── seeds.sql        # Initial seed data
├── frontend
│   └── src
│       ├── components   # Reusable UI pieces (Sidebar, etc.)
│       ├── layouts       # Shared page layout
│       ├── pages         # Dashboard, Ideas, Planning, Settings
│       └── router        # Route definitions
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

> These are illustrative examples of how the Ideas endpoints are consumed. Refer to `/docs` for the full, up-to-date contract.

**Create a new idea**

```bash
curl -X POST http://localhost:8000/ideas \
  -H "Content-Type: application/json" \
  -d '{
    "title": "5 tips for organizing a home office",
    "description": "Short-form post with practical setup tips",
    "category_id": 2
  }'
```

**List all active ideas**

```bash
curl http://localhost:8000/ideas?active=true
```

**Toggle an idea's active status**

```bash
curl -X PATCH http://localhost:8000/ideas/14/toggle-active
```

---

## 🗺️ Roadmap

- [ ] Rich dashboard indicators (posts per category, completion rate, etc.)
- [ ] Drag-and-drop calendar for rescheduling posts
- [ ] Multi-user support with authentication
- [ ] Notifications for upcoming post deadlines

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