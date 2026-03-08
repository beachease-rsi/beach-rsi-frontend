import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getRecommendations, getRSIColor, getSuitabilityColor, ACTIVITY_ICONS } from '../services/api';
import RSIGauge from '../components/RSIGauge';
import ActivityBadge from '../components/ActivityBadge';
import AlertBanner from '../components/AlertBanner';

export default function RecommendPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);

    const lat = parseFloat(params.get('lat') || 15.5);
    const lon = parseFloat(params.get('lon') || 73.8);
    const activities = (params.get('activities') || 'swimming').split(',').filter(Boolean);
    const level = params.get('level') || 'learner';

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('score'); // 'score' | 'distance'
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        getRecommendations({ lat, lon, activities, experienceLevel: level })
            .then(res => setData(res.data))
            .catch(err => setError(err.response?.data?.error || 'Failed to load recommendations'))
            .finally(() => setLoading(false));
    }, []);

    const sorted = data?.recommendations
        ? [...data.recommendations].sort((a, b) =>
            sortBy === 'distance'
                ? a.distanceKm - b.distanceKm
                : b.recommendationScore - a.recommendationScore
        )
        : [];

    const levelMeta = {
        learner: { emoji: '🌱', color: 'var(--rsi-safe)' },
        intermediate: { emoji: '🏊', color: 'var(--rsi-moderate)' },
        pro: { emoji: '🏆', color: '#ffd700' },
    }[level] || {};

    return (
        <div className="page">
            {/* ── Header ── */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">🏖️ Your Recommendations</h1>
                    <p className="page-subtitle">
                        {levelMeta.emoji} <span style={{ color: levelMeta.color, textTransform: 'capitalize', fontWeight: 600 }}>{level}</span>
                        {' · '}
                        {activities.map(a => ACTIVITY_ICONS[a] || '').join(' ')} {activities.join(', ')}
                    </p>
                </div>
                <button className="btn btn-outline" onClick={() => navigate('/onboard')}>↩ Change</button>
            </div>

            {error && <div className="alert-banner alert-danger"><span>❌</span><div>{error}</div></div>}

            {loading ? (
                <div className="loading" style={{ marginTop: '10vh' }}>
                    <div className="spinner" />
                    <span>Analysing beaches for you...</span>
                </div>
            ) : data && (
                <>
                    {/* ── Top Pick Banner ── */}
                    {sorted[0] && (
                        <div className="top-pick-banner">
                            <div className="top-pick-left">
                                <span className="top-pick-crown">👑</span>
                                <div>
                                    <div className="top-pick-label">Best Beach For You</div>
                                    <div className="top-pick-name">{sorted[0].beach.name}</div>
                                    <div className="top-pick-state">{sorted[0].beach.state} · {sorted[0].distanceKm} km away</div>
                                </div>
                            </div>
                            <div className="top-pick-score" style={{ color: getRSIColor(sorted[0].rsi.score) }}>
                                {sorted[0].rsi.score} <span style={{ fontSize: 16 }}>{sorted[0].rsi.emoji}</span>
                            </div>
                        </div>
                    )}

                    {/* ── Sort toggle ── */}
                    <div className="sort-toggle">
                        <span>Sort by:</span>
                        <button className={`sort-btn ${sortBy === 'score' ? 'active' : ''}`} onClick={() => setSortBy('score')}>
                            🏅 Best Score
                        </button>
                        <button className={`sort-btn ${sortBy === 'distance' ? 'active' : ''}`} onClick={() => setSortBy('distance')}>
                            📍 Nearest First
                        </button>
                    </div>

                    {/* ── Recommendation Cards ── */}
                    <div className="rec-list">
                        {sorted.slice(0, 50).map((item, i) => {
                            const isOpen = expanded === i;
                            const score = item.rsi?.score;
                            return (
                                <div key={i} className={`rec-card ${isOpen ? 'open' : ''}`}>
                                    <div className="rec-card-main" onClick={() => setExpanded(isOpen ? null : i)}>
                                        <div className="rec-rank" style={{ color: getRSIColor(score) }}>#{item.rank}</div>
                                        <div className="rec-info">
                                            <div className="rec-name">
                                                {item.beach.name}
                                                {item.beach.blueFlagCertified && (
                                                    <span className="blue-flag-badge" style={{ marginLeft: 10, fontSize: 11 }}>🏴</span>
                                                )}
                                            </div>
                                            <div className="rec-state">{item.beach.state}</div>
                                            <div className="rec-activities">
                                                {activities.map(a => {
                                                    const s = item.activitySuitability?.[a];
                                                    if (!s) return null;
                                                    return (
                                                        <span key={a} className="rec-activity-chip"
                                                            style={{ color: getSuitabilityColor(s.label), borderColor: getSuitabilityColor(s.label) }}>
                                                            {ACTIVITY_ICONS[a]} {s.label}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="rec-right">
                                            <div className="rec-distance">{item.distanceKm} km</div>
                                            <div className="rec-rsi-score" style={{ color: getRSIColor(score) }}>
                                                {score} {item.rsi?.emoji}
                                            </div>
                                            <div className="rec-safety-badge"
                                                style={{ color: item.alerts?.overallSafety === 'SAFE' ? 'var(--rsi-safe)' : item.alerts?.overallSafety === 'CAUTION' ? 'var(--rsi-risky)' : 'var(--rsi-unsafe)' }}>
                                                {item.alerts?.overallSafety}
                                            </div>
                                        </div>
                                        <span className="rec-chevron">{isOpen ? '▲' : '▼'}</span>
                                    </div>

                                    {isOpen && (
                                        <div className="rec-card-detail">
                                            {/* Activity suitability bars */}
                                            <div className="rec-detail-section">
                                                <h4>Activity Suitability — {level}</h4>
                                                {activities.map(a => {
                                                    const s = item.activitySuitability?.[a];
                                                    return s ? <ActivityBadge key={a} activity={a} label={s.label} score={s.score} /> : null;
                                                })}
                                            </div>
                                            {/* Alerts */}
                                            {item.alerts?.alerts?.length > 0 && (
                                                <div className="rec-detail-section">
                                                    <h4>Safety Alerts</h4>
                                                    <AlertBanner alerts={item.alerts.alerts} />
                                                </div>
                                            )}
                                            <button className="btn btn-primary" style={{ marginTop: 16 }}
                                                onClick={() => navigate(`/beach/${item.beach.city}`)}>
                                                View Full RSI →
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
