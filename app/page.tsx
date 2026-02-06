"use client";

import React, { useState } from 'react';
import Deck from '../components/presentation/Deck';
import TitleSlide from '../components/presentation/templates/TitleSlide';
import ContentSlide from '../components/presentation/templates/ContentSlide';
import ImageSlide from '../components/presentation/templates/ImageSlide';
import LectureSidebar from '../components/presentation/LectureSidebar';
import { lectures } from './slides';

export default function PresentationPage() {
  // Default to Lecture 1 (Core content) or Lecture 0 (Intro). 
  // User asked to switch between them. Let's default to Lecture 0 as it's the sequence start, 
  // or Lecture 1 if that was what they were working on. 
  // Given previous context was Lecture 1, let's stick to Lecture 1 as default to avoid "losing" their place.
  const [activeLectureId, setActiveLectureId] = useState('lecture-1');

  const activeLecture = lectures.find(l => l.id === activeLectureId) || lectures[0];
  const slides = activeLecture.slides;

  // Calculate the "steps" count for each slide (e.g., number of bullets)
  const slideCounts = slides.map(slide => {
    // @ts-ignore
    return slide.props.content && Array.isArray(slide.props.content) ? slide.props.content.length : 0;
  });

  return (
    <div className="relative w-full h-full">
      <LectureSidebar
        lectures={lectures}
        activeLectureId={activeLectureId}
        onSelectLecture={setActiveLectureId}
      />

      {/* 
        Key prop ensures Deck remounts when lecture changes, 
        resetting slide index to 0. 
      */}
      <Deck key={activeLectureId} slideCounts={slideCounts} lectureId={activeLectureId}>
        {slides.map((slide, index) => {
          switch (slide.type) {
            case 'title':
              // @ts-ignore
              return <TitleSlide key={index} {...slide.props} />;
            case 'content':
              // @ts-ignore
              return <ContentSlide key={index} {...slide.props} />;
            case 'image':
              // @ts-ignore
              return <ImageSlide key={index} {...slide.props} />;
            default:
              return null;
          }
        })}
      </Deck>
    </div>
  );
}
