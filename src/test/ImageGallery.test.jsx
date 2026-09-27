import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import ImageGallery from "../pages/property-detail/ImageGallery";

const touch = (x, y) => ({ clientX: x, clientY: y });

it("changes photos in both swipe directions without opening the gallery", () => {
  const onNext = vi.fn();
  const onPrevious = vi.fn();
  const onOpen = vi.fn();
  const { container } = render(
    <ImageGallery images={["/one.jpg", "/two.jpg"]} currentIndex={0}
      onNext={onNext} onPrevious={onPrevious} onSelect={vi.fn()} onOpen={onOpen} title="Prona" />,
  );
  const mainImage = container.querySelector("img");

  fireEvent.touchStart(mainImage, { touches: [touch(180, 100)] });
  fireEvent.touchEnd(mainImage, { changedTouches: [touch(80, 105)] });
  fireEvent.click(mainImage);
  expect(onNext).toHaveBeenCalledTimes(1);
  expect(onOpen).not.toHaveBeenCalled();

  fireEvent.touchStart(mainImage, { touches: [touch(80, 100)] });
  fireEvent.touchEnd(mainImage, { changedTouches: [touch(180, 105)] });
  fireEvent.click(mainImage);
  expect(onPrevious).toHaveBeenCalledTimes(1);
  expect(onOpen).not.toHaveBeenCalled();

  fireEvent.touchStart(mainImage, { touches: [touch(100, 100)] });
  fireEvent.touchEnd(mainImage, { changedTouches: [touch(105, 190)] });
  expect(onNext).toHaveBeenCalledTimes(1);
  expect(onPrevious).toHaveBeenCalledTimes(1);
  fireEvent.click(mainImage);
  expect(onOpen).toHaveBeenCalledTimes(1);

  fireEvent.click(screen.getByRole("button", { name: "Foto tjetër" }));
  expect(onNext).toHaveBeenCalledTimes(2);
});
