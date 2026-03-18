// frontend/src/components/Navbar.jsx
import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasRoadmap, setHasRoadmap] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { setHasRoadmap(false); return; }
    const check = async () => {
      try {
        const res = await axiosInstance.get("/user/roadmap");
        setHasRoadmap(!!(res.data.success && (res.data.data || res.data.roadmap)));
      } catch { setHasRoadmap(false); }
    };
    check();
  }, [user, location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };
  const closeMenu = () => setIsMenuOpen(false);
  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const navItems = [
    { to: '/', label: 'Home' },
    ...(user ? (hasRoadmap
      ? [{ to: '/roadmap', label: 'My Roadmap' }]
      : [{ to: '/questionnaire', label: 'Get Started' }]) : []),
    ...(user ? [{ to: '/events', label: 'Events' }, { to: '/profile', label: 'Profile' }] : []),
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&display=swap');

        :root {
          --green:       #2D6A4F;
          --green-mid:   #40916C;
          --green-light: #52B788;
          --green-soft:  #D8F3DC;
          --green-mist:  #F0FAF3;
          --green-line:  #B7E4C7;
          --sage-dim:    rgba(82,183,136,0.12);
          --text-1:      #1A2E1A;
          --text-2:      #3D5A3E;
          --text-3:      #6B8F71;
          --text-4:      #9AB89D;
          --surface:     #FFFFFF;
          --bg:          #F4F9F5;
          --border:      #D4E8D7;
          --border-soft: #E8F4EA;
          --shadow-sm:   0 2px 10px rgba(26,46,26,0.06);
          --shadow-md:   0 6px 24px rgba(26,46,26,0.09);
          --shadow-green:0 6px 24px rgba(45,106,79,0.18);
        }

        .nb-link {
          position: relative;
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-3);
          text-decoration: none;
          transition: all 0.16s;
          font-family: 'Plus Jakarta Sans', sans-serif;
          border: none;
          background: transparent;
          cursor: pointer;
        }
        .nb-link:hover { background: var(--sage-dim); color: var(--green); }
        .nb-link.active { background: var(--sage-dim); color: var(--green); font-weight: 700; }

        .nb-mob-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-3);
          text-decoration: none;
          transition: all 0.16s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .nb-mob-link:hover { background: var(--green-mist); color: var(--green); }
        .nb-mob-link.active { background: var(--green-soft); color: var(--green); font-weight: 700; }

        .nb-logout-btn {
          padding: 7px 14px;
          border-radius: 9px;
          border: 1px solid var(--border);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-3);
          background: transparent;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .nb-logout-btn:hover { background: var(--bg); color: var(--text-1); border-color: var(--green-line); }

        .nb-cta-btn {
          padding: 7px 18px;
          border-radius: 9px;
          background: var(--green);
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          transition: background 0.16s, transform 0.1s;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-shadow: var(--shadow-green);
        }
        .nb-cta-btn:hover { background: var(--green-mid); }
        .nb-cta-btn:active { transform: scale(0.97); }

        .nb-login-btn {
          padding: 7px 14px;
          border-radius: 9px;
          border: 1px solid var(--border);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-3);
          background: transparent;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          transition: all 0.15s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .nb-login-btn:hover { background: var(--sage-dim); color: var(--green); border-color: var(--green-line); }

        @media(min-width:768px) {
          .nb-desktop { display: flex !important; }
          .nb-hamburger { display: none !important; }
          .nb-desktop-auth { display: flex !important; }
        }
        @keyframes nbSlide { from{opacity:0;transform:translateY(-8px);} to{opacity:1;transform:translateY(0);} }
        .logo-fallback { display: none !important; }
        .logo-fallback.show { display: flex !important; align-items: center; justify-content: center; }
      `}</style>

      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        paddingTop: 'env(safe-area-inset-top)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        {/* Backdrop */}
        <div style={{
          position: 'absolute', inset: 0,
          background: scrolled ? 'rgba(244,249,245,0.92)' : 'rgba(244,249,245,0)',
          backdropFilter: scrolled ? 'blur(20px) saturate(160%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(160%)' : 'none',
          borderBottom: scrolled ? '1px solid #D4E8D7' : '1px solid transparent',
          transition: 'all 0.35s ease',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58 }}>

            {/* Brand */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: '#2D6A4F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img
                  src={`${process.env.PUBLIC_URL || ''}/logo.png`}
                  alt="EduRoute"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.add('show'); }}
                />
                <span className="logo-fallback" style={{ display: 'none', color: '#fff', fontWeight: 800, fontSize: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>E</span>
              </div>
              <span style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 15, fontWeight: 800, color: '#1A2E1A', letterSpacing: '-0.02em',
              }}>
                Edu<span style={{ color: '#2D6A4F' }}>Route</span>
              </span>
            </Link>

            {/* Desktop center nav */}
            <div className="nb-desktop" style={{ display: 'none', alignItems: 'center', gap: 2 }}>
              {navItems.map(({ to, label }) => (
                <Link key={to} to={to} className={`nb-link${isActive(to) ? ' active' : ''}`}>{label}</Link>
              ))}
            </div>

            {/* Right actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {user ? (
                <>
                  <NotificationBell />
                  <div className="nb-desktop-auth" style={{ display: 'none', alignItems: 'center', gap: 10 }}>
                    {/* Streak badge */}
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '5px 13px', borderRadius: 8,
                      background: 'rgba(82,183,136,0.12)', color: '#2D6A4F',
                      border: '1px solid #B7E4C7',
                    }}>🔥 Streak</span>
                    {/* Avatar → Profile */}
                    <Link
                      to="/profile"
                      style={{
                        width: 32, height: 32, borderRadius: 9,
                        background: '#2D6A4F',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 13, fontWeight: 800, color: '#fff',
                        flexShrink: 0, cursor: 'pointer', textDecoration: 'none',
                      }}
                      aria-label="Go to profile"
                    >
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Link>
                    <button onClick={handleLogout} className="nb-logout-btn">Logout</button>
                  </div>
                </>
              ) : (
                <div className="nb-desktop-auth" style={{ display: 'none', alignItems: 'center', gap: 8 }}>
                  <Link to="/login" className="nb-login-btn">Log in</Link>
                  <Link to="/signup" className="nb-cta-btn">Get Started →</Link>
                </div>
              )}

              {/* Hamburger */}
              <button
                className="nb-hamburger"
                onClick={() => setIsMenuOpen(v => !v)}
                style={{
                  width: 34, height: 34, borderRadius: 8,
                  border: `1px solid ${isMenuOpen ? '#B7E4C7' : '#D4E8D7'}`,
                  background: isMenuOpen ? '#F0FAF3' : 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s', flexShrink: 0,
                }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B8F71" strokeWidth="2.2" strokeLinecap="round">
                  {isMenuOpen
                    ? <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></>
                    : <><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></>
                  }
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {isMenuOpen && (
            <div style={{
              position: 'absolute', top: '100%', left: 16, right: 16,
              background: '#FFFFFF', borderRadius: 16,
              border: '1px solid #D4E8D7',
              boxShadow: '0 12px 40px rgba(26,46,26,0.12)',
              padding: '10px', animation: 'nbSlide 0.18s ease',
              display: 'flex', flexDirection: 'column', gap: 2,
              zIndex: 60,
            }}>
              {navItems.map(({ to, label }) => (
                <Link key={to} to={to} onClick={closeMenu} className={`nb-mob-link${isActive(to) ? ' active' : ''}`}>
                  {label}
                </Link>
              ))}
              <div style={{ height: 1, background: '#E8F4EA', margin: '8px 4px' }} />
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' }}>
                  <Link
                    to="/profile"
                    onClick={closeMenu}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
                    aria-label="Go to profile"
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 9, background: '#2D6A4F',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 800, color: '#fff',
                    }}>
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#3D5A3E' }}>{user.name || 'Profile'}</span>
                  </Link>
                  <button onClick={() => { handleLogout(); closeMenu(); }} className="nb-logout-btn">Logout</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8, padding: '4px' }}>
                  <Link to="/login" onClick={closeMenu} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '12px 0', borderRadius: 11, fontSize: 13, fontWeight: 600,
                    color: '#3D5A3E', border: '1.5px solid #D4E8D7', textDecoration: 'none',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>Log in</Link>
                  <Link to="/signup" onClick={closeMenu} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '12px 0', borderRadius: 11, fontSize: 13, fontWeight: 700,
                    color: '#fff', background: '#2D6A4F', textDecoration: 'none',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    boxShadow: '0 4px 14px rgba(45,106,79,0.25)',
                  }}>Get Started</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;