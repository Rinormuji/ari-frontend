import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import Profile from "../pages/Profile";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
  refreshUser: vi.fn(),
}));
vi.mock("../services/api", () => ({ default: { get: mocks.get, put: mocks.put } }));
vi.mock("../context/authContextValue", () => ({
  useAuth: () => ({ user: { username: "arta" }, refreshUser: mocks.refreshUser }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.get.mockResolvedValue({
    data: { username: "arta", firstName: "Arta", lastName: "Berisha", phoneNumber: "+38349111222" },
  });
  mocks.put.mockResolvedValue({
    data: { username: "arta_new", firstName: "Arta", lastName: "Berisha", phoneNumber: "+38349111222" },
  });
  mocks.refreshUser.mockResolvedValue({ username: "arta_new" });
});

it("autofills account details and saves only the four profile fields", async () => {
  render(<MemoryRouter><Profile /></MemoryRouter>);
  expect(await screen.findByRole("textbox", { name: "Emri" })).toHaveValue("Arta");
  expect(screen.getByRole("textbox", { name: "Mbiemri" })).toHaveValue("Berisha");
  expect(screen.getByRole("textbox", { name: "Username" })).toHaveValue("arta");
  expect(screen.getByRole("textbox", { name: "Numri i telefonit" })).toHaveValue("+38349111222");

  fireEvent.change(screen.getByRole("textbox", { name: "Username" }), { target: { value: "arta_new" } });
  fireEvent.click(screen.getByRole("button", { name: "Përditëso Profilin" }));
  await waitFor(() => expect(mocks.put).toHaveBeenCalledWith("/profile", {
    username: "arta_new", firstName: "Arta", lastName: "Berisha", phoneNumber: "+38349111222",
  }));
  await waitFor(() => expect(mocks.refreshUser).toHaveBeenCalled());
});
