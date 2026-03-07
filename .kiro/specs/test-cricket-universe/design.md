# Design Document: Test Cricket Universe

## Overview

Test Cricket Universe is a full-stack web platform built on the MERN stack with an integrated Python ML microservice. The system provides comprehensive cricket data, interactive visualizations, and AI-powered predictions through a modern, editorial-grade user interface.

The platform consists of four primary components:
- React 18 frontend application (port 5173) with Vite, Tailwind CSS, and Framer Motion
- Express REST API backend (port 5000) handling business logic and data operations
- MongoDB database (port 27017) storing cricket data across 8 collections
- Flask ML microservice (port 5001) providing machine learning predictions

The architecture follows a microservices pattern with clear separation of concerns: the frontend handles presentation and user interaction, the Express backend manages business logic and data access, MongoDB provides persistent storage, and the Flask service delivers specialized ML capabilities.

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   React Frontend (Port 5173)                     │
│  - Vite Build Tool                                               │
│  - Tailwind CSS + Framer Motion                                  │
│  - Zustand State Management                                      │
│  - React Router v6                                               │
│  - Recharts + D3.js Visualizations                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ REST API (JSON)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Express Backend API (Port 5000)                     │
│  - RESTful API with /api/v1/ prefix                              │
│  - JWT Authentication Middleware                                 │
│  - Rate Limiting & Error Handling                                │
│  - Mongoose ODM                                                  │
│  - Async/Await Pattern                                           │
└──────────────┬──────────────────────────────┬────────────────────┘
               │                              │
               │ Mongoose                     │ HTTP POST
               │                              │
               ▼                              ▼
