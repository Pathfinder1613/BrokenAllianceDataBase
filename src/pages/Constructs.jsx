import UnitAndBuldingButton from '../components/unitAndBuilding.jsx';

// css
import '../Styles/ConstructsPage.css';

import FACTIONS from '../data/Factions.json';
import UNITS from '../data/Units.json';
import FACTIONS from '../services/Factions.json';
import UNITS from '../services/NewTestData/Units.json';
import BUILDING from '../services/NewTestData/Building.json';

export default function ConstructsPage() {
    return (
        <div className='constructs-page'>
            <div className='Header-faction'>
                {Object.keys(FACTIONS).map((faction_id) => {
                    const faction = FACTIONS[faction_id];

                    return (
                        <div className='Faction-column' key={faction_id}>
                            <img
                                className='img-faction'
                                src={`/images/icons/${faction_id}.svg`}
                            />

                            <h1
                                className='Faction-title'
                                style={{ color: faction.color }}
                            >
                                {faction.name}
                                <hr></hr>
                            </h1>

                        <h1
                            className='Faction-title'
                            style={{ color: FACTIONS[faction].color }}
                        >
                            {faction}
                            <hr></hr>
                        </h1>


                            <div className='Units-containers'>
                                {UNITS.units
                                    .filter((unit) => unit.faction === faction_id)
                                    .map((unit) => (
                                        <UnitAndBuldingButton
                                            key={unit.name}
                                            accentColor={faction.color}
                                            name={unit.name}
                                            tier={unit.tier}
                                            type={unit.type}
                                            onClick={() => console.log(unit)}
                                        />
                                    ))}
                            </div>
                        </div>
                    )
                })}
                        <div className='Units-containers'>
                            {UNITS.units
                                .filter((unit) => unit.faction === faction)
                                .map((unit) => (
                                    <UnitAndBuldingButton
                                        key={unit.name}
                                        accentColor={FACTIONS[faction].color}
                                        name={unit.name}
                                        tier={unit.tier}
                                        type={unit.type}
                                        onClick={() => console.log(unit)}
                                    />
                                ))}

                            {BUILDING.Building
                                .filter((Building) => Building.faction === faction)
                                .map((Building) => (
                                    <UnitAndBuldingButton
                                        key={Building.name}
                                        accentColor={FACTIONS[faction].color}
                                        name={Building.name}
                                        tier={Building.tier}
                                        type={Building.type}
                                        onClick={() => console.log(Building)}
                                    />
                                ))
                            }
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}