import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Modal from "./modal";
import "../Styles/Navbar.css";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { isAdmin, logout: authLogout } = useAuth();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navigate = useNavigate();

    async function logout() {
        await authLogout();
        navigate("/");
    }

    return (
        <> 
        

        <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="Log Out">
            <p>Are you sure you want to log out?</p>

            <div className="modal-buttons">
                <button type="button" onClick={() => setShowLogoutModal(false)}>
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={async () => {
                        setShowLogoutModal(false);
                        await logout();
                    }}
                >
                    Log Out
                </button>
            </div>
        </Modal>

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
                            <button
                                className="nav-logout"
                                onClick={() => setShowLogoutModal(true)}
                            >
                                Logout
                            </button>
                        </li>
                    </>
                )}
            </ul>

            <span className="navbar-version">v0.0</span>
        </nav>

        </>

        
    );
}
