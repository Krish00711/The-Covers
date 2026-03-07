# Implementation Tasks: Test Cricket Universe

## PHASE 1 — Foundation

Task 1: Initialize project structure and environment configuration
Phase: PHASE 1 — Foundation
Depends on: none
What to build: Create root directory with backend/, frontend/, and ml-service/ folders. Set up .env files for backend (PORT, MONGO_URI, JWT_SECRET, JWT_EXPIRE, ML_SERVICE_URL, CLIENT_URL) and ml-service (PORT). Create .gitignore files for node_modules and Python virtual environments.
Done when: All three project folders exist with environment configuration files and .gitignore files in place.

Task 2: Set up backend Express server foundation
Phase: PHASE 1 — Foundation
Depends on: Task 1
What to build: Initialize Node.js project in backend/ with package.json. Install Express, Mongoose, bcryptjs, jsonwebtoken, dotenv, cors, express-rate-limit. Create server.js with Express app initialization, CORS configuration, JSON body parser, and basic error handling. Server should listen on PORT from environment.
Done when: Running `node server.js` starts Express server on configured port and logs "Server running on port X".

Task 3: Connect MongoDB with Mongoose
Phase: PHASE 1 — Foundation
Depends on: Task 2
What to build: Create config/db.js that exports connectDB function. Function should connect to MongoDB using MONGO_URI from environment with retry logic (3 attempts with exponential backoff). Add connection event listeners for connected, error, and disconnected events. Call connectDB in server.js before starting server.
Done when: Server successfully connects to MongoDB on startup and logs "MongoDB connected" or retries 3 times before failing with descriptive error.

Task 4: Create Player Mongoose model
Phase: PHASE 1 — Foundation
Depends on: Task 3
What to build: Create models/Player.js with Mongoose schema matching design document. Include name (String, required, indexed), country (String, required), role (enum), batting object (style, matches, innings, runs, average, strikeRate, centuries, fifties, highScore), bowling object (style, matches, innings, wickets, average, economy, strikeRate, fiveWickets, tenWickets, bestInnings), fielding object (catches, stumpings), debut (Date), lastPlayed (Date), active (Boolean), imageUrl (String), bio (String). Add indexes on name (text), country, role, batting.average (desc), bowling.average (asc).
Done when: Player model exports Mongoose model with complete schema validation and indexes as specified in design document.

Task 5: Create Match Mongoose model
Phase: PHASE 1 — Foundation
Depends on: Task 3
What to build: Create models/Match.js with Mongoose schema. Include matchNumber (Number, unique, indexed), team1 (ObjectId ref Team), team2 (ObjectId ref Team), venue (ObjectId ref Venue), series (ObjectId ref Series), startDate (Date, required, indexed), endDate (Date), result (enum), winningTeam (ObjectId ref Team), winMargin (String), tossWinner (ObjectId ref Team), tossDecision (enum), umpires (Array of String), referee (String), innings (Array of ObjectId ref Innings), playerOfMatch (ObjectId ref Player), status (enum), narrative (String). Add indexes on matchNumber (unique), startDate (desc), venue, team1+team2 compound, status.
Done when: Match model exports Mongoose model with all fields, references, and indexes as specified in design document.

Task 6: Create Innings Mongoose model
Phase: PHASE 1 — Foundation
Depends on: Task 3
What to build: Create models/Innings.js with Mongoose schema. Include match (ObjectId ref Match, required), inningsNumber (Number, required, enum 1-4), battingTeam (ObjectId ref Team), bowlingTeam (ObjectId ref Team), totalRuns (Number), totalWickets (Number), overs (Number), declared (Boolean), forfeited (Boolean), extras object (byes, legByes, wides, noBalls, penalties), battingScorecard array (player ObjectId, runs, balls, fours, sixes, strikeRate, dismissal, position), bowlingScorecard array (player ObjectId, overs, maidens, runs, wickets, economy), fallOfWickets array (wicket, runs, overs, player ObjectId), sessionData array (session enum, day, runs, wickets, overs). Add compound unique index on match + inningsNumber.
Done when: Innings model exports Mongoose model with nested objects, arrays, and compound index as specified.

Task 7: Create Venue Mongoose model
Phase: PHASE 1 — Foundation
Depends on: Task 3
What to build: Create models/Venue.js with Mongoose schema. Include name (String, required, unique, indexed), city (String, required), country (String, required, indexed), location object (type "Point", coordinates array [longitude, latitude]), capacity (Number), established (Number), pitchProfile object (spinFriendly 0-100, paceFriendly 0-100, avgFirstInningsScore, characteristics String), historicMoments array (title, description, date, match ObjectId), matchesPlayed (Number), imageUrl (String). Add indexes on name (unique), country, and 2dsphere index on location for geospatial queries.
Done when: Venue model exports Mongoose model with geospatial index and all fields as specified.

Task 8: Create Team Mongoose model
Phase: PHASE 1 — Foundation
Depends on: Task 3
What to build: Create models/Team.js with Mongoose schema. Include name (String, required, unique, indexed), country (String, required, unique), iccRanking (Number), flagUrl (String), founded (Number), captain (ObjectId ref Player), coach (String), stats object (matchesPlayed, won, lost, drawn, tied, winPercentage). Add indexes on name (unique), country (unique), iccRanking.
Done when: Team model exports Mongoose model with all fields and indexes as specified.

