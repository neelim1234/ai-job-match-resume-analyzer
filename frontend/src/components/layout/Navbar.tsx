import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <Link to={user ? '/dashboard' : '/'} className="navbar-brand">
        <span className="brand-icon">⚡</span>
        <span className="brand-text">JobMatch <span className="brand-ai">AI</span></span>
      </Link>

      {user ? (
        <div className="navbar-actions">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Dashboard</NavLink>
          <NavLink to="/resumes"   className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Resumes</NavLink>
          <NavLink to="/jobs"      className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Jobs</NavLink>
          <NavLink to="/analyze"   className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Analyze</NavLink>
          <NavLink to="/history"   className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>History</NavLink>

          {/* Clickable avatar → profile */}
          <Link to="/profile" className="navbar-user" title="Profile & Settings">
            <span className="user-avatar">{user.full_name.charAt(0).toUpperCase()}</span>
            <span className="user-name">{user.full_name.split(' ')[0]}</span>
          </Link>
          <button onClick={logout} className="btn btn-ghost btn-sm">Sign Out</button>
        </div>
      ) : (
        <div className="navbar-actions">
          <button onClick={() => navigate('/login')} className="btn btn-ghost btn-sm">Sign In</button>
          <button onClick={() => navigate('/register')} className="btn btn-primary btn-sm">Get Started</button>
        </div>
      )}
    </nav>
  );
}
