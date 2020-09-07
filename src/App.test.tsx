import React from "react";
import { render } from "@testing-library/react";
import App from "./App";
import "@testing-library/jest-dom/extend-expect";

test("renders learn react link", () => {
  const { getByText } = render(<App width={100} height={100} />);
  const linkElement = getByText(/React Games/i);
  expect(linkElement).toBeTruthy();
});
