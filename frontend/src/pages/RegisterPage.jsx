import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('client');  // default to client
    const navigate = useNavigate();

    async function handleRegister(e) {
        e.preventDefault();

        const res = await fetch('http://localhost:8000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role })
        });

        const data = await res.json();

        if (res.ok) {
            alert('Registration successful! Please log in.');
            navigate('/login');
        } else {
            alert(data.detail || data.error || 'Registration failed');
        }
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
                <label>Email:</label><br />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /><br />

                <label>Password:</label><br />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /><br />

                <label>Role:</label><br />
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="lawyer">Lawyer</option>
                    <option value="client">Client</option>
                </select><br /><br />

                <button type="submit">Register</button>
            </form>
            <p style={{ marginTop: '10px' }}>
                Already have an account? <Link to="/login">Login here</Link>
            </p>

        </div>
    );
}
