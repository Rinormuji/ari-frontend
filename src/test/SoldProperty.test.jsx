import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { expect, it, vi } from "vitest";
import PropertyCard from "../components/PropertyCard";

vi.mock("../context/authContextValue", () => ({ useAuth: () => ({ isAuthenticated: false }) }));
vi.mock("../components/FavoriteButton", () => ({ default: () => <button>Favorite</button> }));
const property = { id: 42, title: "Prona test", type: "BANESA", status: "FOR_SALE", images: ["/one.jpg", "/two.jpg"] };
const showCard = (status) => render(<MemoryRouter><Routes>
  <Route path="/" element={<PropertyCard property={{ ...property, status }} />} />
  <Route path="/properties/42" element={<p>Detajet</p>} />
</Routes></MemoryRouter>);

it.each([["SOLD", "E shitur"], ["RENTED", "E lëshuar me qera"]])("stamps %s listings and removes navigation and booking controls", (status, label) => {
  showCard(status);
  expect(screen.getByRole("img", { name: label })).toBeInTheDocument();
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: label })).toBeDisabled();
  expect(screen.queryByRole("button", { name: "Favorite" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /^Foto / })).not.toBeInTheDocument();
  fireEvent.click(screen.getByText("Prona test"));
  expect(screen.queryByText("Detajet")).not.toBeInTheDocument();
});

it("keeps available listings clickable and bookable", () => {
  showCard("FOR_SALE");
  expect(screen.getByRole("button", { name: "Rezervo Takim" })).toBeEnabled();
  fireEvent.click(screen.getByRole("link"));
  expect(screen.getByText("Detajet")).toBeInTheDocument();
});
