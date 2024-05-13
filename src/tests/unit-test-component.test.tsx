// componets/Greetings.test.tsx

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { idText } from "typescript";
import { UnitTestComponent } from "../pages/unit-test-component";

// let wrapper:any = render(<UnitTestComponent name="Test Name" />);
let wrapper;
beforeEach(() => {
  wrapper = render(<UnitTestComponent name="Test Name" />);
});

describe("when rendered with a `name` prop", () => {
  it("should paste it into the greetings text", () => {
    expect(screen.getByText(/Hello Test Name!/)).toBeInTheDocument();
  });

  it("should render the sending waves button", () => {
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should call the `testXX` callback", () => {
    userEvent.click(screen.getByRole("button"));
    expect(screen.getByText(/success/)).toBeInTheDocument();
  });
});
