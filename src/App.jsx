import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import SSEAlertToast from './components/SSEAlertToast';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import ComparePage from './pages/ComparePage';
import RankingsPage from './pages/RankingsPage';
import OnboardingPage from './pages/OnboardingPage';
import NearbyPage from './pages/NearbyPage';
import RecommendPage from './pages/RecommendPage';
import BeachDetailPage from './pages/BeachDetailPage';
import HistoryPage from './pages/HistoryPage';
import AlertsPage from './pages/AlertsPage';

export default function App() {
  return (
    <BrowserRouter>
      {/* ── APP CONTENT ── */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Navbar />
        {/* Global SSE toast — monitors 5 major beaches always */}
        <SSEAlertToast beaches={['goa', 'mumbai', 'puri', 'vizag', 'kovalam']} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/rankings" element={<RankingsPage />} />
          <Route path="/onboard" element={<OnboardingPage />} />
          <Route path="/nearby" element={<NearbyPage />} />
          <Route path="/recommend" element={<RecommendPage />} />
          <Route path="/beach/:city" element={<BeachDetailPage />} />
          <Route path="/beach/:city/history" element={<HistoryPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
