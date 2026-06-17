import { useParams } from 'react-router-dom';

import '../Styles/LeaderFullpage.css'

import LEADERS from '../data/Leaders.json'

export default function LeaderPage() {
    const { id } = useParams();
    // this doesn't actually do anything, I just wanted to rename the id variable from useParams()
    const leader_id = id;
    const leader = LEADERS[id];

    if (!leader) {
        return <h1>leader not found</h1>;
    }

    return (
        <div className="leader-full">
            <img className="leader-portrait" src={`/images/portraits/${leader_id}.png`} onError={
                // may consider moving this out into a function statement instead of a lambda expression
                ({ currentTarget }) => {
                    console.log(`Could not find portrait for leader '${leader_id}'!`)
                    currentTarget.onerror = null;
                    currentTarget.src = `/images/portraits/Placeholder.png`
                }
            } />
            <h1 className="leader-full-name">Leader Name: {leader.name}</h1>
            <p className="leader-full-faction">{leader.faction}</p>
            <p className="leader-full-tagline">{leader.tagline}</p>
            <p className="leader-full-lore">{leader.lore}</p>
            <div className='leader-powers'>
                minecraft
            </div>
        </div>
    );
}