┌──────────────────────────────┐  ┌──────────────────────────────┐
│  MongoDB (Port 27017)        │  │  Flask ML Service (5001)     │
│  - 8 Collections:            │  │  - XGBoost Classifier        │
│    * players                 │  │  - Gradient Boosting         │
│    * matches                 │  │  - Cosine Similarity         │
│    * innings                 │  │  - scikit-learn + pandas     │
│    * venues                  │  │  - Pre-trained Models        │
│    * teams                   │  │                              │
│    * series                  │  │  Endpoints:                  │
│    * predictions             │  │  - POST /predict/match       │
│    * articles                │  │  - POST /predict/score       │
│  - Indexes on key fields     │  │  - POST /predict/xi          │
│  - Mongoose Schema Validation│  │  - POST /predict/similar     │
└──────────────────────────────┘  └──────────────────────────────┘
```

### Request Flow Patterns

**Flow 1: Standard Data Request (React → Express → MongoDB)**
1. User interacts with React component
2. Frontend service function calls Express API endpoint
3. Express route handler validates request
4. Mongoose model queries MongoDB
5. Express returns JSON response
6. React updates UI with data

**Flow 2: ML Prediction Request (React → Express → Flask → Express → React)**
1. User submits prediction form in React
2. Frontend calls Express prediction endpoint
3. Express forwards request to Flask ML service
4. Flask preprocesses features and runs model inference
5. Flask returns prediction with confidence scores
6. Express forwards response to React
7. React displays animated prediction results


## Components and Interfaces

### MongoDB Collection Designs

#### Collection: players
Fields:
- _id (ObjectId, auto-generated)
- name (String, required, indexed)
- country (String, required)
- role (String, enum: ["batsman", "bowler", "allrounder", "wicketkeeper"])
- batting (Object)
  - batting.style (String, enum: ["right-hand", "left-hand"])
  - batting.matches (Number)
  - batting.innings (Number)
  - batting.runs (Number)
  - batting.average (Number)
  - batting.strikeRate (Number)
  - batting.centuries (Number)
  - batting.fifties (Number)
  - batting.highScore (Number)
- bowling (Object)
  - bowling.style (String, enum: ["fast", "medium", "spin-off", "spin-leg", "spin-orthodox"])
  - bowling.matches (Number)
  - bowling.innings (Number)
  - bowling.wickets (Number)
  - bowling.average (Number)
  - bowling.economy (Number)
  - bowling.strikeRate (Number)
  - bowling.fiveWickets (Number)
  - bowling.tenWickets (Number)
  - bowling.bestInnings (String, format: "5/32")
- fielding (Object)
  - fielding.catches (Number)
  - fielding.stumpings (Number)
- debut (Date)
- lastPlayed (Date)
- active (Boolean, default: true)
- imageUrl (String)
- bio (String)

Indexes:
- name (text index for search)
- country (ascending)
- role (ascending)
- batting.average (descending)
- bowling.average (ascending)

#### Collection: matches
Fields:
- _id (ObjectId, auto-generated)
- matchNumber (Number, unique, indexed)
- team1 (ObjectId, ref: "Team", required)
- team2 (ObjectId, ref: "Team", required)
- venue (ObjectId, ref: "Venue", required)
- series (ObjectId, ref: "Series")
- startDate (Date, required, indexed)
- endDate (Date)
- result (String, enum: ["team1_won", "team2_won", "draw", "tie", "abandoned"])
- winningTeam (ObjectId, ref: "Team")
- winMargin (String, format: "10 wickets" or "150 runs")
- tossWinner (ObjectId, ref: "Team")
- tossDecision (String, enum: ["bat", "field"])
- umpires (Array of String)
- referee (String)
- innings (Array of ObjectId, ref: "Innings")
- playerOfMatch (ObjectId, ref: "Player")
- status (String, enum: ["scheduled", "live", "completed", "abandoned"])
- narrative (String, long text for AI-generated match summary)

Indexes:
- matchNumber (unique, ascending)
- startDate (descending)
- venue (ascending)
- team1, team2 (compound index)
- status (ascending)


#### Collection: innings
Fields:
- _id (ObjectId, auto-generated)
- match (ObjectId, ref: "Match", required)
- inningsNumber (Number, required, enum: [1, 2, 3, 4])
- battingTeam (ObjectId, ref: "Team", required)
- bowlingTeam (ObjectId, ref: "Team", required)
- totalRuns (Number, required)
- totalWickets (Number, required)
- overs (Number, required)
- declared (Boolean, default: false)
- forfeited (Boolean, default: false)
- extras (Object)
  - extras.byes (Number)
  - extras.legByes (Number)
  - extras.wides (Number)
  - extras.noBalls (Number)
  - extras.penalties (Number)
- battingScorecard (Array of Objects)
  - player (ObjectId, ref: "Player")
  - runs (Number)
  - balls (Number)
  - fours (Number)
  - sixes (Number)
  - strikeRate (Number)
  - dismissal (String, e.g., "c Smith b Anderson")
  - position (Number, batting order)
- bowlingScorecard (Array of Objects)
  - player (ObjectId, ref: "Player")
  - overs (Number)
  - maidens (Number)
  - runs (Number)
  - wickets (Number)
  - economy (Number)
- fallOfWickets (Array of Objects)
  - wicket (Number, 1-10)
  - runs (Number)
  - overs (Number)
  - player (ObjectId, ref: "Player")
- sessionData (Array of Objects)
  - session (String, enum: ["session1", "session2", "session3"])
  - day (Number)
  - runs (Number)
  - wickets (Number)
  - overs (Number)

Indexes:
- match (ascending)
- inningsNumber (ascending)
- match + inningsNumber (compound unique index)

#### Collection: venues
Fields:
- _id (ObjectId, auto-generated)
- name (String, required, unique, indexed)
- city (String, required)
- country (String, required, indexed)
- location (Object)
  - location.type (String, default: "Point")
  - location.coordinates (Array of Number, [longitude, latitude])
- capacity (Number)
- established (Number, year)
- pitchProfile (Object)
  - pitchProfile.spinFriendly (Number, 0-100 percentage)
  - pitchProfile.paceFriendly (Number, 0-100 percentage)
  - pitchProfile.avgFirstInningsScore (Number)
  - pitchProfile.characteristics (String, e.g., "Flat batting track with bounce")
- historicMoments (Array of Objects)
  - title (String)
  - description (String)
  - date (Date)
  - match (ObjectId, ref: "Match")
- matchesPlayed (Number)
- imageUrl (String)

Indexes:
- name (unique, ascending)
- country (ascending)
- location (2dsphere index for geospatial queries)


#### Collection: teams
Fields:
- _id (ObjectId, auto-generated)
- name (String, required, unique, indexed)
- country (String, required, unique)
- iccRanking (Number)
- flagUrl (String)
- founded (Number, year)
- captain (ObjectId, ref: "Player")
- coach (String)
- stats (Object)
  - stats.matchesPlayed (Number)
  - stats.won (Number)
  - stats.lost (Number)
  - stats.drawn (Number)
  - stats.tied (Number)
  - stats.winPercentage (Number)

Indexes:
- name (unique, ascending)
- country (unique, ascending)
- iccRanking (ascending)

#### Collection: series
Fields:
- _id (ObjectId, auto-generated)
- name (String, required)
- startDate (Date, required)
- endDate (Date)
- teams (Array of ObjectId, ref: "Team")
- seriesType (String, enum: ["bilateral", "triangular", "tournament"])
- hostCountry (String)
- matches (Array of ObjectId, ref: "Match")
- winner (ObjectId, ref: "Team")

Indexes:
- startDate (descending)
- teams (ascending)

#### Collection: predictions
Fields:
- _id (ObjectId, auto-generated)
- user (ObjectId, ref: "User")
- predictionType (String, enum: ["match_result", "score_range", "best_xi", "similar_players"])
- inputParameters (Object, flexible schema based on prediction type)
- result (Object, flexible schema based on prediction type)
- confidence (Number, 0-100)
- createdAt (Date, default: Date.now, indexed)
- modelVersion (String)

Indexes:
- user (ascending)
- predictionType (ascending)
- createdAt (descending)

#### Collection: articles
Fields:
- _id (ObjectId, auto-generated)
- title (String, required, indexed)
- slug (String, required, unique, indexed)
- author (String, required)
- category (String, enum: ["analysis", "history", "features", "opinion"])
- content (String, required, markdown format)
- excerpt (String, required)
- publishedAt (Date, default: Date.now, indexed)
- updatedAt (Date)
- tags (Array of String)
- featuredImage (String, URL)
- readTime (Number, minutes)
- views (Number, default: 0)

Indexes:
- slug (unique, ascending)
- category (ascending)
- publishedAt (descending)
- title (text index for search)


#### Collection: users
Fields:
- _id (ObjectId, auto-generated)
- name (String, required)
- email (String, required, unique, indexed)
- password (String, required, bcrypt hashed)
- role (String, enum: ["user", "admin"], default: "user")
- createdAt (Date, default: Date.now)
- lastLogin (Date)
- preferences (Object)
  - preferences.favoriteTeam (ObjectId, ref: "Team")
  - preferences.favoritePlayers (Array of ObjectId, ref: "Player")
  - preferences.theme (String, enum: ["dark", "light"], default: "dark")

Indexes:
- email (unique, ascending)

### Express API Route Structure

| Method | Path | Controller Function | Auth Required | Middleware |
|--------|------|---------------------|---------------|------------|
| POST | /api/v1/auth/register | authController.register | No | None |
| POST | /api/v1/auth/login | authController.login | No | None |
| GET | /api/v1/auth/me | authController.getMe | Yes | authMiddleware |
| GET | /api/v1/players | playerController.getPlayers | No | None |
| GET | /api/v1/players/:id | playerController.getPlayer | No | validateObjectId |
| GET | /api/v1/players/:id/similar | playerController.getSimilarPlayers | No | validateObjectId |
| GET | /api/v1/matches | matchController.getMatches | No | None |
| GET | /api/v1/matches/:id | matchController.getMatch | No | validateObjectId |
| GET | /api/v1/matches/today-in-history | matchController.getTodayInHistory | No | None |
| GET | /api/v1/venues | venueController.getVenues | No | None |
| GET | /api/v1/venues/:id | venueController.getVenue | No | validateObjectId |
| GET | /api/v1/stats/records | statsController.getRecords | No | None |
| GET | /api/v1/stats/rankings | statsController.getRankings | No | None |
| GET | /api/v1/stats/head-to-head | statsController.getHeadToHead | No | None |
| GET | /api/v1/stats/era/:era | statsController.getEraStats | No | None |
| POST | /api/v1/predictions/match | predictionController.predictMatch | Yes | authMiddleware |
| POST | /api/v1/predictions/score | predictionController.predictScore | Yes | authMiddleware |
| POST | /api/v1/predictions/xi | predictionController.predictXI | Yes | authMiddleware |
| POST | /api/v1/predictions/similar-players | predictionController.predictSimilarPlayers | Yes | authMiddleware |
| GET | /api/v1/articles | articleController.getArticles | No | None |
| GET | /api/v1/articles/:slug | articleController.getArticle | No | None |
| GET | /api/v1/teams | teamController.getTeams | No | None |
| GET | /api/v1/teams/:id | teamController.getTeam | No | validateObjectId |
| GET | /api/v1/series | seriesController.getSeries | No | None |
| GET | /api/v1/series/:id | seriesController.getSeriesById | No | validateObjectId |

All routes are prefixed with /api/v1/ and apply rateLimiter middleware globally.


### Middleware Architecture

**authMiddleware.js**
Validates JWT tokens from Authorization header (Bearer token format). Decodes token, verifies signature using JWT_SECRET, attaches user object to request, and passes to next middleware. Returns 401 if token is missing, invalid, or expired.

**errorHandler.js**
Centralized error handling middleware that catches all errors from route handlers. Formats consistent error responses with status code, message, and stack trace (development only). Handles Mongoose validation errors, duplicate key errors, and cast errors with appropriate status codes.

**rateLimiter.js**
Implements rate limiting using express-rate-limit package. Configurable limits per IP address (default: 100 requests per 15 minutes). Returns 429 Too Many Requests when limit exceeded. Prevents API abuse and DDoS attacks.

**validateObjectId.js**
Validates MongoDB ObjectId parameters in route paths. Checks if :id parameter is a valid 24-character hex string. Returns 400 Bad Request with descriptive message if invalid. Prevents Mongoose CastError exceptions.

### React Component Trees

**Home Page**
```
Home
├── Hero
│   ├── AnimatedStatCounter (matches count)
│   ├── AnimatedStatCounter (players count)
│   └── AnimatedStatCounter (venues count)
├── LiveTicker
│   └── TickerItem (scrolling facts)
├── RankingsPreview
│   ├── TeamRankingCard (top 5 teams)
│   └── PlayerRankingCard (top 5 players)
├── HistoricMatchesShowcase
│   └── MatchThumbnail (3-5 featured matches)
└── CTASection
```

**Players Page (List)**
```
Players
├── SearchBar
├── FilterPanel
│   ├── CountryFilter
│   ├── RoleFilter
│   └── EraFilter
├── PlayerGrid
│   └── PlayerCard (name, country, role, stats preview)
└── Pagination
```

**PlayerDetail Page**
```
PlayerDetail
├── PlayerHeader (name, country, image, role)
├── CareerTimeline (Recharts line chart)
├── StatsOverview
│   ├── BattingStats
│   ├── BowlingStats
│   └── FieldingStats
├── PerformanceHeatmap (D3.js visualization)
├── SimilarPlayers
│   └── PlayerCard (ML-generated similar players)
└── MatchHistory
    └── MatchRow
