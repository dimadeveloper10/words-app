import { useEffect, useId, useState, type ReactNode } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

interface CarouselProps<T> {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  label: string;
  itemsLabel: string;
}

export function Carousel<T>({
  items,
  getKey,
  renderItem,
  label,
  itemsLabel,
}: CarouselProps<T>) {
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

  return (
    <div
      className="carousel"
      role="region"
      aria-label={label}
      aria-roledescription="carousel"
    >
      {items.length > 1 && (
        <div className="carousel-controls">
          <button
            type="button"
            className="carousel-button"
            aria-label={`Previous ${itemsLabel}`}
            aria-controls={viewportId}
            disabled={!canGoBack}
            onClick={() => scroll('previous')}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            className="carousel-button"
            aria-label={`Next ${itemsLabel}`}
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
        aria-label={`Use left and right arrow keys to browse ${itemsLabel}`}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            scroll(event.key === 'ArrowLeft' ? 'previous' : 'next');
          }
        }}
      >
        <div className="carousel-track">
          {items.map((item, index) => (
            <div
              className="carousel-slide"
              key={getKey(item)}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${items.length}`}
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
