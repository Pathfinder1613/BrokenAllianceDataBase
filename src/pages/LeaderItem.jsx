import LeaderData from '../services/Leaders.json'
import { useState } from 'react';

// imgs
import UDFICON from '../assets/UDFPlacholdericon.svg';
import SakupenICON from '../assets/SakupenPlaceHolder.svg';
import StormICON from '../assets/StromPlaceHolder.svg';
import BogIcon from '../assets/TheBogPlaceHolder.svg';
import TrogsIcon from '../assets/TheRoglerIcon.svg'


export default function LeaderItem({ factionName }) {
    const leaders = LeaderData.Leader


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
    return (
        <>
            <div className='Leader-container'>
                {FACTIONS.map((faction) => (
                    <div key={faction} className={`Leader-section-${faction.name.replace(" ", "-")}`}>
                        <h1>{faction.name}</h1>
                        <div>
                            <img src={faction.icon} />
                            {leaders
                                .filter((leader) => leader.faction === factionName)
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
            </div>
        </>
    )
}