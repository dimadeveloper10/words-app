import { useEffect, useId, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { Lesson } from './lessons.types';

export function LessonsCarousel({ lessons }: { lessons: Lesson[] }) {
  const viewportId = useId();
  const [viewportRef, carousel] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    loop: false,
  });
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  useEffect(() => {
    if (!carousel) return;

    function updateControls() {
      setCanGoBack(carousel!.canScrollPrev());
      setCanGoForward(carousel!.canScrollNext());
    }

    updateControls();
    carousel.on('select', updateControls).on('reInit', updateControls);
    return () => {
      carousel.off('select', updateControls).off('reInit', updateControls);
    };
  }, [carousel]);

  function scroll(direction: 'previous' | 'next') {
    const jump = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (direction === 'previous') carousel?.scrollPrev(jump);
    else carousel?.scrollNext(jump);
  }

  if (lessons.length === 0) return <p>No lessons yet.</p>;

  return (
    <div
      className="lessons-carousel"
      role="region"
      aria-label="Lesson cards"
      aria-roledescription="carousel"
    >
      {lessons.length > 1 && (
        <div className="carousel-controls">
          <button
            type="button"
            className="carousel-button"
            aria-label="Previous lessons"
            aria-controls={viewportId}
            disabled={!canGoBack}
            onClick={() => scroll('previous')}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            className="carousel-button"
            aria-label="Next lessons"
            aria-controls={viewportId}
            disabled={!canGoForward}
            onClick={() => scroll('next')}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
      <div
        id={viewportId}
        className="carousel-viewport"
        ref={viewportRef}
        tabIndex={0}
        role="group"
        aria-label="Use left and right arrow keys to browse lessons"
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            scroll(event.key === 'ArrowLeft' ? 'previous' : 'next');
          }
        }}
      >
        <div className="carousel-track">
          {lessons.map((lesson, index) => (
            <div
              className="carousel-slide"
              key={lesson.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${lessons.length}`}
            >
              <article className="lesson-card">
                <h3>{lesson.name}</h3>
                <dl className="lesson-card-stats">
                  <div>
                    <dt>Points</dt>
                    <dd>
                      <span aria-label="Not available">—</span>
                    </dd>
                  </div>
                  <div>
                    <dt>Words</dt>
                    <dd>{lesson.wordCount}</dd>
                  </div>
                </dl>
              </article>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
