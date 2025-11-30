import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ErrorPage from "../error";

describe("Error", () => {
  it("should render error message", () => {
    const mockError = new Error("Test error");
    const mockReset = vi.fn();

    render(<ErrorPage error={mockError} reset={mockReset} />);

    expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
    expect(screen.getByText("Try again")).toBeInTheDocument();
  });

  it("should call reset when button is clicked", async () => {
    const user = userEvent.setup();
    const mockError = new Error("Test error");
    const mockReset = vi.fn();

    render(<ErrorPage error={mockError} reset={mockReset} />);

    const button = screen.getByText("Try again");
    await user.click(button);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("should log error to console", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const mockError = new Error("Test error");
    const mockReset = vi.fn();

    render(<ErrorPage error={mockError} reset={mockReset} />);

    expect(consoleErrorSpy).toHaveBeenCalledWith(mockError);

    consoleErrorSpy.mockRestore();
  });
});
