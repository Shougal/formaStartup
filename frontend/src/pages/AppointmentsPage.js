import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import moment from 'moment';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const storedData = localStorage.getItem('user');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setUserData(parsed);
      fetchAppointments(parsed);
    }
  }, []);

  const fetchAppointments = async (user) => {
    try {
      const endpoint = user.isCustomer
        ? '/appointments/customer/'
        : '/appointments/provider/';
      const res = await axiosInstance.get(endpoint);
      setAppointments(
        res.data.filter(appt => moment(appt.date).isSameOrAfter(moment(), 'day'))
      );
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    }
  };

  return (
    <main>
      <section className="hero">
        <div className="container mt-4">
          <h2>
            {userData.isCustomer
              ? 'Your Upcoming Appointments with Forma Providers'
              : 'Upcoming Customer Appointments'}
          </h2>
          {appointments.length === 0 ? (
            <p>No upcoming appointments yet.</p>
          ) : (
            <ul>
              {appointments.map((appt, index) => (
                <li key={index}>
                  {moment(appt.date).format('MMMM Do')} at {appt.time} —{' '}
                  {userData.isCustomer
                    ? `With ${appt.provider_name}`
                    : `With ${appt.customer_name}`}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
};

export default AppointmentsPage;
