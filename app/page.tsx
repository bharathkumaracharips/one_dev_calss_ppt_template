import React from 'react';
import Deck from '../components/presentation/Deck';
import TitleSlide from '../components/presentation/templates/TitleSlide';
import ContentSlide from '../components/presentation/templates/ContentSlide';
import ImageSlide from '../components/presentation/templates/ImageSlide';
import { presentationData } from './slides';

export default function PresentationPage() {
  return (
    <Deck>
      {presentationData.map((slide, index) => {
        switch (slide.type) {
          case 'title':
            return <TitleSlide key={index} {...slide.props} title={slide.props.title!} />;
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
