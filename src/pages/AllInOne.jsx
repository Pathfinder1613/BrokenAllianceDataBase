import '../Styles/AIO.css'

import LEADERS from '../services/NewTestData/Leader.json'
import UNITS from '../services/Units.json'

// import FACTION from '../services/Factions.json' should we update that json?
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
                        <div style={{ maskImage: `url(/images/icons/${faction.id}.svg)` }} className="aio-faction-mini-icon" />
                    </div>
                    {LEADERS.Leader.filter((leader) => leader.faction.toLowerCase() === faction.id).map((leader) =>
                    (<div key={leader.id} className="aio-leader-panel">
                        <div className="aio-leader-name">{leader.name}</div>
                        <div className="aio-leader-type">{leader.title}</div>
                        <div className="aio-leader-quote">"{leader.tagline}"</div>
                    </div>))}
                    {UNITS.filter((unit) => unit.faction === faction.id).map((unit) => (
                        <div key={unit.id} className="aio-unit-panel">
                            <span>T{unit.tier}</span>
                            <span> {unit.type}</span>
                            <span className="aio-unit-name"> {unit.name ? `"${unit.name}"` : ""}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}