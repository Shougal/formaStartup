import React, { useEffect, useState } from 'react';
import { fetchApprovedProviders } from '../api/providers';
import './providers.css'
import { useNavigate } from 'react-router-dom';

function Barber() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getProviders = async () => {
      try {
        const data = await fetchApprovedProviders('Barber');
        setProviders(data);
      } catch (error) {
        console.error('Failed to fetch barbers/hairstylists:', error);
      } finally {
        setLoading(false);
      }
    };
    getProviders();
  }, []);

  if (loading) return <p>Loading...</p>;

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
                        onClick={() =>
                            navigate(`/availability/provider/${provider.id}`, {
                              state: {name: `${provider.first_name} ${provider.last_name}`}
                            })
                        }
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

export default Barber;
