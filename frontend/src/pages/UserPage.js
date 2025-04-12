import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { changePassword } from '../api/auth';
// import "./Home.css";

function UserPage() {
  const [userData, setUserData] = useState({ username: '', email: '' });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // user data is stored under 'user' in localStorage
    const storedData = localStorage.getItem('user');
    if (storedData) {
      const { username, email } = JSON.parse(storedData);
      setUserData({ username, email });
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
        </div>
      </section>
    </main>
  );
}

export default UserPage;
