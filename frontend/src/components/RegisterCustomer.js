import React, { useState } from 'react';
import { registerCustomer } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function RegisterCustomer() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { email, password, confirmPassword } = formData;

    // Check email ends with @virginia.edu
    if (!email.toLowerCase().endsWith('@virginia.edu')) {
      setError('Email must end with @virginia.edu');
      return false;
    }

    // Check password strength
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters, contain at least one uppercase letter and one number.');
      return false;
    }

    // Check passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
  //    if (formData.password !== formData.confirmPassword) {
  //   setError("Passwords do not match");
  //   return;
  // }

  const { confirmPassword, ...dataToSubmit } = formData;

    try {
      await registerCustomer({
        ...dataToSubmit,
        email: dataToSubmit.email.toLowerCase(),
        username: dataToSubmit.username.toLowerCase(),
      });

      alert('Customer registered successfully!');
      navigate('/login'); // Redirect to login
    } catch (err) {
      setError('Failed to register. Please try again.');
    }
  };

  return (
    <section className="hero">
      <div className="register-container">
        <h2>Join as a Customer</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="username" placeholder="Username" onChange={handleChange} required/>
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required/>
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required/>
          <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={handleChange}
              required
          />

          <input type="text" name="location" placeholder="Location" onChange={handleChange} required/>
          <button type="submit">Register</button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </section>
  );
}

export default RegisterCustomer;
