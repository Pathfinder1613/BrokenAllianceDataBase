import '../Styles/unitAndBuilding.css';

// pan to to add Unit/id as and route import { NavLink } from "react-router-dom";

export default function UnitAndBuildingButton({ name, tier, accentColor, portrait, icon }) {
    return (
        <button className="unit-btn">
            <div className="unit-btn-frame" />

            <img
                className="unit-btn-portrait"
                src={portrait || '/images/portraits/Placeholder.png'}
                alt={name}
            />

            <img
                className="unit-btn-small-icon"
                src={icon || '/images/portraits/Placeholder.png'}
            />

            <div className="unit-btn-tier">{tier ?? 1}</div>

            <div className="unit-btn-bar" style={{ background: accentColor ?? '#4fa3ff' }} />

            <div className="unit-btn-tooltip">
                <span>{name ?? 'Unit Name'}</span>
                <span>Tier {tier ?? 1}</span>
                <span>Unit type</span>
            </div>
        </button>
    )
}