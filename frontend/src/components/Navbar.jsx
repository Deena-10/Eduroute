// frontend/src/components/Navbar.jsx
import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";
import NotificationBell from "./NotificationBell";
import logoImg from "../images/updatedlogopng.png";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasRoadmap, setHasRoadmap] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setHasRoadmap(false);
      return;
    }
    const check = async () => {
      try {
        const res = await axiosInstance.get("/user/roadmap");
        setHasRoadmap(!!(res.data.success && (res.data.data || res.data.roadmap)));
      } catch {
        setHasRoadmap(false);
      }
    };
    check();
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLink = (to, label, active, onNavigate) => (
    <Link
      to={to}
      onClick={onNavigate}
      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        active ? "bg-[#1C74D9] text-white" : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      {label}
    </Link>
  );

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div
        className="mx-4 mt-3 rounded-2xl border border-slate-200 bg-white shadow-lg"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <img
              src={logoImg}
              alt="EduRoute AI"
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-200 shadow-md group-hover:ring-[#1C74D9]/50 transition-all"
            />
            <span className="text-lg font-bold text-slate-800">
              EduRoute AI
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLink("/", "Home", location.pathname === "/")}
            {user && (
              hasRoadmap
                ? navLink("/roadmap", "Roadmap", location.pathname.startsWith("/roadmap"))
                : navLink("/questionnaire", "Create", location.pathname === "/questionnaire")
            )}
            {user && navLink("/events", "Events", location.pathname === "/events")}
            {user && navLink("/profile", "Profile", location.pathname === "/profile")}
          </div>

          {/* Auth & menu */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <NotificationBell />
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#1C74D9] flex items-center justify-center text-white font-bold text-sm">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2.5 rounded-xl bg-[#1C74D9] text-white text-sm font-semibold hover:bg-[#0A3FAE] transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-700 text-sm font-medium"
            >
              {isMenuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-200 px-4 py-4 space-y-1">
            {navLink("/", "Home", location.pathname === "/", closeMenu)}
            {user && (
              hasRoadmap
                ? navLink("/roadmap", "Roadmap", location.pathname.startsWith("/roadmap"), closeMenu)
                : navLink("/questionnaire", "Create Roadmap", location.pathname === "/questionnaire", closeMenu)
            )}
            {user && navLink("/events", "Events", location.pathname === "/events", closeMenu)}
            {user && navLink("/profile", "Profile", location.pathname === "/profile", closeMenu)}
            {user ? (
              <button
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Logout
              </button>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex-1 flex items-center justify-center py-3 rounded-xl bg-[#1C74D9] text-white font-semibold">
                  Login
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="flex-1 flex items-center justify-center py-3 rounded-xl bg-slate-100 text-slate-700 font-medium">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