```


**MatchCentre Page (List)**
```
MatchCentre
├── FilterBar
│   ├── DateRangeFilter
│   ├── TeamFilter
│   └── VenueFilter
├── MatchList
│   └── MatchCard (teams, date, venue, result)
└── Pagination
```

**MatchDetail Page**
```
MatchDetail
├── MatchHeader (teams, venue, date, result)
├── ScoreboardTabs
│   ├── InningsScorecard (batting and bowling tables)
│   ├── FallOfWickets (chart)
│   └── SessionChart (runs per session)
├── ManhattanGraph (D3.js, runs per over)
├── WormGraph (D3.js, cumulative runs)
├── MatchNarrative (AI-generated text)
└── PlayerPerformances
    └── PlayerPerformanceCard
```

**Venues Page**
```
Venues
├── LeafletMap
│   ├── VenueMarker (clustered)
│   └── CountryFilter (dropdown)
├── VenueSidePanel (slide-out)
│   ├── VenueHeader (name, city, country)
│   ├── PitchProfile
│   │   ├── SpinVsPacePieChart (Recharts)
│   │   └── AvgFirstInningsScore
│   ├── HistoricMoments
│   │   └── MomentCard
│   └── MatchesAtVenue
│       └── MatchRow
└── VenueList (fallback for mobile)
    └── VenueCard
```

**StatsLab Page**
```
StatsLab
├── TabNavigation (4 tabs)
├── MatchResultPredictor
│   ├── PredictionForm (team selectors, venue, conditions)
│   ├── SubmitButton
│   └── ResultDisplay
│       ├── AnimatedProbabilityBar (Framer Motion)
│       ├── ConfidenceScore
│       └── ResetButton
├── ScoreRangePredictor
│   ├── PredictionForm (player, match context)
│   ├── SubmitButton
│   └── ResultDisplay
│       ├── ScoreRangeChart (Recharts)
│       ├── ConfidenceScore
│       └── ResetButton
├── BestPlayingXIBuilder
│   ├── PredictionForm (team, conditions, opposition)
│   ├── SubmitButton
│   └── ResultDisplay
│       ├── XILineup (visual formation)
│       ├── PlayerCards
│       └── ResetButton
└── PlayerSimilarityEngine
    ├── PredictionForm (player selector)
    ├── SubmitButton
    └── ResultDisplay
        ├── SimilarPlayersList
        ├── ComparisonChart (Recharts radar)
        └── ResetButton
```


**History Page**
```
History
├── EraTabNavigation (5 eras)
├── EraContent
│   ├── EraOverview (description, key events)
│   ├── EraRecords
│   │   └── RecordTable (sortable)
│   └── NotablePlayers
│       └── PlayerCard
├── HeadToHeadTimeline
│   ├── NationSelector1
│   ├── NationSelector2
│   └── TimelineChart (D3.js, match results over time)
└── GreatestTestsEver
    └── TestMatchCard (scorecard, narrative summary)
```

**AIAnalyst Page**
```
AIAnalyst
├── ChatInterface
│   ├── MessageList
│   │   ├── UserMessage
│   │   └── AIMessage (formatted with tables, lists)
│   └── MessageInput
├── SuggestedPrompts
│   └── PromptButton (e.g., "Compare Tendulkar vs Lara")
└── ConversationContext (maintained in state)
```

**Editorial Page**
```
Editorial
├── CategoryFilter (analysis, history, features, opinion)
├── ArticleGrid (asymmetric layout)
│   └── ArticleCard (title, excerpt, author, date, image)
└── Pagination
```

**ArticleDetail Page**
```
ArticleDetail
├── ArticleHeader (title, author, date, read time)
├── FeaturedImage
├── ArticleContent (markdown rendered with Source Serif 4)
├── TagList
└── RelatedArticles
    └── ArticleCard
