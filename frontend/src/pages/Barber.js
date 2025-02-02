import React, { useEffect, useState } from 'react';
import { fetchApprovedProviders } from '../api/providers';

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
            <h1>Approved Barbers</h1>
            {providers.length > 0 ? (
                <ul>
                  {providers.map((provider) => (
                      <li key={provider.id}>
                        <h2>{provider.username}</h2>
                        <p>Location: {provider.location}</p>
                        <p>Specialty: {provider.specialty}</p>
                        <p>Prices: {JSON.stringify(provider.prices)}</p>
                      </li>
                  ))}
                </ul>
            ) : (
                <p>No approved barbers found.</p>
            )}
          </div>

        </section>
      </main>

  );
}

export default Barber;
