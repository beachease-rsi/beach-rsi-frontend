import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rankBeaches, getRSIColor } from '../services/api';
import RSIGauge from '../components/RSIGauge';

export default function RankingsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadRankings(); }, []);

  const loadRankings = async () => {
    try {
      const res = await rankBeaches();
      setData(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  if (loading) return <div className="page"><div className="loading"><div className="spinner" /><span>Ranking all beaches...</span></div></div>;
  if (!data) return <div className="page"><p>Failed to load rankings</p></div>;

  const top3 = data.rankings.slice(0, 3);
  const rest = data.rankings.slice(3);
  const medals = ['🥇', '🥈', '🥉'];
  const podiumClass = ['gold', 'silver', 'bronze'];

  return (
    <div className="page">
      <h1 className="page-title">🏆 Live Beach Rankings</h1>
      <p className="page-subtitle">All {data.totalBeaches} beaches ranked by real-time RSI score • {data.topRecommendation}</p>

      <div className="podium">
        {top3.map((item, i) => (
          <div key={item.beach.id || item.beach.city} className={`card podium-card ${podiumClass[i]}`}
            onClick={() => navigate(`/beach/${item.beach.city}`)} style={{ cursor: 'pointer' }}>
            <div className="podium-rank" style={{ color: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : '#cd7f32' }}>
              {medals[i]}
            </div>
            <RSIGauge score={item.rsiScore} size={120} />
            <h3 style={{ marginTop: 8, fontSize: 16 }}>{item.beach.name}</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.beach.state}</p>
            <span className={`rsi-badge ${item.classification?.toLowerCase()}`} style={{ marginTop: 8, display: 'inline-block' }}>
              {item.emoji} {item.classification}
            </span>
            {item.beach.blueFlagCertified && <div className="blue-flag-badge" style={{ marginTop: 8, fontSize: 11 }}>🏴 Blue Flag</div>}
          </div>
        ))}
      </div>

      <div>
        {rest.map(item => (
          <div key={item.beach.id || item.beach.city} className="rank-row"
            onClick={() => navigate(`/beach/${item.beach.city}`)} style={{ cursor: 'pointer' }}>
            <div className="rank-number">#{item.rank}</div>
            <div className="rank-info">
              <div className="rank-name">
                {item.beach.name}
                {item.beach.blueFlagCertified && <span style={{ marginLeft: 8, fontSize: 11, color: '#42a5f5' }}>🏴</span>}
              </div>
              <div className="rank-state">{item.beach.state}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 100, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${item.rsiScore}%`, background: getRSIColor(item.rsiScore), borderRadius: 3, transition: 'width 0.8s' }} />
              </div>
              <span className={`rsi-badge ${item.classification?.toLowerCase()}`}>
                {item.emoji} {item.rsiScore}
              </span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'none' }}>→</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
        Last updated: {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
