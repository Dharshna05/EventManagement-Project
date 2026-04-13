import { Link } from "react-router-dom";

function Dashboard() {
  const role = localStorage.getItem("role");

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Welcome to Event Management</h1>

      {role === "Organizer" && (
        <>
          <Link to="/create-event">
            <button>Create Event</button>
          </Link>
          <br /><br />
          <Link to="/analytics">
            <button>View Analytics</button>
          </Link>
        </>
      )}

      {role === "Attendee" && (
        <>
          <Link to="/browse">
            <button>Browse Events</button>
          </Link>
          <br /><br />
          <Link to="/my-tickets">
            <button>My Tickets</button>
          </Link>
        </>
      )}
    </div>
  );
}

export default Dashboard;
