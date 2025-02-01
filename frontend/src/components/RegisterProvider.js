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
    <section className="hero">
      <div className="register-container">
        <h2>Join as a Service Provider</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <input type="text" name="location" placeholder="Location" onChange={handleChange} required />
          <input type="text" name="specialty" placeholder="Specialty" onChange={handleChange} required />
          <button type="submit">Register</button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </section>
  );
}

export default RegisterProvider;
