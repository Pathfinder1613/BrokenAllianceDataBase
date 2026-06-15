import UnitAndBuldingButton from '../components/unitAndBuilding.jsx'

// css
import '../Styles/ConstructsPage.css';

import FACTIONS from '../services/Factions.json';

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
                        

                        <div className='Units-containers'>
                            <UnitAndBuldingButton onClick={() => console.log(FACTIONS)} />


                                
                        </div>
                    </div>
                ))}
            </div>
            </div>
            




        </>
    )
}