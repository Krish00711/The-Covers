import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import PageWrapper from './components/layout/PageWrapper';

// Page imports
import Home from './pages/Home';
import Players from './pages/Players';
import PlayerDetail from './pages/PlayerDetail';
import MatchCentre from './pages/MatchCentre';
import MatchDetail from './pages/MatchDetail';
import Venues from './pages/Venues';
import StatsLab from './pages/StatsLab';
import History from './pages/History';
import AIAnalyst from './pages/AIAnalyst';
import Editorial from './pages/Editorial';
import ArticleDetail from './pages/ArticleDetail';
import Schedule from './pages/Schedule';
import Login from './pages/Login';
import Register from './pages/Register';

function NotFound() {
  return (
    <div style={{ padding: '80px 40px', textAlign: 'center' }}>
      <h1 className="display" style={{ fontSize: '96px', color: 'var(--accent)', marginBottom: '16px' }}>404</h1>
      <p style={{ fontSize: '20px', color: 'var(--muted)', marginBottom: '32px' }}>Page not found</p>
      <a href="/" style={{ padding: '16px 32px', background: 'var(--accent)', color: 'var(--bg)', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
        Go Home
      </a>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: '0' }}>
          <Routes>
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/players" element={<PageWrapper><Players /></PageWrapper>} />
            <Route path="/players/:id" element={<PageWrapper><PlayerDetail /></PageWrapper>} />
            <Route path="/matches" element={<PageWrapper><MatchCentre /></PageWrapper>} />
            <Route path="/matches/:id" element={<PageWrapper><MatchDetail /></PageWrapper>} />
            <Route path="/schedule" element={<PageWrapper><Schedule /></PageWrapper>} />
            <Route path="/venues" element={<PageWrapper><Venues /></PageWrapper>} />
            <Route path="/stats-lab" element={<PageWrapper><StatsLab /></PageWrapper>} />
            <Route path="/history" element={<PageWrapper><History /></PageWrapper>} />
            <Route path="/ai-analyst" element={<PageWrapper><AIAnalyst /></PageWrapper>} />
            <Route path="/editorial" element={<PageWrapper><Editorial /></PageWrapper>} />
            <Route path="/editorial/:slug" element={<PageWrapper><ArticleDetail /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
            <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
