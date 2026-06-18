import '../Styles/AIO.css'

import FACTIONS from '../data/Factions.json'
import LEADERS from '../data/Leaders.json'
import UNITS from '../data/Units.json'

const FACTION_ORDER = ["udf", "sakupen", "the_storm", "the_trogs"];
const empty_row_item = (<div className="aio-row-item"></div>);

function CreateLeaderRows() {
    const content = [];

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
                    if (!leader_id) return empty_row_item;

                    const leader = LEADERS[leader_id];

                    if (!leader) return empty_row_item;

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

function CreateUnitRows(filter) {
    const content = [];

    const unit_lists = {};
    Object.keys(FACTIONS).forEach((faction_id) => unit_lists[faction_id] = []);

    UNITS.units.forEach((unit) => {
        const list = unit_lists[unit.faction];
        
        if (list && filter(unit)) list.push(unit);
    })

    let maximum_unit_count = 0;
    FACTION_ORDER.forEach((faction_id) => {
        const unit_list_length = unit_lists[faction_id].length;
        if (unit_list_length > maximum_unit_count) maximum_unit_count = unit_list_length;
    })

    for (let i = 0; i < maximum_unit_count; i++) {
        content.push(
            <div className="aio-row">
                {FACTION_ORDER.map((faction_id) => {
                    const faction = FACTIONS[faction_id];
                    const unit = unit_lists[faction_id][i];

                    if (!unit) return <div key={faction_id} className="aio-row-item" />;

                    return (
                        <div key={faction_id} className="aio-row-item aio-selectable">
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

function CreateSortBar() {
    return (<aside>
        <header>
            <span title="0 selected">0</span>
            <a href="" title="clear selection">x</a>
            <a href="#/" title="compare">compare</a>
        </header>

        <form>
            <input
                id="filter"
                type="text"
                placeholder="filter"
                autofocus
            />
        </form>

        <p>
            <button type="button">UDF</button>
            <button type="button">Sakupen</button>
            <button type="button">The Storm</button>
            <button type="button">The Trogs</button>
        </p>

        <p>
            <button type="button">Base</button>
            <button type="button">Land</button>
            <button type="button">Air</button>
            <button type="button">Naval</button>
        </p>

        <p>
            <button type="button">T1</button>
            <button type="button">T2</button>
            <button type="button">T3</button>
            <button type="button">T4</button>
        </p>

        <p>
            <button type="button" title="view units by kind">By Kind</button>
            <button type="button" title="view units by class">By Class</button>
        </p>
    </aside>)
}

export default function AllInOne() {
    return (
        <>
            {CreateSortBar()}
            {document.documentElement.style.setProperty("--total_columns", FACTION_ORDER.length)}
            {document.documentElement.style.setProperty("--visible_columns", 3)}
            <div className="aio-main">
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
                    {CreateUnitRows((unit) => unit.tier === 1)}
                </div>
                <div className="aio-row-container">
                    {CreateUnitRows((unit) => unit.tier === 2)}
                </div>
                <div className="aio-row-container">
                    {CreateUnitRows((unit) => unit.tier === 3)}
                </div>
                <div className="aio-row-container">
                    {CreateUnitRows((unit) => unit.tier === 4)}
                </div>

            </div>
        </>
    )
}