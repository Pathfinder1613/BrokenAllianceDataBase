import { useLocation } from "react-router-dom";
import UNITS from "../data/Units.json";

export default function Compare() {
    const { state } = useLocation();

    const units = UNITS.units.filter(
        u => state.units.includes(u.id)
    );

    return (
        <div className="compare-page">
            {units.map(unit => (
                <div key={unit.id}>
                    <h2>{unit.title}</h2>
                    <p>Faction: {unit.faction}</p>
                    <p>Tier: {unit.tier}</p>
                    <p>HP: {unit.stats.hp}</p>
                    <p>Mass: {unit.stats.mass}</p>
                    <p>Build Time: {unit.stats.buildTimeSeconds}</p>
                </div>
            ))}
        </div>
    );
}