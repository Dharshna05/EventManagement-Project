import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND = window.location.hostname === 'localhost'
  ? 'http://localhost:5001'
  : 'http://' + window.location.hostname + ':5001';

const ActivatePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Activating your account...');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    console.log('Activating with token:', token);
    console.log('Backend URL:', BACKEND);

    axios.get(`${BACKEND}/api/auth/activate/${token}`)
      .then((res) => {
        console.log('Activation response:', res.data);
        setSuccess(true);
        setMessage(res.data.message || 'Account activated successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      })
      .catch((err) => {
        console.error('Activation error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Activation failed. Please try again.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      });
  }, [token]);

  return (
    <div style={{
      textAlign: 'center',
      marginTop: '100px',
      fontFamily: 'Arial',
      padding: '20px',
    }}>
      {error ? (
        <div>
          <h2 style={{ color: 'red', fontSize: '24px' }}>❌ {error}</h2>
          <p style={{ color: '#666' }}>
            Redirecting to login page in 3 seconds...
          </p>
        </div>
      ) : success ? (
        <div>
          <h2 style={{ color: '#16a34a', fontSize: '24px' }}>✅ {message}</h2>
          <p style={{ color: '#666' }}>
            Redirecting to login page in 3 seconds...
          </p>
        </div>
      ) : (
        <div>
          <h2 style={{ color: '#e91e8c', fontSize: '24px' }}>
            ⏳ {message}
          </h2>
          <p style={{ color: '#666' }}>Please wait...</p>
        </div>
      )}
    </div>
  );
};

export default ActivatePage;