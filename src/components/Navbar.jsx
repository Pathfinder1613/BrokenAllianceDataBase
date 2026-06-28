import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../Styles/Navbar.css";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [authed, setAuthed] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    async function checkAuth() {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}me`,
                {
                    credentials: "include",
                }
            );

            setAuthed(res.ok);
        } catch {
            setAuthed(false);
        }
    }

    useEffect(() => {
        checkAuth();
    }, [location.pathname]);

    async function logout() {
        try {
            await fetch(
                `${import.meta.env.VITE_API_URL}logout`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );
        } finally {
            setAuthed(false);
            navigate("/");
        }
    }

    return (
        <nav className="navbar">
            <span className={`navbar-logo${authed ? " navbar-logo--authed" : ""}`}>
                BROKEN ALLIANCE
            </span>

            <button
                className="menu-button"
                onClick={() => setMenuOpen(!menuOpen)}
            >
                ☰
            </button>

            <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="/leaders">Leaders</NavLink></li>
                <li><NavLink to="/aio">AIO</NavLink></li>
                <li><NavLink to="/detail-viewer">viewer</NavLink></li>

                {authed && (
                    <li>
                        <button
                            className="nav-logout"
                            onClick={logout}
                        >
                            Logout
                        </button>
                    </li>
                )}
            </ul>

            <span className="navbar-version">v0.0</span>
        </nav>
    );
}
