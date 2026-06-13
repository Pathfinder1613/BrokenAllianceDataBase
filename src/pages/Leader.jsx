import { useState } from 'react'

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
                slidesPerView={3}
                navigation
                pagination={{ clickable: true }}
                scrollbar={false}
                onSwiper={(swiper) => console.log(swiper)}
                onSlideChange={() => console.log('slide change')}
            >
                <div>
                    {LEADERS.map((leader) => {
                        return (
                            <SwiperSlide className='swiper-container ' key={`leader-slide-${leader.id}`}>
                                <div className="leader-list swiper-slide">
                                    <div className="leader-card" key={leader.id} style={{
                                        borderLeftColor: 'white'
                                    }}
                                    >
                                        {/*Its going to be a challenge to fit images properly.*/}
                                        <img className="leader-portrait" src={`../../images/portraits/${leader.id}.png`} onError={
                                            // should maybe seperate this into a function statement instead of a lambda expression?
                                            ({ currentTarget }) => {
                                                console.log(`Portrait not found for leader '${leader.id}'`);
                                                currentTarget.onerror = null;
                                                currentTarget.src = "../../images/portraits/Placeholder.png"
                                            }
                                        } />
                                        <div className="leader-info">
                                            <span style={{ fontSize: '1.5em', color: 'white', fontWeight: 'bold' }}>{leader.name}</span>
                                            <span style={{ fontWeight: 'bold' }}>{leader.leader_type}</span>
                                            <span className="leader-quote">
                                                "{leader.quote}"
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        )
                    })}
                </div>
            </Swiper>
        </>
    )
}