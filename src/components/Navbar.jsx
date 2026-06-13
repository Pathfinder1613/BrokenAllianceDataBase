import { NavLink } from "react-router-dom";
import '../Styles/Navbar.css';

export default function Navbar() {
    return (
        <nav className="navbar">
            <span className="navbar-title">BROKEN ALLIANCE</span>

            <ul className="navbar-links">
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="/Leader">Leaders</NavLink></li>
            </ul>

            <span className="navbar-version">v0.0</span>
        </nav>
    );
}