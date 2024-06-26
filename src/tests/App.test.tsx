import React from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../../frontend/src/App";

test("renders search page", async () => {
  await act(async () => {
    render(<App />);
  });
  const linkElement = screen.getByText(/Search Anomalies/i);
  expect(linkElement).toBeInTheDocument();
});
