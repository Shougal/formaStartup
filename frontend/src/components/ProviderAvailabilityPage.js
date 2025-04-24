import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import moment from 'moment';

const ProviderAvailabilityPage = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const providerName = location.state?.name || "Provider";

  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({}); // { '2025-04-26': ['10:00', '11:00'] }

  const fetchAvailability = async () => {
    try {
      const res = await axiosInstance.get(`/availability/provider/${providerId}/`);
      const formatted = res.data.map(entry => ({
        day: entry.day,
        slots: entry.time_slots
      }));
      setAvailability(formatted);
    } catch (err) {
      console.error('Failed to fetch availability:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [providerId]);

  // const toggleSlot = (day, slot) => {
  //   setSelected(prev => {
  //     const currentSlots = prev[day] || [];
  //     const newSlots = currentSlots.includes(slot)
  //       ? currentSlots.filter(s => s !== slot)
  //       : [...currentSlots, slot];
  //     return { ...prev, [day]: newSlots };
  //   });
  // };
  const toggleSlot = (day, slot) => {
  const currentSlots = selected[day] || [];

  // If the clicked slot is already selected, unselect it
  if (currentSlots.includes(slot)) {
    setSelected({});
    return;
  }

  // Check if any slot is already selected
  const hasOtherSlot = Object.keys(selected).some(d => selected[d].length > 0);

  if (hasOtherSlot) {
    alert('You can only book one appointment at a time. Please deselect the other slot first.');
    return;
  }

  // Set the newly selected slot
  setSelected({ [day]: [slot] });
};


  const handleSubmit = async () => {
    const storedData = localStorage.getItem('user');
    if (!storedData) {
      alert('Please log in to book.');
      navigate('/login');
      return;
    }

    const userDetails = JSON.parse(storedData);
    if (!userDetails.isCustomer) {
      alert('Only customers can book appointments.');
      return;
    }

    const bookings = [];

    for (const day in selected) {
      const slots = selected[day];
      for (const time of slots) {
        bookings.push({ provider: providerId, date: day, time });
      }
    }

    try {
      await Promise.all(
        bookings.map(b =>
          axiosInstance.post('/appointments/book/', b)
        )
      );
      alert(`Booked ${bookings.length} appointment(s) with ${providerName}`);
      setSelected({});
      fetchAvailability(); // refresh slots after booking
    } catch (err) {
      alert('Some appointments failed to book. Try again.');
      console.error(err);
    }
  };

  if (loading) return <p>Loading availability...</p>;

  return (
    <main>
      <section className="hero">
        <div className="container mt-4">
          <h2>Availability for {providerName}</h2>
          {availability.length === 0 ? (
            <p>No availability set by this provider.</p>
          ) : (
            availability
  .filter(entry => entry.slots && entry.slots.length > 0)
  .map((entry, index) => (
    <div key={index} className="card p-3 mb-3">
      <h5>{moment(entry.day).format('dddd, MMMM Do')}</h5>
      <div className="d-flex flex-wrap gap-3">
        {entry.slots.map((slot, i) => (
          <div className="form-check form-check-inline" key={i}>
            <input
              className="form-check-input"
              type="checkbox"
              id={`${entry.day}-${slot}`}
              checked={selected[entry.day]?.includes(slot) || false}

              onChange={() => toggleSlot(entry.day, slot)}
            />
            <label className="form-check-label" htmlFor={`${entry.day}-${slot}`}>
              {slot}
            </label>
          </div>
        ))}
      </div>
    </div>
))

          )}
          {Object.keys(selected).length > 0 && (
            <div className="mt-4">
              <button className="btn btn-primary" onClick={handleSubmit}>
                Submit Booking
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default ProviderAvailabilityPage;