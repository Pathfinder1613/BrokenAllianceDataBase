import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import '../Styles/Navbar.css';

function getIsAuthed() {
    try {
        const { exp } = JSON.parse(atob(token.split('.')[1]));
        return exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [authed, setAuthed] = useState(getIsAuthed);
    const location = useLocation();
    const navigate = useNavigate();

    // Ask the server whether the cookie is valid (JS can't read httpOnly cookies)
    async function checkAuth() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}logout`, {
                credentials: "include",
            });
            setAuthed(res.ok);            // 200 = logged in, 401 = not
        } catch {
            setAuthed(false);
        }
    }

    useEffect(() => {
        checkAuth();
    }, [location]);

    async function logout() {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
                method: "POST",
                credentials: "include",   // only the server can clear an httpOnly cookie
            });
        } finally {
            setAuthed(false);
            navigate('/');
        }
    }

    return (
        <nav className="navbar">
            <span className={`navbar-logo${authed ? ' navbar-logo--authed' : ''}`}>BROKEN ALLIANCE</span>

            <button
                className="menu-button"
                onClick={() => setMenuOpen(!menuOpen)}
            >
                ☰
            </button>

            <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="/leaders">Leaders</NavLink></li>
                <li><NavLink to="/aio">AIO</NavLink></li>
                <li><NavLink to="/detail-viewer">viewer</NavLink></li>
                {authed && (
                    <li>
                        <button className="nav-logout" onClick={logout}>Logout</button>
                    </li>
                )}
            </ul>

            <span className="navbar-version">v0.0</span>
        </nav>
    );
}
