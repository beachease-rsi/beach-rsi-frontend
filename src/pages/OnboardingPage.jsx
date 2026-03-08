import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuestionnaire, ACTIVITY_ICONS } from '../services/api';

export default function OnboardingPage() {
    const [activities, setActivities] = useState([]);
    const [selected, setSelected] = useState([]);
    const [level, setLevel] = useState('');
    const [step, setStep] = useState(1); // 1 = activities, 2 = experience
    const [loading, setLoading] = useState(true);
    const [locating, setLocating] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        getQuestionnaire()
            .then(res => {
                const actQ = res.data.questions.find(q => q.id === 'activities');
                setActivities(actQ?.options || []);
            })
            .finally(() => setLoading(false));
    }, []);

    const toggleActivity = (a) =>
        setSelected(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

    const goToStep2 = () => {
        if (selected.length === 0) { setError('Pick at least one activity'); return; }
        setError('');
        setStep(2);
    };

    const handleFindBeach = () => {
        if (!level) { setError('Please choose your experience level'); return; }
        setLocating(true); setError('');
        navigator.geolocation
            ? navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude: lat, longitude: lon } = pos.coords;
                    navigate(`/recommend?lat=${lat}&lon=${lon}&activities=${selected.join(',')}&level=${level}`);
                },
                () => {
                    // fallback to Goa centre if location denied
                    navigate(`/recommend?lat=15.5&lon=73.8&activities=${selected.join(',')}&level=${level}`);
                }
            )
            : navigate(`/recommend?lat=15.5&lon=73.8&activities=${selected.join(',')}&level=${level}`);
    };

    if (loading) return (
        <div className="onboard-wrap">
            <div className="loading"><div className="spinner" /><span>Loading...</span></div>
        </div>
    );

    return (
        <div className="onboard-wrap">
            <div className="onboard-card">
                {/* ── Header ── */}
                <div className="onboard-logo">🌊 BeachEase</div>
                <h1 className="onboard-title">
                    {step === 1 ? 'What brings you to the beach?' : 'What\'s your experience level?'}
                </h1>
                <p className="onboard-subtitle">
                    {step === 1
                        ? 'Select all activities you are interested in'
                        : `Selected: ${selected.length} activit${selected.length === 1 ? 'y' : 'ies'}`}
                </p>

                {/* ── Step indicator ── */}
                <div className="onboard-steps">
                    <div className={`onboard-step ${step >= 1 ? 'done' : ''}`}>1</div>
                    <div className="onboard-step-line" />
                    <div className={`onboard-step ${step >= 2 ? 'done' : ''}`}>2</div>
                </div>

                {error && <div className="onboard-error">⚠️ {error}</div>}

                {/* ── Step 1: Activity grid ── */}
                {step === 1 && (
                    <>
                        <div className="activity-grid">
                            {activities.map(act => {
                                const active = selected.includes(act);
                                return (
                                    <button
                                        key={act}
                                        className={`activity-tile ${active ? 'selected' : ''}`}
                                        onClick={() => toggleActivity(act)}
                                    >
                                        <span className="activity-tile-icon">{ACTIVITY_ICONS[act] || '🏖️'}</span>
                                        <span className="activity-tile-label">
                                            {act.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                        </span>
                                        {active && <span className="activity-tile-check">✓</span>}
                                    </button>
                                );
                            })}
                        </div>
                        <button className="btn btn-primary onboard-cta" onClick={goToStep2}>
                            Continue →
                        </button>
                    </>
                )}

                {/* ── Step 2: Experience level ── */}
                {step === 2 && (
                    <>
                        <div className="level-grid">
                            {[
                                { k: 'learner', emoji: '🌱', title: 'Learner', desc: 'Little or no prior experience. Needs guidance.' },
                                { k: 'intermediate', emoji: '🏊', title: 'Intermediate', desc: 'Comfortable in normal conditions.' },
                                { k: 'pro', emoji: '🏆', title: 'Pro', desc: 'Expert — handles challenging conditions safely.' },
                            ].map(({ k, emoji, title, desc }) => (
                                <button
                                    key={k}
                                    className={`level-tile ${level === k ? 'selected' : ''}`}
                                    onClick={() => setLevel(k)}
                                >
                                    <span className="level-tile-emoji">{emoji}</span>
                                    <strong className="level-tile-title">{title}</strong>
                                    <p className="level-tile-desc">{desc}</p>
                                </button>
                            ))}
                        </div>
                        <div className="onboard-actions">
                            <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                            <button className="btn btn-primary onboard-cta" onClick={handleFindBeach} disabled={locating}>
                                {locating ? '📍 Locating...' : '🏖️ Find My Beach'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
