import React, { useState } from 'react';
import { registerProvider } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function RegisterProvider() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    location: '',
    specialty: '',
    availability: '',
    prices: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerProvider(formData);
      alert('Provider registered successfully!');
      navigate('/login'); // Redirect to login
    } catch (err) {
      setError('Failed to register. Please try again.');
    }
  };

  return (
    <div>
      <h2>Register as Provider</h2>
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
        <input
          type="text"
          name="specialty"
          placeholder="Specialty"
          value={formData.specialty}
          onChange={handleChange}
          required
        />
        <textarea
          name="availability"
          placeholder="Availability (e.g., {'Monday': '9-5'})"
          value={formData.availability}
          onChange={handleChange}
          required
        />
        <textarea
          name="prices"
          placeholder="Prices (e.g., {'session': '100'})"
          value={formData.prices}
          onChange={handleChange}
          required
        />
        <button type="submit">Register</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default RegisterProvider;
