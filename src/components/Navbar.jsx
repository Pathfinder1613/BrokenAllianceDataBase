import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "../Styles/Navbar.css";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { isAdmin, logout: authLogout } = useAuth();
    const navigate = useNavigate();

    async function logout() {
        await authLogout();
        navigate("/");
    }

    return (
        <nav className="navbar">
            <span className={`navbar-logo${isAdmin ? " navbar-logo--authed" : ""}`}>
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

                {isAdmin && (
                    <>
                        <li><NavLink to="/admin">Dashboard</NavLink></li>
                        <li>
                            <button className="nav-logout" onClick={logout}>
                                Logout
                            </button>
                        </li>
                    </>
                )}
            </ul>

            <span className="navbar-version">v0.0</span>
        </nav>
    );
}
