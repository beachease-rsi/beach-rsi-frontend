import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { compareBeaches, getRSIColor } from '../services/api';
import RSIGauge from '../components/RSIGauge';

export default function ComparePage() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCompare = async (e) => {
    e.preventDefault();
    const cities = input.split(',').map(c => c.trim()).filter(Boolean);
    if (cities.length < 2) { setError('Enter at least 2 cities separated by commas'); return; }
    if (cities.length > 5) { setError('Maximum 5 cities'); return; }

    setLoading(true); setError(''); setResults(null);
    try {
      const res = await compareBeaches(cities.join(','));
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Comparison failed');
    }
    setLoading(false);
  };

  const winner = results?.comparison?.[0];

  return (
    <div className="page">
      <h1 className="page-title">⚖️ Compare Beaches</h1>
      <p className="page-subtitle">Compare RSI scores across multiple beaches side by side</p>

      <form onSubmit={handleCompare}>
        <div className="search-bar" style={{ maxWidth: 700 }}>
          <input type="text" placeholder="Enter cities separated by commas (e.g. goa, puri, mumbai, vizag)"
            value={input} onChange={e => setInput(e.target.value)} />
          <button type="submit">{loading ? '...' : 'Compare'}</button>
        </div>
      </form>

      {error && <div className="alert-banner alert-danger" style={{ marginTop: 20 }}><span>❌</span><div><strong>{error}</strong></div></div>}

      {loading && <div className="loading"><div className="spinner" /><span>Comparing beaches...</span></div>}

      {results && (
        <>
          {winner && (
            <div className="compare-winner">
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>🏆 Best Beach</p>
              <h3 style={{ fontSize: 22 }}>{winner.beach.name}</h3>
              <p style={{ fontSize: 14 }}>RSI: <strong>{winner.rsiScore}</strong> {winner.emoji} — {winner.classification}</p>
            </div>
          )}

          <div className="compare-columns">
            {results.comparison.map((item, i) => (
              <div key={i} className="card compare-column"
                onClick={() => navigate(`/beach/${item.beach.city}`)}
                style={{ cursor: 'pointer' }}>
                <RSIGauge score={item.rsiScore} size={140} />
                <h3 style={{ marginTop: 12 }}>{item.beach.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.beach.state}</p>
                <span className={`rsi-badge ${item.classification?.toLowerCase()}`} style={{ marginTop: 8, display: 'inline-block' }}>
                  {item.emoji} {item.classification}
                </span>
                {item.beach.blueFlagCertified && <div className="blue-flag-badge" style={{ marginTop: 8 }}>🏴 Blue Flag</div>}
                <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                  Safety: <strong style={{ color: item.overallSafety === 'SAFE' ? 'var(--rsi-safe)' : item.overallSafety === 'CAUTION' ? 'var(--rsi-risky)' : 'var(--rsi-unsafe)' }}>{item.overallSafety}</strong>
                  {item.alertCount > 0 && <span> • {item.alertCount} alert{item.alertCount > 1 ? 's' : ''}</span>}
                </div>
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--accent)' }}>View Full RSI →</div>
              </div>
            ))}
          </div>

          {results.errors?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              {results.errors.map((e, i) => <div key={i} className="alert-banner alert-caution"><span>⚠️</span><div>{e.error}</div></div>)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
