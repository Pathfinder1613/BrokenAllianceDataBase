import '../Styles/AIO.css'

import FACTIONS from '../data/Factions.json'
import LEADERS from '../data/Leaders.json'
import UNITS from '../data/Units.json'

function CreateLeaderRows() {
    const content = [];
    const empty = (<div className="aio-row-item"></div>)

    // finding the faction with the most amount of leaders
    let max_leaders = 0;
    Object.values(FACTIONS).forEach((element) => {
        max_leaders = Math.max(max_leaders, element.leaders.length)
    })

    for (let i = 0; i < max_leaders; i++) {
        content.push((
            <div className="aio-row">
                {Object.values(FACTIONS).map((faction, ii) => {
                    const leader_id = faction.leaders[i];
                    if (!leader_id) return empty;

                    const leader = LEADERS[leader_id];

                    if (!leader) return empty;

                    return (
                        <div className="aio-row-item aio-selectable">
                            <span className="aio-leader-name">{leader.name}</span>
                            <span className="aio-leader-type">{leader.title}</span>
                            <span className="aio-leader-quote">"{leader.tagline}"</span>
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
                    {Object.keys(FACTIONS).map((faction_id) => {
                        const faction = FACTIONS[faction_id];

                        return (
                            <div style={{ background: faction.color }} className="aio-faction-header">
                                <span>{faction.name}</span>
                                <div style={{ maskImage: `url(/images/icons/${faction_id}.svg)` }} className="aio-faction-icon"></div>
                            </div>
                        )
                    })}
                </div>
                <div className="aio-row-container">
                    {CreateLeaderRows()}
                </div>
            </>
        </div>
    )
}