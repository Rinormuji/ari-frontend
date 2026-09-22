import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import AddProperty from "../admin/pages/AddProperty";
import EditProperty from "../admin/pages/EditProperty";
import Contact from "../pages/Contact";
import { extractContactPhones, formatPropertyPhone } from "../utils/propertyContact";

const mocks = vi.hoisted(() => ({
  get: vi.fn(), post: vi.fn(), getAll: vi.fn(), getProperty: vi.fn(), updatePropertyByType: vi.fn(),
  toast: { error: vi.fn(), success: vi.fn() },
}));
vi.mock("../services/api", () => ({ default: mocks, cityAPI: mocks, propertyAPI: mocks }));
vi.mock("../context/toastContextValue", () => ({ useToast: () => mocks.toast }));
vi.mock("../admin/components/MapPicker", () => ({ default: () => null }));
const profile = { phoneNumbers: ["+38345111222"] };
const contacts = "+38345111222\n+38348333444\n+38349555666";
const requiredContacts = "+38345465726\n+38348465726";
const contactsWithDefaults = `${contacts}\n${requiredContacts}`;
const profileWithDefaults = `${profile.phoneNumbers[0]}\n${requiredContacts}`;
const showAdd = () => render(<MemoryRouter><AddProperty /></MemoryRouter>);
const field = () => screen.getByRole("textbox", { name: "Numrat e kontaktit" });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.getAll.mockResolvedValue({ data: [] });
  mocks.get.mockResolvedValue({ data: profile });
  mocks.post.mockResolvedValue({ data: {} });
  mocks.updatePropertyByType.mockResolvedValue({ data: {} });
});
it("fills the creator's phone and submits manually entered multiple contacts", async () => {
  const { container } = showAdd();
  await waitFor(() => expect(field()).toHaveValue(profileWithDefaults));
  expect(mocks.get).toHaveBeenCalledWith("/admin/current-contact");
  fireEvent.change(field(), { target: { value: contacts } });
  fireEvent.change(screen.getByText("Zgjidh llojin...").closest("select"), { target: { value: "TOKA" } });
  for (const [name, value] of Object.entries({ id: "101", title: "Prona", price: "100", area: "200" })) {
    fireEvent.change(container.querySelector(`[name="${name}"]`), { target: { value } });
  }
  fireEvent.submit(container.querySelector("form"));
  await waitFor(() => expect(mocks.post).toHaveBeenCalledWith("/toka", expect.objectContaining({ contactInfo: contactsWithDefaults })));
  await waitFor(() => expect(field()).toHaveValue(profileWithDefaults));
});
it("does not overwrite manual edits when the profile arrives late", async () => {
  let resolve;
  mocks.get.mockReturnValue(new Promise((done) => { resolve = done; }));
  showAdd();
  fireEvent.change(field(), { target: { value: contacts } });
  await act(async () => resolve({ data: profile }));
  expect(field()).toHaveValue(contacts);
});
it("preserves existing contacts during editing and saves manual changes", async () => {
  mocks.getProperty.mockResolvedValue({ data: { id: 101, type: "TOKA", title: "Prona", price: 100, area: 200, images: ["https://example.com/one.jpg", "https://example.com/two.jpg"], contactInfo: "+38344123456", status: "FOR_SALE" } });
  const { container } = render(<MemoryRouter initialEntries={["/admin/properties/edit/101"]}><Routes><Route path="/admin/properties/edit/:id" element={<EditProperty />} /></Routes></MemoryRouter>);
  await waitFor(() => expect(field()).toHaveValue("+38344123456"));
  expect(mocks.get).toHaveBeenCalledWith("/admin/current-contact");
  fireEvent.change(field(), { target: { value: contacts } });
  fireEvent.submit(container.querySelector("form"));
  await waitFor(() => expect(mocks.updatePropertyByType).toHaveBeenCalledWith("TOKA", "101", expect.objectContaining({ contactInfo: contactsWithDefaults })));
  expect(field()).toHaveAttribute("maxlength", "255");
  expect(screen.getByAltText("Foto ekzistuese 1")).toHaveAttribute("src", "https://example.com/one.jpg");
  expect(screen.getByAltText("Foto ekzistuese 2")).toBeInTheDocument();
  expect(mocks.updatePropertyByType.mock.calls[0][2].images).toBeUndefined();
});
it("allows manual contacts when the profile cannot load", async () => {
  mocks.get.mockRejectedValue(new Error("Offline"));
  showAdd();
  await screen.findByRole("alert");
  fireEvent.change(field(), { target: { value: contacts } });
  expect(field()).toHaveValue(contacts);
});
it("shows both agency phone numbers as callable links", () => {
  render(<Contact />);
  expect(screen.getByRole("link", { name: "+383 45 465 726" })).toHaveAttribute("href", "tel:+38345465726");
  expect(screen.getByRole("link", { name: "+383 48 465 726" })).toHaveAttribute("href", "tel:+38348465726");
});


it("autofills both super admin numbers without names", async () => {
  mocks.get.mockResolvedValue({ data: { phoneNumbers: ["+38345465726", "+38348465726"] } });
  showAdd();
  await waitFor(() => expect(field()).toHaveValue("+38345465726\n+38348465726"));
  expect(screen.queryByText("Zgjidh agjent\u00ebt")).not.toBeInTheDocument();
});
it("extracts numbers from legacy named contacts", () => {
  expect(extractContactPhones("Arta Test ? +383 45 111 222\nBlerim ? +383 48 333 444")).toBe("+383 45 111 222\n+383 48 333 444");
});

it("formats Kosovo property contacts for display", () => {
  expect(formatPropertyPhone("+38345465726")).toBe("+383 45 465 726");
  expect(formatPropertyPhone("+38348465726")).toBe("+383 48 465 726");
});
