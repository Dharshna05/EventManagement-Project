import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-overlay">
          <h1>Event Management & Ticketing Portal</h1>
          <p>
            Create events, browse events, book tickets, download QR e-passes,
            manage check-ins, and collect feedback.
          </p>

          <div className="hero-buttons">
            <Link to="/events" className="primary-btn">
              Browse Events
            </Link>
            <Link to="/register" className="secondary-btn">
              Register
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