Task 9: Create Series Mongoose model
Phase: PHASE 1 — Foundation
Depends on: Task 3
What to build: Create models/Series.js with Mongoose schema. Include name (String, required), startDate (Date, required), endDate (Date), teams (Array of ObjectId ref Team), seriesType (enum: bilateral, triangular, tournament), hostCountry (String), matches (Array of ObjectId ref Match), winner (ObjectId ref Team). Add indexes on startDate (desc) and teams.
Done when: Series model exports Mongoose model with all fields and indexes as specified.

Task 10: Create Prediction Mongoose model
Phase: PHASE 1 — Foundation
Depends on: Task 3
What to build: Create models/Prediction.js with Mongoose schema. Include user (ObjectId ref User), predictionType (enum: match_result, score_range, best_xi, similar_players), inputParameters (Object, flexible schema), result (Object, flexible schema), confidence (Number 0-100), createdAt (Date, default now, indexed), modelVersion (String). Add indexes on user, predictionType, createdAt (desc).
Done when: Prediction model exports Mongoose model with flexible schema objects and indexes as specified.

Task 11: Create Article Mongoose model
Phase: PHASE 1 — Foundation
Depends on: Task 3
What to build: Create models/Article.js with Mongoose schema. Include title (String, required, indexed), slug (String, required, unique, indexed), author (String, required), category (enum: analysis, history, features, opinion), content (String, required, markdown), excerpt (String, required), publishedAt (Date, default now, indexed), updatedAt (Date), tags (Array of String), featuredImage (String), readTime (Number), views (Number, default 0). Add indexes on slug (unique), category, publishedAt (desc), title (text).
Done when: Article model exports Mongoose model with text index and all fields as specified.

Task 12: Create User Mongoose model
Phase: PHASE 1 — Foundation
Depends on: Task 3
What to build: Create models/User.js with Mongoose schema. Include name (String, required), email (String, required, unique, indexed), password (String, required), role (enum: user, admin, default user), createdAt (Date, default now), lastLogin (Date), preferences object (favoriteTeam ObjectId ref Team, favoritePlayers Array of ObjectId ref Player, theme enum dark/light default dark). Add pre-save hook to hash password with bcrypt if modified. Add method comparePassword to verify password. Add index on email (unique).
Done when: User model exports Mongoose model with password hashing, comparison method, and email index.

Task 13: Create authMiddleware
Phase: PHASE 1 — Foundation
Depends on: Task 12
What to build: Create middleware/authMiddleware.js that extracts JWT token from Authorization header (Bearer format), verifies token using JWT_SECRET, decodes payload, attaches user object to req.user, and calls next(). If token is missing, invalid, or expired, return 401 with error message.
Done when: Middleware exports function that validates JWT tokens and attaches user to request or returns 401 error.

Task 14: Create errorHandler middleware
Phase: PHASE 1 — Foundation
Depends on: Task 2
What to build: Create middleware/errorHandler.js that catches all errors from route handlers. Format consistent error responses with success: false, error message, statusCode, and stack trace (development only). Handle Mongoose validation errors (400), duplicate key errors (400), cast errors (400), and generic errors (500). Export as Express error middleware with (err, req, res, next) signature.
Done when: Middleware exports error handler that returns consistent JSON error format for all error types.

Task 15: Create rateLimiter middleware
Phase: PHASE 1 — Foundation
Depends on: Task 2
What to build: Create middleware/rateLimiter.js using express-rate-limit package. Configure limit of 100 requests per 15 minutes per IP address. Return 429 Too Many Requests when limit exceeded with descriptive message. Export configured rate limiter middleware.
Done when: Middleware exports rate limiter that enforces 100 requests per 15 minutes per IP.

Task 16: Create validateObjectId middleware
Phase: PHASE 1 — Foundation
Depends on: Task 2
What to build: Create middleware/validateObjectId.js that checks if req.params.id is a valid MongoDB ObjectId (24-character hex string). Use Mongoose isValidObjectId function. If invalid, return 400 Bad Request with descriptive message. If valid, call next(). Export middleware function.
Done when: Middleware exports function that validates ObjectId parameters and returns 400 for invalid IDs.

## PHASE 2 — Data Pipeline

Task 17: Create CSV parser utility
Phase: PHASE 2 — Data Pipeline
Depends on: Task 4, Task 5, Task 6, Task 7, Task 8, Task 9
What to build: Create utils/csvParser.js that reads CSV files using csv-parser library. Export parseCSV function that takes file path and returns parsed rows as JavaScript objects. Handle quoted fields, escaped characters, and multi-line values per RFC 4180. Return descriptive errors for malformed CSV with line numbers.
Done when: parseCSV function successfully parses valid cricsheet CSV files and returns structured objects or descriptive errors for invalid files.

Task 18: Create CSV to MongoDB transformer
Phase: PHASE 2 — Data Pipeline
Depends on: Task 17
What to build: Create utils/csvTransformer.js that transforms cricsheet CSV data into MongoDB document format. Map CSV columns to Mongoose schema fields per design document table. Handle data type conversions (strings to numbers, dates, ObjectId references). Export transformMatch, transformPlayer, transformInnings, transformVenue, transformTeam functions. Validate transformed documents against schemas.
Done when: Transformer functions convert CSV rows to valid MongoDB documents matching Mongoose schemas.

