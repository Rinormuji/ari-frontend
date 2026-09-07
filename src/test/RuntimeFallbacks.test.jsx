import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DataLoadError from "../components/DataLoadError";
import ErrorBoundary from "../components/ErrorBoundary";

function BrokenComponent() {
  throw new Error("test failure");
}

describe("runtime fallbacks", () => {
  it("lets the user retry a failed data request", () => {
    const retry = vi.fn();
    render(<DataLoadError onRetry={retry} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /provo përsëri/i }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it("shows an application fallback for an unhandled render error", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("heading", { name: /diçka shkoi keq/i })).toBeInTheDocument();
    consoleError.mockRestore();
  });
});