import { useState } from 'react';

import '../Styles/Login.css'

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log('Username:', username);
        console.log('Password:', password);
    };

    return (
        <div className="form">
            <h1>Admin Login Page</h1>
            <p>Please sign in to continue.</p>

            <form onSubmit={handleSubmit}>
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
        </div>
    );
}