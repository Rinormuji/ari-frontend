import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ layers: [] }));
vi.mock("../components/KosovoMapContext", () => ({
  default: ({ overview, satellite }) => <span data-testid="kosovo-context" data-overview={overview} data-satellite={satellite} />,
}));
vi.mock("../components/KosovoStreetLayer", () => ({
  default: ({ satellite }) => <span data-testid={satellite ? "kosovo-satellite-labels" : "kosovo-street"} />,
}));
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  TileLayer: (props) => {
    mocks.layers.push(props);
    return <span data-testid="base-layer" />;
  },
  ZoomControl: () => null,
}));

afterEach(() => {
  vi.unstubAllEnvs();
  mocks.layers = [];
});

async function loadMap(key) {
  vi.resetModules();
  vi.stubEnv("VITE_ARCGIS_API_KEY", key);
  return (await import("../components/PropertyMap")).default;
}

const baseLayer = () => mocks.layers.filter(({ url }) => !url.includes("imagery/labels")).at(-1);

it("keeps the street map available and prevents satellite requests without credentials", async () => {
  const PropertyMap = await loadMap("");
  render(<PropertyMap center={[42.6, 21.1]} zoom={14} />);
  expect(screen.getByRole("button", { name: "Satelit" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Hartë" })).toHaveAttribute("aria-pressed", "true");
  expect(mocks.layers.at(-1).url).toContain("tile.openstreetmap.org");
});

it("switches between satellite and street imagery without replacing the map or its markers", async () => {
  const PropertyMap = await loadMap("test-key");
  render(<PropertyMap center={[42.6, 21.1]} zoom={14}><span>Property marker</span></PropertyMap>);
  const map = screen.getByTestId("map");
  const marker = screen.getByText("Property marker");
  expect(baseLayer().url).toContain("World_Imagery/MapServer/tile/{z}/{y}/{x}?token=test-key");
  expect(screen.getByTestId("kosovo-context")).toHaveAttribute("data-satellite", "true");
  fireEvent.click(screen.getByRole("button", { name: "Hartë" }));
  expect(screen.getByTestId("kosovo-street")).toBeInTheDocument();
  expect(screen.getByTestId("kosovo-context")).toHaveAttribute("data-satellite", "false");
  fireEvent.click(screen.getByRole("button", { name: "Satelit" }));
  expect(screen.getByTestId("map")).toBe(map);
  expect(screen.getByText("Property marker")).toBe(marker);
  expect(screen.getByRole("button", { name: "Satelit" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByTestId("kosovo-context")).toHaveAttribute("data-satellite", "true");
});

it("offers a working street layer when satellite imagery cannot load", async () => {
  const PropertyMap = await loadMap("test-key");
  render(<PropertyMap center={[42.6, 21.1]} zoom={14} />);
  act(() => baseLayer().eventHandlers.tileerror());
  expect(screen.getByRole("status")).toHaveTextContent("Disa pjesë të hartës nuk u ngarkuan.");
  fireEvent.click(screen.getByRole("button", { name: "Shfaq hartën" }));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  expect(screen.getByTestId("kosovo-street")).toBeInTheDocument();
});

it("requests a Kosovo overview with detailed satellite labels", async () => {
  const PropertyMap = await loadMap("test-key");
  render(<PropertyMap overview center={[42.6, 21.1]} zoom={14} />);
  expect(screen.getByTestId("kosovo-context")).toHaveAttribute("data-overview", "true");
  expect(mocks.layers).toHaveLength(1);
  expect(screen.getByTestId("kosovo-satellite-labels")).toBeInTheDocument();
});
