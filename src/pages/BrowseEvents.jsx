import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API = "http://172.29.6.22:5001";

function BrowseEvents() {
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // ✅ Load events from MongoDB
  useEffect(() => {
    axios
      .get(`${API}/api/events`)
      .then((res) => {
        setEvents(res.data.events || res.data);
        setEventsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load events:", err);
        setEventsLoading(false);
      });
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(
      (event) =>
        event.title?.toLowerCase().includes(search.toLowerCase()) ||
        event.category?.toLowerCase().includes(search.toLowerCase()) ||
        event.venue?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, events]);

  const handleBook = async (event) => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (!token) {
      setIsError(true);
      setMessage("Please login first to book tickets.");
      return;
    }

    if (role !== "Attendee") {
      setIsError(true);
      setMessage("Only Attendees can book tickets.");
      return;
    }

    try {
      setLoadingId(event._id);
      setMessage("");

      await axios.post(
        `${API}/api/tickets/book`,
        { eventId: event._id, ticketType: "general" },
        { headers: { Authorization: "Bearer " + token } }
      );

      setIsError(false);
      setMessage(`Ticket booked successfully for ${event.title}! Check My Tickets.`);
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || "Booking failed. Try again.");
    } finally {
      setLoadingId(null);
    }
  };

  if (eventsLoading) return (
    <div style={{ textAlign: "center", marginTop: 80, fontSize: 20 }}>
      Loading events...
    </div>
  );

  return (
    <div className="page-container">
      <h2 className="page-title">Browse Events</h2>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search event by name, category, or venue"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {message && (
        <p style={{
          padding: "12px",
          borderRadius: "8px",
          marginBottom: "16px",
          textAlign: "center",
          background: isError ? "#fee2e2" : "#dcfce7",
          color: isError ? "#dc2626" : "#16a34a",
          fontWeight: "500",
        }}>
          {message}
        </p>
      )}

      <div className="card-grid">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div className="event-card" key={event._id}>
              <div className="event-banner">{event.category}</div>
              <h3>{event.title}</h3>
              <p><strong>Venue:</strong> {event.venue}</p>
              <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric"
              })}</p>
              <p><strong>Capacity:</strong> {event.capacity}</p>
              <p><strong>Price:</strong> ₹{event.price}</p>
              <button
                onClick={() => handleBook(event)}
                className="primary-btn"
                disabled={loadingId === event._id}
              >
                {loadingId === event._id ? "Booking..." : "Book Ticket"}
              </button>
            </div>
          ))
        ) : (
          <p className="sub-text">No events found.</p>
        )}
      </div>
    </div>
  );
}

export default BrowseEvents;