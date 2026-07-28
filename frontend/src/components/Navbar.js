import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.navLeft}>
        <Link to="/" style={styles.logo}>TrueJobs</Link>
      </div>

      <div style={styles.navRight}>
        {/* Desktop links */}
        <div style={styles.desktopLinks} className="desktop-links">
          <Link to="/jobs" style={styles.link}>Browse Jobs</Link>
          {user && <Link to="/saved" style={styles.link}>Saved Jobs</Link>}
          {user && <Link to="/alerts" style={styles.link}>Job Alerts</Link>}
          {user && <Link to="/applications" style={styles.link}>My Applications</Link>}
          <Link to="/smart-search" style={styles.link}>🤖 AI Search</Link>
          <Link to="/resume-builder" style={styles.link}>Resume Builder</Link>
          {user ? (
            <>
              <span
                style={styles.userBadge}
                onClick={() => navigate('/profile')}
                title="View your profile"
              >
                {user.user_metadata?.full_name || user.email.split('@')[0]}
              </span>
              <button style={styles.btnOutline} onClick={handleSignOut}>Log out</button>
            </>
          ) : (
            <>
              <button style={styles.btnOutline} onClick={() => navigate('/auth')}>Log in</button>
              <button style={styles.btnPrimary} onClick={() => navigate('/auth')}>Sign up free</button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button style={styles.hamburger} className="hamburger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={styles.mobileMenu} className="mobile-menu">
          <Link to="/jobs" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Browse Jobs</Link>
          {user && <Link to="/saved" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Saved Jobs</Link>}
          {user && <Link to="/alerts" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Job Alerts 🔔</Link>}
          {user && <Link to="/applications" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>My Applications</Link>}
          {user && <Link to="/profile" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Profile</Link>}
          <Link to="/smart-search" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>🤖 AI Search</Link>
          <Link to="/resume-builder" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>📄 Resume Builder</Link>
          {user ? (
            <button style={styles.mobileBtnOutline} onClick={handleSignOut}>Log out</button>
          ) : (
            <>
              <button style={styles.mobileBtnOutline} onClick={() => { navigate('/auth'); setMenuOpen(false); }}>Log in</button>
              <button style={styles.mobileBtnPrimary} onClick={() => { navigate('/auth'); setMenuOpen(false); }}>Sign up free</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    flexWrap: 'wrap',
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logo: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#2563eb',
    textDecoration: 'none',
  },
  desktopLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    '@media(maxWidth:768px)': { display: 'none' },
  },
  link: {
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
  },
  userBadge: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2563eb',
    background: '#dbeafe',
    padding: '6px 14px',
    borderRadius: '20px',
    cursor: 'pointer',
  },
  btnOutline: {
    background: 'transparent',
    color: '#1e293b',
    border: '1px solid #cbd5e1',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  btnPrimary: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  hamburger: {
    display: 'none',
    background: 'transparent',
    border: 'none',
    fontSize: '22px',
    cursor: 'pointer',
    color: '#1e293b',
    padding: '4px 8px',
  },
  mobileMenu: {
    display: 'none',
    flexDirection: 'column',
    width: '100%',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '12px',
    gap: '8px',
  },
  mobileLink: {
    color: '#1e293b',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500',
    padding: '10px 4px',
    borderBottom: '1px solid #f1f5f9',
  },
  mobileBtnOutline: {
    background: 'transparent',
    color: '#1e293b',
    border: '1px solid #cbd5e1',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '4px',
  },
  mobileBtnPrimary: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '4px',
  },
};

export default Navbar;