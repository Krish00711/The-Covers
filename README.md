<div align="center">
<br/>

```
████████╗██╗  ██╗███████╗     ██████╗ ██████╗ ██╗   ██╗███████╗██████╗ ███████╗
╚══██╔══╝██║  ██║██╔════╝    ██╔════╝██╔═══██╗██║   ██║██╔════╝██╔══██╗██╔════╝
   ██║   ███████║█████╗      ██║     ██║   ██║██║   ██║█████╗  ██████╔╝███████╗
   ██║   ██╔══██║██╔══╝      ██║     ██║   ██║╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║
   ██║   ██║  ██║███████╗    ╚██████╗╚██████╔╝ ╚████╔╝ ███████╗██║  ██║███████║
   ╚═╝   ╚═╝  ╚═╝╚══════╝    ╚═════╝ ╚═════╝   ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝
```

<img src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&q=80" width="100%"/>

<br/>

> *Test cricket. 1877 to present. Every match. Every player. Every story.*

<br/>

**[ [→ OPEN LIVE SITE](https://the-covers.vercel.app) ]&nbsp;&nbsp;[ [→ API](https://the-covers-backend.onrender.com) ]&nbsp;&nbsp;[ [→ ML SERVICE](https://the-covers-ml.onrender.com) ]**

<br/>

![](https://img.shields.io/badge/React-18-black?style=flat-square&logo=react&logoColor=61DAFB)
![](https://img.shields.io/badge/Node.js-22-black?style=flat-square&logo=nodedotjs&logoColor=339933)
![](https://img.shields.io/badge/Python-3.14-black?style=flat-square&logo=python&logoColor=3776AB)
![](https://img.shields.io/badge/MongoDB-Atlas-black?style=flat-square&logo=mongodb&logoColor=47A248)
![](https://img.shields.io/badge/LLaMA-3.3_70B-black?style=flat-square&logoColor=white)
![](https://img.shields.io/badge/XGBoost-73.79%25_acc-black?style=flat-square&logoColor=white)

</div>

---

<br/>

## 01 &nbsp; WHAT IS THIS

The Covers is a full-stack Test cricket platform. Not a scorecard app. Not a stats table. A proper editorial platform — built the way cricket deserves to be seen.

898 real matches. 1,025 players. 4 trained ML models. 1 AI analyst that actually knows cricket. All wrapped in a dark, cinematic interface that feels closer to a luxury magazine than a sports website.

<br/>

## 02 &nbsp; THE STACK

```
FRONTEND          BACKEND           ML SERVICE        AI & DATA
─────────         ─────────         ──────────        ─────────
React 18          Node.js 22        Python 3.14       Groq LLaMA 3.3 70B
Vite 4            Express 4         Flask 3           CricAPI (live scores)
Tailwind 3        MongoDB Atlas     scikit-learn 1.8  cricsheet.org (matches)
Framer Motion     Mongoose          XGBoost 3
Recharts          Groq SDK          joblib
Three.js          dotenv            pandas / numpy
```

<br/>

## 03 &nbsp; ML MODELS

Four models trained on real Test cricket data —

```
┌─────────────────────────┬──────────────────────────┬─────────────────────┐
│ MODEL                   │ ALGORITHM                │ PERFORMANCE         │
├─────────────────────────┼──────────────────────────┼─────────────────────┤
│ Match Predictor         │ XGBoost Classifier       │ 73.79% accuracy     │
│ Score Predictor         │ Gradient Boosting        │ MAE: 23.5 runs      │
│ Player Similarity       │ Cosine Similarity        │ 1,025 players       │
│ XI Optimizer            │ Weighted Scoring         │ Role-balanced XI    │
└─────────────────────────┴──────────────────────────┴─────────────────────┘
```

<br/>

## 04 &nbsp; PAGES

```
/              →  Cinematic hero with live scores + ICC rankings
/players       →  1,025 players, searchable, with radar charts
/matches       →  898 matches, live + historical, ML win probability
/venues        →  25 grounds, interactive map, pitch reports
/stats-lab     →  Analytics dashboard — run all 4 ML models
/history       →  Era stats 1877 to present, head-to-head records
/ai-analyst    →  Chat with The Oracle (LLaMA-powered cricket AI)
/editorial     →  Horizontal magazine — flip through 10 articles
/schedule      →  Upcoming Test matches
```

<br/>

## 05 &nbsp; API

```bash
# Teams, Players, Matches, Venues
GET /api/v1/teams
GET /api/v1/players?search=kohli&country=India
GET /api/v1/matches?status=completed&page=1
GET /api/v1/venues

# Stats
GET /api/v1/stats/head-to-head?team1=India&team2=Australia

# Live (CricAPI)
GET /api/v1/live/matches
GET /api/v1/live/rankings
GET /api/v1/live/upcoming

# ML Predictions
POST /api/v1/predictions/match
POST /api/v1/predictions/score
POST /api/v1/predictions/xi
POST /api/v1/predictions/similar-players

# AI
POST /api/v1/ai/chat
```

<br/>

## 06 &nbsp; RUN LOCALLY

**Prerequisites:** Node.js 18+, Python 3.10+, MongoDB 7.0

```bash
# Clone
git clone https://github.com/Krish00711/The-Covers.git
cd The-Covers

# Backend
cd backend && npm install
# create backend/.env (see below)
node scripts/seedTeams.js
node scripts/seedVenues.js
node scripts/seedPlayers.js
node scripts/seedMatches.js
node scripts/seedArticles.js
npm run dev

# ML Service (new terminal)
cd ml-service && ./start.sh

# Frontend (new terminal)
cd client && npm install && npm run dev
```

**backend/.env**
```
MONGO_URI=mongodb://localhost:27017/testcricket
PORT=5000
CRICAPI_KEY=your_key
GROQ_API_KEY=your_key
ML_SERVICE_URL=http://localhost:5001
NODE_ENV=development
```

Open `http://localhost:5173`

<br/>

## 07 &nbsp; DEPLOYMENT

```
the-covers.vercel.app              →  Vercel (frontend)
the-covers-backend.onrender.com    →  Render (backend)
the-covers-ml.onrender.com         →  Render (ML service)
                                      MongoDB Atlas (database)
                                      UptimeRobot (keeps services alive 24/7)
```

<br/>

## 08 &nbsp; STRUCTURE

```
The-Covers/
├── client/
│   └── src/
│       ├── pages/          11 pages
│       ├── components/     sidebar, layout, ui
│       ├── services/       api layers
│       └── stores/         state management
│
├── backend/
│   ├── controllers/        route logic
│   ├── models/             mongoose schemas
│   ├── routes/             api routes
│   ├── services/           ai, cricapi
│   └── scripts/            5 seed scripts
│
└── ml-service/
    ├── api.py              flask app
    ├── models/             4 trained .joblib models
    └── requirements.txt
```

<br/>

## 09 &nbsp; DESIGN

```
Background    #0A0A0F
Text          #E8D5B0
Gold          #C9A84C
Glass         rgba(10, 10, 15, 0.72)

Headings      Playfair Display
Numbers       IBM Plex Mono
Body          Source Serif 4
```

<br/>

---

<div align="center">
<br/>

Built by **[Krish Sharma](https://github.com/Krish00711)**

*If this helped you or you just liked it — leave a ⭐*

<br/>
</div>
