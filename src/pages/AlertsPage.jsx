import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { listBeaches, createAlertStream } from '../services/api';

// newDangers items from weatherRefresher have { type, message } — map type→color
const DANGER_COLOR = {
    rsi: 'var(--rsi-unsafe)',
    wind: 'var(--rsi-risky)',
    uv: 'var(--rsi-risky)',
    temperature: 'var(--rsi-moderate)',
    natural_calamity: 'var(--rsi-unsafe)',
};

export default function AlertsPage() {
    const location = useLocation();
    const initCities = new URLSearchParams(location.search).get('beaches')?.split(',').filter(Boolean) || [];

    const [allBeaches, setAllBeaches] = useState([]);
    const [subscribed, setSubscribed] = useState(initCities);
    const [searchQ, setSearchQ] = useState('');
    const [alerts, setAlerts] = useState([]);
    const [connected, setConnected] = useState(false);
    const [loadingList, setLoadingList] = useState(true);
    const esRef = useRef(null);

    // Load beach list for the selector
    useEffect(() => {
        listBeaches()
            .then(res => setAllBeaches(res.data.data || []))
            .finally(() => setLoadingList(false));
    }, []);

    // Reconnect SSE when subscriptions change
    useEffect(() => {
        if (esRef.current) esRef.current.close();
        if (!subscribed.length) { setConnected(false); return; }

        const es = createAlertStream(
            subscribed,
            (msg) => {
                if (msg.type === 'connected') { setConnected(true); return; }
                if (msg.type === 'danger_alert') {
                    const id = Date.now() + Math.random();
                    setAlerts(prev => [{ id, ...msg, receivedAt: new Date().toISOString() }, ...prev.slice(0, 99)]);
                }
            },
            () => setConnected(false)
        );

        esRef.current = es;
        return () => es.close();
    }, [subscribed.join(',')]);

    const toggleCity = (city) =>
        setSubscribed(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);

    const clearAlerts = () => setAlerts([]);

    const filteredBeaches = allBeaches.filter(b =>
        !searchQ || b.name.toLowerCase().includes(searchQ.toLowerCase()) || b.state.toLowerCase().includes(searchQ.toLowerCase())
    );

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">🔔 Live Alert Monitor</h1>
                    <p className="page-subtitle">Subscribe to beaches and receive real-time SSE danger alerts</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className={`connection-dot ${connected ? 'online' : 'offline'}`} />
                    <span style={{ fontSize: 13, color: connected ? 'var(--rsi-safe)' : 'var(--text-muted)' }}>
                        {subscribed.length ? (connected ? '● Connected' : '○ Connecting...') : '○ No beaches selected'}
                    </span>
                </div>
            </div>

            <div className="alerts-layout">
                {/* ── Left: Beach Selector ── */}
                <div className="alerts-sidebar">
                    <h3 className="alerts-sidebar-title">📍 Select Beaches to Monitor</h3>
                    <input
                        className="alerts-search"
                        type="text"
                        placeholder="Search beaches..."
                        value={searchQ}
                        onChange={e => setSearchQ(e.target.value)}
                    />
                    {subscribed.length > 0 && (
                        <div className="subscribed-chips">
                            {subscribed.map(city => {
                                const b = allBeaches.find(x => x.city === city);
                                return (
                                    <div key={city} className="subscribed-chip">
                                        {b?.name || city}
                                        <button onClick={() => toggleCity(city)}>✕</button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div className="beach-selector-list">
                        {loadingList ? (
                            <div className="loading" style={{ padding: 20 }}><div className="spinner" /></div>
                        ) : filteredBeaches.slice(0, 50).map(beach => (
                            <div
                                key={beach.city}
                                className={`beach-selector-item ${subscribed.includes(beach.city) ? 'selected' : ''}`}
                                onClick={() => toggleCity(beach.city)}
                            >
                                <div>
                                    <div className="beach-selector-name">{beach.name}</div>
                                    <div className="beach-selector-state">{beach.state}</div>
                                </div>
                                {subscribed.includes(beach.city) && <span className="beach-selector-check">✓</span>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Right: Alerts Feed ── */}
                <div className="alerts-feed">
                    <div className="alerts-feed-header">
                        <h3>📡 Live Alert Feed</h3>
                        {alerts.length > 0 && (
                            <button className="btn btn-outline" style={{ fontSize: 12, padding: '6px 14px' }} onClick={clearAlerts}>
                                Clear All
                            </button>
                        )}
                    </div>

                    {!subscribed.length ? (
                        <div className="alerts-empty">
                            <p style={{ fontSize: 40 }}>📭</p>
                            <p>Select beaches on the left to start monitoring</p>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                                Alerts are pushed in real time every 5 minutes when weather conditions change
                            </p>
                        </div>
                    ) : alerts.length === 0 ? (
                        <div className="alerts-empty">
                            <div className="sseline-pulse" />
                            <p>Monitoring {subscribed.length} beach{subscribed.length > 1 ? 'es' : ''}...</p>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                                No danger alerts received yet. Alerts appear here when conditions deteriorate.
                            </p>
                        </div>
                    ) : (
                        <div className="alerts-feed-list">
                            {alerts.map(a => (
                                <div key={a.id} className="alert-feed-card">
                                    <div className="alert-feed-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span className="alert-feed-dot" style={{ background: 'var(--rsi-unsafe)' }} />
                                            <strong>⚠️ {a.beachName}</strong>
                                        </div>
                                        <span className="alert-feed-time">
                                            {new Date(a.receivedAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    {a.newDangers?.map((d, i) => (
                                        <div key={i} className="alert-feed-danger" style={{ borderLeftColor: DANGER_COLOR[d.type] || 'var(--rsi-unsafe)' }}>
                                            <strong>
                                                {d.type === 'rsi' ? '🔴' : d.type === 'wind' ? '💨' : d.type === 'uv' ? '☀️' : d.type === 'temperature' ? '🌡️' : '🚨'}
                                                {' '}{d.type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                            </strong>
                                            <p>{d.message}</p>
                                        </div>
                                    ))}
                                    {a.alertCount !== undefined && (
                                        <div className="alert-feed-meta">
                                            RSI: {a.rsiScore} · Overall: {a.overallSafety} · {a.alertCount} alert{a.alertCount !== 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