```

**Shared Components (components/ui/)**
```
- Button (primary, secondary, ghost variants)
- Card (with hover animations)
- Input (text, email, password)
- Select (dropdown)
- Modal (with backdrop)
- Spinner (loading indicator)
- ErrorBoundary (catches React errors)
- SkeletonLoader (loading placeholders)
- Toast (notifications)
- Tabs (reusable tab component)
- Badge (status indicators)
```

**Layout Components (components/layout/)**
```
- Navbar (logo, navigation links, auth buttons)
- Footer (links, social media, copyright)
- Sidebar (mobile navigation)
- Container (max-width wrapper)
- PageTransition (Framer Motion wrapper)
```


### Zustand Store Shapes

**authStore**
State:
- user (Object | null): current authenticated user with id, name, email, role
- token (String | null): JWT token
- isAuthenticated (Boolean): authentication status
- loading (Boolean): async operation in progress
- error (String | null): error message

Actions:
- register(name, email, password): creates new user account
- login(email, password): authenticates user and stores token
- logout(): clears user and token, redirects to home
- loadUser(): fetches current user from /api/v1/auth/me
- clearError(): resets error state

**matchStore**
State:
- matches (Array): list of match objects
- currentMatch (Object | null): selected match details
- filters (Object): active filters (date range, teams, venue)
- pagination (Object): page, limit, total
- loading (Boolean): fetch in progress
- error (String | null): error message

Actions:
- fetchMatches(filters, page): retrieves paginated match list
- fetchMatchById(id): retrieves single match with full details
- setFilters(filters): updates active filters
- clearCurrentMatch(): resets selected match
- fetchTodayInHistory(): retrieves historical matches from current date

**playerStore**
State:
- players (Array): list of player objects
- currentPlayer (Object | null): selected player details
- similarPlayers (Array): ML-generated similar players
- filters (Object): active filters (country, role, era)
- pagination (Object): page, limit, total
- loading (Boolean): fetch in progress
- error (String | null): error message

Actions:
- fetchPlayers(filters, page): retrieves paginated player list
- fetchPlayerById(id): retrieves single player with full stats
- fetchSimilarPlayers(id): retrieves ML-generated similar players
- setFilters(filters): updates active filters
- clearCurrentPlayer(): resets selected player

**predictionStore**
State:
- matchPrediction (Object | null): latest match result prediction
- scorePrediction (Object | null): latest score range prediction
- xiPrediction (Object | null): latest best XI prediction
- similarityPrediction (Object | null): latest player similarity prediction
- loading (Boolean): prediction in progress
- error (String | null): error message

Actions:
- predictMatch(params): calls ML service for match outcome
- predictScore(params): calls ML service for score range
- predictXI(params): calls ML service for best XI
- predictSimilarPlayers(params): calls ML service for player similarity
- clearPredictions(): resets all prediction results
- clearError(): resets error state

**uiStore**
State:
- sidebarOpen (Boolean): mobile sidebar visibility
- theme (String): "dark" or "light"
- venueMapSidePanelOpen (Boolean): venue side panel visibility
- selectedVenue (Object | null): venue selected on map
- toasts (Array): notification messages

Actions:
- toggleSidebar(): opens/closes mobile sidebar
- setTheme(theme): switches between dark and light themes
- openVenueSidePanel(venue): displays venue details in side panel
- closeVenueSidePanel(): hides venue side panel
- addToast(message, type): adds notification
- removeToast(id): removes notification


## Data Models

### Python ML Service Design

**Endpoint: POST /predict/match**

Input Fields:
- team1_id (String): MongoDB ObjectId of first team
- team2_id (String): MongoDB ObjectId of second team
- venue_id (String): MongoDB ObjectId of venue
- toss_winner (String): "team1" or "team2"
- toss_decision (String): "bat" or "field"
- pitch_conditions (String): "dry", "green", "dusty", "flat"
- weather (String): "sunny", "cloudy", "overcast", "rainy"

Output Fields:
- prediction (String): "team1_win", "team2_win", "draw"
- probabilities (Object)
  - team1_win (Number): 0-1 probability
  - team2_win (Number): 0-1 probability
  - draw (Number): 0-1 probability
- confidence (Number): 0-100 confidence score
- feature_importance (Array of Objects): top contributing features

ML Model: XGBoost Classifier trained on historical match data
Feature Engineering: Team strength ratings, venue statistics, head-to-head records, recent form, toss advantage

**Endpoint: POST /predict/score**

Input Fields:
- player_id (String): MongoDB ObjectId of player
- opposition_team_id (String): MongoDB ObjectId of opposition
- venue_id (String): MongoDB ObjectId of venue
- innings_number (Number): 1, 2, 3, or 4
- match_situation (Object)
  - current_score (Number): team score
  - wickets_fallen (Number): 0-10
  - overs_bowled (Number): overs completed

Output Fields:
- predicted_score (Number): expected runs
- score_range (Object)
  - lower_bound (Number): 10th percentile
  - upper_bound (Number): 90th percentile
- confidence (Number): 0-100 confidence score
- comparison_to_average (Number): percentage above/below player average

ML Model: Gradient Boosting Regressor
Feature Engineering: Player career stats, venue averages, opposition bowling strength, match situation context

**Endpoint: POST /predict/xi**

Input Fields:
- team_id (String): MongoDB ObjectId of team
- opposition_team_id (String): MongoDB ObjectId of opposition
- venue_id (String): MongoDB ObjectId of venue
- pitch_conditions (String): "dry", "green", "dusty", "flat"
- available_players (Array of String): MongoDB ObjectIds of available players

Output Fields:
- selected_xi (Array of Objects)
  - player_id (String): MongoDB ObjectId
  - player_name (String)
  - role (String): batsman, bowler, allrounder, wicketkeeper
  - selection_score (Number): 0-100 rating
  - position (Number): 1-11 batting order
- team_balance (Object)
  - batsmen (Number): count
  - bowlers (Number): count
  - allrounders (Number): count
  - wicketkeeper (Number): count
- confidence (Number): 0-100 confidence score

ML Model: Optimization algorithm with player performance scoring
Feature Engineering: Player form, venue suitability, opposition matchups, team balance constraints


**Endpoint: POST /predict/similar-players**

Input Fields:
- player_id (String): MongoDB ObjectId of reference player
- role_filter (String, optional): "batsman", "bowler", "allrounder", "wicketkeeper"
- era_filter (String, optional): "1877-1914", "1920-1950", "1950-1980", "1980-2000", "2000-present"
- top_n (Number, optional): number of similar players to return (default: 10)

Output Fields:
- similar_players (Array of Objects)
  - player_id (String): MongoDB ObjectId
  - player_name (String)
  - similarity_score (Number): 0-1 cosine similarity
  - matching_attributes (Array of String): key similarities (e.g., "batting average", "strike rate")
- reference_player_vector (Array of Number): feature vector of input player
- comparison_chart_data (Object): data for radar chart visualization

ML Model: Cosine Similarity on normalized player feature vectors
Feature Engineering: Career statistics normalized by era, playing style encoding, performance consistency metrics

### Data Pipeline Design (seed.js)

The seed.js script ingests cricket data from cricsheet.org CSV files and populates MongoDB collections.

**Step-by-Step Flow:**

1. Initialize MongoDB connection using Mongoose
2. Read CSV files from data/ directory using fs module
3. Parse CSV content using csv-parser library
4. Transform CSV rows into MongoDB document format
5. Validate transformed documents against Mongoose schemas
6. Upsert documents into appropriate collections (players, matches, innings, venues, teams, series)
7. Create references between related documents (match → venue, innings → match, etc.)
8. Calculate derived statistics (batting averages, bowling economy, etc.)
9. Generate indexes on key fields for query performance
10. Log progress with record counts and processing time
11. Handle errors gracefully, logging failures without stopping entire process
12. Close MongoDB connection on completion

**CSV to MongoDB Field Mapping:**

| Cricsheet CSV Column | MongoDB Collection | MongoDB Field | Transformation |
|---------------------|-------------------|---------------|----------------|
| match_id | matches | matchNumber | Parse integer |
| start_date | matches | startDate | Parse ISO date |
| venue | venues | name | String, create venue if not exists |
| city | venues | city | String |
| team1 | teams | name | String, create team if not exists |
| team2 | teams | name | String, create team if not exists |
| toss_winner | matches | tossWinner | Reference to team ObjectId |
| toss_decision | matches | tossDecision | Enum: "bat" or "field" |
| winner | matches | winningTeam | Reference to team ObjectId |
| win_margin | matches | winMargin | String format |
| player_of_match | matches | playerOfMatch | Reference to player ObjectId |
| innings | innings | inningsNumber | Parse integer 1-4 |
| batting_team | innings | battingTeam | Reference to team ObjectId |
| bowling_team | innings | bowlingTeam | Reference to team ObjectId |
| total | innings | totalRuns | Parse integer |
| wickets | innings | totalWickets | Parse integer |
| overs | innings | overs | Parse float |
| batsman | players | name | String, create player if not exists |
| runs | innings.battingScorecard | runs | Parse integer |
| balls_faced | innings.battingScorecard | balls | Parse integer |
| fours | innings.battingScorecard | fours | Parse integer |
| sixes | innings.battingScorecard | sixes | Parse integer |
| dismissal | innings.battingScorecard | dismissal | String |
| bowler | players | name | String, create player if not exists |
| overs_bowled | innings.bowlingScorecard | overs | Parse float |
| maidens | innings.bowlingScorecard | maidens | Parse integer |
| runs_conceded | innings.bowlingScorecard | runs | Parse integer |
| wickets_taken | innings.bowlingScorecard | wickets | Parse integer |


### Frontend Services Layer

**authService.js**

Functions:
- register(name, email, password)
  - Endpoint: POST /api/v1/auth/register
  - Returns: { success: true, token: String, user: Object }
  
- login(email, password)
  - Endpoint: POST /api/v1/auth/login
  - Returns: { success: true, token: String, user: Object }
  
- getCurrentUser()
  - Endpoint: GET /api/v1/auth/me
  - Returns: { success: true, user: Object }

**playerService.js**

Functions:
- getPlayers(filters, page, limit)
  - Endpoint: GET /api/v1/players?country=X&role=Y&page=N&limit=M
  - Returns: { success: true, data: Array, pagination: Object }
  
- getPlayerById(id)
  - Endpoint: GET /api/v1/players/:id
  - Returns: { success: true, data: Object }
  
- getSimilarPlayers(id)
  - Endpoint: GET /api/v1/players/:id/similar
  - Returns: { success: true, data: Array }

**matchService.js**

Functions:
- getMatches(filters, page, limit)
  - Endpoint: GET /api/v1/matches?team=X&venue=Y&startDate=Z&page=N&limit=M
  - Returns: { success: true, data: Array, pagination: Object }
  
- getMatchById(id)
  - Endpoint: GET /api/v1/matches/:id
  - Returns: { success: true, data: Object }
  
- getTodayInHistory()
  - Endpoint: GET /api/v1/matches/today-in-history
  - Returns: { success: true, data: Array }

**venueService.js**

Functions:
- getVenues(country)
  - Endpoint: GET /api/v1/venues?country=X
  - Returns: { success: true, data: Array }
  
- getVenueById(id)
  - Endpoint: GET /api/v1/venues/:id
  - Returns: { success: true, data: Object }

**statsService.js**

Functions:
- getRecords(category)
  - Endpoint: GET /api/v1/stats/records?category=batting
  - Returns: { success: true, data: Object }
  
- getRankings()
  - Endpoint: GET /api/v1/stats/rankings
  - Returns: { success: true, teams: Array, players: Array }
  
- getHeadToHead(team1Id, team2Id)
  - Endpoint: GET /api/v1/stats/head-to-head?team1=X&team2=Y
  - Returns: { success: true, data: Object }
  
- getEraStats(era)
  - Endpoint: GET /api/v1/stats/era/:era
  - Returns: { success: true, data: Object }

**predictionService.js**

Functions:
- predictMatch(params)
  - Endpoint: POST /api/v1/predictions/match
  - Returns: { success: true, prediction: String, probabilities: Object, confidence: Number }
  
- predictScore(params)
  - Endpoint: POST /api/v1/predictions/score
  - Returns: { success: true, predicted_score: Number, score_range: Object, confidence: Number }
  
- predictXI(params)
  - Endpoint: POST /api/v1/predictions/xi
  - Returns: { success: true, selected_xi: Array, team_balance: Object, confidence: Number }
  
- predictSimilarPlayers(params)
  - Endpoint: POST /api/v1/predictions/similar-players
  - Returns: { success: true, similar_players: Array, comparison_chart_data: Object }

**articleService.js**

Functions:
- getArticles(category, page, limit)
  - Endpoint: GET /api/v1/articles?category=X&page=N&limit=M
  - Returns: { success: true, data: Array, pagination: Object }
  
- getArticleBySlug(slug)
  - Endpoint: GET /api/v1/articles/:slug
  - Returns: { success: true, data: Object }


### Key Design Decisions

**1. Embedding vs Referencing Strategy**
- Use references (ObjectId) for relationships between major entities (matches → venues, matches → teams, innings → players)
- Embed small, frequently accessed data (batting/bowling scorecards within innings, pitch profiles within venues)
- Rationale: References maintain data integrity and reduce duplication for entities that change independently. Embedding improves read performance for data always accessed together.

**2. Pagination Approach**
- Implement cursor-based pagination for large collections (matches, players)
- Default page size: 20 items for lists, 50 for search results
- Include total count in response for UI pagination controls
- Rationale: Cursor-based pagination scales better than offset-based for large datasets and prevents issues with concurrent modifications.

**3. Caching Strategy**
- Cache frequently accessed endpoints (rankings, records) with 5-minute TTL using in-memory cache
- Cache ML predictions in MongoDB predictions collection for reuse
- No caching for user-specific or real-time data (auth, live matches)
- Rationale: Reduces database load and ML service calls while ensuring data freshness for dynamic content.

**4. ML Service Communication Pattern**
- Express backend acts as proxy between React frontend and Flask ML service
- Backend validates input, forwards to ML service, caches results, returns to frontend
- ML service is stateless and does not access MongoDB directly
- Rationale: Centralizes authentication, provides fallback handling if ML service is down, and maintains separation of concerns.

**5. Authentication Approach**
- JWT tokens stored in localStorage for development convenience
- Token expiration configurable via JWT_EXPIRE environment variable (default: 7 days)
- Protected routes require valid token in Authorization header
- Note: Production deployment should migrate to httpOnly cookies for enhanced security
- Rationale: JWT provides stateless authentication, localStorage enables quick development, with clear path to production-ready security.

**6. Data Normalization Level**
- Normalize major entities (players, teams, venues) into separate collections
- Denormalize frequently displayed fields (player names in scorecards) to reduce joins
- Calculate derived statistics (averages, strike rates) during data ingestion
- Rationale: Balances query performance with data consistency and storage efficiency.

**7. Frontend State Management**
- Use Zustand for global state (auth, cached data, UI state)
- Use React hooks (useState, useEffect) for local component state
- Persist only authentication state to localStorage
- Rationale: Zustand provides simpler API than Redux with less boilerplate, suitable for medium-complexity applications.

**8. Error Handling Strategy**
- Backend returns consistent error format: { success: false, error: String, statusCode: Number }
- Frontend displays user-friendly messages, logs technical details to console
- React Error Boundaries catch component errors and display fallback UI
- ML service errors return 503 with descriptive message, frontend shows "Service temporarily unavailable"
- Rationale: Consistent error format simplifies frontend handling, user-friendly messages improve UX, detailed logs aid debugging.

**9. Visualization Library Selection**
- Use Recharts for standard charts (line, bar, pie) due to React-native API
- Use D3.js for custom visualizations (Manhattan graphs, worm graphs) requiring fine-grained control
- Use Leaflet for interactive maps with marker clustering
- Rationale: Recharts provides quick implementation for common charts, D3.js offers flexibility for unique cricket visualizations, Leaflet is industry standard for maps.

**10. Database Indexing Strategy**
- Create single-field indexes on frequently queried fields (player names, match dates)
- Create compound indexes for common filter combinations (team + date, venue + team)
- Create text indexes for search functionality (player names, article titles)
- Create 2dsphere index on venue locations for geospatial queries
- Rationale: Indexes dramatically improve query performance at minimal storage cost, compound indexes optimize multi-field queries.


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies and consolidations:

- Properties 1.1 and 1.2 (user registration and login) both test authentication round-trips and can be combined into a single authentication property
- Properties 2.3, 3.2, 4.4, and 7.2 all test that API responses contain required fields - these can be consolidated into a single "complete data response" property
- Properties 5.1, 5.2, 5.3, and 5.4 all test ML service response formats - these share the same underlying property of "valid prediction response structure"
- Properties 11.2 and 17.1 both test error response formatting - these can be combined
- Properties 12.3 and 12.5 both test Mongoose schema validation - these can be combined into a single validation property

After consolidation, the following properties provide unique validation value:

### Property 1: Authentication Round-Trip

*For any* valid user credentials (name, email, password), registering then logging in with those credentials should return a valid JWT token that can be used to access protected resources.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Invalid Token Rejection

*For any* invalid or expired JWT token, requests to protected endpoints should return 401 unauthorized error.

**Validates: Requirements 1.4**

### Property 3: Search Filter Accuracy

*For any* search filter criteria (name, country, role), all returned player profiles should match the specified filters.

**Validates: Requirements 2.2**

### Property 4: Complete API Response Data

*For any* API endpoint that returns entity details (players, matches, venues, articles), the response should contain all required fields as defined in the MongoDB schema.

**Validates: Requirements 2.3, 3.2, 4.4, 7.2**

### Property 5: Head-to-Head Data Completeness

*For any* two teams or players, head-to-head statistics should include comparative data for all relevant metrics.

**Validates: Requirements 6.3**

### Property 6: ML Prediction Response Structure

*For any* valid prediction request (match, score, XI, similarity), the ML service should return a response containing the prediction result, confidence score, and properly formatted output data.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 20.4**

### Property 7: Backend ML Proxy

*For any* prediction request to the backend API, the request should be forwarded to the ML service and the response returned to the client.

**Validates: Requirements 5.5**

### Property 8: CSV Parsing Round-Trip

*For any* valid cricket data object, serializing to CSV then parsing back should produce an equivalent object.

**Validates: Requirements 9.4**

### Property 9: CSV to MongoDB Transformation

*For any* valid cricsheet CSV data, parsing and transforming should produce MongoDB documents that conform to the Mongoose schemas.

**Validates: Requirements 8.2**

### Property 10: Upsert Idempotence

*For any* cricket data, running the data pipeline twice with the same input should not create duplicate records in MongoDB.

**Validates: Requirements 8.3**

### Property 11: API Route Versioning

*For all* registered API routes, the route path should start with /api/v1/ prefix.

**Validates: Requirements 11.1**

### Property 12: Consistent Error Response Format

*For any* error encountered in the backend API or frontend application, the error response should follow a consistent format with status code, message, and appropriate user-friendly text.

**Validates: Requirements 11.2, 17.1, 17.4**

### Property 13: Protected Route Authentication

*For any* protected API route, requests without a valid JWT token should be rejected with 401 unauthorized.

**Validates: Requirements 11.3**

### Property 14: Invalid ObjectId Rejection

*For any* API route with an ObjectId parameter, providing an invalid ObjectId should return 400 bad request.

**Validates: Requirements 11.5**

### Property 15: Mongoose Schema Validation

*For any* MongoDB collection, attempting to insert a document that violates schema validation rules (missing required fields, wrong data types, invalid enum values) should be rejected.

**Validates: Requirements 12.2, 12.5**

### Property 16: Match Reference Integrity

*For any* match record created in MongoDB, all references to related entities (teams, venue, players) should be valid ObjectIds pointing to existing documents.

**Validates: Requirements 12.3**

### Property 17: Chat Query Response

*For any* cricket-related question submitted to the AI analyst, the backend should return a response containing cricket-domain information.

**Validates: Requirements 14.2**

### Property 18: Conversation Context Persistence

*For any* follow-up question in a chat session, the AI analyst should have access to previous messages in the conversation.

**Validates: Requirements 14.5**

### Property 19: JWT Expiration Configuration

*For any* JWT token generated, the expiration time should match the JWT_EXPIRE environment variable value.

**Validates: Requirements 15.4**

### Property 20: Response Caching Behavior

*For any* frequently accessed endpoint with caching enabled, making the same request twice within the TTL period should return the cached response on the second request.

**Validates: Requirements 16.4**

### Property 21: Authentication State Persistence

*For any* authenticated user, the authentication state should be persisted to localStorage and restored on page reload.

**Validates: Requirements 18.2**

### Property 22: Optimistic Update Rollback

*For any* user interaction with optimistic updates, if the API request fails, the UI state should roll back to the previous state.

**Validates: Requirements 18.4**

### Property 23: Semantic HTML and ARIA

*For any* interactive component in the frontend, the rendered HTML should use semantic elements and include appropriate ARIA labels for accessibility.

**Validates: Requirements 19.3**

### Property 24: Stats Lab Integration

*For any* of the four prediction types in Stats Lab (match result, score range, best XI, player similarity), submitting the form should call the corresponding ML service endpoint.

**Validates: Requirements 21.5**


## Error Handling

### Backend API Error Handling

**Error Response Format:**
All backend errors return a consistent JSON structure:
```
{
  success: false,
  error: String (user-friendly message),
  statusCode: Number,
  stack: String (development only)
}
```

**Error Categories:**

1. **Validation Errors (400 Bad Request)**
   - Invalid request body fields
   - Missing required parameters
   - Invalid ObjectId format
   - Schema validation failures
   - Triggered by: Mongoose validation, custom validators, validateObjectId middleware

2. **Authentication Errors (401 Unauthorized)**
   - Missing JWT token
   - Invalid JWT token
   - Expired JWT token
   - Triggered by: authMiddleware

3. **Authorization Errors (403 Forbidden)**
   - User lacks required permissions
   - Triggered by: role-based access control checks

4. **Not Found Errors (404 Not Found)**
   - Requested resource does not exist
   - Invalid route
   - Triggered by: database queries returning null

5. **Rate Limit Errors (429 Too Many Requests)**
   - Request limit exceeded for IP address
   - Triggered by: rateLimiter middleware

6. **Server Errors (500 Internal Server Error)**
   - Unhandled exceptions
   - Database connection failures
   - Triggered by: errorHandler middleware catch-all

7. **Service Unavailable Errors (503 Service Unavailable)**
   - ML service is down or unreachable
   - Database connection lost
   - Triggered by: ML service proxy, database connection monitoring

**Error Handling Flow:**
1. Error occurs in route handler or middleware
2. Error is passed to next(error)
3. errorHandler middleware catches error
4. Error type is identified (Mongoose error, custom error, etc.)
5. Appropriate status code and message are determined
6. Consistent error response is sent to client
7. Error details are logged to console with timestamp and stack trace

**Database Connection Resilience:**
- Initial connection attempts: 3 retries with exponential backoff (1s, 2s, 4s)
- Connection monitoring: Mongoose connection events (connected, error, disconnected)
- Automatic reconnection: Mongoose handles reconnection automatically
- Graceful degradation: API returns 503 if database is unavailable

### Frontend Error Handling

**Error Display Strategy:**
- User-friendly messages without technical details
- Toast notifications for transient errors (network failures, timeouts)
- Inline error messages for form validation
- Full-page error states for critical failures (authentication, data loading)

**Error Boundaries:**
- React Error Boundaries wrap major page components
- Fallback UI displays when component errors occur
- Error details logged to console for debugging
- "Something went wrong" message with reload button

**Network Error Handling:**
- Axios interceptors catch network errors
- Retry logic for transient failures (3 attempts with exponential backoff)
- Timeout configuration (30 seconds for standard requests, 60 seconds for ML predictions)
- Offline detection with user notification

**Form Validation:**
- Client-side validation before API calls
- Real-time validation feedback on input blur
- Validation error messages displayed inline
- Submit button disabled until form is valid

### ML Service Error Handling

**Error Response Format:**
```
{
  error: String (error type),
  message: String (descriptive message),
  status_code: Number
}
```

**Error Scenarios:**
1. **Invalid Input (400)**
   - Missing required parameters
   - Invalid parameter types
   - Out-of-range values

2. **Model Not Found (500)**
   - Model file missing or corrupted
   - Model loading failed on startup

3. **Prediction Failure (500)**
   - Feature preprocessing error
   - Model inference error
   - Unexpected input format

**Error Propagation:**
- ML service returns structured error to Express backend
- Backend logs ML service error details
- Backend returns 503 to frontend with user-friendly message
- Frontend displays "Prediction service temporarily unavailable"


## Testing Strategy

### Dual Testing Approach

Test Cricket Universe employs both unit testing and property-based testing to ensure comprehensive coverage. These approaches are complementary:

- **Unit tests** verify specific examples, edge cases, and error conditions
- **Property tests** verify universal properties across all inputs

Together, they provide comprehensive coverage: unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Property-Based Testing

**Library Selection:**
- **Backend (Node.js):** fast-check library for property-based testing
- **Frontend (React):** fast-check with React Testing Library
- **ML Service (Python):** Hypothesis library for property-based testing

**Configuration:**
- Minimum 100 iterations per property test (due to randomization)
- Each property test references its design document property
- Tag format: `// Feature: test-cricket-universe, Property {number}: {property_text}`

