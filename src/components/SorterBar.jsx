import { useNavigate } from 'react-router-dom';
import '../Styles/SorterBar.css';

export default function SorterBar({ filters, selectedUnits }) {
    const navigate = useNavigate();

    return (
        <aside>
            <header>
                <span title={`${selectedUnits.length} selected`}>{selectedUnits.length}</span>
                <button
                    onClick={() => setSelectedUnits([])}
                    title="clear selection"
                >
                    x
                </button>
                <button
                    onClick={() => navigate("/compare", { state: { units: selectedUnits } })}
                    title="compare"
                >
                    compare
                </button>
            </header>

            <form>
                <input
                    id="filter"
                    type="text"
                    placeholder="filter"
                    autoFocus
                />
            </form>

            <p>
                <button type="button">UDF</button>
                <button type="button">Sakupen</button>
                <button type="button">The Storm</button>
                <button type="button">The Trogs</button>
            </p>

            <p>
                <button className='aio-toggle-active' type="button" onClick={({ currentTarget: e }) => { e.className = `${filters.tag.toggleTag("base") ? 'aio-toggle-active' : ''}` }}>Base</button>
                <button className='aio-toggle-active' type="button" onClick={({ currentTarget: e }) => { e.className = `${filters.tag.toggleTag("land") ? 'aio-toggle-active' : ''}` }}>Land</button>
                <button className='aio-toggle-active' type='button' onClick={({ currentTarget: e }) => { e.className = `${filters.tag.toggleTag("infantry") ? 'aio-toggle-active' : ''}` }}>infantry</button>
                <button className='aio-toggle-active' type="button" onClick={({ currentTarget: e }) => { e.className = `${filters.tag.toggleTag("air") ? 'aio-toggle-active' : ''}` }}>Air</button>
                <button className='aio-toggle-active' type="button" onClick={({ currentTarget: e }) => { e.className = `${filters.tag.toggleTag("naval") ? 'aio-toggle-active' : ''}` }}>Naval</button>
            </p>

            <p>
                <button className='aio-toggle-active' type="button" onClick={({ currentTarget: e }) => { e.className = `${filters.tier.toggleTag(1) ? 'aio-toggle-active' : ''}` }}>T1</button>
                <button className='aio-toggle-active' type="button" onClick={({ currentTarget: e }) => { e.className = `${filters.tier.toggleTag(2) ? 'aio-toggle-active' : ''}` }}>T2</button>
                <button className='aio-toggle-active' type="button" onClick={({ currentTarget: e }) => { e.className = `${filters.tier.toggleTag(3) ? 'aio-toggle-active' : ''}` }}>T3</button>
                <button className='aio-toggle-active' type="button" onClick={({ currentTarget: e }) => { e.className = `${filters.tier.toggleTag(4) ? 'aio-toggle-active' : ''}` }}>T4</button>
                <button className='aio-toggle-active' type="button" onClick={({ currentTarget: e }) => { e.className = `${filters.tier.toggleTag(5) ? 'aio-toggle-active' : ''}` }}>Hero</button>
            </p>

            <p>
                <button type="button" title="view units by kind">By Kind</button>
                <button type="button" title="view units by class">By Class</button>
            </p>
        </aside>
    );
}
