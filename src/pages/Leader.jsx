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
                modules={[Navigation, Pagination, A11y]}
                spaceBetween={0}
                slidesPerView={6}
                navigation
                pagination={{ clickable: true }}
                scrollbar={false}
                onSwiper={(swiper) => console.log(swiper)}
                onSlideChange={() => console.log('slide change')}
                className='SWiper-box'
            >

                <div>
                    {LEADERS.map((leader) => {



                        return (
                                <SwiperSlide className='leader-slide' key={`leader-slide-${leader.id}`}>
                                <div className="leader-slide-content">
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
                                            <div className="leader-name-row">
                                                <span className="leader-name">{leader.name}</span>
                                                <div className="leader-faction-badge">
                                                    <img
                                                        className="leader-faction-icon"
                                                        src={`/images/icons/${leader.faction}.svg`}
                                                        onError={({ currentTarget }) => {
                                                            currentTarget.onerror = null;
                                                        }}
                                                    />
                                                    <span className="leader-faction-name">{leader.faction}</span>
                                                </div>
                                            </div>
                                            <span className="leader-type">{leader.leader_type}</span>
                                            <span className="leader-quote">"{leader.quote}"</span>
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