import { ChevronLeft, ChevronRight } from "lucide-react";

const ImageGallery = ({
  images,
  currentIndex,
  onNext,
  onPrevious,
  onSelect,
  onOpen,
  title,
}) => (
  <div>
    <div
      className="relative aspect-4/3 cursor-pointer overflow-hidden rounded-2xl bg-gray-200"
      onClick={onOpen}
    >
      <img
        src={images[currentIndex]}
        alt={title || "Foto e pronës"}
        className="h-full w-full object-cover"
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
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
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
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
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
            className={`h-16 w-24 shrink-0 overflow-hidden rounded-xl transition-all ${
              index === currentIndex ? "ring-2 ring-[#EFD391] opacity-100" : "opacity-60 hover:opacity-80"
            }`}
            aria-label={`Shfaq foton ${index + 1}`}
          >
            <img src={image} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    )}
  </div>
);

export default ImageGallery;
