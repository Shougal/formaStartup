import React, { useEffect, useState } from 'react';
import { fetchApprovedProviders } from '../api/providers';
import './providers.css'
import { useNavigate } from 'react-router-dom';

function NailStylist() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getProviders = async () => {
      try {
        const data = await fetchApprovedProviders('NailStylist');
        setProviders(data);
      } catch (error) {
        console.error('Failed to fetch nail stylists:', error);
      } finally {
        setLoading(false);
      }
    };
    getProviders();
  }, []);

  if (loading) return <p>Loading...</p>;

   const handleBookNow = (providerId, providerName) => {
  const storedData = localStorage.getItem('user');
  if (!storedData) {
    alert('Please log in to book an appointment.');
    navigate('/login');
    return;
  }

  const userDetails = JSON.parse(storedData);
  if (!userDetails.isCustomer) {
    alert('Only customers can book appointments. Please register as a customer.');
    return;
  }

  navigate(`/availability/provider/${providerId}`, {
    state: { name: providerName }
  });
};

  return (
      <main>
        <section className="hero">
          <div className="provider-list">
            {providers.map(provider => (
                <div className="provider-card" key={provider.id}>
                  <h2>{`${provider.first_name} ${provider.last_name}`}</h2>
                  <p><strong>Specialty:</strong> {provider.theme}</p>
                  <div className="pricing">
                    <h3>Prices:</h3>
                    <ul>
                      {provider.prices && JSON.parse(provider.prices).map(({session, price}, index) => (
                          <li key={index}>{`${session}: $${price}`}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="availability">
                    <h3>Availability:</h3>
                    <ul>
                       {provider.availability && JSON.parse(provider.availability).map((entry, index) => (
                          <li key={index}>{`${entry.day}: ${entry.slots}`}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="actions">
                    <a href={provider.portfolio_link} target="_blank" rel="noopener noreferrer"
                       className="btn portfolio-btn">Portfolio</a>
                    {/*<a href={provider.calendly_link} target="_blank" rel="noopener noreferrer" className="btn book-btn">Book*/}
                    {/*  Now</a>*/}
                    <button
                        className="btn book-btn"
                        onClick={() => handleBookNow(provider.id, `${provider.first_name} ${provider.last_name}`)}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
            ))}
          </div>
        </section>
      </main>

  );
}

export default NailStylist;
