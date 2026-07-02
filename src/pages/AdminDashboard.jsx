import { useState, useEffect, useRef } from 'react';
import '../Styles/AdminDashboard.css';
import UnitForm from '../components/unitsFrom';

const API = import.meta.env.VITE_API_URL;

export default function AdminDashboard() {
    const [allUnits, setAllUnits] = useState([]);
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [isNew, setIsNew] = useState(false);
    const comboRef = useRef(null);
    const [loadError, setLoadError] = useState(null);


    useEffect(() => {
        fetch(`${API}units`, { credentials: 'include' })
            .then(r => r.ok ? r.json() : [])
            .then(setAllUnits)
            .catch(() => {
                setLoadError('Could not load units. Check your connection.');
            });
    }, []);

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
            u.id.toLowerCase().includes(query.toLowerCase()) ||
            (u.title ?? '').toLowerCase().includes(query.toLowerCase())
        )
        : allUnits;

    function selectUnit(unit) {
        setSelectedUnit(unit);
        setIsNew(false);
        setQuery(unit.title ?? unit.id);
        setOpen(false);
    }

    function startNewUnit() {
        setSelectedUnit(null);
        setIsNew(true);
        setQuery('');
        setOpen(false);
    }

    function handleSaved(saved) {
        setAllUnits(prev => {
            const exists = prev.some(u => u.id === saved.id);
            return exists ? prev.map(u => u.id === saved.id ? saved : u) : [...prev, saved];
        });
        setSelectedUnit(saved);
        setIsNew(false);
        setQuery(saved.title ?? saved.id);
    }

    function handleDeleted(id) {
        setAllUnits(prev => prev.filter(u => u.id !== id));
        setSelectedUnit(null);
        setIsNew(false);
        setQuery('');
    }

    function handleClear() {
        setSelectedUnit(null);
        setIsNew(false);
        setQuery('');
    }

    const showForm = isNew || selectedUnit !== null;

    return (
        <div className="dash">
            <h1 className="dash-title">Admin Dashboard</h1>

            <div className="dash-toolbar">
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
                                    {loadError && <p className="dash-error">{loadError}</p>}
                                    <span className="dash-dropdown-title">{unit.title ?? unit.id}</span>
                                    <span className="dash-dropdown-meta">{unit.faction} · T{unit.tier}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <button className="dash-btn dash-btn--new" type="button" onClick={startNewUnit}>
                    + New Unit
                </button>
            </div>

            {showForm && (
                <UnitForm
                    unit={isNew ? null : selectedUnit}
                    api={API}
                    onSaved={handleSaved}
                    onDeleted={handleDeleted}
                    onClear={handleClear}
                />
            )}
        </div>
    );
}