Task 19: Create seed script
Phase: PHASE 2 — Data Pipeline
Depends on: Task 18
What to build: Create scripts/seed.js that reads CSV files from data/ directory, parses with csvParser, transforms with csvTransformer, and upserts into MongoDB collections. Use upsert operations to prevent duplicates (match on unique fields like matchNumber, player name+country, venue name). Calculate derived statistics (batting averages, bowling economy). Log progress with record counts. Handle errors gracefully without stopping entire process. Accept command line argument for data directory path.
Done when: Running `node scripts/seed.js` successfully ingests CSV data into all collections with progress logging and error handling.

## PHASE 3 — Backend APIs

Task 20: Create auth controller and routes
Phase: PHASE 3 — Backend APIs
Depends on: Task 12, Task 13, Task 14, Task 15, Task 16
What to build: Create controllers/authController.js with register (create user with hashed password, return JWT), login (verify credentials, return JWT), and getMe (return current user) functions. Create routes/authRoutes.js with POST /register, POST /login (no auth), GET /me (with authMiddleware). Mount routes in server.js at /api/v1/auth with rateLimiter.
Done when: All three auth endpoints work correctly - register creates user, login returns token, /me returns authenticated user profile.

Task 21: Create player controller and routes
Phase: PHASE 3 — Backend APIs
Depends on: Task 4, Task 14, Task 15, Task 16
What to build: Create controllers/playerController.js with getPlayers (paginated list with filters for country, role, name search), getPlayer (single player by ID with full stats), getSimilarPlayers (placeholder returning empty array, will integrate ML later) functions. Create routes/playerRoutes.js with GET / (pagination and filters), GET /:id (with validateObjectId). Mount routes in server.js at /api/v1/players with rateLimiter.
Done when: Player endpoints return paginated lists with filters, single player details, and placeholder similar players array.

Task 22: Create match controller and routes
Phase: PHASE 3 — Backend APIs
Depends on: Task 5, Task 6, Task 14, Task 15, Task 16
What to build: Create controllers/matchController.js with getMatches (paginated list with filters for teams, venue, date range, populate team and venue names), getMatch (single match by ID with populated innings, teams, venue, player details), getTodayInHistory (matches from current date in previous years) functions. Create routes/matchRoutes.js with GET /, GET /today-in-history, GET /:id (with validateObjectId). Mount routes in server.js at /api/v1/matches with rateLimiter.
Done when: Match endpoints return paginated lists with filters, full match details with populated references, and today-in-history matches.

Task 23: Create venue controller and routes
Phase: PHASE 3 — Backend APIs
Depends on: Task 7, Task 14, Task 15, Task 16
What to build: Create controllers/venueController.js with getVenues (all venues with optional country filter, include location coordinates for map), getVenue (single venue by ID with pitch profile, historic moments, and list of matches played at venue) functions. Create routes/venueRoutes.js with GET / (country filter), GET /:id (with validateObjectId). Mount routes in server.js at /api/v1/venues with rateLimiter.
Done when: Venue endpoints return all venues with geospatial data and single venue with complete pitch profile and match history.

Task 24: Create team controller and routes
Phase: PHASE 3 — Backend APIs
Depends on: Task 8, Task 14, Task 15, Task 16
What to build: Create controllers/teamController.js with getTeams (all teams with ICC rankings sorted), getTeam (single team by ID with captain details and stats) functions. Create routes/teamRoutes.js with GET /, GET /:id (with validateObjectId). Mount routes in server.js at /api/v1/teams with rateLimiter.
Done when: Team endpoints return all teams sorted by ICC ranking and single team with complete stats and captain info.

Task 25: Create series controller and routes
Phase: PHASE 3 — Backend APIs
Depends on: Task 9, Task 14, Task 15, Task 16
What to build: Create controllers/seriesController.js with getSeries (paginated list sorted by startDate desc, populate team names), getSeriesById (single series with populated teams and matches) functions. Create routes/seriesRoutes.js with GET /, GET /:id (with validateObjectId). Mount routes in server.js at /api/v1/series with rateLimiter.
Done when: Series endpoints return paginated series list and single series with populated team and match details.

Task 26: Create stats controller and routes
Phase: PHASE 3 — Backend APIs
Depends on: Task 4, Task 5, Task 8, Task 14, Task 15
What to build: Create controllers/statsController.js with getRecords (all-time records for batting, bowling, fielding categories from Player collection), getRankings (current ICC rankings from Team collection top 5 teams and Player collection top 5 players), getHeadToHead (comparative stats between two teams using Match collection), getEraStats (era-filtered statistics for specified time period) functions. Create routes/statsRoutes.js with GET /records, GET /rankings, GET /head-to-head (query params team1, team2), GET /era/:era. Mount routes in server.js at /api/v1/stats with rateLimiter.
Done when: Stats endpoints return all-time records, current rankings, head-to-head comparisons, and era-based statistics.

Task 27: Create article controller and routes
Phase: PHASE 3 — Backend APIs
Depends on: Task 11, Task 14, Task 15
What to build: Create controllers/articleController.js with getArticles (paginated list with category filter, sorted by publishedAt desc), getArticle (single article by slug with markdown content) functions. Create routes/articleRoutes.js with GET / (pagination and category filter), GET /:slug. Mount routes in server.js at /api/v1/articles with rateLimiter.
Done when: Article endpoints return paginated articles with category filtering and single article by slug with full markdown content.

