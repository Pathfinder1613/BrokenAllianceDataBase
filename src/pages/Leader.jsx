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

export default function LeaderPage() {

    return (
        <>

            <Swiper
                // install Swiper modules
                modules={[Navigation, Pagination, Scrollbar, A11y]}
                spaceBetween={50}
                slidesPerView={3}
                navigation
                pagination={{ clickable: true }}
                scrollbar={{ draggable: true }}
                onSwiper={(swiper) => console.log(swiper)}
                onSlideChange={() => console.log('slide change')}
            >
                <SwiperSlide><LeaderItem UDF/></SwiperSlide>
                <SwiperSlide><LeaderItem  Sakupen/></SwiperSlide>
                <SwiperSlide><LeaderItem The Storm/></SwiperSlide>
                <SwiperSlide><LeaderItem  placeholder/></SwiperSlide>
                <SwiperSlide><LeaderItem  placeholder/></SwiperSlide>
                ...
            </Swiper>








        </>
    )

}