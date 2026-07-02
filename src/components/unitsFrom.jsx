import { useState, useEffect } from 'react';
import Modal from './modal';
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
    const numOrNull = (v) => (v === '' ? null : Number(v));

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

/**
 * Props:
 *   unit      — existing unit object (edit mode) or null/undefined (create mode)
 *   api       — VITE_API_URL string, e.g. "http://localhost:8000/"
 *   onSaved   — called with the saved unit object after a successful POST or PUT
 *   onDeleted — called with the deleted unit id after a successful DELETE
 *   onClear   — called when the Clear button is clicked
 */
export default function UnitForm({ unit, api, onSaved, onDeleted, onClear }) {
    const isNew = !unit;
    const [form, setForm] = useState(() => unit ? unitToForm(unit) : { ...EMPTY_FORM });
    const [saveStatus, setSaveStatus] = useState(null);
    const [deleteStatus, setDeleteStatus] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Re-initialise the form whenever the unit prop changes
    useEffect(() => {
        setForm(unit ? unitToForm(unit) : { ...EMPTY_FORM });
        setSaveStatus(null);
        setDeleteStatus(null);
        setConfirmDelete(false);
    }, [unit?.id ?? null]);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setSaveStatus(null);
    }

    function handleClear() {
        setForm({ ...EMPTY_FORM });
        setSaveStatus(null);
        setDeleteStatus(null);
        setConfirmDelete(false);
        onClear?.();
    }

    async function handleSave(e) {
        e.preventDefault();
        setSaveStatus('saving');
        try {
            const payload = formToPayload(form);
            const url = isNew ? `${api}units` : `${api}units/${form.id}`;
            const res = await fetch(url, {
                method: isNew ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                const saved = await res.json();
                setSaveStatus('ok');
                onSaved?.(saved);
            } else {
                setSaveStatus('error');
            }
        } catch {
            setSaveStatus('error');
        }
    }

    async function handleDelete() {
        setDeleteStatus('deleting');

        try {
            const res = await fetch(`${api}units/${form.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (res.ok) {
                setDeleteStatus('ok');
                onDeleted?.(form.id);
            } else {
                setDeleteStatus('error');
                setConfirmDelete(false);
            }
        } catch {
            setDeleteStatus('error');
            setConfirmDelete(false);
        }
    }

    return (
        <form className="dash-form" onSubmit={handleSave}>
            {/* {isNew && <p className="dash-new-banner">New unit — fill in all fields and save.</p>} */}

            <section className="dash-section">
                <h2>Identity</h2>
                <div className="dash-grid">
                    <Field label="ID"
                        name="id"
                        value={form.id}
                        onChange={handleChange}
                        disabled={!isNew} />
                    <Field label="Title"
                        name="title"
                        value={form.title}
                        onChange={handleChange} />
                    <Field label="Type"
                        name="type"
                        value={form.type}
                        onChange={handleChange} />
                    <Field label="Faction"
                        name="faction"
                        value={form.faction}
                        onChange={handleChange} />
                    <Field label="Tier"
                        name="tier"
                        value={form.tier}
                        onChange={handleChange} />
                    <Field label="Tags (comma-separated)"
                        name="tag"
                        value={form.tag}
                        onChange={handleChange} />
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
                <h2>Abilities &amp; Weapons</h2>
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
                <button className="dash-btn dash-btn--save" type="submit" disabled={saveStatus === 'saving'}>
                    {saveStatus === 'saving' ? 'Saving…' : isNew ? 'Create Unit' : 'Save Changes'}
                </button>

                <button className="dash-btn dash-btn--clear" type="button" onClick={handleClear}>
                    Clear
                </button>

                {!isNew && (
                    <button
                        className="dash-btn dash-btn--delete"
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        disabled={deleteStatus === 'deleting'}
                    >
                        {deleteStatus === 'deleting' ? 'Deleting…' : 'Delete Unit'}
                    </button>
                )}

                {isNew && (
                    <span className="dash-status">
                        {saveStatus === 'ok' && <span className="dash-ok">Unit created.</span>}
                        {saveStatus === 'error' && <span className="dash-error">Create failed.</span>}
                    </span>
                )}
            </div>

            <div className="dash-footer">
                {isNew ? (
                    <span className="dash-status">
                        {saveStatus === 'ok' && <span className="dash-ok">Unit created.</span>}
                        {saveStatus === 'error' && <span className="dash-error">Create failed.</span>}
                    </span>
                ) : (
                    <span className="dash-status">
                        {saveStatus === 'ok' && <span className="dash-ok">Saved successfully.</span>}
                        {saveStatus === 'error' && <span className="dash-error">Save failed.</span>}
                        {deleteStatus === 'error' && <span className="dash-error">Delete failed.</span>}
                    </span>
                )}
            </div>

            {!isNew && (
                <Modal
                    isOpen={confirmDelete}
                    onClose={() => setConfirmDelete(false)}
                    title="Confirm Delete"
                >
                    <p>Are you sure you want to delete this unit? This action cannot be undone.</p>
                    <div className="dash-modal-buttons">
                        <button
                            className="dash-btn dash-btn--delete"
                            type="button"
                            onClick={handleDelete}
                            disabled={deleteStatus === 'deleting'}
                        >
                            {deleteStatus === 'deleting' ? 'Deleting…' : 'Confirm Delete'}
                        </button>
                        <button
                            className="dash-btn"
                            type="button"
                            onClick={() => setConfirmDelete(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </Modal>
            )}
        </form>
    );
}



function Field({ label, name, value, onChange, disabled, textarea }) {
    return (
        <label className="dash-field">
            <span>{label}</span>
            {textarea ? (
                <textarea name={name} value={value} onChange={onChange} disabled={disabled} rows={3} />
            ) : (
                <input name={name} value={value} onChange={onChange} disabled={disabled} />
            )}
        </label>
    );
}