**Property Test Implementation:**

Each correctness property from the design document must be implemented as a single property-based test:

1. **Property 1: Authentication Round-Trip**
   - Generate random valid credentials
   - Register user, login, access protected resource
   - Verify token grants access

2. **Property 2: Invalid Token Rejection**
   - Generate random invalid/expired tokens
   - Attempt to access protected resources
   - Verify 401 response

3. **Property 3: Search Filter Accuracy**
   - Generate random player data and filter criteria
   - Apply filters and verify all results match

4. **Property 4: Complete API Response Data**
   - Generate random entity IDs
   - Fetch entity details
   - Verify all required schema fields are present

5. **Property 5: Head-to-Head Data Completeness**
   - Generate random team/player pairs
   - Fetch head-to-head stats
   - Verify all comparative metrics are present

6. **Property 6: ML Prediction Response Structure**
   - Generate random valid prediction parameters
   - Call ML service
   - Verify response contains prediction, confidence, and formatted data

7. **Property 7: Backend ML Proxy**
   - Generate random prediction requests
   - Call backend prediction endpoint
   - Verify request is forwarded to ML service

8. **Property 8: CSV Parsing Round-Trip**
   - Generate random valid cricket data objects
   - Serialize to CSV, parse back
   - Verify equivalence

9. **Property 9: CSV to MongoDB Transformation**
   - Generate random valid CSV data
   - Transform to MongoDB format
   - Verify schema compliance

