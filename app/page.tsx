import React from 'react';
import Deck from '../components/presentation/Deck';
import TitleSlide from '../components/presentation/templates/TitleSlide';
import ContentSlide from '../components/presentation/templates/ContentSlide';
import ImageSlide from '../components/presentation/templates/ImageSlide';
import { presentationData } from './slides';

export default function PresentationPage() {
  // Calculate the "steps" count for each slide (e.g., number of bullets)
  // 'content' slides have steps equal to the length of the content array
  // 'title' or other slides have 0 steps (content shows immediately)
  const slideCounts = presentationData.map(slide => {
    // @ts-ignore
    return slide.props.content && Array.isArray(slide.props.content) ? slide.props.content.length : 0;
  });

  return (
    <Deck slideCounts={slideCounts}>
      {presentationData.map((slide, index) => {
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
  );
}
