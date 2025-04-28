import React, { useState } from 'react';
import {registerCustomer, registerProvider} from '../api/auth';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function RegisterProvider() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    specialty: 'NailStylist',  // Default to NailStylist as the initial selected specialty
    availability: '',
    prices: '',
    theme: '',
    first_name: '',
    last_name: '',
    portfolio_link: '',
    calendly_link: '',
    // img: ''  // TODO: Check if '' or null

  });

  const [error, setError] = useState('');
  const navigate = useNavigate();
  const[availability, setAvailability] = useState([{day:'', slots:''}])
  const[prices, setPrices] = useState([{session:'', price:''}])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { email, password, confirmPassword } = formData;

    if (!email.toLowerCase().endsWith('@virginia.edu')) {
      setError('Email must end with @virginia.edu');
      return false;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters, contain at least one uppercase letter and one number.');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };



  // Handling formatting availability and prices into JSON before sending them to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
  //    if (formData.password !== formData.confirmPassword) {
  //   setError("Passwords do not match");
  //   return;
  // }
    const submitData = {
        ...formData,
        availability: JSON.stringify(availability),
        prices: JSON.stringify(prices)
    };
     delete submitData.confirmPassword; // Don't send this to the backend
    try {
        await registerProvider({
          ...submitData,
          email: submitData.email.toLowerCase(),
          username: submitData.username.toLowerCase(),
        });

        alert('Provider registered successfully!');
        navigate('/login');
    } catch (err) {
        setError('Failed to register. Please try again.');

    }
};

  const handleAvailabilityChange = (index, field, value) => {
    const newAvailability = [...availability];
    newAvailability[index][field] = value;
    setAvailability(newAvailability);
  };

  const addAvailabilityField = () => {
    setAvailability([...availability, { day: '', slots: '' }]);
  };

  const removeAvailabilityField = (index) => {
    const newAvailability = [...availability];
    newAvailability.splice(index, 1);
    setAvailability(newAvailability);
  };

  // Adding and handling prices
  const handlePricesChange = (index, field, value) => {
    const newPrices = prices.map((price, i) => {
      if (i === index) {
        if (field === 'price') {
          // Convert price input to a number if it is not NaN
          const number = parseFloat(value);
          return { ...price, [field]: isNaN(number) ? '' : number };
        }
        return { ...price, [field]: value };
      }
      return price;
    });
    setPrices(newPrices);
  };

  // Add a new price tier
  const addPriceField = () => {
    setPrices([...prices, { session: '', price: '' }]);
  };

  // Remove a price tier
  const removePriceField = (index) => {
    setPrices(prices.filter((_, i) => i !== index));
  };

  return (
    <section className="hero">
      <div className="register-container">
        <h2>Join as a Service Provider</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="username" placeholder="Username" onChange={handleChange} required/>
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required/>
          <input type="text" name="first_name" placeholder="First name" onChange={handleChange} required/>
          <input type="text" name="last_name" placeholder="Last name" onChange={handleChange} required/>
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required/>
          <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange}
                 required/>

          <input type="text" name="location" placeholder="Location" onChange={handleChange} required/>
          <label htmlFor="specialty"> What's your specialty?</label>
          <select name="specialty" id="specialty" onChange={handleChange} required>
            <option value="NailStylist">Nail Stylist</option>
            <option value="Barber"> Barber/HairStylist</option>
            <option value="Photographer"> Photographer</option>
          </select>
          <textarea name="theme" placeholder="Is there a specific thing you do within your field?"
                    onChange={handleChange}></textarea>
          {availability.map((item, index) => (
              <div key={index} style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                <label style={{marginRight: '5px'}}>
                  Available Days:
                  <input
                      type="text"
                      placeholder="Ex:Mon-Thrs"
                      value={item.day}
                      onChange={(e) => handleAvailabilityChange(index, 'day', e.target.value)}
                      style={{marginLeft: '5px'}}
                  />
                </label>
                <label style={{marginRight: '5px'}}>
                  Time Slots:
                  <input
                      type="text"
                      placeholder="Slots (e.g., 9:00 AM - 5:00 PM)"
                      value={item.slots}
                      onChange={(e) => handleAvailabilityChange(index, 'slots', e.target.value)}
                      style={{marginLeft: '5px'}}
                  />
                </label>
                {index > 0 && (
                    <button type="button" onClick={() => removeAvailabilityField(index)}>Remove</button>
                )}
              </div>
          ))}
          <button type="button" onClick={addAvailabilityField}>Add More</button>
          {/* Adding pricing field */}
          {/*TODO: Price field changes numbers sometimes, fix it */}
          {prices.map((price, index) => (
              <div key={index} style={{marginBottom: '10px'}}>
                <input
                    type="text"
                    placeholder="Session, `ex: 1 person or 1 hour:"
                    value={price.session}
                    onChange={(e) => handlePricesChange(index, 'session', e.target.value)}
                    style={{marginRight: '5px'}}
                />
                <input
                    type="number"  // Set input type to number to restrict input to numerical values
                    placeholder="Please input a price integer ex: 20"
                    value={price.price}
                    onChange={(e) => handlePricesChange(index, 'price', e.target.value)}
                />
                {index > 0 && (
                    <button type="button" onClick={() => removePriceField(index)}>Remove</button>
                )}
              </div>
          ))}
          <button type="button" onClick={addPriceField}>Add Price Tier</button>
          {/*TODO: Handle image uploads */}
          {/*<input type="file" name="img" placeholder="An optional image to be displayed of you in our website" onChange={handleChange}/>*/}
          <input type="url" name="portfolio_link" placeholder="Portfolio link, ex: instagram profile page link"
                 onChange={handleChange} required/>
          <input type="url" name="calendly_link" placeholder="Please add link to your calendly schedule"
                 onChange={handleChange} required/>

          <button type="submit">Register</button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </section>
  );
}

export default RegisterProvider;