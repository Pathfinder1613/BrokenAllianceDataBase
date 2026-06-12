import LeaderData from '../services/Leaders.json'

import FACTIONS from '../services/Factions.json'

export default function LeaderItem(props) {
    const leaders = LeaderData.Leader


    // const faction = FACTIONS.find((f) => f.name === factionName);

    return (
        <>
            <div className='Leader-container'>
                {FACTIONS.map((faction) => (
                    <div key={faction.name} className={`Leader-section-${faction.name.replace(" ", "-")}`}>
                        <h1>{faction.name}</h1>
                        <div>
                            <img src={`../../images/${faction.name.replace(" ", "")}_Icon.svg`}/>
                            <ul>
                                {leaders
                                    .filter((leader) => leader.faction === faction.name)
                                    .map((leader) => (
                                        <li key={leader.id}>
                                            <h2>★ {leader.name}</h2>
                                            <p>{leader.leaderType} | {leader.treeType}</p>
                                            <p>{leader.subHeader}</p>
                                        </li>
                                    ))}

                            </ul>

                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}