10. **Property 10: Upsert Idempotence**
    - Generate random cricket data
    - Run pipeline twice
    - Verify no duplicates created

11. **Property 11: API Route Versioning**
    - Enumerate all registered routes
    - Verify each starts with /api/v1/

12. **Property 12: Consistent Error Response Format**
    - Generate random error conditions
    - Trigger errors
    - Verify consistent response format

13. **Property 13: Protected Route Authentication**
    - Generate random protected route requests without tokens
    - Verify 401 rejection

14. **Property 14: Invalid ObjectId Rejection**
    - Generate random invalid ObjectIds
    - Call routes with ObjectId parameters
    - Verify 400 response

15. **Property 15: Mongoose Schema Validation**
    - Generate random invalid documents (missing fields, wrong types)
    - Attempt to insert
    - Verify rejection

16. **Property 16: Match Reference Integrity**
    - Generate random match records
    - Create in database
    - Verify all references are valid ObjectIds

17. **Property 17: Chat Query Response**
    - Generate random cricket questions
    - Submit to AI analyst
    - Verify response contains cricket information

18. **Property 18: Conversation Context Persistence**
    - Generate random conversation sequences
    - Submit follow-up questions
    - Verify context is maintained

19. **Property 19: JWT Expiration Configuration**
    - Generate random JWT_EXPIRE values
    - Create tokens
    - Verify expiration matches configuration

