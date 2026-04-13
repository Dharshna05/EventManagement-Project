import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import BrowseEvents from "./pages/BrowseEvents.jsx";
import CreateEvent from "./pages/CreateEvent.jsx";
import MyTickets from "./pages/MyTickets.jsx";
import CheckIn from "./pages/CheckIn.jsx";
import Feedback from "./pages/Feedback.jsx";
import ActivatePage from "./pages/Activatepage.jsx";
import VerifyTicket from "./pages/VerifyTicket";
import AdminDashboard from "./pages/AdminDashboard.jsx";



function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<BrowseEvents />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/activate/:token" element={<ActivatePage />} />

        <Route
          path="/create-event"
          element={
            <ProtectedRoute role="Organizer">
              <CreateEvent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-tickets"
          element={
            <ProtectedRoute role="Attendee">
              <MyTickets />
            </ProtectedRoute>
          }
        />
<Route path="/admin" element={<AdminDashboard />} />
        <Route
          path="/checkin"
          element={
            <ProtectedRoute role="Organizer">
              <CheckIn />
            </ProtectedRoute>
          }
        />
  
<Route path="/verify-ticket/:ticketId" element={<VerifyTicket />} />

        <Route
          path="/feedback"
          element={
            <ProtectedRoute role="Attendee">
              <Feedback />
            </ProtectedRoute>
            
          }
        />
      </Routes>
    </>
  );
}

export default App;
