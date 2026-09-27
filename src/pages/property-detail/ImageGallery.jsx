import { ChevronLeft, ChevronRight } from "lucide-react";
import { useImageSwipe } from "../../hooks/useImageSwipe";

const ImageGallery = ({
  images,
  currentIndex,
  onNext,
  onPrevious,
  onSelect,
  onOpen,
  title,
}) => {
  const swipeHandlers = useImageSwipe({ enabled: images.length > 1, onNext, onPrevious });

  return (
  <div>
    <div
      className="relative aspect-square cursor-pointer touch-pan-y overflow-hidden rounded-2xl bg-gray-200"
      onClick={onOpen}
      {...swipeHandlers}
    >
      <img
        src={images[currentIndex]}
        alt={title || "Foto e pronës"}
        draggable="false"
        className="h-full w-full object-contain"
      />

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPrevious();
            }}
            aria-label="Foto e mëparshme"
            className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-md transition hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onNext();
            }}
            aria-label="Foto tjetër"
            className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-md transition hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      <div className="absolute bottom-3 right-3 rounded-lg bg-black/50 px-2 py-1 text-xs text-white">
        {currentIndex + 1} / {images.length}
      </div>
    </div>

    {images.length > 1 && (
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => onSelect(index)}
            className={`h-20 w-20 shrink-0 bg-gray-100 overflow-hidden rounded-xl transition-all ${
              index === currentIndex ? "ring-2 ring-[#EFD391] opacity-100" : "opacity-60 hover:opacity-80"
            }`}
            aria-label={`Shfaq foton ${index + 1}`}
          >
            <img src={image} alt="" className="h-full w-full object-contain" />
          </button>
        ))}
      </div>
    )}
  </div>
  );
};

export default ImageGallery;
