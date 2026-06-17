import UnitAndBuldingButton from '../components/unitAndBuilding.jsx'

// css
import '../Styles/ConstructsPage.css';

import FACTIONS from '../services/Factions.json';
import UNITS from '../services/NewTestData/Units.json'

export default function ConstructsPage() {
    return (
        <>
            <div className='containers'>
                <div className='Header-faction'>
                    {Object.keys(FACTIONS).map((faction) => (
                        <div key={faction}>
                            <img className='img-faction' src={`/images/icons/${faction}.svg`} />
                            <h1 style={{ color: FACTIONS[faction].color }}>
                                {faction}
                            </h1>

                            {UNITS.units.filter((units) => units.faction === faction).map((units) => (
                                <div className='Units-containers' key={units.name}>
                                    <UnitAndBuldingButton
                                        accentColor={FACTIONS[faction].color}
                                        name={units.name}
                                        tier={units.tier}
                                        type={units.type}
                                        onClick={() => console.log(units)}
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>





        </>
    )
}