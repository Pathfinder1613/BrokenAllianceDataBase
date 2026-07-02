import { useState, useEffect } from 'react';
import '../Styles/AIO.css';
import SorterBar from '../components/SorterBar';

import FACTIONS from '../data/Factions.json'
import LEADERS from '../data/Leaders.json'
import UNITS from '../data/Units.json'

const FACTION_ORDER = ["udf", "sakupen", "the_storm", "the_trogs"];
const empty_row_item = (<div className="aio-row-item"></div>);

class TagFilter {
    constructor(state) {
        this.tags = state[0];
        this.setter = state[1];
    }

    toggleTag(tag) {
        const index = this.tags.indexOf(tag)
        const copied_tags = this.tags.slice()
        let new_state = false;

        if (index === -1) {
            new_state = true;
            copied_tags.push(tag)
        }
        else {
            copied_tags.splice(index, 1)
        }

        this.setter(copied_tags)

        return new_state
    }

    hasTag(tag) {
        return this.tags.includes(tag)
    }
}

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
                                <span className="aio-unit-tier">T{unit.tier}</span>
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


function UnitFilter(unit, filters) {
    const tierAllowed =
        filters.tier.hasTag(unit.tier);

    const tagAllowed =
        unit.tag?.some(tag => filters.tag.hasTag(tag.toLowerCase()));

    return tierAllowed && tagAllowed;
}

function ToggleUnit(unitId) {
    setSelectedUnits(current => {
        if (current.includes(unitId)) {
            return current.filter(id => id !== unitId);
        }

        return [...current, unitId];
    });
}


export default function AllInOne() {
    const filters = {
        tier: new TagFilter(useState([1, 2, 3, 4, 5])),
        tag: new TagFilter(useState(["base", "land", "infantry", "air", "naval"])),
    }
    const [selectedUnits, setSelectedUnits] = useState([]);

    return (
        <>
            <SorterBar filters={filters} selectedUnits={selectedUnits} />
            {document.documentElement.style.setProperty("--total_columns", FACTION_ORDER.length)}
            {document.documentElement.style.setProperty("--visible_columns", 4)}
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

                {[1, 2, 3, 4, 5].map(tier =>
                    filters.tier.hasTag(tier) && (
                        <div key={tier} className="aio-row-container">
                            {CreateUnitRows(unit => UnitFilter(unit, filters))}
                        </div>
                    )
                )}


            </div>
        </>
    )
}