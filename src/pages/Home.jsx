import { useNavigate } from 'react-router-dom';

import '../Styles/HomePage.css';

import FACTIONS from "../data/Factions.json"

export default function HomePage() {
    const navigate = useNavigate();   // ← was imported but never called

    return (
        <div className="home-page">

            <section className="hero">
                <h1 className="hero-title">BROKEN ALLIANCE</h1>
                {/* <p className="hero-tagline">Five factions. One fractured galaxy. No mercy.</p> */}
            </section>

            <div className="faction-strip">
                {Object.keys(FACTIONS).map((faction_id) => (
                    <img src={`/images/icons/${faction_id}.svg`}/>
                ))}
            </div>

            <section className="home-blurb">
                <p>
                    Command massive armies across a fractured galaxy. Master economy,
                    tech, and tactics as humans, cyborgs, placeholder, or cosmic horrors
                    collide over alien ruins and resource-rich worlds.
                </p>
            </section>

            <section className="home-actions">
                <button onClick={() => navigate('/leaders')}>Leaders</button>
                <button onClick={() => navigate('/constructs')}>Constructs</button>
            </section>

        </div>
    );
}