Task 28: Create prediction controller and routes (placeholder)
Phase: PHASE 3 — Backend APIs
Depends on: Task 10, Task 13, Task 14, Task 15
What to build: Create controllers/predictionController.js with predictMatch, predictScore, predictXI, predictSimilarPlayers functions that return placeholder responses (empty predictions with 0 confidence). These will be connected to ML service later. Create routes/predictionRoutes.js with POST /match, POST /score, POST /xi, POST /similar-players (all with authMiddleware). Mount routes in server.js at /api/v1/predictions with rateLimiter.
Done when: All four prediction endpoints accept requests and return placeholder responses with correct structure.

## PHASE 4 — ML Service

Task 29: Set up Flask ML service foundation
Phase: PHASE 4 — ML Service
Depends on: Task 1
What to build: Initialize Python project in ml-service/ with requirements.txt (Flask, scikit-learn, xgboost, pandas, numpy, joblib). Create app.py with Flask app initialization, CORS configuration for backend origin, and basic error handling. App should listen on port 5001 from environment. Create /health endpoint returning service status.
Done when: Running `python app.py` starts Flask server on port 5001 and /health endpoint returns 200 OK.

Task 30: Create match prediction model and endpoint
Phase: PHASE 4 — ML Service
Depends on: Task 29
What to build: Create models/match_predictor.py with XGBoost classifier. Create training script train_match_model.py that loads historical match data, engineers features (team strength, venue stats, toss advantage, head-to-head), trains model, saves to match_model.joblib. Create endpoint POST /predict/match in app.py that loads model, preprocesses input (team1_id, team2_id, venue_id, toss_winner, toss_decision, pitch_conditions, weather), runs inference, returns prediction (team1_win/team2_win/draw), probabilities object, confidence score, feature_importance array.
Done when: POST /predict/match accepts valid parameters and returns prediction with probabilities and confidence score.

Task 31: Create score prediction model and endpoint
Phase: PHASE 4 — ML Service
Depends on: Task 29
What to build: Create models/score_predictor.py with Gradient Boosting Regressor. Create training script train_score_model.py that loads player performance data, engineers features (player career stats, venue averages, opposition strength, match situation), trains model, saves to score_model.joblib. Create endpoint POST /predict/score in app.py that loads model, preprocesses input (player_id, opposition_team_id, venue_id, innings_number, match_situation object), runs inference, returns predicted_score, score_range (lower_bound, upper_bound), confidence, comparison_to_average.
Done when: POST /predict/score accepts valid parameters and returns score prediction with range and confidence.

Task 32: Create best XI prediction model and endpoint
Phase: PHASE 4 — ML Service
Depends on: Task 29
What to build: Create models/xi_optimizer.py with player performance scoring algorithm. Create endpoint POST /predict/xi in app.py that accepts team_id, opposition_team_id, venue_id, pitch_conditions, available_players array. Implement optimization logic that scores each player based on form, venue suitability, opposition matchups, and team balance constraints (minimum batsmen, bowlers, allrounders, wicketkeeper). Return selected_xi array (player_id, player_name, role, selection_score, position), team_balance object (counts by role), confidence score.
Done when: POST /predict/xi accepts valid parameters and returns optimized XI with player positions and team balance.

Task 33: Create player similarity model and endpoint
Phase: PHASE 4 — ML Service
Depends on: Task 29
What to build: Create models/similarity_engine.py using cosine similarity on normalized player feature vectors. Create endpoint POST /predict/similar-players in app.py that accepts player_id, optional role_filter, optional era_filter, optional top_n (default 10). Load player data, create feature vectors from career statistics normalized by era, calculate cosine similarity between reference player and all others, filter by role and era if specified, return top N similar_players array (player_id, player_name, similarity_score, matching_attributes), reference_player_vector, comparison_chart_data for radar visualization.
Done when: POST /predict/similar-players accepts player_id and returns ranked list of similar players with similarity scores.

## PHASE 5 — Frontend Foundation

Task 34: Set up Vite React project
Phase: PHASE 5 — Frontend Foundation
Depends on: Task 1
What to build: Initialize React 18 project in frontend/ using Vite. Install dependencies: react, react-dom, react-router-dom, zustand, axios, recharts, d3, leaflet, react-leaflet, framer-motion, tailwindcss, postcss, autoprefixer. Configure Vite to proxy API requests to backend port 5000. Create index.html with root div and main.jsx with React root render.
Done when: Running `npm run dev` starts Vite dev server on port 5173 and displays default React app.

