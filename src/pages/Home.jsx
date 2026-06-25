import { useNavigate } from 'react-router-dom';

import '../Styles/HomePage.css';

import FACTIONS from "../data/Factions.json"

export default function HomePage() {
    const navigate = useNavigate();   // ← was imported but never called

    return (
        <div className="home-page">

            <section className="hero">
                <h1 className="hero-title">BROKEN ALLIANCE</h1>
                <p className="hero-tagline">Four factions. One fractured galaxy. No mercy.</p>
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
                <button onClick={() => navigate('/aio')}>All units/building</button>
            </section>

            <section className='about-section'>
                <h3 className='about-title'>Elevator Pitch </h3>
                <p>
                    Broken Alliance is a massive-scale sci-fi RTS set in a fractured universe where the United Defense Force's dream of galactic unity has collapsed. Four radically asymmetric factions disciplined humans, cybernetic elites, placeHolder, and a consuming cosmic Rot clash over alien ruins and resource-rich worlds. Drawing on the epic unit counts of Supreme Commander and the punchy hero-driven combat of Halo Wars, players navigate dynamic weather, destructible terrain, and faction-defining leader powers — all scored by their own music library. 
                </p>
                
            </section>

        </div>
    );
}