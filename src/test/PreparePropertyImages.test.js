import { afterEach, expect, it, vi } from "vitest";
import { preparePropertyImages } from "../utils/preparePropertyImages";

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it("shrinks large property photos before upload while preserving existing images", async () => {
  const revoke = vi.fn();
  vi.stubGlobal("URL", { createObjectURL: () => "blob:photo", revokeObjectURL: revoke });
  vi.stubGlobal("Image", class {
    naturalWidth = 2800;
    naturalHeight = 1400;
    set src(_) { queueMicrotask(() => this.onload()); }
  });
  const drawImage = vi.fn();
  const originalCreateElement = document.createElement.bind(document);
  vi.spyOn(document, "createElement").mockImplementation((tag) => tag === "canvas"
    ? { width: 0, height: 0, getContext: () => ({ drawImage }), toDataURL: () => "data:image/jpeg;base64,c2hvcnQ=" }
    : originalCreateElement(tag));

  const largePhoto = new File([new Uint8Array(300_000)], "home.jpg", { type: "image/jpeg" });
  const result = await preparePropertyImages([largePhoto, "existing-image"]);

  expect(result).toEqual(["data:image/jpeg;base64,c2hvcnQ=", "existing-image"]);
  expect(drawImage).toHaveBeenCalledOnce();
  expect(revoke).toHaveBeenCalledWith("blob:photo");
});
