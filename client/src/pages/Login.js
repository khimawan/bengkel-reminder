import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);

    try {
      const response = await axios.post('/api/auth/forgot-password', { username: forgotUsername });
      
      // Store the token and navigate to dashboard
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      navigate('/dashboard');
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Gagal reset password. Silakan coba lagi.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Bengkel Reminder</h1>
        <p>Sistem Pengingat Servis Kendaraan</p>
        
        {!showForgotPassword ? (
          <>
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Masukkan username"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Masukkan password"
                />
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              <button type="submit" disabled={loading} className="login-button">
                {loading ? 'Memuat...' : 'Masuk'}
              </button>
            </form>
            
            <div className="login-footer">
              <button 
                type="button" 
                className="forgot-password-link"
                onClick={() => setShowForgotPassword(true)}
              >
                Lupa Password?
              </button>
              <p>Default: admin / admin123</p>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={handleForgotPassword} className="login-form">
              <div className="form-group">
                <label htmlFor="forgot-username">Username</label>
                <input
                  type="text"
                  id="forgot-username"
                  value={forgotUsername}
                  onChange={(e) => setForgotUsername(e.target.value)}
                  required
                  placeholder="Masukkan username Anda"
                />
              </div>
              
              {forgotError && <div className="error-message">{forgotError}</div>}
              
              <button type="submit" disabled={forgotLoading} className="login-button">
                {forgotLoading ? 'Memproses...' : 'Reset & Masuk'}
              </button>
            </form>
            
            <div className="login-footer">
              <button 
                type="button" 
                className="back-to-login-link"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotUsername('');
                  setForgotError('');
                }}
              >
                ← Kembali ke Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
