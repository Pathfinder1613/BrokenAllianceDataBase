import UnitAndBuldingButton from '../components/unitAndBuilding.jsx';

// css
import '../Styles/ConstructsPage.css';

import img from '../../public/images/unitsPortraits/lol oll.png'

import FACTIONS from '../data/Factions.json';
import UNITS from '../data/Units.json';
import BUILDING from '../data/Building.json';

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

                            <h1 className='Faction-title' style={{ color: faction.color }}>
                                {faction.name}
                                <hr></hr>
                            </h1>

                            <div className='Units-containers'>
                                {UNITS.units
                                    .filter((unit) => unit.faction === faction_id)
                                    .map((unit) => (
                                        <UnitAndBuldingButton
                                            key={unit.title}
                                            accentColor={faction.color}
                                            name={unit.title}
                                            tier={unit.tier}
                                            type={unit.type}
                                            onClick={() => console.log(unit)}
                                        />
                                    ))}

                                {BUILDING.Building
                                    .filter((building) => building.faction === faction_id)
                                    .map((building) => (
                                        <UnitAndBuldingButton
                                            key={building.name}
                                            accentColor={faction.color}
                                            name={building.name}
                                            tier={building.tier}
                                            type={building.type}
                                            portrait={img}
                                            onClick={() => console.log(building)}
                                        />
                                    ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
