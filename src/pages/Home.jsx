import { useNavigate } from 'react-router-dom';
import '../Styles/HomePage.css';

export default function HomePage() {
    const navigate = useNavigate();   // ← was imported but never called

    return (
        <div className="home-page">

            <section className="hero">
                <h1 className="hero-title">BROKEN ALLIANCE</h1>
                <p className="hero-tagline">Five factions. One fractured galaxy. No mercy.</p>
            </section>

            <div className="faction-strip">
                <img src="/images/icons/UDF.svg" />
                <img src="/images/icons/Sakupen.svg" />
                <img src="/images/icons/The Storm.svg" />
                <img src="/images/icons/TheBog.svg" />
                <img src="/images/icons/Trogs.svg" />
            </div>

            <section className="home-blurb">
                <p>
                    Command massive armies across a fractured galaxy. Master economy,
                    tech, and tactics as humans, cyborgs, placeholder, or cosmic horrors
                    collide over alien ruins and resource-rich worlds.
                </p>
            </section>

            <section className="home-actions">
                <button onClick={() => navigate('/Leader')}>Meet the Leaders</button>
                <button onClick={() => navigate('/unitsAndBuilding')}>The Units</button>
            </section>

        </div>
    );
}