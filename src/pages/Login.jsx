import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/modal.jsx';

import '../Styles/Login.css'

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
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

                <button type="submit">Login</button>
            </form>
        </Modal>
    );
}
