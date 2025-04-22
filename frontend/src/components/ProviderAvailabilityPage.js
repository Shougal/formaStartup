import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axios';
import moment from 'moment';

const ProviderAvailabilityPage = () => {
  const { providerId } = useParams();
  const location = useLocation();
  const providerName = location.state?.name || "Provider";

  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await axiosInstance.get(`/availability/provider/${providerId}/`);
        const formatted = res.data.map(entry => ({
          day: entry.day,
          slots: entry.time_slots  // match your earlier data structure
        }));
        setAvailability(formatted);
      } catch (err) {
        console.error('Failed to fetch availability:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [providerId]);

  if (loading) return <p>Loading availability...</p>;

  return (
    <main >
        <section className={"hero"}>
            <div className="container mt-4">
      <h2>Availability for {providerName}</h2>
      {availability.length === 0 ? (
        <p>No availability set by this provider.</p>
      ) : (
        <ul>
          {availability.map((entry, index) => (
            <li key={index}>
              {moment(entry.day).format('dddd, MMMM Do')}: {entry.slots.join(', ')}
            </li>
          ))}
        </ul>
      )}
            </div>
        </section>
    </main>
  );
};

export default ProviderAvailabilityPage;
