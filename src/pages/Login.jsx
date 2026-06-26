import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/modal.jsx';

import '../Styles/Login.css'

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function login(username, password) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", 
            body: JSON.stringify({ username, password }),
        });
        if (!res.ok) throw new Error("Login failed");
        
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(username, password);
            navigate('/');   // where admins land after logging in
        } catch (err) {
            setError("Invalid username or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={() => window.history.length > 1 ? navigate(-1) : navigate('/')}
            title='Admin Login'
        >
            <form className="form" onSubmit={handleSubmit}>
                <p>Please sign in to continue.</p>
                
                <label>
                    Admin Name
                    <input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="User name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="new-username"
                        required
                    />
                </label>

                <label>
                    Admin Password
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                    />
                </label>

                <button type="submit" disabled={loading}>
                    {loading ? 'Signing in…' : 'Login'}
                </button>
                {error && <p className="form-error">{error}</p>}
            </form>
        </Modal>
    );
}
