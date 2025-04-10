import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import "./Home.css";

function UserPage() {
  const [userData, setUserData] = useState({ username: '', email: '' });

  useEffect(() => {
    // user data is stored under 'user' in localStorage
    const storedData = localStorage.getItem('user');
    if (storedData) {
      const { username, email } = JSON.parse(storedData);
      setUserData({ username, email });
    }
  }, []);

  return (
    <main>
      <section className="hero">
        <div>
          {/* For both providers and customers */}
          <h1>Welcome, {userData.username}</h1>
          <p>Your email: {userData.email}</p>
          {/* Link to change password page  */}
          <Link to="/change-password">Change Password</Link>
        </div>
      </section>
    </main>
  );
}

export default UserPage;
