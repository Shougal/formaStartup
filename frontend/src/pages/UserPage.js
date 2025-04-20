import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../api/auth';

function UserPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    username: '', email: '', isProvider: false, isCustomer: false,
    location: '', specialty: '', portfolio: '', prices: [], availability: [], theme: ''
  });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem('user');
    if (storedData) {
      const userDetails = JSON.parse(storedData);
      let parsedPrices = [];
      let parsedAvailability = [];

      try {
        const rawPrices = userDetails.prices;
        parsedPrices = typeof rawPrices === 'string'
          ? JSON.parse(rawPrices)
          : Array.isArray(rawPrices) ? rawPrices : [];
      } catch (err) {
        console.error("Failed to parse prices:", err);
      }

      try {
        const rawAvailability = userDetails.availability;
        parsedAvailability = typeof rawAvailability === 'string'
          ? JSON.parse(rawAvailability)
          : Array.isArray(rawAvailability) ? rawAvailability : [];
      } catch (err) {
        console.error("Failed to parse availability:", err);
      }

      setUserData({
        username: userDetails.username,
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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    try {
      await changePassword(password);
      setMessage('Password changed successfully');
      setPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (error) {
      setMessage('Failed to change password');
      console.error('Password change error:', error);
    }
  };

  return (
    <main >
      <section className={"hero"}>
        <div className="container mt-4">

          {/* Username & Email */}
          <h1>Welcome, {userData.username}</h1>
          <div className="mb-3 p-3 rounded" style={{backgroundColor: 'white', color: 'black'}}>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Location:</strong> {userData.location}</p>
          </div>

          {/* Change Password */}
          <div className="mb-3 p-3 rounded" style={{backgroundColor: 'white', color: 'black'}}>
            {!showPasswordForm ? (
                <button className="btn"
                        onClick={() => setShowPasswordForm(true)}>
                  Change Password
                </button>
            ) : (
                <form onSubmit={handlePasswordChange} className="mt-3">
                  <div className="mb-2">
                    <label>New Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                           className="form-control"/>
                  </div>
                  <div className="mb-2">
                    <label>Confirm Password:</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                           required className="form-control"/>
                  </div>
                  <button type="submit" className="btn btn-success">Submit</button>
                  <button type="button" className="btn btn-secondary ms-2"
                          onClick={() => setShowPasswordForm(false)}>Cancel
                  </button>
                  {message && <p className="mt-2">{message}</p>}
                </form>
            )}
          </div>

          {/* Provider Details */}
          {userData.isProvider && (
              <>
                <div className="mb-3 p-3 rounded" style={{backgroundColor: 'white', color: 'black'}}>
                  <h3>Provider Info</h3>
                  <p><strong>Specialty:</strong> {userData.specialty}</p>
                  <p><strong>Portfolio:</strong> <a href={userData.portfolio} target="_blank"
                                                    rel="noreferrer">{userData.portfolio}</a></p>
                  <p><strong>Theme:</strong> {userData.theme}</p>
                </div>

                {/* Pricing */}
                <div className="mb-3 p-3 rounded" style={{backgroundColor: 'white', color: 'black'}}>
                  <h5>Pricing</h5>
                  <ul>
                    {userData.prices.map((entry, index) => (
                        <li key={index}>
                          Session: <strong>{entry.session}</strong>, Price: <strong>${entry.price}</strong>
                        </li>
                    ))}
                  </ul>
                  {/* TODO: Implement Change Pricing Functionality */}
                  {/*<button className="btn btn-outline-secondary" onClick={() => setShowPriceForm(true)}>Change Prices*/}
                  {/*</button>*/}
                </div>

                {/* Availability Button */}
                <div className="mb-3 p-3 rounded" style={{backgroundColor: 'white', color: 'black'}}>
                  <p><strong>Set this week's Availability:</strong></p>
                  <button className="btn btn-primary" onClick={() => navigate('/set-availability')}>
                    Set Availability
                  </button>
                </div>

                {/* Availability List */}
                <div className="mb-3 p-3 rounded" style={{backgroundColor: 'white', color: 'black'}}>
                  <h5>Current Availability</h5>
                  <ul>
                    {userData.availability.map((entry, index) => (
                        <li key={index}>
                          Day: <strong>{entry.day}</strong>, Slots: <strong>{entry.slots}</strong>
                        </li>
                    ))}
                  </ul>
                </div>
              </>
          )}

        </div>


      </section>
    </main>
  );
}

export default UserPage;