20. **Property 20: Response Caching Behavior**
    - Generate random cacheable requests
    - Make same request twice within TTL
    - Verify second response is cached

21. **Property 21: Authentication State Persistence**
    - Generate random authenticated users
    - Store state to localStorage
    - Reload and verify state restored

22. **Property 22: Optimistic Update Rollback**
    - Generate random user interactions
    - Simulate API failures
    - Verify UI state rolls back

23. **Property 23: Semantic HTML and ARIA**
    - Generate random interactive components
    - Render and inspect HTML
    - Verify semantic elements and ARIA labels

24. **Property 24: Stats Lab Integration**
    - Generate random prediction form submissions
    - Submit each of four prediction types
    - Verify correct endpoint is called

### Unit Testing

**Unit Test Focus Areas:**

1. **Specific Examples**
   - /api/v1/auth/me endpoint returns current user
   - /api/v1/players endpoint returns paginated list
   - /api/v1/matches/today-in-history returns historical matches
   - Stats Lab page has four tabs
   - History page has five era tabs

2. **Edge Cases**
   - Empty CSV content handling
   - Non-HTML content in responses
   - Malformed CSV records
   - Missing environment variables
   - ML service unavailable
   - Database connection failures
   - Model files missing

3. **Integration Points**
   - Express routes connect to correct controllers
   - Controllers call correct services
   - Services make correct API calls
   - Zustand stores update correctly
   - React components render with correct props

