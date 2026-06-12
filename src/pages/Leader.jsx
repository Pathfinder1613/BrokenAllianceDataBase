import { useState } from 'react'
import LeaderItem from './LeaderItem';


import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

// css
import '../Styles/LeaderPage.css';

import FACTIONS from '../services/Factions.json';
import LEADERS from '../services/Leaders.json'

export default function LeaderPage() {
    // NOTE: When referencing images dynamically, images MUST be put in the 'public' folder.

    return (
        <>
            <Swiper
                // install Swiper modules
                modules={[Navigation, Pagination, Scrollbar, A11y]}
                spaceBetween={50}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                scrollbar={false}
                onSwiper={(swiper) => console.log(swiper)}
                onSlideChange={() => console.log('slide change')}
            >
                <div>
                    {FACTIONS.map((faction) => {
                        const leaders = LEADERS.filter((leader) => leader.faction === faction.name);

                        return (
                            <SwiperSlide key={`faction-slide-${faction.name}`}>
                                <div style={{marginBottom: '86px'}}>
                                    <img style={{ width: '82px', height: '82px', float: 'left', marginRight: '16px' }} src={`../../images/${faction.name.replace(" ", "")}_Icon.svg`} />
                                    <h1 style={{ float: "left", color: faction.color }}>{faction.name}</h1>
                                </div>
                                <div className="leader-list">
                                    {leaders.map((leader) => (
                                        <div className="leader-container" key={leader.id}>
                                            <span style={{fontSize: '1.5em', color: faction.color, fontWeight: 'bold'}}>★ {leader.name}</span>
                                            <br/>
                                            <span style={{fontWeight: 'bold'}}>{leader.leaderType}</span>
                                            <br/>
                                            <span style={{fontSize: '1.1em', fontStyle: 'italic', opacity: 0.75}}>"{leader.quote}"</span>
                                        </div>
                                    ))}
                                </div>
                            </SwiperSlide>
                        )
                    })}
                </div>
            </Swiper>


        </>
    )

}