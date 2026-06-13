import { Link } from "react-router-dom";
// css
import '../Styles/Navbar.css';

export default function Navbar() {
    return (
        <div>
            <nav className="Navbar">
                <h1>BROKEN ALLIANCE </h1>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/Leader"> Leaders</Link>
                    </li>   
                </ul>
                <p>v.0.0</p>
                
                
                

            </nav>

        </div>


    )
}