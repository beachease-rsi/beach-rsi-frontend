import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBeachHistory, getRSIColor } from '../services/api';

export default function HistoryPage() {
    const { city } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getBeachHistory(city)
            .then(res => setData(res.data))
            .catch(err => setError(err.response?.data?.error || 'Failed to load history'))
            .finally(() => setLoading(false));
    }, [city]);

    const records = data?.data || [];

    // Stats
    const avgRSI = records.length ? Math.round(records.reduce((s, r) => s + r.rsiScore, 0) / records.length) : null;
    const maxRSI = records.length ? Math.max(...records.map(r => r.rsiScore)) : null;
    const minRSI = records.length ? Math.min(...records.map(r => r.rsiScore)) : null;
    const safePct = records.length ? Math.round(records.filter(r => r.rsiScore >= 80).length / records.length * 100) : null;

    return (
        <div className="page">
            {/* ── Header ── */}
            <div className="page-header">
                <div>
                    <button className="btn-link" onClick={() => navigate(`/beach/${city}`)} style={{ marginBottom: 8 }}>
                        ← Back to {data?.beach || city}
                    </button>
                    <h1 className="page-title">📈 RSI History — {data?.beach || city}</h1>
                    <p className="page-subtitle">
                        {records.length} records stored · Each view of this beach saves a record
                    </p>
                </div>
            </div>

            {error && <div className="alert-banner alert-danger"><span>❌</span><div>{error}</div></div>}

            {loading ? (
                <div className="loading"><div className="spinner" /><span>Loading history...</span></div>
            ) : records.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: 48 }}>📭</p>
                    <p>No history yet for this beach.</p>
                    <p style={{ fontSize: 13, marginTop: 8 }}>Visit the beach detail page to generate RSI records.</p>
                    <button className="btn btn-primary" style={{ marginTop: 20 }}
                        onClick={() => navigate(`/beach/${city}`)}>
                        View Beach →
                    </button>
                </div>
            ) : (
                <>
                    {/* ── Stats strip ── */}
                    <div className="history-stats">
                        <div className="history-stat">
                            <div className="history-stat-value" style={{ color: getRSIColor(avgRSI) }}>{avgRSI}</div>
                            <div className="history-stat-label">Average RSI</div>
                        </div>
                        <div className="history-stat">
                            <div className="history-stat-value" style={{ color: getRSIColor(maxRSI) }}>{maxRSI}</div>
                            <div className="history-stat-label">Best RSI</div>
                        </div>
                        <div className="history-stat">
                            <div className="history-stat-value" style={{ color: getRSIColor(minRSI) }}>{minRSI}</div>
                            <div className="history-stat-label">Lowest RSI</div>
                        </div>
                        <div className="history-stat">
                            <div className="history-stat-value" style={{ color: 'var(--rsi-safe)' }}>{safePct}%</div>
                            <div className="history-stat-label">Safe readings</div>
                        </div>
                    </div>

                    {/* ── Visual timeline ── */}
                    <div className="history-timeline-header">
                        <span>RSI Trend (newest → oldest)</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{records.length} records</span>
                    </div>
                    <div className="history-bar-chart">
                        {records.slice(0, 30).map((rec, i) => (
                            <div key={i} className="history-bar-col" title={`${rec.rsiScore} — ${new Date(rec.calculatedAt).toLocaleString()}`}>
                                <div className="history-bar"
                                    style={{ height: `${rec.rsiScore}%`, background: getRSIColor(rec.rsiScore) }} />
                                <div className="history-bar-score">{rec.rsiScore}</div>
                            </div>
                        ))}
                    </div>

                    {/* ── Full record table ── */}
                    <div className="history-table-wrap">
                        <table className="norm-table history-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>RSI Score</th>
                                    <th>Classification</th>
                                    <th>Weather Score</th>
                                    <th>Wind Score</th>
                                    <th>Comfort Score</th>
                                    <th>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((rec, i) => (
                                    <tr key={i}>
                                        <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                        <td>
                                            <span style={{ color: getRSIColor(rec.rsiScore), fontWeight: 700, fontSize: 16 }}>
                                                {rec.rsiScore}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`rsi-badge ${rec.classification?.toLowerCase()}`}>
                                                {rec.classification === 'Safe' ? '🟢' : rec.classification === 'Moderate' ? '🟡' : rec.classification === 'Risky' ? '🟠' : '🔴'} {rec.classification}
                                            </span>
                                        </td>
                                        <td>{rec.subScores?.weather?.score ?? '–'}</td>
                                        <td>{rec.subScores?.wind?.score ?? '–'}</td>
                                        <td>{rec.subScores?.comfort?.score ?? '–'}</td>
                                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                            {new Date(rec.calculatedAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
