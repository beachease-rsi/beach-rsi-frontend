import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBeachRSI, getRSIColor, ACTIVITY_ICONS } from '../services/api';
import RSIGauge from '../components/RSIGauge';
import AlertBanner from '../components/AlertBanner';
import ActivityBadge from '../components/ActivityBadge';

export default function HomePage() {
  const [city, setCity] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // optional experience filters shown after result
  const [activities, setActivities] = useState('');
  const [level, setLevel] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    setLoading(true); setError(''); setData(null);
    try {
      const params = {};
      if (activities.trim()) params.activities = activities.trim();
      if (level) params.level = level;
      const res = await getBeachRSI(city.trim(), params);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Beach not found. Try: goa, mumbai, chennai, puri, vizag');
    }
    setLoading(false);
  };

  return (
    <div className="landing-theme">
      {/* ── BACKGROUND THEME ── */}
      <div className="landing-bg" />
      <div className="ocean-bg">
        <svg className="svg-waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
          <defs>
            <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
          </defs>
          <g className="parallax">
            <use xlinkHref="#gentle-wave" x="48" y="0" />
            <use xlinkHref="#gentle-wave" x="48" y="3" />
            <use xlinkHref="#gentle-wave" x="48" y="5" />
            <use xlinkHref="#gentle-wave" x="48" y="7" />
          </g>
        </svg>

        <svg className="svg-rocks" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 200" preserveAspectRatio="none">
          <path d="M0 200 L0 120 Q50 80 100 130 T200 150 L200 200 Z" fill="#3E4258" opacity="0.9" />
          <path d="M0 200 L0 150 Q40 130 80 160 T150 180 L150 200 Z" fill="#2B2D42" />
          <path d="M1000 200 L1000 100 Q950 50 850 120 T700 140 L700 200 Z" fill="#3E4258" opacity="0.9" />
          <path d="M1000 200 L1000 140 Q940 120 880 150 T800 180 L800 200 Z" fill="#2B2D42" />
          <path d="M600 200 L650 160 Q680 140 700 180 Z" fill="#2B2D42" />
          <path d="M250 200 L300 170 Q320 160 350 190 Z" fill="#3E4258" opacity="0.8" />
        </svg>
      </div>
      <div className="landing-grass" />

      {/* ── APP CONTENT WRAPPER (Sits above background) ── */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* ── Hero ── */}
        <section className="hero" style={{ background: 'transparent', paddingBottom: 0, paddingTop: 100 }}>
          <div className="hero-badge" style={{ background: 'rgba(0, 212, 170, 0.2)', color: '#028090' }}>🌊 Real-time Beach Safety</div>
          <h1 style={{ color: '#0a1628' }}>Find Your Safest Beach 🌊</h1>
          <p style={{ color: '#1a2940', fontWeight: 500 }}>Real-time Recreational Suitability Index for Indian beaches</p>

          <form onSubmit={handleSearch}>
            <div className="search-bar" style={{ background: 'rgba(10, 22, 40, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <input
                type="text"
                placeholder="Search beach city... (e.g. goa, mumbai, puri, vizag)"
                value={city}
                onChange={e => setCity(e.target.value)}
                style={{ color: 'var(--text-primary)' }}
              />
              <button type="submit">{loading ? '⏳' : '🔍 Search'}</button>
            </div>
          </form>

          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => navigate('/onboard')} style={{ boxShadow: '0 4px 15px rgba(0, 212, 170, 0.5)' }}>
              🏖️ Get Personalized Recommendations
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/nearby')} style={{ color: '#0077b6', borderColor: '#0077b6' }}>
              📍 Beaches Near Me
            </button>
          </div>
        </section>

        {/* ── Search Results Container ── */}
        <div className="landing-section" style={{ paddingBottom: 40 }}>
          {error && (
            <div className="alert-banner alert-danger">
              <span>❌</span><div><strong>{error}</strong></div>
            </div>
          )}
          {loading && (
            <div className="loading">
              <div className="spinner" style={{ borderTopColor: '#00d4aa', borderColor: 'rgba(255,255,255,0.1)' }} />
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Analysing beach conditions...</span>
            </div>
          )}

          {data && (
            <div className="landing-glass-panel">
              <div className="result-section" style={{ marginTop: 0 }}>
                {/* ── Left: Gauge + beach info ── */}
                <div className="result-left">
                  <RSIGauge score={data.rsi.score} />
                  <div className="beach-info" style={{ textAlign: 'center' }}>
                    <div className="beach-name" style={{ color: 'var(--text-primary)' }}>{data.beach.name}</div>
                    <div className="beach-state" style={{ color: 'var(--text-secondary)' }}>{data.beach.state}</div>
                    {data.beach.blueFlagCertified && (
                      <div className="blue-flag-badge">🏴 Blue Flag Certified</div>
                    )}
                    <div className="activity-tags" style={{ justifyContent: 'center', marginTop: 12 }}>
                      {data.beach.activities?.map(a => (
                        <span key={a} className="activity-tag" style={{ background: 'rgba(0, 212, 170, 0.1)', color: 'var(--accent)' }}>
                          {ACTIVITY_ICONS[a]} {a.replace(/-/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Experience filter pills */}
                  <div className="exp-filter-box" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                      Filter by experience:
                    </p>
                    <div className="exp-pills">
                      {['learner', 'intermediate', 'pro'].map(l => (
                        <button
                          key={l}
                          className={`exp-pill ${level === l ? 'active' : ''}`}
                          onClick={() => setLevel(level === l ? '' : l)}
                          style={{ borderColor: level === l ? 'var(--accent)' : 'rgba(255,255,255,0.2)', color: level === l ? 'var(--accent)' : 'var(--text-primary)', background: level === l ? 'rgba(0, 212, 170, 0.1)' : 'transparent' }}
                        >
                          {l === 'learner' ? '🌱' : l === 'intermediate' ? '🏊' : '🏆'} {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Right: Weather + Alerts + Suitability ── */}
                <div className="result-right">
                  <AlertBanner alerts={data.safety?.alerts || data.activitySafety?.alerts} />

                  <div className="weather-grid">
                    <div className="weather-card" style={{ background: 'rgba(255,255,255,0.6)', borderColor: 'rgba(0,0,0,0.05)', color: '#0a1628' }}><div className="weather-icon">🌡️</div><div className="weather-label" style={{ color: '#0077b6' }}>Temperature</div><div className="weather-value">{data.weather.temperature}</div></div>
                    <div className="weather-card" style={{ background: 'rgba(255,255,255,0.6)', borderColor: 'rgba(0,0,0,0.05)', color: '#0a1628' }}><div className="weather-icon">💨</div><div className="weather-label" style={{ color: '#0077b6' }}>Wind</div><div className="weather-value">{data.weather.windSpeed}</div></div>
                    <div className="weather-card" style={{ background: 'rgba(255,255,255,0.6)', borderColor: 'rgba(0,0,0,0.05)', color: '#0a1628' }}><div className="weather-icon">💧</div><div className="weather-label" style={{ color: '#0077b6' }}>Humidity</div><div className="weather-value">{data.weather.humidity}</div></div>
                    <div className="weather-card" style={{ background: 'rgba(255,255,255,0.6)', borderColor: 'rgba(0,0,0,0.05)', color: '#0a1628' }}><div className="weather-icon">☀️</div><div className="weather-label" style={{ color: '#0077b6' }}>UV Index</div>
                      <div className="weather-value" style={{ color: data.weather.uvIndex >= 8 ? 'var(--rsi-unsafe)' : 'inherit' }}>{data.weather.uvIndex}</div>
                    </div>
                    <div className="weather-card" style={{ background: 'rgba(255,255,255,0.6)', borderColor: 'rgba(0,0,0,0.05)', color: '#0a1628' }}><div className="weather-icon">☁️</div><div className="weather-label" style={{ color: '#0077b6' }}>Cloud Cover</div><div className="weather-value">{data.weather.cloudCover}</div></div>
                    <div className="weather-card" style={{ background: 'rgba(255,255,255,0.6)', borderColor: 'rgba(0,0,0,0.05)', color: '#0a1628' }}><div className="weather-icon">👁️</div><div className="weather-label" style={{ color: '#0077b6' }}>Visibility</div><div className="weather-value">{data.weather.visibility}</div></div>
                  </div>

                  {/* Activity suitability (if level was selected) */}
                  {data.activitySafety?.suitability && (
                    <div className="subscore-section" style={{ marginTop: 24 }}>
                      <h3 style={{ marginBottom: 16, fontSize: 18, color: '#0a1628' }}>
                        Activity Suitability — <span style={{ textTransform: 'capitalize' }}>{data.activitySafety.experienceLevel}</span>
                      </h3>
                      {Object.entries(data.activitySafety.suitability).map(([act, s]) => (
                        <ActivityBadge key={act} activity={act} label={s.label} score={s.score} />
                      ))}
                    </div>
                  )}

                  <div className="subscore-section">
                    <h3 style={{ marginBottom: 16, fontSize: 18, color: '#0a1628' }}>Score Breakdown</h3>
                    {Object.entries(data.subScores).map(([key, val]) => (
                      <div key={key} className="subscore-bar-container">
                        <div className="subscore-header">
                          <span style={{ textTransform: 'capitalize', color: '#334155', fontWeight: 600 }}>{key} ({val.weight})</span>
                          <span style={{ color: getRSIColor(val.score), fontWeight: 700 }}>{val.score}/100</span>
                        </div>
                        <div className="subscore-track" style={{ background: 'rgba(0,0,0,0.1)' }}>
                          <div className="subscore-fill" style={{ width: `${val.score}%`, background: getRSIColor(val.score) }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 16, fontSize: 12, color: '#475569' }}>
                    Data source: {data.weather.dataSource} · {new Date(data.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── About Us / What We Do ── */}
        <div className="landing-section" style={{ paddingBottom: 40, paddingTop: 0 }}>
          <div className="landing-glass-panel">
            <h2>About Us & What We Do</h2>
            <p>
              <b>BeachEase</b> is India's first real-time Recreational Suitability Index (RSI) platform dedicated to beach safety.
              We analyze thousands of environmental data points—from tidal patterns and wind speeds to UV indices and historical safety metrics—to
              alert you to natural hazards before you leave home.
            </p>
            <br />
            <p>
              <b>How we serve:</b> We provide instant, normalized safety classifications (Safe, Moderate, Risky, Unsafe) tailored strictly
              to your experience level and desired activities. Whether you are a beginner looking to wade in calm waters or a pro surfer chasing waves,
              our goal is to make every beach trip spectacular and safe.
            </p>
          </div>
        </div>

        {/* ── Exploratory Activity Showcase ── */}
        <div className="landing-section" style={{ paddingBottom: 40, paddingTop: 0 }}>
          <div className="landing-glass-panel">
            <h2>Popular Activities by Indian Beaches</h2>
            <p>Discover pristine, curated environments perfectly suited to your favorite pastimes.</p>
            <div className="photo-grid">
              <div className="photo-card">
                <img src="https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&q=80&w=400" alt="Surfing" />
                <div className="photo-caption">Advanced Surfing</div>
              </div>
              <div className="photo-card">
                <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400" alt="Sunbathing" />
                <div className="photo-caption">Peaceful Sunbathing</div>
              </div>
              <div className="photo-card">
                <img src="https://images.unsplash.com/photo-1520116468816-95b69f847357?auto=format&fit=crop&q=80&w=400" alt="Coastal Walk" />
                <div className="photo-caption">Coastal Walks with Family</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Community Reviews / Testimonials ── */}
        <div className="landing-section" style={{ paddingBottom: 160, paddingTop: 0 }}>
          <div className="landing-glass-panel">
            <h2>Community Reviews</h2>
            <p>See how BeachEase is helping thousands of beachgoers make safe and informed decisions.</p>

            <div className="review-grid">
              <div className="review-card">
                <div className="review-header">
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150" className="review-avatar" alt="Ananya" />
                  <div>
                    <div className="review-name">Ananya Sharma</div>
                    <div className="review-role">Family Traveler</div>
                  </div>
                </div>
                <div className="review-text">
                  "Checking BeachEase before heading to Goa saved our family trip. The RSI correctly warned us of strong rip currents that typical weather apps missed completely!"
                </div>
              </div>

              <div className="review-card">
                <div className="review-header">
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150" className="review-avatar" alt="Rahul" />
                  <div>
                    <div className="review-name">Rahul Verma</div>
                    <div className="review-role">Intermediate Surfer</div>
                  </div>
                </div>
                <div className="review-text">
                  "Finding the right waves without risking my safety used to be pure guesswork. The personalized activity index here is an absolute game-changer for surfing trips."
                </div>
              </div>

              <div className="review-card">
                <div className="review-header">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" className="review-avatar" alt="Priya" />
                  <div>
                    <div className="review-name">Priya Patel</div>
                    <div className="review-role">Local Explorer</div>
                  </div>
                </div>
                <div className="review-text">
                  "I love exploring hidden beaches across Maharashtra, but tide safety is unpredictable. The Beachease dashboard ensures I never get caught feeling unsafe."
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
