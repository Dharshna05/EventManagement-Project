import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import API from '../services/api';

const CheckIn = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const html5QrRef = useRef(null);

  useEffect(() => {
    html5QrRef.current = new Html5Qrcode('qr-reader');
    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const decodedText = await html5QrRef.current.scanFile(file, true);
      console.log('QR from image:', decodedText);
      await processQR(decodedText);
    } catch (err) {
      setError('Could not read QR code from image. Try a clearer image or use camera.');
    } finally {
      setLoading(false);
    }
  };

  const startCameraScan = async () => {
    setError('');
    setResult(null);
    setScanning(true);
    try {
      await html5QrRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 280, height: 280 } },
        async (decodedText) => {
          await html5QrRef.current.stop();
          setScanning(false);
          setLoading(true);
          await processQR(decodedText);
          setLoading(false);
        },
        () => {}
      );
    } catch (err) {
      setScanning(false);
      setError('Camera access denied. Please allow camera permission and try again.');
    }
  };

  const stopCamera = () => {
    if (html5QrRef.current) {
      html5QrRef.current.stop().catch(() => {});
    }
    setScanning(false);
  };

  const processQR = async (decodedText) => {
    try {
      console.log('Processing QR:', decodedText);
      let ticketId = null;

      // ✅ Format 1: /verify-ticket/<ticketId>
      if (decodedText.includes('/verify-ticket/')) {
        const parts = decodedText.split('/verify-ticket/');
        ticketId = parts[1]?.split('?')[0]?.trim();
      }
      // ✅ Format 2: /verify/<ticketId>
      else if (decodedText.includes('/verify/')) {
        const parts = decodedText.split('/verify/');
        ticketId = parts[1]?.split('?')[0]?.trim();
      }
      // ✅ Format 3: JSON
      else {
        try {
          const qrData = JSON.parse(decodedText);
          ticketId = qrData.ticketId || qrData.bookingRef || qrData.id || qrData._id;
        } catch {
          ticketId = decodedText.trim();
        }
      }

      console.log('Extracted ticketId:', ticketId);

      if (!ticketId) {
        setError('Invalid QR code. Please scan a valid EventSphere ticket.');
        return;
      }

      const res = await API.post('/checkin', { ticketId });
      setResult(res.data);

    } catch (err) {
      console.error('Check-in error:', err);
      setError(err.response?.data?.message || 'Check-in failed. Please try again.');
    }
  };

  const handleScanAgain = () => {
    setResult(null);
    setError('');
    setScanning(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#C0356A' }}>
        QR Code Scanner
      </h2>

      <div id="qr-reader" style={{ display: scanning ? 'block' : 'none', width: '100%', marginBottom: '16px' }}></div>

      {!result && !scanning && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ border: '2px dashed #C0356A', borderRadius: '12px', padding: '24px', textAlign: 'center', background: '#fff5f8' }}>
            <p style={{ color: '#C0356A', fontWeight: '500', marginBottom: '12px' }}>Upload QR Code Image</p>
            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} id="qr-file-input" />
            <label htmlFor="qr-file-input" style={{ display: 'inline-block', padding: '12px 28px', background: '#C0356A', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '15px' }}>
              Choose Image
            </label>
            <p style={{ color: '#999', fontSize: '13px', marginTop: '8px' }}>Select QR code image from gallery</p>
          </div>

          <div style={{ border: '2px dashed #4F46E5', borderRadius: '12px', padding: '24px', textAlign: 'center', background: '#f5f5ff' }}>
            <p style={{ color: '#4F46E5', fontWeight: '500', marginBottom: '12px' }}>Scan Using Camera</p>
            <button onClick={startCameraScan} style={{ padding: '12px 28px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px' }}>
              Open Camera
            </button>
            <p style={{ color: '#999', fontSize: '13px', marginTop: '8px' }}>Point camera at QR code to scan</p>
          </div>
        </div>
      )}

      {scanning && (
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <p style={{ color: '#4F46E5', marginBottom: '12px' }}>Point camera at QR code...</p>
          <button onClick={stopCamera} style={{ padding: '10px 24px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Stop Camera
          </button>
        </div>
      )}

      {loading && (
        <p style={{ textAlign: 'center', color: '#C0356A', fontSize: '18px', marginTop: '20px' }}>
          ⏳ Processing check-in...
        </p>
      )}

      {error && (
        <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '16px', borderRadius: '8px', marginTop: '20px', textAlign: 'center' }}>
          <h3>❌ {error}</h3>
          <button onClick={handleScanAgain} style={{ marginTop: '10px', padding: '10px 20px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Try Again
          </button>
        </div>
      )}

      {result && (
        <div style={{ background: '#DCFCE7', color: '#16A34A', padding: '24px', borderRadius: '8px', marginTop: '20px', textAlign: 'center' }}>
          <h2>✅ Check-in Successful!</h2>
          <p><strong>Attendee:</strong> {result.attendee?.name || result.holder || result.name}</p>
          <p><strong>Email:</strong> {result.attendee?.email || result.email}</p>
          <p><strong>Event:</strong> {result.event?.title || result.eventName || result.event}</p>
          <p><strong>Ticket Type:</strong> {result.ticketType}</p>
          <p><strong>Time:</strong> {new Date(result.checkedInAt || Date.now()).toLocaleTimeString()}</p>
          <button onClick={handleScanAgain} style={{ marginTop: '16px', padding: '12px 28px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>
            Scan Next Person
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckIn;