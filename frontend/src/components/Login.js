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
    try {
      const data = await login(email, password);
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      alert('Login successful!');
      navigate('/'); // Redirect to home
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
      <section className={"hero"}>
        <div className={"div-login"}>
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
          {error && <p style={{color: 'red'}}>{error}</p>}
        </div>


      </section>
  );
}

export default Login;