Task 35: Configure Tailwind CSS with design tokens
Phase: PHASE 5 — Frontend Foundation
Depends on: Task 34
What to build: Initialize Tailwind CSS with `npx tailwindcss init -p`. Configure tailwind.config.js with custom colors (background #0A0A0F, primary #E8D5B0, accent #C9A84C), custom fonts (Playfair Display for headings, IBM Plex Mono for stats, Source Serif 4 for body), breakpoints (sm 640px, md 768px, lg 1024px, xl 1280px). Add Tailwind directives to index.css. Import Google Fonts for Playfair Display, IBM Plex Mono, Source Serif 4 in index.html.
Done when: Tailwind classes work in components with custom colors and fonts applied correctly.

Task 36: Set up React Router
Phase: PHASE 5 — Frontend Foundation
Depends on: Task 34
What to build: Create App.jsx with BrowserRouter and Routes. Define route paths for Home (/), Players (/players), PlayerDetail (/players/:id), MatchCentre (/matches), MatchDetail (/matches/:id), Venues (/venues), StatsLab (/stats-lab), History (/history), AIAnalyst (/ai-analyst), Editorial (/editorial), ArticleDetail (/editorial/:slug), Login (/login), Register (/register). Create placeholder page components that render route name. Wrap routes with PageTransition component using Framer Motion for fade transitions.
Done when: All routes navigate correctly with fade transitions between pages.

Task 37: Create Zustand authStore
Phase: PHASE 5 — Frontend Foundation
Depends on: Task 34
What to build: Create stores/authStore.js with Zustand. State: user (Object | null), token (String | null), isAuthenticated (Boolean), loading (Boolean), error (String | null). Actions: register(name, email, password) calls /api/v1/auth/register and stores token/user, login(email, password) calls /api/v1/auth/login, logout() clears state and localStorage, loadUser() calls /api/v1/auth/me, clearError() resets error. Persist token to localStorage. Load token from localStorage on store initialization.
Done when: authStore manages authentication state with localStorage persistence and API integration.

Task 38: Create Zustand matchStore
Phase: PHASE 5 — Frontend Foundation
Depends on: Task 34
What to build: Create stores/matchStore.js with Zustand. State: matches (Array), currentMatch (Object | null), filters (Object), pagination (Object), loading (Boolean), error (String | null). Actions: fetchMatches(filters, page) calls /api/v1/matches, fetchMatchById(id) calls /api/v1/matches/:id, setFilters(filters) updates filters, clearCurrentMatch() resets, fetchTodayInHistory() calls /api/v1/matches/today-in-history.
Done when: matchStore manages match data with pagination and filtering.

Task 39: Create Zustand playerStore
Phase: PHASE 5 — Frontend Foundation
Depends on: Task 34
What to build: Create stores/playerStore.js with Zustand. State: players (Array), currentPlayer (Object | null), similarPlayers (Array), filters (Object), pagination (Object), loading (Boolean), error (String | null). Actions: fetchPlayers(filters, page) calls /api/v1/players, fetchPlayerById(id) calls /api/v1/players/:id, fetchSimilarPlayers(id) calls /api/v1/players/:id/similar, setFilters(filters), clearCurrentPlayer().
Done when: playerStore manages player data with pagination, filtering, and similar players.

Task 40: Create Zustand predictionStore
Phase: PHASE 5 — Frontend Foundation
Depends on: Task 34
What to build: Create stores/predictionStore.js with Zustand. State: matchPrediction (Object | null), scorePrediction (Object | null), xiPrediction (Object | null), similarityPrediction (Object | null), loading (Boolean), error (String | null). Actions: predictMatch(params) calls /api/v1/predictions/match, predictScore(params) calls /api/v1/predictions/score, predictXI(params) calls /api/v1/predictions/xi, predictSimilarPlayers(params) calls /api/v1/predictions/similar-players, clearPredictions(), clearError().
Done when: predictionStore manages all four prediction types with API integration.

Task 41: Create Zustand uiStore
Phase: PHASE 5 — Frontend Foundation
Depends on: Task 34
What to build: Create stores/uiStore.js with Zustand. State: sidebarOpen (Boolean), theme (String dark/light), venueMapSidePanelOpen (Boolean), selectedVenue (Object | null), toasts (Array). Actions: toggleSidebar(), setTheme(theme), openVenueSidePanel(venue), closeVenueSidePanel(), addToast(message, type), removeToast(id).
Done when: uiStore manages UI state for sidebar, theme, venue panel, and toast notifications.

Task 42: Create Axios service utilities
Phase: PHASE 5 — Frontend Foundation
Depends on: Task 34, Task 37
What to build: Create services/api.js with Axios instance configured with baseURL (backend API), timeout (30s standard, 60s for predictions), and interceptors. Request interceptor adds Authorization header with token from authStore. Response interceptor handles errors (401 logout, network errors with retry logic 3 attempts, timeout errors). Export configured axios instance.
Done when: Axios instance automatically adds auth headers and handles common errors with retry logic.

Task 43: Create shared UI components
Phase: PHASE 5 — Frontend Foundation
Depends on: Task 35
What to build: Create components/ui/ folder with Button.jsx (primary, secondary, ghost variants), Card.jsx (with hover animations), Input.jsx (text, email, password types), Select.jsx (dropdown), Modal.jsx (with backdrop), Spinner.jsx (loading indicator), ErrorBoundary.jsx (catches React errors), SkeletonLoader.jsx (loading placeholders), Toast.jsx (notifications), Tabs.jsx (reusable tab component), Badge.jsx (status indicators). Each component should use Tailwind classes and Framer Motion for animations.
Done when: All 11 shared UI components render correctly with Tailwind styling and animations.

Task 44: Create layout components
Phase: PHASE 5 — Frontend Foundation
Depends on: Task 35, Task 37, Task 41
What to build: Create components/layout/ folder with Navbar.jsx (logo, navigation links to all pages, auth buttons using authStore, mobile hamburger menu), Footer.jsx (links, social media icons, copyright), Sidebar.jsx (mobile navigation using uiStore), Container.jsx (max-width wrapper), PageTransition.jsx (Framer Motion wrapper for route transitions). Navbar should show Login/Register when not authenticated, user name and Logout when authenticated.
Done when: Layout components render correctly with responsive design and authentication state integration.

## PHASE 6 — Frontend Pages

Task 45: Build Home page
Phase: PHASE 6 — Frontend Pages
Depends on: Task 44, Task 38, Task 39, Task 41
What to build: Create pages/Home.jsx with Hero section (animated stat counters for total matches, players, venues using Framer Motion), LiveTicker component (scrolling today-in-history facts from matchStore), RankingsPreview (top 5 teams and players from stats API), HistoricMatchesShowcase (3-5 featured matches with thumbnails), CTASection (call-to-action buttons). Use Tailwind asymmetric editorial grid layout. Implement scroll animations with Framer Motion when sections enter viewport.
Done when: Home page displays all sections with animated counters, live ticker, rankings, and featured matches with smooth scroll animations.

Task 46: Build Players list page
Phase: PHASE 6 — Frontend Pages
Depends on: Task 44, Task 39, Task 43
What to build: Create pages/Players.jsx with SearchBar (name search), FilterPanel (CountryFilter dropdown, RoleFilter dropdown, EraFilter dropdown), PlayerGrid (responsive grid of PlayerCard components showing name, country, role, batting average, bowling average, image), Pagination component. Use playerStore to fetch and filter players. Display SkeletonLoader while loading. Show error message if fetch fails.
Done when: Players page displays searchable, filterable, paginated player list with loading states and error handling.

Task 47: Build PlayerDetail page
Phase: PHASE 6 — Frontend Pages
Depends on: Task 44, Task 39, Task 43
What to build: Create pages/PlayerDetail.jsx with PlayerHeader (name, country, image, role, debut date), CareerTimeline (Recharts line chart showing runs/wickets over time), StatsOverview (BattingStats card, BowlingStats card, FieldingStats card with IBM Plex Mono font), PerformanceHeatmap (D3.js visualization of performance by venue/opposition), SimilarPlayers section (PlayerCard grid from ML similar players), MatchHistory (scrollable list of MatchRow components). Use playerStore to fetch player by ID and similar players. Use Framer Motion for section animations.
Done when: PlayerDetail page displays complete player profile with charts, stats, similar players, and match history.

Task 48: Build MatchCentre list page
Phase: PHASE 6 — Frontend Pages
Depends on: Task 44, Task 38, Task 43
What to build: Create pages/MatchCentre.jsx with FilterBar (DateRangeFilter, TeamFilter dropdown, VenueFilter dropdown), MatchList (MatchCard components showing team flags, team names, date, venue, result, win margin), Pagination component. Use matchStore to fetch and filter matches. Display SkeletonLoader while loading. Show error message if fetch fails.
Done when: MatchCentre page displays filterable, paginated match list with loading states and error handling.

Task 49: Build MatchDetail page
Phase: PHASE 6 — Frontend Pages
Depends on: Task 44, Task 38, Task 43
What to build: Create pages/MatchDetail.jsx with MatchHeader (team names, flags, venue, date, result, toss info), ScoreboardTabs (Tabs component with InningsScorecard for each innings showing batting table with runs/balls/4s/6s/SR and bowling table with overs/maidens/runs/wickets/economy, FallOfWickets chart, SessionChart showing runs per session), ManhattanGraph (D3.js bar chart of runs per over), WormGraph (D3.js line chart of cumulative runs), MatchNarrative (AI-generated text with Source Serif 4 font), PlayerPerformances (PlayerPerformanceCard grid). Use matchStore to fetch match by ID with populated innings data.
Done when: MatchDetail page displays complete match details with scorecards, visualizations, and narrative.

Task 50: Build Venues page with interactive map
Phase: PHASE 6 — Frontend Pages
Depends on: Task 44, Task 41, Task 43
What to build: Create pages/Venues.jsx with LeafletMap component (display all venues as markers with clustering, CountryFilter dropdown that highlights markers by nation), VenueSidePanel (slide-out panel from right using Framer Motion, shows VenueHeader with name/city/country, PitchProfile with SpinVsPacePieChart using Recharts, AvgFirstInningsScore stat, HistoricMoments list with MomentCard components, MatchesAtVenue list with MatchRow components). Use uiStore for side panel state. Fetch venues from API. On mobile, show VenueList as fallback with VenueCard grid.
Done when: Venues page displays interactive map with country filter, clickable markers, and slide-out side panel with complete venue details.

Task 51: Build StatsLab page with four prediction tabs
Phase: PHASE 6 — Frontend Pages
Depends on: Task 44, Task 40, Task 43
What to build: Create pages/StatsLab.jsx with TabNavigation (4 tabs: Match Result Predictor, Score Range Predictor, Best Playing XI Builder, Player Similarity Engine). Each tab has PredictionForm (input fields specific to prediction type using Select and Input components), SubmitButton, ResultDisplay (AnimatedProbabilityBar with Framer Motion, ConfidenceScore indicator, visualization specific to prediction type using Recharts, ResetButton). Use predictionStore for all predictions. Show Spinner while loading. Display error messages if prediction fails. Animate tab transitions with Framer Motion.
Done when: StatsLab page displays all four prediction tabs with forms, animated results, and error handling.

Task 52: Build History page with era tabs
Phase: PHASE 6 — Frontend Pages
Depends on: Task 44, Task 38, Task 43
What to build: Create pages/History.jsx with EraTabNavigation (5 tabs: 1877-1914, 1920-1950, 1950-1980, 1980-2000, 2000-present), EraContent (EraOverview with description and key events, EraRecords with sortable RecordTable, NotablePlayers grid with PlayerCard components), HeadToHeadTimeline (NationSelector1 and NationSelector2 dropdowns, TimelineChart using D3.js showing match results over time), GreatestTestsEver section (TestMatchCard grid with scorecards and narrative summaries). Fetch era stats from /api/v1/stats/era/:era and head-to-head from /api/v1/stats/head-to-head.
Done when: History page displays era-based tabs, head-to-head timeline, and greatest tests with all data fetched correctly.

Task 53: Build AIAnalyst page
Phase: PHASE 6 — Frontend Pages
Depends on: Task 44, Task 43
What to build: Create pages/AIAnalyst.jsx with ChatInterface (MessageList showing UserMessage and AIMessage components with formatted tables/lists, MessageInput with text input and send button), SuggestedPrompts (PromptButton components for "Compare Tendulkar vs Lara", "Best bowling figures at Lord's", "Predict India vs Australia"), ConversationContext maintained in component state. Create placeholder API endpoint /api/v1/chat that returns mock cricket responses. Display messages with Source Serif 4 font. Scroll to bottom on new messages. Use Framer Motion for message animations.
Done when: AIAnalyst page displays chat interface with suggested prompts, message history, and placeholder responses.

Task 54: Build Editorial page
Phase: PHASE 6 — Frontend Pages
Depends on: Task 44, Task 43
What to build: Create pages/Editorial.jsx with CategoryFilter (buttons for analysis, history, features, opinion, all), ArticleGrid (asymmetric editorial layout using Tailwind grid, ArticleCard components showing title, excerpt, author, date, featured image, read time), Pagination component. Fetch articles from /api/v1/articles with category filter. Display SkeletonLoader while loading. Use Framer Motion for card hover animations.
Done when: Editorial page displays filterable, paginated article grid with asymmetric layout and loading states.

Task 55: Build ArticleDetail page
Phase: PHASE 6 — Frontend Pages
Depends on: Task 44, Task 43
What to build: Create pages/ArticleDetail.jsx with ArticleHeader (title with Playfair Display, author, date, read time), FeaturedImage, ArticleContent (render markdown using react-markdown with Source Serif 4 font, proper typography for headings/paragraphs/lists/blockquotes), TagList (Badge components), RelatedArticles section (ArticleCard grid). Fetch article by slug from /api/v1/articles/:slug. Display Spinner while loading. Show 404 error if article not found.
Done when: ArticleDetail page displays full article with rendered markdown, proper typography, and related articles.

Task 56: Build Login and Register pages
Phase: PHASE 6 — Frontend Pages
Depends on: Task 44, Task 37, Task 43
What to build: Create pages/Login.jsx with form (email Input, password Input, submit Button) and link to Register. Create pages/Register.jsx with form (name Input, email Input, password Input, confirm password Input, submit Button) and link to Login. Use authStore for register and login actions. Display error messages from authStore. Redirect to home page on successful authentication. Use Framer Motion for form animations. Apply form validation (email format, password length, password match).
Done when: Login and Register pages work correctly with form validation, error display, and redirect on success.

## PHASE 7 — Integration

Task 57: Connect ML service to Express prediction endpoints
Phase: PHASE 7 — Integration
Depends on: Task 28, Task 30, Task 31, Task 32, Task 33
What to build: Update controllers/predictionController.js to replace placeholder functions with actual HTTP requests to Flask ML service. Use axios to call ML_SERVICE_URL from environment. For predictMatch, call POST /predict/match. For predictScore, call POST /predict/score. For predictXI, call POST /predict/xi. For predictSimilarPlayers, call POST /predict/similar-players. Handle ML service errors (timeout, unavailable) and return 503 with descriptive message. Save successful predictions to Prediction collection in MongoDB.
Done when: All four prediction endpoints in Express successfully forward requests to Flask ML service and return results or 503 errors.

Task 58: Connect player similar endpoint to ML service
Phase: PHASE 7 — Integration
Depends on: Task 21, Task 33
What to build: Update controllers/playerController.js getSimilarPlayers function to call Flask ML service POST /predict/similar-players with player_id. Replace placeholder empty array with actual similar players from ML service. Handle ML service errors gracefully and return empty array with warning message if service is unavailable.
Done when: GET /api/v1/players/:id/similar returns ML-generated similar players or empty array if service unavailable.

Task 59: Integrate predictions into Stats Lab UI
Phase: PHASE 7 — Integration
Depends on: Task 51, Task 57
What to build: Update pages/StatsLab.jsx to use predictionStore actions for all four prediction types. Ensure forms collect all required parameters per ML service input specifications. Display prediction results with animated probability bars using Framer Motion. For match predictions, show probabilities as horizontal bars. For score predictions, show range chart with Recharts. For XI predictions, show visual formation with player cards. For similarity predictions, show radar comparison chart with Recharts. Add reset buttons that clear predictionStore state.
Done when: All four prediction tabs in Stats Lab successfully call ML service through backend and display animated results.

Task 60: Connect AI Analyst to backend chat endpoint
Phase: PHASE 7 — Integration
Depends on: Task 53
What to build: Create backend endpoint POST /api/v1/chat in controllers/chatController.js that accepts message and conversation history. Implement basic cricket-domain response logic using keyword matching (player names, team names, venue names) to query MongoDB and return formatted responses. For "Compare X vs Y", fetch player stats and return comparison. For "Best bowling at X", query matches at venue. For "Predict X vs Y", return suggestion to use Stats Lab. Mount route at /api/v1/chat with authMiddleware. Update AIAnalyst page to call this endpoint instead of placeholder.
Done when: AI Analyst chat interface sends messages to backend and receives cricket-domain responses based on database queries.

Task 61: End-to-end data flow testing
Phase: PHASE 7 — Integration
Depends on: Task 57, Task 58, Task 59, Task 60
What to build: Create test script scripts/e2e-test.js that verifies complete data flows: (1) Seed data into MongoDB, (2) Start backend server, (3) Start ML service, (4) Test all API endpoints return data, (5) Test all prediction endpoints return results, (6) Test chat endpoint returns responses, (7) Verify frontend can fetch data from all endpoints. Log success/failure for each test. Use axios to make requests. Exit with code 0 if all pass, 1 if any fail.
Done when: Running `node scripts/e2e-test.js` verifies all data flows work correctly from database through backend and ML service to frontend.

## PHASE 8 — Polish

Task 62: Add Framer Motion animations to all pages
Phase: PHASE 8 — Polish
Depends on: Task 45, Task 46, Task 47, Task 48, Task 49, Task 50, Task 51, Task 52, Task 53, Task 54, Task 55, Task 56
What to build: Review all page components and add Framer Motion animations: page transitions (fade in/out), scroll animations (sections fade/slide in when entering viewport using useInView hook), card hover effects (scale and shadow), button hover effects (scale), list item stagger animations (children animate in sequence), modal entrance/exit animations (scale and fade), side panel slide animations (translateX). Use consistent animation durations (0.3s for quick interactions, 0.6s for page transitions) and easing (ease-in-out).
Done when: All pages have smooth Framer Motion animations for transitions, scrolling, hovers, and interactions.

Task 63: Implement skeleton loading screens
Phase: PHASE 8 — Polish
Depends on: Task 43, Task 46, Task 47, Task 48, Task 49, Task 50, Task 51, Task 52, Task 54, Task 55
What to build: Update all pages that fetch data to display SkeletonLoader components while loading. Create skeleton variants for PlayerCard, MatchCard, ArticleCard, StatsTable, Chart placeholders. Skeletons should match the layout of actual components with animated shimmer effect using Tailwind and CSS animations. Replace generic Spinner with contextual skeletons.
Done when: All data-fetching pages display skeleton loaders that match component layouts with shimmer animations.

Task 64: Add error boundaries to all pages
Phase: PHASE 8 — Polish
Depends on: Task 43, Task 45, Task 46, Task 47, Task 48, Task 49, Task 50, Task 51, Task 52, Task 53, Task 54, Task 55, Task 56
What to build: Wrap all page components in App.jsx routes with ErrorBoundary component. Update ErrorBoundary to display user-friendly error message with Reload button and Home button. Log error details to console with component stack trace. Add error boundary around major sections within pages (charts, data tables) to prevent entire page crash if one section fails.
Done when: All pages are wrapped in error boundaries that catch React errors and display fallback UI without crashing entire app.

Task 65: Mobile responsive fixes
Phase: PHASE 8 — Polish
Depends on: Task 45, Task 46, Task 47, Task 48, Task 49, Task 50, Task 51, Task 52, Task 53, Task 54, Task 55, Task 56
What to build: Review all pages on mobile viewport (375px width) and fix responsive issues. Ensure Navbar collapses to hamburger menu below 768px. Ensure all tables scroll horizontally on mobile. Ensure charts resize correctly. Ensure touch targets are minimum 44x44px. Ensure text is readable (minimum 16px). Ensure forms are usable on mobile. Ensure map on Venues page works with touch gestures. Test on iOS Safari and Android Chrome.
Done when: All pages display correctly and are fully functional on mobile devices with proper touch interactions.

Task 66: Performance optimization
Phase: PHASE 8 — Polish
Depends on: Task 34, Task 36, Task 45, Task 46, Task 47, Task 48, Task 49, Task 50, Task 51, Task 52, Task 53, Task 54, Task 55, Task 56
What to build: Implement React.lazy and Suspense for route-based code splitting (lazy load all page components). Add dynamic imports for heavy libraries (D3, Leaflet) only on pages that use them. Optimize images (compress, use WebP format, add lazy loading). Add response caching to backend for /api/v1/stats/records and /api/v1/stats/rankings with 5-minute TTL using node-cache library. Add database compound indexes for common query patterns (team+date, venue+team). Run Vite build and verify bundle size under 500KB for initial load.
Done when: Frontend bundle size is under 500KB, pages load quickly with code splitting, and frequently accessed API endpoints are cached.

## Summary

| Phase | Task Count |
|-------|-----------|
| PHASE 1 — Foundation | 16 tasks |
| PHASE 2 — Data Pipeline | 3 tasks |
| PHASE 3 — Backend APIs | 9 tasks |
| PHASE 4 — ML Service | 5 tasks |
| PHASE 5 — Frontend Foundation | 11 tasks |
| PHASE 6 — Frontend Pages | 12 tasks |
| PHASE 7 — Integration | 5 tasks |
| PHASE 8 — Polish | 5 tasks |
| **TOTAL** | **66 tasks** |
