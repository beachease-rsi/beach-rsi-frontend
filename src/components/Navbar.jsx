import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-logo">🌊 BeachEase</NavLink>
      <div className="navbar-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} end>Dashboard</NavLink>
        <NavLink to="/explore" className={({ isActive }) => isActive ? 'active' : ''}>Explore</NavLink>
        <NavLink to="/nearby" className={({ isActive }) => isActive ? 'active' : ''}>Nearby</NavLink>
        <NavLink to="/compare" className={({ isActive }) => isActive ? 'active' : ''}>Compare</NavLink>
        <NavLink to="/rankings" className={({ isActive }) => isActive ? 'active' : ''}>Rankings</NavLink>
        <NavLink to="/alerts" className={({ isActive }) => isActive ? 'active' : ''}>🔔 Alerts</NavLink>
        <NavLink to="/onboard" className={({ isActive }) => `nav-cta ${isActive ? 'active' : ''}`}>
          🏖️ Recommend
        </NavLink>
      </div>
    </nav>
  );
}
