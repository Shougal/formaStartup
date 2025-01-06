import React, { useState } from "react";
import { signUpWithEmail } from "../firebase/auth";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      await signUpWithEmail(email, password);
      alert("Account created successfully!");
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleRegister}>Sign Up</button>
    </div>
  );
};

export default Register;
