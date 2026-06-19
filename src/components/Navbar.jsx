import { NavLink } from "react-router-dom";
import { useState } from 'react';
import '../Styles/Navbar.css';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="navbar">
            <span className="navbar-logo">BROKEN ALLIANCE</span>

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
            </ul>

            <span className="navbar-version">v0.0</span>
        </nav>
    );
}