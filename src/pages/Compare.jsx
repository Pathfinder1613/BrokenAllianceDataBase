import { useParams, useNavigate } from 'react-router-dom';

import WEAPONS from '../data/Weapons.json'
import ABILITIES from '../data/Abilities.json'
import FACTIONS from '../data/Factions.json'
import UNITS from '../data/Units.json'


export default function ComparePage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const unit = unit[id];

    if (!unit) {
        return <h1>Leader Not Found</h1>;
    }

    return (
        <>
            <div className="the_go_back">
                <button onClick={() => navigate(-1)}>
                    Go Back
                </button>
            </div>

        </>
    )
}