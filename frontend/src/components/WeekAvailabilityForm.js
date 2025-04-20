import React, { useEffect, useState } from 'react';
import moment from 'moment';
import axiosInstance from '../api/axios';

const WeekAvailabilityForm = () => {
  const [weekDays, setWeekDays] = useState([]);
  const [availabilityMap, setAvailabilityMap] = useState({});
  const [availabilityIds, setAvailabilityIds] = useState({});
  const [editingDate, setEditingDate] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);

  useEffect(() => {
    const startOfWeek = moment().startOf('week').add(1, 'days'); // Monday
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(startOfWeek.clone().add(i, 'days'));
    }
    setWeekDays(days);
  }, []);

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 0; i < 24; i++) {
      const time = moment({ hour: i }).format('HH:00');
      slots.push(time);
    }
    return slots;
  };

  const fetchAvailability = async (date) => {
    const formattedDate = date.format('YYYY-MM-DD');
    try {
      const response = await axiosInstance.get('/availability/');
      const allAvailabilities = response.data;
      const dayAvailability = allAvailabilities.find(av => av.day === formattedDate);

      setAvailabilityMap(prev => ({
        ...prev,
        [formattedDate]: dayAvailability?.time_slots || []
      }));

      if (dayAvailability?.id) {
        setAvailabilityIds(prev => ({ ...prev, [formattedDate]: dayAvailability.id }));
      }
    } catch (error) {
      console.error('Failed to fetch availability:', error);
    }
  };

  const handleEdit = (date) => {
    const formattedDate = date.format('YYYY-MM-DD');
    const existingSlots = availabilityMap[formattedDate] || [];
    setEditingDate(formattedDate);
    setSelectedSlots(existingSlots);
  };

  const toggleSlot = (slot) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const handleSave = async () => {
    const payload = {
      day: editingDate,
      time_slots: selectedSlots
    };
    console.log('Submitting payload:', payload);

    try {
      if (availabilityIds[editingDate]) {
        // Update existing
        await axiosInstance.put(`/availability/${availabilityIds[editingDate]}/`, payload);
      } else {
        // Create new
        const res = await axiosInstance.post('/availability/', payload);
        setAvailabilityIds(prev => ({ ...prev, [editingDate]: res.data.id }));
      }

      // Update local state
      setAvailabilityMap(prev => ({ ...prev, [editingDate]: selectedSlots }));
      setEditingDate(null);
    } catch (error) {
      console.error('Failed to save availability:', error);
    }
  };

  return (
      <main>
        <section className={"hero"}>
          <div className="container mt-4">
            <h2>This Week's Availability</h2>
            {weekDays.map((day, index) => {
              const formattedDate = day.format('YYYY-MM-DD');
              const displayDate = day.format('dddd, MMMM Do');
              const slots = availabilityMap[formattedDate];

              return (
                  <div key={index} className="card mb-3 p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <strong>{displayDate}</strong>
                      <div>
                        <button
                            className="btn btn-outline-primary me-2"
                            onClick={() => fetchAvailability(day)}
                        >
                          View
                        </button>
                        <button
                            className="btn btn-outline-success"
                            onClick={() => handleEdit(day)}
                        >
                          Update
                        </button>
                      </div>
                    </div>

                    <div className="mt-2">
                      {slots ? (
                          slots.length > 0 ? (
                              <ul className="mb-0">
                                {slots.map((slot, i) => (
                                    <li key={i}>{slot}</li>
                                ))}
                              </ul>
                          ) : (
                              <p className="text-muted">No availability set.</p>
                          )
                      ) : null}
                    </div>

                    {editingDate === formattedDate && (
                        <div className="mt-3 border-top pt-3">
                          <div className="d-flex flex-wrap gap-3">
                            {generateTimeSlots().map((slot, i) => (
                                <label key={i} className="form-check-label">
                                  <input
                                      type="checkbox"
                                      className="form-check-input me-1"
                                      checked={selectedSlots.includes(slot)}
                                      onChange={() => toggleSlot(slot)}
                                  />
                                  {slot}
                                </label>
                            ))}
                          </div>
                          <div className="mt-3">
                            <button className="btn btn-sm btn-primary me-2" onClick={handleSave}>Save</button>
                            <button className="btn btn-sm btn-secondary" onClick={() => setEditingDate(null)}>Cancel
                            </button>
                          </div>
                        </div>
                    )}
                  </div>
              );
            })}
          </div>
        </section>
      </main>

  );
};

export default WeekAvailabilityForm;
