import { useState, useEffect, useRef } from 'react';
import '../Styles/AdminDashboard.css';

const EMPTY_FORM = {
    id: '',
    title: '',
    type: '',
    tag: '',
    tier: '',
    faction: '',
    lore: '',
    stats_mass: '',
    stats_power: '',
    stats_buildTimeSeconds: '',
    stats_pop: '',
    stats_hp: '',
    stats_vision: '',
    abilities: '',
    weapons: '',
    wreckage_mass: '',
    wreckage_power: '',
    wreckage_health: '',
};

function unitToForm(unit) {
    return {
        id: unit.id ?? '',
        title: unit.title ?? '',
        type: unit.type ?? '',
        tag: (unit.tag ?? []).join(', '),
        tier: unit.tier ?? '',
        faction: unit.faction ?? '',
        lore: unit.lore ?? '',
        stats_mass: unit.stats?.mass ?? '',
        stats_power: unit.stats?.power ?? '',
        stats_buildTimeSeconds: unit.stats?.buildTimeSeconds ?? '',
        stats_pop: unit.stats?.pop ?? '',
        stats_hp: unit.stats?.hp ?? '',
        stats_vision: unit.stats?.vision ?? '',
        abilities: (unit.abilities ?? []).join(', '),
        weapons: (unit.weapons ?? []).join(', '),
        wreckage_mass: unit.wreckage?.mass ?? '',
        wreckage_power: unit.wreckage?.power ?? '',
        wreckage_health: unit.wreckage?.health ?? '',
    };
}

function formToPayload(form) {
    const splitTrim = (s) => s.split(',').map(x => x.trim()).filter(Boolean);
    const numOrNull = (v) => v === '' ? null : Number(v);

    return {
        id: form.id,
        title: form.title || null,
        type: form.type,
        tag: splitTrim(form.tag),
        tier: isNaN(Number(form.tier)) ? form.tier : Number(form.tier),
        faction: form.faction,
        lore: form.lore || null,
        stats: {
            mass: numOrNull(form.stats_mass),
            power: numOrNull(form.stats_power),
            buildTimeSeconds: numOrNull(form.stats_buildTimeSeconds),
            pop: numOrNull(form.stats_pop),
            hp: numOrNull(form.stats_hp),
            vision: form.stats_vision || null,
        },
        abilities: splitTrim(form.abilities),
        weapons: splitTrim(form.weapons),
        wreckage: {
            mass: numOrNull(form.wreckage_mass),
            power: numOrNull(form.wreckage_power),
            health: numOrNull(form.wreckage_health),
        },
    };
}

export default function AdminDashboard() {
    const [allUnits, setAllUnits] = useState([]);
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(null);
    const [fetchError, setFetchError] = useState(null);
    const [saveStatus, setSaveStatus] = useState(null);
    const comboRef = useRef(null);

    const API = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetch(`${API}units`, { credentials: 'include' })
            .then(r => r.ok ? r.json() : [])
            .then(setAllUnits)
            .catch(() => {});
    }, [API]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (comboRef.current && !comboRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filtered = query.trim()
        ? allUnits.filter(u =>
            u.id.includes(query.toLowerCase()) ||
            (u.title ?? '').toLowerCase().includes(query.toLowerCase())
          )
        : allUnits;

    function selectUnit(unit) {
        setQuery(unit.title ?? unit.id);
        setOpen(false);
        setFetchError(null);
        setSaveStatus(null);
        setForm(unitToForm(unit));
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setSaveStatus(null);
    }

    async function handleSave(e) {
        e.preventDefault();
        setSaveStatus(null);
        try {
            const payload = formToPayload(form);
            const res = await fetch(`${API}units/${form.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            });
            setSaveStatus(res.ok ? 'ok' : 'error');
        } catch {
            setSaveStatus('error');
        }
    }

    return (
        <>
        
        <div className="dash">
            <h1 className="dash-title">Admin Dashboard</h1>

            <div className="dash-combo" ref={comboRef}>
                <input
                    className="dash-search-input"
                    placeholder="Search units…"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                />
                {open && filtered.length > 0 && (
                    <ul className="dash-dropdown">
                        {filtered.map(unit => (
                            <li
                                key={unit.id}
                                className="dash-dropdown-item"
                                onMouseDown={() => selectUnit(unit)}
                            >
                                <span className="dash-dropdown-title">{unit.title ?? unit.id}</span>
                                <span className="dash-dropdown-meta">{unit.faction} · T{unit.tier}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {fetchError && <p className="dash-error">{fetchError}</p>}

            {form && (
                <form className="dash-form" onSubmit={handleSave}>
                    <section className="dash-section">
                        <h2>Identity</h2>
                        <div className="dash-grid">
                            <Field label="ID" name="id" value={form.id} onChange={handleChange} disabled />
                            <Field label="Title" name="title" value={form.title} onChange={handleChange} />
                            <Field label="Type" name="type" value={form.type} onChange={handleChange} />
                            <Field label="Faction" name="faction" value={form.faction} onChange={handleChange} />
                            <Field label="Tier" name="tier" value={form.tier} onChange={handleChange} />
                            <Field label="Tags (comma-separated)" name="tag" value={form.tag} onChange={handleChange} />
                        </div>
                        <Field label="Lore" name="lore" value={form.lore} onChange={handleChange} textarea />
                    </section>

                    <section className="dash-section">
                        <h2>Stats</h2>
                        <div className="dash-grid">
                            <Field label="Mass" name="stats_mass" value={form.stats_mass} onChange={handleChange} />
                            <Field label="Power" name="stats_power" value={form.stats_power} onChange={handleChange} />
                            <Field label="Build Time (s)" name="stats_buildTimeSeconds" value={form.stats_buildTimeSeconds} onChange={handleChange} />
                            <Field label="Pop" name="stats_pop" value={form.stats_pop} onChange={handleChange} />
                            <Field label="HP" name="stats_hp" value={form.stats_hp} onChange={handleChange} />
                            <Field label="Vision" name="stats_vision" value={form.stats_vision} onChange={handleChange} />
                        </div>
                    </section>

                    <section className="dash-section">
                        <h2>Abilities & Weapons</h2>
                        <div className="dash-grid">
                            <Field label="Abilities (comma-separated)" name="abilities" value={form.abilities} onChange={handleChange} />
                            <Field label="Weapons (comma-separated)" name="weapons" value={form.weapons} onChange={handleChange} />
                        </div>
                    </section>

                    <section className="dash-section">
                        <h2>Wreckage</h2>
                        <div className="dash-grid">
                            <Field label="Mass" name="wreckage_mass" value={form.wreckage_mass} onChange={handleChange} />
                            <Field label="Power" name="wreckage_power" value={form.wreckage_power} onChange={handleChange} />
                            <Field label="Health" name="wreckage_health" value={form.wreckage_health} onChange={handleChange} />
                        </div>
                    </section>

                    <div className="dash-footer">
                        <button className="dash-btn dash-btn--save" type="submit">Save</button>
                        {saveStatus === 'ok' && <span className="dash-ok">Saved successfully.</span>}
                        {saveStatus === 'error' && <span className="dash-error">Save failed.</span>}
                    </div>
                </form>
            )}
        </div>

        </>
    );
}

function Field({ label, name, value, onChange, disabled, textarea }) {
    return (
        <label className="dash-field">
            <span>{label}</span>
            {textarea ? (
                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    rows={3}
                />
            ) : (
                <input
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                />
            )}
        </label>
    );
}
