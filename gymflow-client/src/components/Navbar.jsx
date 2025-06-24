import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './css/Navbar.css';
import { FaUserCircle } from 'react-icons/fa';

export default function Navbar({ onLogout }) {
  const { isAuthenticated, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const getHomePath = () => {
    if (!user) return '/home';
    switch (user.user_type) {
      case 'trainer':
        return '/trainer/dashboard';
      case 'trainee':
        return '/trainee/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/home';
    }
  };

  const getNavLinks = () => {
    const links = [
      <Link key="home" to={getHomePath()} className="nav-link" onClick={() => setMenuOpen(false)}>דף הבית</Link>
    ];
    if (isAuthenticated && user) {
      // קישור לעמוד ההודעות לכל סוגי המשתמשים
      links.push(
        <Link key="messages" to="/messages" className="nav-link" onClick={() => setMenuOpen(false)}>הודעות</Link>
      );
      switch (user.user_type) {
        case 'admin':
          links.push(
            <Link key="users" to="/admin/users" className="nav-link" onClick={() => setMenuOpen(false)}>ניהול משתמשים</Link>,
            <Link key="classes" to="/admin/classes" className="nav-link" onClick={() => setMenuOpen(false)}>ניהול חוגים</Link>,
            <Link key="packages" to="/admin/packages" className="nav-link" onClick={() => setMenuOpen(false)}>ניהול חבילות</Link>,
            <Link key="broadcast-messages" to="/admin/broadcast-messages" className="nav-link" onClick={() => setMenuOpen(false)}>הודעות שיווקיות</Link>
          );
          break;
        case 'trainee':
          links.push(
            <Link key="classes" to="/trainee/classes" className="nav-link" onClick={() => setMenuOpen(false)}>חוגים</Link>,
            <Link key="schedule" to="/trainee/schedule" className="nav-link" onClick={() => setMenuOpen(false)}>המערכת שלי</Link>,
            <Link key="subscription" to="/trainee/subscription" className="nav-link" onClick={() => setMenuOpen(false)}>המנוי שלי</Link>
          );
          break;
        case 'trainer':
          links.push(
            <Link key="my-classes" to="/trainer/classes" className="nav-link" onClick={() => setMenuOpen(false)}>החוגים שלי</Link>,
            <Link key="schedule" to="/trainer/schedule" className="nav-link" onClick={() => setMenuOpen(false)}>מערכת שעות</Link>,
            <Link key="stats" to="/trainer/stats" className="nav-link" onClick={() => setMenuOpen(false)}>סטטיסטיקות</Link>,
            <Link key="assign-program" to="/trainer/assign-program" className="nav-link" onClick={() => setMenuOpen(false)}>שיוך תוכנית למתאמן</Link>
          );
          break;
      }
      links.push(
        <button key="logout" className="nav-link logout-btn" onClick={() => { setMenuOpen(false); onLogout(); }}>התנתק</button>
      );
    } else {
      links.push(<Link key="login" to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>התחבר</Link>);
    }
    return links;
  };

  return (
    <header className="nav-header">
      <nav className="nav-bar">
        <div className="logo-area">
          <Link to={getHomePath()} className="logo-link" onClick={() => setMenuOpen(false)}>
            <img src="/public/images/logo-gymflow.png" alt="GymFlow Logo" className="logo-img" />
            {/* <span className="logo-text">GymFlow</span> */}
          </Link>
        </div>
        <div className={`nav-links${menuOpen ? ' open' : ''}`}>{getNavLinks()}</div>
        <div className="nav-actions">
          {isAuthenticated && user && (
            <div className="nav-profile-area">
              <Link to="/profile" className="profile-link" onClick={() => setMenuOpen(false)}>
                {/* במקום תמונת פרופיל, אייקון משתמש בצבע מהנושא */}
                <FaUserCircle size={38} color="var(--accent-color)" style={{ verticalAlign: 'middle' }} />
              </Link>
            </div>
          )}
          <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="navbar-toggle-icon">☰</span>
          </div>
        </div>
      </nav>
    </header>
  );
}