4. **Error Conditions**
   - Invalid login credentials
   - Expired JWT tokens
   - Missing required fields
   - Invalid ObjectIds
   - Rate limit exceeded
   - Network timeouts

**Unit Test Libraries:**
- **Backend:** Jest + Supertest for API testing
- **Frontend:** Vitest + React Testing Library
- **ML Service:** pytest

**Test Organization:**
- Backend: tests/ directory mirroring src/ structure
- Frontend: __tests__/ directories alongside components
- ML Service: tests/ directory with test_*.py files

### Integration Testing

**API Integration Tests:**
- Test complete request/response cycles
- Use test database with seed data
- Test authentication flows end-to-end
- Test ML service integration through backend proxy
- Test data pipeline with sample CSV files

**Frontend Integration Tests:**
- Test page navigation flows
- Test form submission and validation
- Test data fetching and display
- Test error handling and recovery
- Test authentication flows

### Test Data Generation

**Property Test Generators:**
- User credentials: random name, email, password
- Player data: random stats within realistic ranges
- Match data: random teams, venues, dates, results
- CSV data: random valid cricsheet format
- Prediction parameters: random valid inputs for each prediction type
- ObjectIds: random valid and invalid formats
- JWT tokens: random valid and invalid tokens

**Unit Test Fixtures:**
- Sample player profiles
- Sample match records
- Sample venue data
- Sample CSV files from cricsheet.org
- Sample prediction requests and responses

### Continuous Integration

**CI Pipeline:**
1. Run linting (ESLint for JS, Black for Python)
2. Run unit tests with coverage reporting
3. Run property tests (100 iterations each)
4. Run integration tests
5. Build frontend and verify bundle size
6. Generate test coverage report (target: 80% coverage)

**Test Execution:**
- Unit tests: Run on every commit
- Property tests: Run on every commit (fast-check is fast enough)
- Integration tests: Run on pull requests
- Full test suite: Run before deployment

### Performance Testing

**Load Testing:**
- Test API endpoints under load (100 concurrent requests)
- Test ML service response times (target: <2 seconds per prediction)
- Test database query performance (target: <100ms for simple queries)
- Test frontend bundle size (target: <500KB initial load)

**Monitoring:**
- API response times
- Database query times
- ML service availability
- Frontend page load times
- Error rates

