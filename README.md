# Carbon Budget — Carbon Footprint Awareness Platform

A full-stack app that helps people understand, track, and reduce their personal carbon footprint through quick daily logging, a clear visual breakdown, and ranked, specific next steps — not a vague "be greener" message.

**Live demo:** _add your deployed Vercel link here_
**Backend API:** _add your deployed Render link here_

---

## 1. Chosen vertical

This is a submission for **Challenge 3: Carbon Footprint Awareness Platform**. The target user is anyone who wants to build awareness of their day-to-day environmental impact but finds carbon footprint calculators either too complex (full lifecycle audits) or too shallow (a single one-off quiz). The app is built around a simple loop: **log a few everyday activities → see a clear breakdown of where your footprint actually comes from → get a small number of specific, ranked actions, not a generic checklist.**

## 2. Approach and logic

The core design decision in this project is splitting "what to say" from "how to say it":

- **A deterministic, rule-based recommendation engine** (`backend/utils/recommendationEngine.js`) is the actual brain of the app. It looks at a user's category breakdown, budget status, meal patterns, waste recycling ratio, and logging streak, and produces a ranked list of context-specific recommendations (e.g., "transport is over 40% of your footprint" outranks a generic tip). This engine requires no external API, runs instantly, and is the one thing the app guarantees will always work.
- **A Groq AI layer** (`backend/services/groqService.js`) takes that same rule-engine output and turns it into a short, warm, personalized message in natural language. Its only job is phrasing — the judgement calls (what matters, what's the priority) already happened in the rule engine. Groq runs open models (here, Llama 3.3 70B) on its own low-latency LPU inference, so responses come back fast. If no `GROQ_API_KEY` is configured, or the request fails for any reason, the service **automatically falls back** to a deterministic message built from the rule engine's own output, so the feature degrades gracefully instead of breaking the app. The API response always includes a `source: 'ai' | 'fallback'` field so the UI is honest about which one was used.

This split means the "smart, dynamic assistant" the challenge asks for doesn't depend on an API key being configured correctly at evaluation time — it's smart by construction, and the AI is a (very nice) bonus layer on top.

Everyday activities (a commute, a meal, an electricity bill, a bag of waste, a purchase) are converted to kg CO2e using a small set of public, illustrative emission factors (see **Assumptions** below) — not because they're scientifically certified, but because they're good enough to build real intuition about relative impact ("a flight is much worse than a bus ride") and to track trends over time.

## 3. How the solution works

```
 ┌─────────────┐        ┌──────────────────────────┐        ┌─────────────────┐
 │   Frontend   │  REST  │          Backend          │        │    MongoDB       │
 │ React + Vite │ <----> │   Express + Mongoose      │ <----> │  (Atlas, free)   │
 │   Tailwind   │        │  JWT auth, validation,    │        └─────────────────┘
 └─────────────┘        │  rate limiting, helmet    │
                          │                            │        ┌─────────────────┐
                          │  utils/carbonCalculator.js │        │    Groq API      │
                          │  utils/recommendationEngine│ -----> │ (optional, with  │
                          │  services/groqService.js  │        │  graceful        │
                          └──────────────────────────┘        │  fallback)       │
                                                                  └─────────────────┘
```

**User flow:** sign up → log a few activities across transport / electricity / food / waste / shopping → the dashboard shows a category-colored ring gauge against your daily budget, a trend chart, and relatable equivalents (e.g., "≈ 3 months of CO2 absorbed by a tree") → the Insights page shows the rule-based recommendations instantly, plus an on-demand "Get AI insight" button for a personalized written nudge → the Goals page lets you set your own daily budget and region (which affects the electricity emission factor) → a logging streak rewards consistency.

**Key implementation details:**
- The server **always** computes the CO2e figure itself from `category` + `type` + `quantity` server-side — a client can never submit its own emissions number.
- All five emission-factor categories, the recommendation rules, and the streak logic are pure, dependency-free functions, each covered by unit tests with no database required (see `backend/tests/`).
- Auth uses JWT + bcrypt; the AI-insight and login routes have their own stricter rate limits on top of a global one, since they're the most abuse-prone endpoints.
- The dashboard's signature visual (`CarbonRing`) is a hand-built SVG gauge rather than a generic chart library donut, paired with a real, visible data table beneath it so screen reader and low-vision users get the same information.

## 4. Assumptions made

- **Emission factors are simplified and illustrative, not certified carbon accounting.** They're ballparked from widely published public references — UK DEFRA/BEIS conversion factors, US EPA GHG equivalencies, IPCC AR6 lifecycle estimates, and India's Central Electricity Authority (CEA) grid emission factor for electricity. Real figures vary by country, vehicle efficiency, grid mix, and supply chain. This app is built for personal awareness and habit-building, not for regulatory or scientific carbon accounting — that distinction is also surfaced in the UI copy (e.g., shopping figures are labelled "rough indicator").
- **Default daily carbon budget (5.5 kg/day)** is derived from the widely cited "fair share" target of roughly 2 tonnes of CO2e per person per year by 2050 to stay aligned with global climate goals (2000 kg ÷ 365 days ≈ 5.5 kg/day). It's a starting point, fully editable per user in Goals.
- **Region only affects the electricity factor** (India / US / EU / Global average grid mix) for simplicity — transport, food, waste, and shopping factors are treated as global averages.
- **"Relatable equivalents"** on the dashboard (tree-months of CO2 absorption, km driven in a petrol car) are rough, clearly-labelled approximations meant to build intuition, not precise conversions.
- The app assumes a single user logs their own activities (no household/shared accounts) and that one "meal" or "item" is a reasonable enough unit for food and shopping entries without requiring exact weights from the user.

## 5. Tech stack

- **Backend:** Node.js, Express, MongoDB/Mongoose, JWT + bcrypt, express-validator, express-rate-limit, helmet, Groq SDK (Llama 3.3 70B via Groq's inference API), Jest + Supertest.
- **Frontend:** React 18, Vite, React Router v6, Tailwind CSS, Recharts, Axios, Vitest + React Testing Library.

## 6. Project structure

```
backend/
  config/db.js                  MongoDB connection
  middleware/                   auth (JWT), validation, error handling
  models/                       User, Activity (Mongoose schemas)
  routes/                       auth, activities, goals, insights
  services/groqService.js       AI phrasing layer with fallback
  utils/                        emissionFactors, carbonCalculator,
                                 recommendationEngine, streak (all pure + tested)
  tests/                        Jest unit + API tests (no DB required)
frontend/
  src/
    pages/                      Landing, Login, Signup, Dashboard, LogActivity,
                                 History, Goals, Insights, Profile, NotFound
    components/
      dashboard/                CarbonRing, TrendChart, RecommendationCard
      layout/                   Navbar, ProtectedRoute
      ui/                       Button, Input, Select, Card, Banner, Spinner
    context/AuthContext.jsx     auth state, persisted in localStorage
    utils/                      activityOptions (form data + live preview),
                                 co2Format (formatting + equivalents)
    tests/                      Vitest unit + component tests
```

## 7. Running locally

### Backend
```bash
cd backend
cp .env.example .env     # fill in MONGO_URI and JWT_SECRET at minimum
npm install
npm run dev               # starts on http://localhost:5000
npm test                  # runs the Jest suite (no DB needed)
```

### Frontend
```bash
cd frontend
cp .env.example .env      # defaults to http://localhost:5000/api
npm install
npm run dev                # starts on http://localhost:5173
npm test                   # runs the Vitest suite
npm run build               # production build (verified locally — builds clean)
```

The app works end-to-end with `GROQ_API_KEY` left blank in `.env` — AI insight requests will simply return the rule-based fallback message instead of erroring out.

## 8. Deployment

- **Frontend → Vercel:** import the repo, set the root directory to `frontend`, framework preset "Vite", and add the environment variable `VITE_API_URL=<your-render-backend-url>/api`. The included `vercel.json` adds the SPA rewrite needed for client-side routing.
- **Backend → Render:** create a Web Service with root directory `backend`, build command `npm install`, start command `npm start`, and set the environment variables from `backend/.env.example` (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` set to your Vercel URL, and optionally `GROQ_API_KEY`). A `render.yaml` blueprint is included if you prefer Render's "New Blueprint" flow.
- **Database → MongoDB Atlas:** free-tier cluster, with the connection string (including a database user with read/write access) used as `MONGO_URI`.

## 9. Testing summary

- Backend: 38 Jest tests across the carbon calculator, recommendation engine, streak logic, AI-fallback behavior, and API-level auth/validation/guard checks — all runnable without a live database connection.
- Frontend: Vitest + React Testing Library tests for the formatting/equivalents utilities, the client-side estimate helper, and a component render test for the dashboard's signature `CarbonRing` visual.

## 10. Security notes

JWT auth with bcrypt-hashed passwords; helmet, CORS restricted to the configured frontend origin, and a 100kb JSON body limit; a global rate limiter plus stricter limits on `/auth/login` and `/insights/ai`; all secrets via environment variables only (never committed); the server never trusts a client-supplied emissions figure, always recomputing it from the activity's category/type/quantity.
