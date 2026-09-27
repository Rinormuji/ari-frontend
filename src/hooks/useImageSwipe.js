import { useRef } from "react";

const MIN_SWIPE_DISTANCE = 40;

export const useImageSwipe = ({ enabled, onNext, onPrevious }) => {
  const startPosition = useRef(null);
  const suppressClickUntil = useRef(0);

  const onTouchStart = (event) => {
    if (!enabled || event.touches.length !== 1) {
      startPosition.current = null;
      return;
    }

    startPosition.current = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  };

  const onTouchEnd = (event) => {
    const start = startPosition.current;
    startPosition.current = null;
    if (!start || event.changedTouches.length !== 1) return;

    const deltaX = event.changedTouches[0].clientX - start.x;
    const deltaY = event.changedTouches[0].clientY - start.y;
    if (Math.abs(deltaX) < MIN_SWIPE_DISTANCE || Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) return;

    // A touch gesture can produce a click. Keep it from opening the image or card.
    suppressClickUntil.current = Date.now() + 500;
    if (deltaX < 0) onNext();
    else onPrevious();
  };

  const onTouchCancel = () => {
    startPosition.current = null;
  };

  const onClickCapture = (event) => {
    if (Date.now() >= suppressClickUntil.current) return;
    suppressClickUntil.current = 0;
    event.preventDefault();
    event.stopPropagation();
  };

  return { onTouchStart, onTouchEnd, onTouchCancel, onClickCapture };
};
