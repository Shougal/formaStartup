# Forma
# Code is fully owned by repository owner - Shoug Alharbi

🚀 *From Students, For Students* – A UVA-exclusive service platform

[Live Demo on Heroku](https://forma-app-b1081cbc4d9c.herokuapp.com)

---

> 📢 **Public Notice**  
> This repository is public for demonstration and educational purposes.  
> 🧑‍💻 All coding and contributions are restricted to the repository owner.  
> 🔐 Pull requests from outside contributors will not be accepted.

---

## 🌐 How to Run Locally

### Backend (Django)
```bash
python -m venv env
source env/bin/activate  # or .\env\Scripts\activate on Windows
pip install -r ../requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend (React)
```bash
cd frontend
npm install
npm start
```

By default:
- Backend runs at `http://127.0.0.1:8000`
- Frontend runs at `http://localhost:3000`

Ensure CORS settings allow connections between the two.

---

## DevOps Report for Forma (Startup Project)

**Prepared by:** Shoug Alharbi  
**Business Partner:** Elisa Hu  
**Project Name:** Forma  
**Hosting:** [Heroku Deployment](https://forma-app-b1081cbc4d9c.herokuapp.com)

---

### Summary

As the sole developer of Forma, a service marketplace for UVA students, I adopted a DevOps approach focused on simplicity, reliability, and automation. Our stack includes Django (backend) and React (frontend), hosted on Heroku. For DevOps practices, I integrated GitHub Actions for CI pipelines, enabled branch protection rules to enforce quality gates, and added ESLint-based linting for JavaScript code quality. Although I am the only contributor, enforcing automated testing and code style checks ensures stability and scalability as the platform grows.

---

### Django

**What worked well:**
- Django's modular architecture and built-in admin interface made it easy to manage user roles, especially admin approval of providers.
- Django Rest Framework (DRF) allowed for quick API development.
- PostgreSQL integration on Heroku was seamless.

**Challenges:**
- Managing static files and CSRF protection across Django and React required middleware customization.

**Suggestions:**
- Future teams should modularize serializers and views early to maintain scalability.

---

### GitHub

**What worked well:**
- GitHub provided easy integration with Actions and served as the central place for managing issues, documentation, and version control.
- Branch protection rules ensured discipline even as a solo contributor.

**Challenges:**
- Setting up the new ruleset-based branch protection interface required some trial and error.

**Suggestions:**
- Take time to understand GitHub's Rulesets to fine-tune merge permissions and CI requirements.

---

### Heroku

**What worked well:**
- Heroku's student plan enabled free deployment with PostgreSQL.
- Automatic detection of Django and Node environments simplified the build process.

**Challenges:**
- Environment variable management and static file handling needed attention during initial deployments.

**Suggestions:**
- Use the `whitenoise` library for static files and store secrets in Heroku's config vars.

---

### Continuous Integration (CI)

**Setup:**
- CI was implemented using GitHub Actions via a `ci.yml` workflow.

**Tools used:**
- **Backend:** Django tests (`python manage.py test`) run in a PostgreSQL container.
- **Frontend:** ESLint runs against all React components in `src/`

**Branch Protection:**
- CI checks (`Forma CI / test-backend`, `Forma CI / test-frontend`) must pass before merging to `main`.
- Only repository administrators (myself) can bypass these checks.

**What worked well:**
- CI integration gives immediate feedback on code issues or test failures.
- Enforces best practices and prevents regressions.

**Challenges:**
- Initially missed defining `lint` script in `package.json`, which caused pipeline errors.

**Suggestions:**
- Teams should add CI early in development, even for solo projects.

---

### Instructor-Specific Comments

While this report is tailored for my startup, Forma, rather than a class project, the practices align with industry DevOps standards. GitHub Actions, Heroku, Django, and React form a powerful stack for rapid, secure development with automation built-in. I highly recommend future solo developers to enforce CI/linting workflows early and leverage protected branches even when working alone.

