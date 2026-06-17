import { useState } from 'react'
import { useNavigate } from 'react-router-dom';

import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

// css
import '../Styles/LeaderPage.css';

import FACTIONS from '../data/Factions.json';
import LEADERS from '../data/Leaders.json'


export default function LeaderPage() {
    // NOTE: When referencing images dynamically, images MUST be put in the 'public' folder.
    const navigate = useNavigate();

    return (
        <Swiper className='leader-slide-container'
            modules={[Navigation, Pagination, Scrollbar, A11y]}
            slidesPerView={3}
            navigation
            pagination={{ clickable: true }}
        >
            <SwiperSlide />
            {Object.keys(LEADERS).map(
                (leader_id) => {
                    const leader = LEADERS[leader_id];
                    const faction = FACTIONS[leader.faction.toLowerCase()]
                    const color = faction ? faction.color : 'white'

                    return (
                        <SwiperSlide className="leader-slide" key={`leader-slide-${leader_id}`}>
                            <div style={{ borderLeftColor: color }} className="leader-card" >
                                <img className="leader-portrait" src={`/images/portraits/${leader_id}.png`} onError={
                                    // may consider moving this out into a function statement instead of a lambda expression
                                    ({ currentTarget }) => {
                                        console.log(`Could not find portrait for leader '${leader_id}'!`)
                                        currentTarget.onerror = null;
                                        currentTarget.src = `/images/portraits/Placeholder.png`
                                    }
                                } />
                                <span style={{ color: color }} className="leader-name">{leader.name}</span>
                                <span className="leader-type">{leader.title}</span>
                                <span className="leader-quote">"{leader.quote}"</span>
                                <span className="leader-lore">
                                    {(leader.lore ?? '').split(' ').slice(0, 30).join(' ')}...
                                    <button onClick={() => navigate(`/leaders/${leader_id}`)} className='See-More'>Click to see more</button>
                                </span>
                            </div>
                        </SwiperSlide>
                    )
                }
            )}
            <SwiperSlide />

            {/* using two dummy slides at the beginning and end to focus the selected card in the center */}
        </Swiper>
    )
}