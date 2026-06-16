import '../Styles/AIO.css'

import LEADERS from '../services/Leaders.json'
import UNITS from '../services/Units.json'

// import FACTION from '../services/Factions.json' should we update that json?
const FACTIONS = [
    {
        id: "udf",
        name: "UDF",
        color: "#3535c0",
        leaders: [
            "president_enhet",
            "commander_hawk",
            "iq_iris_quantum",
        ]
    },
    {
        id: "sakupen",
        name: "Sakupen",
        color: "#661414",
        leaders: [
            "kizer",
            "e_11",
            "3c_commander_class_chassis",
        ],
    },
    {
        id: "the_storm",
        name: "The Storm",
        color: "#531d8a",
        leaders: [
            "amalgam",
            "phantoms"
        ]
    },
    {
        id: "the_trogs",
        name: "Trogs",
        color: "#3ca03c",
        leaders: [

        ]
    },
]

function CreateLeaderRows() {
    const content = [];
    const empty = (<div className="aio-row-item"></div>)

    // finding the faction with the most amount of leaders
    let max_leaders = 0;
    FACTIONS.forEach((element) => {
        max_leaders = Math.max(max_leaders, element.leaders.length)
    })
    
    for (let i = 0; i < max_leaders; i++) {
        content.push((
            <div className="aio-row">
                {FACTIONS.map((faction, ii) => {
                    const faction_id = faction.leaders[i];
                    if (!faction_id) return empty;

                    const leader = LEADERS[faction_id];
                    if (!leader) return empty;

                    return (
                        <div className="aio-row-item aio-selectable">
                            <span className="aio-leader-name">{leader.name}</span>
                            <span className="aio-leader-type">{leader.type}</span>
                            <span className="aio-leader-quote">"{leader.quote}"</span>
                        </div>
                    )
                })}
            </div>
        ))
    }

    return content;
}

export default function AllInOne() {
    return (
        <div className="aio-main">
            <>
                <div className="aio-faction-header-container">
                    {FACTIONS.map((faction) => (
                        <div style={{ background: faction.color }} className="aio-faction-header">
                            <span>{faction.name}</span>
                            <div style={{ maskImage: `url(/images/icons/${faction.id}.svg)`}} className="aio-faction-icon"></div>
                        </div>
                    ))}
                </div>
                <div className="aio-row-container">
                    {CreateLeaderRows()}
                </div>
            </>
        </div>
    )
}