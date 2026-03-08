import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBeachRSI, getBeachHistory, getRSIColor, ACTIVITY_ICONS } from '../services/api';
import RSIGauge from '../components/RSIGauge';
import AlertBanner from '../components/AlertBanner';
import ActivityBadge from '../components/ActivityBadge';

export default function BeachDetailPage() {
    const { city } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // optional: experience filter
    const [level, setLevel] = useState('');
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        if (!city) return;
        loadBeach();
    }, [city, level]);

    const loadBeach = async () => {
        setLoading(true); setError('');
        try {
            const params = {};
            if (level && activities.length) {
                params.level = level;
                params.activities = activities.join(',');
            }
            const [beachRes, histRes] = await Promise.all([
                getBeachRSI(city, params),
                getBeachHistory(city).catch(() => ({ data: { data: [] } })),
            ]);
            setData(beachRes.data);
            setHistory(histRes.data.data || []);
        } catch (err) {
            setError(err.response?.data?.error || `Beach "${city}" not found`);
        }
        setLoading(false);
    };

    const toggleActivity = (a) =>
        setActivities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

    if (loading) return (
        <div className="page">
            <div className="loading"><div className="spinner" /><span>Loading beach data...</span></div>
        </div>
    );

    if (error) return (
        <div className="page">
            <button className="btn btn-outline" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>← Back</button>
            <div className="alert-banner alert-danger"><span>❌</span><div><strong>{error}</strong></div></div>
        </div>
    );

    if (!data) return null;
    const { beach, rsi, weather, safety, activitySafety, subScores, normalizedData } = data;

    return (
        <div className="landing-theme page" style={{ position: 'relative', zIndex: 1 }}>
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

            {/* ── APP CONTENT WRAPPER ── */}
            <div style={{ position: 'relative', zIndex: 10 }}>
                {/* ── Breadcrumb ── */}
                <div className="detail-breadcrumb">
                    <button className="btn-link" onClick={() => navigate(-1)}>← Back</button>
                    <span>/</span>
                    <span>{beach.state}</span>
                    <span>/</span>
                    <strong>{beach.name}</strong>
                </div>

                {/* ── Hero Banner ── */}
                <div className="detail-hero">
                    <div className="detail-hero-left">
                        <RSIGauge score={rsi.score} />
                        <div style={{ marginTop: 12, textAlign: 'center' }}>
                            <div className="beach-name">{beach.name}</div>
                            <div className="beach-state">{beach.state}</div>
                            {beach.blueFlagCertified && (
                                <div className="blue-flag-badge" style={{ justifyContent: 'center', marginTop: 8 }}>
                                    🏴 Blue Flag Certified
                                </div>
                            )}
                            <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-muted)' }}>
                                {beach.tideType && (
                                    <span>🌊 {beach.tideType.charAt(0).toUpperCase() + beach.tideType.slice(1)} Tides</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="detail-hero-right">
                        <p className="detail-description">{beach.description}</p>

                        {/* Live weather strip */}
                        <div className="weather-strip">
                            <div className="weather-strip-item"><span>🌡️</span><div><div className="ws-label">Temp</div><div className="ws-val">{weather.temperature}</div></div></div>
                            <div className="weather-strip-item"><span>🤔</span><div><div className="ws-label">Feels Like</div><div className="ws-val">{weather.feelsLike}</div></div></div>
                            <div className="weather-strip-item"><span>💨</span><div><div className="ws-label">Wind</div><div className="ws-val">{weather.windSpeed}</div></div></div>
                            <div className="weather-strip-item"><span>💧</span><div><div className="ws-label">Humidity</div><div className="ws-val">{weather.humidity}</div></div></div>
                            <div className="weather-strip-item">
                                <span>☀️</span>
                                <div>
                                    <div className="ws-label">UV Index</div>
                                    <div className="ws-val" style={{ color: weather.uvIndex >= 8 ? 'var(--rsi-unsafe)' : weather.uvIndex >= 6 ? 'var(--rsi-risky)' : 'inherit' }}>
                                        {weather.uvIndex}
                                    </div>
                                </div>
                            </div>
                            <div className="weather-strip-item"><span>👁️</span><div><div className="ws-label">Visibility</div><div className="ws-val">{weather.visibility}</div></div></div>
                            <div className="weather-strip-item"><span>☁️</span><div><div className="ws-label">Cloud</div><div className="ws-val">{weather.cloudCover}</div></div></div>
                        </div>

                        {/* Natural calamity alerts from OWM */}
                        {weather.naturalCalamityAlerts?.length > 0 && (
                            <div className="calamity-strip">
                                <span>🚨</span>
                                <strong>Government Alert:</strong>
                                {weather.naturalCalamityAlerts.map((a, i) => (
                                    <span key={i}> {a.event || a.description || JSON.stringify(a)}</span>
                                ))}
                            </div>
                        )}

                        {/* Data freshness */}
                        <div className="detail-meta">
                            Source: {weather.dataSource} ·{' '}
                            {weather.fromCache ? '⚡ cached' : '🔴 live'} ·{' '}
                            {new Date(data.timestamp).toLocaleString()}
                        </div>
                    </div>
                </div >

                <div className="dashboard-grid">
                    <div className="dashboard-col">
                        {/* ── Safety Alerts ── */}
                        <div className="detail-section">
                            <h2 className="detail-section-title">🚦 General Safety Alerts</h2>
                            <AlertBanner alerts={safety.alerts} />
                        </div>

                        {/* ── Experience Filter ── */}
                        <div className="detail-section">
                            <h2 className="detail-section-title">🎯 Check For Your Activity</h2>
                            <div className="detail-filter-row">
                                {/* Level selector */}
                                <div className="exp-pills">
                                    {[
                                        { k: 'learner', e: '🌱' },
                                        { k: 'intermediate', e: '🏊' },
                                        { k: 'pro', e: '🏆' },
                                    ].map(({ k, e }) => (
                                        <button key={k} className={`exp-pill ${level === k ? 'active' : ''}`}
                                            onClick={() => setLevel(level === k ? '' : k)}>
                                            {e} {k}
                                        </button>
                                    ))}
                                </div>
                                {/* Activity multi-select if level chosen */}
                                {level && (
                                    <div className="activity-tags" style={{ marginTop: 12, justifyContent: 'flex-start' }}>
                                        {beach.activities?.map(a => (
                                            <button key={a}
                                                className={`activity-tag ${activities.includes(a) ? 'selected-tag' : ''}`}
                                                onClick={() => toggleActivity(a)}
                                                style={{ cursor: 'pointer', border: activities.includes(a) ? '1px solid var(--accent)' : '1px solid transparent' }}>
                                                {ACTIVITY_ICONS[a]} {a.replace(/-/g, ' ')}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {level && activities.length > 0 && (
                                    <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={loadBeach}>
                                        Analyse →
                                    </button>
                                )}
                            </div>

                            {/* Activity suitability from backend */}
                            {activitySafety?.suitability && (
                                <div style={{ marginTop: 20 }}>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                                        Overall: <strong style={{ color: activitySafety.overallSafety === 'SAFE' ? 'var(--rsi-safe)' : activitySafety.overallSafety === 'CAUTION' ? 'var(--rsi-risky)' : 'var(--rsi-unsafe)' }}>
                                            {activitySafety.overallSafety}
                                        </strong>
                                        {' '}· {activitySafety.alertCount} alerts · Level: <strong style={{ textTransform: 'capitalize' }}>{activitySafety.experienceLevel}</strong>
                                    </div>
                                    {Object.entries(activitySafety.suitability).map(([act, s]) => (
                                        <ActivityBadge key={act} activity={act} label={s.label} score={s.score} />
                                    ))}
                                    <AlertBanner alerts={activitySafety.alerts?.filter(a => a.level !== 'INFO')} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="dashboard-col">
                        {/* ── RSI Breakdown ── */}
                        <div className="detail-section">
                            <h2 className="detail-section-title">📊 RSI Score Breakdown</h2>
                            <div className="subscore-grid">
                                {Object.entries(subScores).map(([key, val]) => (
                                    <div key={key} className="subscore-card">
                                        <div className="subscore-card-header">
                                            <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{key}</span>
                                            <span className="subscore-card-weight">{val.weight}</span>
                                        </div>
                                        <div className="subscore-card-score" style={{ color: getRSIColor(val.score) }}>
                                            {val.score}<span style={{ fontSize: 16 }}>/100</span>
                                        </div>
                                        <div className="subscore-track" style={{ marginTop: 8 }}>
                                            <div className="subscore-fill" style={{ width: `${val.score}%`, background: getRSIColor(val.score) }} />
                                        </div>
                                        {/* Per-parameter breakdown */}
                                        {val.breakdown && (
                                            <div className="breakdown-list">
                                                {Object.entries(val.breakdown).map(([param, b]) => (
                                                    <div key={param} className="breakdown-row">
                                                        <span className="breakdown-name">{param.replace(/([A-Z])/g, ' $1')}</span>
                                                        <span className="breakdown-val">{b.value}{b.unit}</span>
                                                        <span className="breakdown-score" style={{ color: getRSIColor(b.score) }}>{b.score}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Activities at this beach ── */}
                        <div className="detail-section">
                            <h2 className="detail-section-title">🏖️ Available Activities</h2>
                            <div className="activity-tags">
                                {beach.activities?.map(a => (
                                    <span key={a} className="activity-tag">
                                        {ACTIVITY_ICONS[a]} {a.replace(/-/g, ' ')}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* ── Coordinates ── */}
                        <div className="detail-section">
                            <h2 className="detail-section-title">📍 Location</h2>
                            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                                <div className="coord-chip">Lat: <strong>{beach.coordinates?.lat}°</strong></div>
                                <div className="coord-chip">Lon: <strong>{beach.coordinates?.lon}°</strong></div>
                                <a
                                    href={`https://www.google.com/maps?q=${beach.coordinates?.lat},${beach.coordinates?.lon}`}
                                    target="_blank" rel="noreferrer"
                                    className="btn btn-outline" style={{ fontSize: 13, padding: '6px 16px' }}>
                                    🗺️ Open in Google Maps
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-col" style={{ gridColumn: '1 / -1' }}>
                        {/* ── Normalized Data Table (Dclean) ── */}
                        {normalizedData && (
                            <div className="detail-section">
                                <h2 className="detail-section-title">🔬 Normalised Data (D<sub>clean</sub>)</h2>
                                <table className="norm-table">
                                    <thead>
                                        <tr><th>Parameter</th><th>Raw Value</th><th>Normalised (0–1)</th></tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(normalizedData).map(([key, val]) => (
                                            <tr key={key}>
                                                <td style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</td>
                                                <td>{weather[key] !== undefined ? weather[key] : '–'}</td>
                                                <td><strong>{val}</strong></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* ── RSI History ── */}
                        {history.length > 0 && (
                            <div className="detail-section">
                                <h2 className="detail-section-title">
                                    📈 RSI History
                                    <Link to={`/beach/${city}/history`} className="detail-section-link">View full →</Link>
                                </h2>
                                <div className="history-mini">
                                    {history.slice(0, 8).map((rec, i) => (
                                        <div key={i} className="history-mini-card">
                                            <div className="history-mini-score" style={{ color: getRSIColor(rec.rsiScore) }}>
                                                {rec.rsiScore}
                                            </div>
                                            <div className="history-mini-label">{rec.classification}</div>
                                            <div className="history-mini-time">
                                                {new Date(rec.calculatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Compare + Alerts shortcuts ── */}
                <div className="detail-actions">
                    <Link to={`/compare?cities=${city}`} className="btn btn-outline">⚖️ Add to Compare</Link>
                    <Link to={`/alerts?beaches=${city}`} className="btn btn-outline">🔔 Monitor Alerts</Link>
                    <Link to={`/beach/${city}/history`} className="btn btn-outline">📈 Full History</Link>
                </div>
            </div>
        </div>
    );
}
