import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND = 'http://172.29.6.22:5001';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const headers = { Authorization: 'Bearer ' + token };

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (!role || role.toLowerCase() !== 'admin') {
      navigate('/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, eventsRes] = await Promise.all([
        axios.get(`${BACKEND}/api/admin/users`, { headers }),
        axios.get(`${BACKEND}/api/admin/events`, { headers }),
      ]);
      setUsers(usersRes.data.users);
      setEvents(eventsRes.data.events);

      const total = usersRes.data.users.length;
      const organizers = usersRes.data.users.filter(
        u => u.role.toLowerCase() === 'organizer'
      ).length;
      const attendees = usersRes.data.users.filter(
        u => u.role.toLowerCase() === 'attendee'
      ).length;

      setStats({
        total,
        organizers,
        attendees,
        events: eventsRes.data.events.length,
      });
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(
        `${BACKEND}/api/admin/users/${userId}/role`,
        { role: newRole },
        { headers }
      );
      fetchData();
      alert('Role updated to ' + newRole);
    } catch (err) {
      alert('Failed to update role');
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm('Delete user ' + email + '?')) return;
    try {
      await axios.delete(
        `${BACKEND}/api/admin/users/${userId}`,
        { headers }
      );
      fetchData();
      alert('User deleted successfully');
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleToggleEvent = async (eventId) => {
    try {
      await axios.put(
        `${BACKEND}/api/admin/events/${eventId}/toggle`,
        {},
        { headers }
      );
      fetchData();
    } catch (err) {
      alert('Failed to update event');
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', marginTop: 80, fontSize: 20 }}>
      Loading Admin Dashboard...
    </div>
  );

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ color: '#e91e8c', marginBottom: 24 }}>
        Admin Dashboard
      </h1>

      {/* Stats Cards */}
      {stats && (
        <div style={{
          display: 'flex', gap: 16,
          marginBottom: 32, flexWrap: 'wrap',
        }}>
          {[
            { label: 'Total Users', value: stats.total, color: '#4F46E5' },
            { label: 'Organizers', value: stats.organizers, color: '#16A34A' },
            { label: 'Attendees', value: stats.attendees, color: '#e91e8c' },
            { label: 'Events', value: stats.events, color: '#D97706' },
          ].map((s) => (
            <div key={s.label} style={{
              flex: 1, minWidth: 140, padding: 20,
              background: '#fff', borderRadius: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              textAlign: 'center',
              border: '2px solid ' + s.color,
            }}>
              <h2 style={{ color: s.color, margin: 0 }}>{s.value}</h2>
              <p style={{ color: '#666', margin: '4px 0 0' }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['users', 'events'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 24px',
              background: activeTab === tab ? '#e91e8c' : '#f3f4f6',
              color: activeTab === tab ? '#fff' : '#333',
              border: 'none', borderRadius: 8,
              cursor: 'pointer', fontWeight: 'bold',
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div style={{ overflowX: 'auto' }}>
          <h2 style={{ marginBottom: 16 }}>All Users</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                {['Name', 'Email', 'Role', 'Verified', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 8px', textAlign: 'left',
                    borderBottom: '2px solid #e5e7eb',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px 8px' }}>{user.name}</td>
                  <td style={{ padding: '12px 8px' }}>{user.email}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      style={{
                        padding: '6px 10px', borderRadius: 6,
                        border: '1px solid #d1d5db', cursor: 'pointer',
                      }}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Organizer">Organizer</option>
                      <option value="Attendee">Attendee</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    {user.isVerified ? '✅' : '❌'}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <button
                      onClick={() => handleDeleteUser(user._id, user.email)}
                      style={{
                        padding: '6px 14px', background: '#DC2626',
                        color: '#fff', border: 'none',
                        borderRadius: 6, cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div style={{ overflowX: 'auto' }}>
          <h2 style={{ marginBottom: 16 }}>All Events</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                {['Title', 'Organizer', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 8px', textAlign: 'left',
                    borderBottom: '2px solid #e5e7eb',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px 8px' }}>{event.title}</td>
                  <td style={{ padding: '12px 8px' }}>
                    {event.organizer?.name || 'N/A'}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    {new Date(event.date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: 20,
                      background: event.isPublished ? '#dcfce7' : '#fee2e2',
                      color: event.isPublished ? '#16a34a' : '#dc2626',
                      fontSize: 13,
                    }}>
                      {event.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <button
                      onClick={() => handleToggleEvent(event._id)}
                      style={{
                        padding: '6px 14px',
                        background: event.isPublished ? '#DC2626' : '#16A34A',
                        color: '#fff', border: 'none',
                        borderRadius: 6, cursor: 'pointer',
                      }}
                    >
                      {event.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;