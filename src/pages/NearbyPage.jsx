import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getNearby, ACTIVITY_ICONS } from '../services/api';

export default function NearbyPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const lat = parseFloat(params.get('lat') || 15.5);
    const lon = parseFloat(params.get('lon') || 73.8);

    const [beaches, setBeaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);

        // If lat/lon are not explicitly passed from the onboard flow,
        // try to get the user's actual location here.
        if (!params.get('lat') || !params.get('lon')) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const { latitude, longitude } = pos.coords;
                        fetchNearby(latitude, longitude);
                    },
                    (err) => {
                        console.warn('Geolocation denied or failed, falling back to Goa:', err);
                        setError('Location access denied. Showing beaches near Goa (default).');
                        fetchNearby(15.5, 73.8); // fallback to Goa
                    },
                    { timeout: 10000 }
                );
            } else {
                setError('Browser does not support geolocation. Showing default (Goa).');
                fetchNearby(15.5, 73.8);
            }
        } else {
            // Use the params passed from Onboarding
            fetchNearby(lat, lon);
        }

        function fetchNearby(latitude, longitude) {
            getNearby(latitude, longitude)
                .then(res => setBeaches(res.data.data || []))
                .catch(() => setError('Failed to load nearby beaches'))
                .finally(() => setLoading(false));
        }
    }, [location.search]);

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">📍 Beaches Near You</h1>
                    <p className="page-subtitle">
                        {loading ? 'Locating...' : `Sorted nearest first`}
                    </p>
                </div>
                <button className="btn btn-outline" onClick={() => navigate('/onboard')}>
                    🏖️ Get Recommendations
                </button>
            </div>

            {error && <div className="alert-banner alert-danger"><span>❌</span><div>{error}</div></div>}

            {loading ? (
                <div className="loading"><div className="spinner" /><span>Finding nearby beaches...</span></div>
            ) : (
                <div className="nearby-list">
                    {beaches.map((beach, i) => (
                        <div
                            key={beach._id || i}
                            className="nearby-card"
                            onClick={() => navigate(`/beach/${beach.city}`)}
                        >
                            <div className="nearby-rank">#{i + 1}</div>

                            <div className="nearby-info">
                                <div className="nearby-name">
                                    {beach.name}
                                    {beach.blueFlagCertified && (
                                        <span className="blue-flag-badge" style={{ marginLeft: 10, fontSize: 11 }}>🏴 Blue Flag</span>
                                    )}
                                </div>
                                <div className="nearby-state">{beach.state}</div>
                                <div className="activity-tags" style={{ marginTop: 6 }}>
                                    {beach.activities?.slice(0, 4).map(a => (
                                        <span key={a} className="activity-tag">
                                            {ACTIVITY_ICONS[a] || ''} {a.replace(/-/g, ' ')}
                                        </span>
                                    ))}
                                    {beach.activities?.length > 4 && (
                                        <span className="activity-tag">+{beach.activities.length - 4}</span>
                                    )}
                                </div>
                            </div>

                            <div className="nearby-right">
                                <div className="nearby-distance">
                                    {beach.distanceKm}
                                    <span className="nearby-unit">km</span>
                                </div>
                                <div className="nearby-tide"
                                    style={{ color: beach.tideType === 'strong' ? 'var(--rsi-unsafe)' : 'var(--text-muted)' }}>
                                    {beach.tideType === 'calm' ? '🌊 Calm' : beach.tideType === 'moderate' ? '🌊 Moderate' : '🌊 Strong'}
                                </div>
                                <button className="btn btn-outline" style={{ fontSize: 12, padding: '6px 14px', marginTop: 8 }}>
                                    View RSI →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
