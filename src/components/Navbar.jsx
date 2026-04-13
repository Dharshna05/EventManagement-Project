import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("userName");

  const logout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">EventSphere</Link>
      </div>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/events">Events</Link>

        {!role && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="nav-btn">
              Register
            </Link>
          </>
        )}

        {role === "Organizer" && (
          <>
            <Link to="/create-event">Create Event</Link>
            <Link to="/checkin">Check-In</Link>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </>
        )}

        {role === "Attendee" && (
          <>
            <Link to="/my-tickets">My Tickets</Link>
            <Link to="/feedback">Feedback</Link>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </>
        )}

        {role === "Admin" && (
          <>
            <span className="admin-badge">Admin</span>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </>
        )}
      </div>

      {role && <div className="welcome-text">Hi, {userName || role}</div>}
    </nav>
  );
}

export default Navbar;
