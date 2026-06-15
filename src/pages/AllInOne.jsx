import '../Styles/AIO.css'

import LEADERS from '../services/Leaders.json'

const FACTIONS = [
    {
        id: "udf",
        name: "UDF",
        color: "#3535c0",
    },
    {
        id: "sakupen",
        name: "Sakupen",
        color: "#661414",
    },
    {
        id: "the_storm",
        name: "The Storm",
        color: "#531d8a",
    },
    {
        id: "the_trogs",
        name: "Trogs",
        color: "#3ca03c"
    },
]

export default function AllInOne() {
    return (
        <div className="aio-main">
            {FACTIONS.map((faction) => (
                <div key={faction.id} className="aio-faction-container">
                    <div style={{ backgroundColor: faction.color }} className="aio-faction-header">
                        <span className="aio-faction-name">{faction.name}</span>
                        <div style={{ maskImage: `url(/images/icons/${faction.name}.svg)` }} className="aio-faction-mini-icon" />
                    </div>
                    {LEADERS.filter((leader) => leader.faction === faction.name).map((leader) =>
                    (<div className="aio-leader-panel">
                        <div className="aio-leader-name">{leader.name}</div>
                        <div className="aio-leader-type">{leader.leader_type}</div>
                        <div className="aio-leader-quote">"{leader.quote}"</div>
                    </div>))}
                </div>
            ))}
        </div>
    )
}