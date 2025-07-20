import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';



export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();


  async function handleLogin(e) {
    e.preventDefault();

    const res = await fetch('http://localhost:8000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      const token = data.access_token;
      const decoded = jwtDecode(token);
      const role = decoded.role;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      if (role === "lawyer") {
        navigate("/lawyer");
      } else {
        navigate("/client");
      }
    } else {
      alert(data.detail || "Login failed");
    }
  }

  return (
    <div id="login-box">
      <h1>
        <span className="x-green">X</span>
        <span className="ledger-black">LEDGER</span> Login
      </h1>
      <form onSubmit={handleLogin}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="login-button" type="submit">Login</button>
      </form>
      <p style={{ marginTop: '10px' }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>

    </div>
  );
}
