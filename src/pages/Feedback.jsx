import { useState } from "react";

function Feedback() {
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!rating || !comment.trim()) {
      setMessage("Please enter rating and feedback.");
      return;
    }

    const feedbackList = JSON.parse(localStorage.getItem("feedbacks")) || [];
    feedbackList.push({
      rating,
      comment,
      user: localStorage.getItem("userName") || "Attendee",
    });
    localStorage.setItem("feedbacks", JSON.stringify(feedbackList));

    setMessage("Feedback submitted successfully.");
    setRating("5");
    setComment("");
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <h2>Feedback & Rating</h2>
        <p className="sub-text">Share your experience</p>

        {message && <p className="message">{message}</p>}

        <form onSubmit={handleSubmit}>
          <select value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value="5">5 - Excellent</option>
            <option value="4">4 - Very Good</option>
            <option value="3">3 - Good</option>
            <option value="2">2 - Average</option>
            <option value="1">1 - Poor</option>
          </select>

          <textarea
            rows="5"
            placeholder="Write your feedback..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button type="submit" className="primary-btn full-btn">
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
}

export default Feedback;
