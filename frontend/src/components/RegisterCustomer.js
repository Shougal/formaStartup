import React, { useState } from 'react';
import { registerCustomer } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function RegisterCustomer() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    location: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerCustomer(formData);
      alert('Customer registered successfully!');
      navigate('/login'); // Redirect to login
    } catch (err) {
      setError('Failed to register. Please try again.');
    }
  };

  return (
    <div>
      <h2>Register as Customer</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          required
        />
        <button type="submit">Register</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default RegisterCustomer;
