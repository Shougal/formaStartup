import React, { useState } from 'react';
import { login } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error before submitting
    try {
      const data = await login(email, password);

      localStorage.setItem('user', JSON.stringify({
          accessToken: data.access,
          refreshToken: data.refresh,
          isLoggedIn: data.is_logged_in,
          userId: data.user_id,
          username: data.username
      }));
      alert('Login successful!');

      window.dispatchEvent(new Event('storageChange'));
      navigate('/'); // Redirect to home
    } catch (err) {
      setError('Invalid email or password');

    }
  };

  return (
    <section className="hero">
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </section>
  );
}

export default Login;
