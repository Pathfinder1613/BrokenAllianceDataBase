import UnitAndBuldingButton from '../components/unitAndBuilding.jsx'

// css
import '../Styles/ConstructsPage.css';

import FACTIONS from '../services/Factions.json';
import UNITS from '../services/Units.json'

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

                            {UNITS.filter((unit) => unit.faction === faction).map((unit) => (
                                <div className='Units-containers' key={unit.name}>
                                    <UnitAndBuldingButton
                                        accentColor={faction.color}
                                        name={unit.name}
                                        tier={unit.tier}
                                        type={unit.type}
                                        onClick={() => console.log(unit)}
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