import '../Styles/AIO.css'

import FACTIONS from '../data/Factions.json'
import LEADERS from '../data/Leaders.json'
import UNITS from '../data/Units.json'

const FACTION_ORDER = ["udf", "sakupen", "the_storm", "the_trogs"]

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

function CreateUnitRows(tier) {
    const content = [];
    const empty = (<div className="aio-row-item"></div>)

    const unit_lists = {};
    Object.keys(FACTIONS).forEach((faction_id) => unit_lists[faction_id] = []);

    UNITS.units.forEach((unit) => {
        const list = unit_lists[unit.faction];

        // doing this because I'm not sure how I want to display hero units.
        if (list && unit.tier !== "Hero" && unit.tier === tier) list.push(unit);
    })

    let maximum_unit_count = 0;
    FACTION_ORDER.forEach((faction_id) => {
        const unit_list_length = unit_lists[faction_id].length;
        if (unit_list_length > maximum_unit_count) maximum_unit_count = unit_list_length;
    })

    console.log(unit_lists);
    console.log(maximum_unit_count);

    for (let i = 0; i < maximum_unit_count; i++) {
        content.push(
            <div className="aio-row">
                {FACTION_ORDER.map((faction_id) => {
                    const faction = FACTIONS[faction_id];
                    const unit = unit_lists[faction_id][i];

                    if (!unit) return empty;

                    return (
                        <div className="aio-row-item aio-selectable">
                            <div>
                                <span>T{unit.tier}</span>
                                <span> {unit.type}</span>
                                {unit.title && <span className="aio-unit-name"> "{unit.title}"</span>}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
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
                <div className="aio-row-container">
                    {CreateUnitRows(1)}
                </div>
                <div className="aio-row-container">
                    {CreateUnitRows(2)}
                </div>
                <div className="aio-row-container">
                    {CreateUnitRows(3)}
                </div>
                <div className="aio-row-container">
                    {CreateUnitRows(4)}
                </div>
            </>
        </div>
    )
}