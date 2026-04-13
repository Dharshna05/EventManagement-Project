import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API = "http://172.29.6.22:5001";

export default function VerifyTicket() {
  const { ticketId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkInDone, setCheckInDone] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInError, setCheckInError] = useState("");

  useEffect(() => {
    axios
      .get(`${API}/api/tickets/verify/${ticketId}`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Invalid ticket");
        setLoading(false);
      });
  }, [ticketId]);

  const handleCheckIn = async () => {
    try {
      setCheckInLoading(true);
      setCheckInError("");
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/api/tickets/checkin/${ticketId}`,
        {},
        { headers: { Authorization: "Bearer " + token } }
      );
      setCheckInDone(true);
    } catch (err) {
      setCheckInError(
        err.response?.data?.message || "Check-in failed. Please try again."
      );
    } finally {
      setCheckInLoading(false);
    }
  };

  // Loading state
  if (loading) return (
    <div style={{ textAlign: "center", marginTop: 100, fontSize: 22 }}>
      🔍 Verifying ticket...
    </div>
  );

  // Error state
  if (error) return (
    <div style={{ textAlign: "center", marginTop: 100 }}>
      <h1 style={{ color: "red" }}>❌ Invalid Ticket</h1>
      <p style={{ color: "#666" }}>{error}</p>
    </div>
  );

  // Check-in success state
  if (checkInDone) return (
    <div style={{
      maxWidth: 480, margin: "60px auto", padding: 32,
      border: "2px solid #16A34A", borderRadius: 16,
      textAlign: "center", fontFamily: "Arial",
    }}>
      <h1 style={{ color: "#16A34A", fontSize: 48 }}>🎉</h1>
      <h2 style={{ color: "#16A34A" }}>Check-In Successful!</h2>
      <p style={{ color: "#666" }}>
        Attendee has been checked in successfully.
      </p>
    </div>
  );

  const t = data.ticket;

  return (
    <div style={{
      maxWidth: 480, margin: "60px auto", padding: 32,
      border: "2px solid #e91e8c", borderRadius: 16,
      fontFamily: "Arial", boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
    }}>

      {/* Header */}
      <h1 style={{ color: "#e91e8c", textAlign: "center", marginBottom: 8 }}>
        {data.valid ? "✅ Valid Ticket" : "⚠️ Already Used"}
      </h1>
      <p style={{ textAlign: "center", color: "#666", marginBottom: 24 }}>
        {data.message}
      </p>

      {/* Ticket Details */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {[
            ["🎫 Event",   t.event],
            ["👤 Holder",  t.holder],
            ["📧 Email",   t.email],
            ["📅 Date",    new Date(t.date).toLocaleDateString("en-IN", {
                            day: "numeric", month: "long", year: "numeric"
                          })],
            ["📍 Venue",   t.venue],
            ["🎟 Type",    t.ticketType],
            ["💰 Price",   "₹" + t.price],
            ["📌 Status",  t.checkedIn
                            ? "✅ Checked In at " + new Date(t.checkInTime).toLocaleTimeString()
                            : "🟢 Not Yet Checked In"],
          ].map(([label, value]) => (
            <tr key={label}>
              <td style={{
                padding: "10px 8px", fontWeight: "bold",
                borderBottom: "1px solid #f0f0f0",
                width: "42%", color: "#333",
              }}>
                {label}
              </td>
              <td style={{
                padding: "10px 8px",
                borderBottom: "1px solid #f0f0f0", color: "#555",
              }}>
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Check-In Button — only show if ticket is valid and not yet checked in */}
      {data.valid && !t.checkedIn && (
        <div style={{ textAlign: "center", marginTop: 28 }}>
          {checkInError && (
            <p style={{ color: "red", marginBottom: 12 }}>{checkInError}</p>
          )}
          <button
            onClick={handleCheckIn}
            disabled={checkInLoading}
            style={{
              padding: "14px 40px",
              background: checkInLoading ? "#9CA3AF" : "#16A34A",
              color: "#fff", border: "none", borderRadius: 8,
              fontSize: 16, fontWeight: "bold", cursor: "pointer",
            }}
          >
            {checkInLoading ? "Processing..." : "✅ Confirm Check-In"}
          </button>
        </div>
      )}

      {/* Footer */}
      <p style={{
        textAlign: "center", marginTop: 24,
        fontSize: 12, color: "#aaa",
      }}>
        EventSphere • Verified Ticket
      </p>
    </div>
  );
}