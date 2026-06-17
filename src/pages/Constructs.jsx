import UnitAndBuldingButton from '../components/unitAndBuilding.jsx';

// css
import '../Styles/ConstructsPage.css';

import FACTIONS from '../services/Factions.json';
import UNITS from '../services/NewTestData/Units.json';
import BUILDING from '../services/NewTestData/Building.json';

export default function ConstructsPage() {
    return (
        <div className='constructs-page'>
            <div className='Header-faction'>
                {Object.keys(FACTIONS).map((faction) => (
                    <div className='Faction-column' key={faction}>
                        <img
                            className='img-faction'
                            src={`/images/icons/${faction}.svg`}
                            alt={faction}
                        />

                        <h1
                            className='Faction-title'
                            style={{ color: FACTIONS[faction].color }}
                        >
                            {faction}
                            <hr></hr>
                        </h1>


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