import { useParams, useNavigate } from 'react-router-dom';

import '../Styles/LeaderFullpage.css';
import LEADERS from '../data/Leaders.json';
import LEADERSPOWERS from '../data/LeaderPowers.json';


export default function LeaderPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const leader = LEADERS[id];

    if (!leader) {
        return <h1>Leader Not Found</h1>;
    }

    return (
        <div className="left-section">
            <div className="detail-leader-portrait-containers">
                <div className="the_go_back">
                    <button onClick={() => navigate(-1)}>
                        Go Back
                    </button>
                </div>

                <img
                    className="detail-leader-portrait"
                    src={`/images/portraits/${id}.png`}
                    alt={leader.name}
                    onError={({ currentTarget }) => {
                        currentTarget.onerror = null;
                        currentTarget.src =
                            '/images/portraits/Placeholder.png';
                    }}
                />
            </div>

            <div className="right-section">
                <div className="detail-leader-header-containers">
                    <h1 className="leader-full-name">
                        {leader.name}
                    </h1>

                    <p className="leader-full-tagline">
                        {leader.tagline}
                    </p>
                </div>

                <div className="detail-leader-lore-containers">
                    <p>{leader.lore}</p>
                    <hr />
                </div>

                <div className="detail-leaderpower-containers">
                    <h1>Leader powers</h1>
                    <ul>
                        {(leader.leader_power ?? []).map((powerId) => {
                            const power = LEADERSPOWERS[powerId];
                            return (
                                <li key={powerId}>
                                    <span className="leaderpower-name">
                                        {power ? power.name : powerId}
                                    </span>
                                    {power?.description && (
                                        <p className="leaderpower-description">
                                            cooldown:{power.cooldown} description:{power.description} 
                                        </p>
                                    )}
                                </li>
                            );
                        })}

                    </ul>
                </div>
            </div>
        </div>
    );
}