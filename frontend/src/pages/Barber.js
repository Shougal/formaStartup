import React, { useEffect, useState } from 'react';
import { fetchApprovedProviders } from '../api/providers';
import './providers.css'
function Barber() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProviders = async () => {
      try {
        const data = await fetchApprovedProviders('Barber');
        setProviders(data);
      } catch (error) {
        console.error('Failed to fetch barbers:', error);
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
                    <h3>Price:</h3>
                    <ul>
                      {Object.entries(provider.prices).map(([key, value], index) => (
                          <li key={index}>{`${key}: ${value}`}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="availability">
                    <h3>Availability:</h3>
                    <ul>
                      {Object.entries(provider.availability).map(([key, value], index) => (
                          <li key={index}>{`${key}: ${value}`}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="actions">
                    <a href={provider.portfolio_link} target="_blank" rel="noopener noreferrer"
                       className="btn portfolio-btn">Portfolio</a>
                    <a href={provider.calendly_link} target="_blank" rel="noopener noreferrer" className="btn book-btn">Book
                      Now</a>
                  </div>
                </div>
            ))}
          </div>
        </section>
      </main>

  );
}

export default Barber;
