import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://172.29.6.22:5001";

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch tickets from backend
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API}/api/tickets/my`, {
        headers: { Authorization: "Bearer " + token },
      })
      .then((res) => {
        setTickets(res.data.tickets);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load tickets.");
        setLoading(false);
      });
  }, []);

  // Download E-Pass PDF from backend
  const handleDownload = async (ticketId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/tickets/epass/${ticketId}`, {
        headers: { Authorization: "Bearer " + token },
      });

      if (!res.ok) {
        alert("Failed to download E-Pass. Please try again.");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `epass-${ticketId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Download failed. Please try again.");
    }
  };

  if (loading) return (
    <div style={{ textAlign: "center", marginTop: 80, fontSize: 20 }}>
      Loading your tickets...
    </div>
  );

  if (error) return (
    <div style={{ textAlign: "center", marginTop: 80, color: "red" }}>
      {error}
    </div>
  );

  return (
    <div className="page-container">
      <h2 className="page-title">My Tickets</h2>

      {tickets.length === 0 ? (
        <p className="sub-text">No tickets booked yet.</p>
      ) : (
        <div className="ticket-list">
          {tickets.map((ticket) => (
            <div className="ticket-card" key={ticket._id}>
              <div>
                <h3>{ticket.event?.title}</h3>
                <p><strong>Ticket ID:</strong> {ticket._id}</p>
                <p><strong>Holder:</strong> {ticket.holder?.name}</p>
                <p><strong>Venue:</strong> {ticket.event?.venue}</p>
                <p><strong>Date:</strong> {new Date(ticket.event?.date).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric"
                })}</p>
                <p><strong>Price:</strong> ₹{ticket.price}</p>
                <p><strong>Status:</strong> {ticket.status}</p>
                <button
                  className="primary-btn"
                  onClick={() => handleDownload(ticket._id)}
                >
                  Download E-Pass
                </button>
              </div>

              {/* Real QR code from backend */}
              <div className="qr-box">
                {ticket.qrCode && ticket.qrCode !== "pending" ? (
                  <img
                    src={ticket.qrCode}
                    alt="QR Code"
                    style={{ width: 140, height: 140 }}
                  />
                ) : (
                  <p style={{ color: "#999", fontSize: 12 }}>
                    QR not available
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyTickets;