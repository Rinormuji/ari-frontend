import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import AddProperty from "../admin/pages/AddProperty";

const mocks = vi.hoisted(() => ({
  get: vi.fn(), getAll: vi.fn(), post: vi.fn(),
  toast: { error: vi.fn(), success: vi.fn() },
}));
vi.mock("../services/api", () => ({
  default: { get: mocks.get, post: mocks.post },
  cityAPI: { getAll: mocks.getAll },
  PROPERTY_SAVE_TIMEOUT_MS: 300000,
}));
vi.mock("../context/toastContextValue", () => ({ useToast: () => mocks.toast }));
vi.mock("../admin/components/MapPicker", () => ({ default: () => null }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.get.mockResolvedValue({ data: { phoneNumbers: [] } });
  mocks.getAll.mockResolvedValue({ data: ["Gjilan"] });
  mocks.post.mockResolvedValue({ data: {} });
});

it.each(["VILLE", "ZYRE", "OBJEKT", "DEPO", "INVENTAR"])(
  "submits a %s listing through the generic property endpoint", async (type) => {
    const { container } = render(<MemoryRouter><AddProperty /></MemoryRouter>);
    fireEvent.change(container.querySelector("select:not([name])"), { target: { value: type } });
    fireEvent.change(container.querySelector('[name="id"]'), { target: { value: "998123" } });
    fireEvent.change(container.querySelector('[name="title"]'), { target: { value: "Prona test" } });
    fireEvent.change(container.querySelector('[name="price"]'), { target: { value: "100000" } });
    if (type !== "INVENTAR") {
      fireEvent.change(container.querySelector('[name="area"]'), { target: { value: "80" } });
    }
    fireEvent.change(container.querySelector('[name="status"]'), { target: { value: "FOR_SALE" } });
    fireEvent.submit(container.querySelector("form"));

    await waitFor(() => expect(mocks.post).toHaveBeenCalledWith(
      "/properties",
      expect.objectContaining({ id: "998123", type, title: "Prona test", status: "FOR_SALE" }),
      expect.any(Object),
    ));
    expect(mocks.toast.error).not.toHaveBeenCalled();
  },
);

it("shows a useful error before submitting a nonnumeric ID", () => {
  const { container } = render(<MemoryRouter><AddProperty /></MemoryRouter>);
  fireEvent.change(container.querySelector('[name="id"]'), { target: { value: "-2" } });
  fireEvent.submit(container.querySelector("form"));
  expect(screen.getByText("ID duhet të jetë numër i plotë pozitiv.")).toBeInTheDocument();
  expect(mocks.post).not.toHaveBeenCalled();
});

it("shows a database conflict beside the form rather than blaming the ID", async () => {
  const message = "Të dhënat e dërguara bien ndesh me një regjistrim ekzistues.";
  mocks.post.mockRejectedValue({ response: { status: 409, data: { message } } });
  const { container } = render(<MemoryRouter><AddProperty /></MemoryRouter>);
  fireEvent.change(container.querySelector("select:not([name])"), { target: { value: "OBJEKT" } });
  fireEvent.change(container.querySelector('[name="id"]'), { target: { value: "998124" } });
  fireEvent.change(container.querySelector('[name="title"]'), { target: { value: "Objekt test" } });
  fireEvent.change(container.querySelector('[name="price"]'), { target: { value: "100000" } });
  fireEvent.change(container.querySelector('[name="area"]'), { target: { value: "80" } });
  fireEvent.change(container.querySelector('[name="status"]'), { target: { value: "FOR_SALE" } });
  fireEvent.submit(container.querySelector("form"));

  expect(await screen.findByRole("alert")).toHaveTextContent(message);
  expect(screen.queryByText(message, { selector: "p.text-red-400" })).not.toBeInTheDocument();
});
