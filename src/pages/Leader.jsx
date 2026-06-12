import { useState } from 'react'
import LeaderData from '../services/Leaders.json'

// css
import '../Styles/LeaderPage.css';


// imgs
import UDFICON from '../assets/UDFPlacholdericon.svg';
import SakupenICON from '../assets/SakupenPlaceHolder.svg';
import StormICON from '../assets/StromPlaceHolder.svg';
import BogIcon from '../assets/TheBogPlaceHolder.svg';
import TrogsIcon from '../assets/TheRoglerIcon.svg'


const FACTIONS = [
    {
        name: "UDF",
        icon: UDFICON,
    },
    {
        name: "Sakupen",
        icon: SakupenICON,
    },
    {
        name: "The Storm",
        icon: StormICON,
    },
    {
        name: "placeholder",
        icon: BogIcon,
    },
    {
        name: "Trogs",
        icon: TrogsIcon
    }
]

export default function LeaderPage() {
    const [leaders] = useState(LeaderData.Leader)

    return (
        <>
            {FACTIONS.map((faction) => (
                <div key={faction}>
                    <h1>{faction.name}</h1>
                    <div>
                        <img src={faction.icon} />
                        {leaders
                            .filter((leader) => leader.faction === faction.name)
                            .map((leader) => (
                                <li key={leader.id}>
                                    <h2>★ {leader.name}</h2>
                                    <p>{leader.leaderType} | {leader.treeType}</p>
                                    <p>{leader.subHeader}</p>
                                </li>
                            ))}
                    </div>
                </div>
            ))}







        </>
    )

}