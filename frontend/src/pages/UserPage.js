import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { changePassword } from '../api/auth';
// import "./Home.css";

function UserPage() {
  const [userData, setUserData] = useState({ username: '', email: '', isProvider: false,
        isCustomer: false, location: '',specialty: '', portfolio: '', prices: [], availability: [], theme: ''});
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // user data is stored under 'user' in localStorage
    const storedData = localStorage.getItem('user');
    if (storedData) {
      const userDetails= JSON.parse(storedData);
      let parsedPrices = [];
      let parsedAvailability = [];

      try {
      const rawPrices = userDetails.prices;
      parsedPrices = typeof rawPrices === 'string'
        ? JSON.parse(rawPrices)
        : Array.isArray(rawPrices)
          ? rawPrices
          : [];
    } catch (err) {
      console.error("Failed to parse prices:", err);
    }

    try {
      const rawAvailability = userDetails.availability;
      parsedAvailability = typeof rawAvailability === 'string'
        ? JSON.parse(rawAvailability)
        : Array.isArray(rawAvailability)
          ? rawAvailability
          : [];
    } catch (err) {
      console.error("Failed to parse availability:", err);
    }
      setUserData({ username: userDetails.username,
            email: userDetails.email,
            isProvider: userDetails.isProvider,
            isCustomer: userDetails.isCustomer,
            location: userDetails.location,
            specialty: userDetails.specialty || '',
            portfolio: userDetails.portfolio || '',
            prices: parsedPrices,
            availability: parsedAvailability,
            theme: userDetails.theme || '',
      });
    }
  }, []);


  const handlePasswordChange = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    try {
      const result = await changePassword(password);
      setMessage('Password changed successfully');
    } catch (error) {
      setMessage('Failed to change password');
      console.error('Password change error:', error);
    }
  };

  return (
    <main>
      <section className="hero">
        <div>
          {/* For both providers and customers */}
          <h1>Welcome, {userData.username}</h1>
          <p>Your email: {userData.email}</p>
          {/* Form to change password page  */}
          {/* TODO: Make visually appealing   */}
          <form onSubmit={handlePasswordChange}>
            <div>
              <label>
                New Password:
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
              </label>
            </div>
            <div>
              <label>
                Confirm New Password:
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                       required/>
              </label>
            </div>
            <button type="submit">Change Password</button>
            {message && <p>{message}</p>}
          </form>
          <p>Location: {userData.location}</p>
          {userData.isProvider && (
              <>
                <p>Specialty: {userData.specialty}</p>
                <p>Portfolio: <a href={userData.portfolio} target="_blank" rel="noreferrer">{userData.portfolio}</a></p>
                <p>Pricing:</p>
                <ul>
                  {userData.prices.map((entry, index) => (
                      <li key={index}>
                        Session: <strong>{entry.session}</strong>, Price: <strong>${entry.price}</strong>
                      </li>
                  ))}
                </ul>
                <p>Availability:</p>
                <ul>
                  {userData.availability.map((entry, index) => (
                      <li key={index}>
                        Day: <strong>{entry.day}</strong>, Slots: <strong>{entry.slots}</strong>
                      </li>
                  ))}
                </ul>
                <p>Theme: {userData.theme}</p>
              </>
          )}

        </div>
      </section>
    </main>
  );
}

export default UserPage;
