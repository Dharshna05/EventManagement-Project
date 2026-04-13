import { useState } from "react";
import axios from "axios";

const API = "http://172.29.6.22:5001";

function CreateEvent() {
  const [form, setForm] = useState({
    title: "",
    category: "",
    ticketType: "",
    capacity: "",
    venue: "",
    date: "",
    price: "",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.category || !form.ticketType ||
        !form.capacity || !form.venue || !form.date || !form.price) {
      setIsError(true);
      setMessage("Please fill all event fields.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");

      await axios.post(
        `${API}/api/events`,
        {
          title: form.title,
          category: form.category,
          ticketTypes: [form.ticketType],
          capacity: Number(form.capacity),
          venue: form.venue,
          date: form.date,
          price: Number(form.price),
        },
        {
          headers: { Authorization: "Bearer " + token },
        }
      );

      setIsError(false);
      setMessage("Event created successfully! ✅");

      setForm({
        title: "",
        category: "",
        ticketType: "",
        capacity: "",
        venue: "",
        date: "",
        price: "",
      });
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || "Failed to create event. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-card large-form">
        <h2>Create Event</h2>
        <p className="sub-text">Organizer event creation form</p>

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

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Event Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            type="text"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <input
            type="text"
            placeholder="Ticket Type (e.g. general, vip)"
            value={form.ticketType}
            onChange={(e) => setForm({ ...form, ticketType: e.target.value })}
          />
          <input
            type="number"
            placeholder="Capacity"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          />
          <input
            type="text"
            placeholder="Venue"
            value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <button
            type="submit"
            className="primary-btn full-btn"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEvent;