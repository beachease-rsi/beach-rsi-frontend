import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listBeaches, ACTIVITY_ICONS } from '../services/api';

export default function ExplorePage() {
  const [beaches, setBeaches] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [states, setStates] = useState([]);
  const [activities, setActivities] = useState([]);
  const [stateFilter, setStateFilter] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [blueFlagFilter, setBlueFlagFilter] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadBeaches();
  }, []);

  const loadBeaches = async () => {
    try {
      const res = await listBeaches();
      setBeaches(res.data.data);
      setFiltered(res.data.data);
      setStates(res.data.availableStates || []);
      setActivities(res.data.availableActivities || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
    let result = [...beaches];

    // Filters
    if (stateFilter) {
      result = result.filter(b => b.state.toLowerCase().trim() === stateFilter.toLowerCase().trim());
    }
    if (activityFilter) {
      result = result.filter(b =>
        (b.activities || []).some(a => a.toLowerCase().trim() === activityFilter.toLowerCase().trim())
      );
    }
    if (blueFlagFilter === 'true') {
      result = result.filter(b => b.blueFlagCertified === true);
    }
    if (blueFlagFilter === 'false') {
      result = result.filter(b => b.blueFlagCertified === false);
    }

    // Sorting
    if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'state-asc') {
      result.sort((a, b) => {
        const stateCmp = a.state.localeCompare(b.state);
        return stateCmp !== 0 ? stateCmp : a.name.localeCompare(b.name);
      });
    }

    setFiltered(result);
  }, [stateFilter, activityFilter, blueFlagFilter, sortBy, beaches]);

  const clearFilters = () => {
    setStateFilter(''); setActivityFilter(''); setBlueFlagFilter(''); setSortBy('name-asc');
  };

  return (
    <div className="page">
      <h1 className="page-title">🗺️ Explore Beaches</h1>
      <p className="page-subtitle">Browse Indian beaches — filter by state, activity, or Blue Flag certification</p>

      <div className="filter-bar">
        <select value={stateFilter} onChange={e => setStateFilter(e.target.value)}>
          <option value="">All States</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={activityFilter} onChange={e => setActivityFilter(e.target.value)}>
          <option value="">All Activities</option>
          {activities.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={blueFlagFilter} onChange={e => setBlueFlagFilter(e.target.value)}>
          <option value="">Blue Flag: All</option>
          <option value="true">🏴 Blue Flag Only</option>
          <option value="false">Non-Certified</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="name-asc">Sort: Name (A-Z)</option>
          <option value="name-desc">Sort: Name (Z-A)</option>
          <option value="state-asc">Sort: State (A-Z)</option>
        </select>
        <button className="btn btn-outline" onClick={clearFilters}>Clear</button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /><span>Loading beaches...</span></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 48 }}>🏖️</p>
          <p>No beaches match your filters</p>
          <button className="btn btn-outline" onClick={clearFilters} style={{ marginTop: 12 }}>Reset Filters</button>
        </div>
      ) : (
        <div className="beach-grid">
          {filtered.map(beach => (
            <div key={beach._id || beach.name} className="card beach-card" onClick={() => navigate(`/beach/${beach.city}`)}>
              <div className="beach-card-body">
                <div className="beach-card-header">
                  <div>
                    <div className="beach-card-name">{beach.name}</div>
                    <div className="beach-card-state">{beach.state}</div>
                  </div>
                  {beach.blueFlagCertified && <div className="blue-flag-badge">🏴 Blue Flag</div>}
                </div>
                <p className="beach-card-desc">{beach.description}</p>
                <div className="activity-tags">
                  {beach.activities?.slice(0, 4).map(a => (
                    <span key={a} className="activity-tag">{ACTIVITY_ICONS[a] || ''} {a}</span>
                  ))}
                  {beach.activities?.length > 4 && <span className="activity-tag">+{beach.activities.length - 4}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
