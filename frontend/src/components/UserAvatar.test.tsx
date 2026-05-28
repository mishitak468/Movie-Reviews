import { render } from "@testing-library/react";
import UserAvatar from "./UserAvatar";

describe("UserAvatar — initials derivation", () => {
  it("splits snake_case usernames", () => {
    const { getByText } = render(<UserAvatar username="dana_white" userId={1} />);
    expect(getByText("DW")).toBeInTheDocument();
  });

  it("splits hyphenated usernames", () => {
    const { getByText } = render(<UserAvatar username="mary-ann" userId={1} />);
    expect(getByText("MA")).toBeInTheDocument();
  });

  it("splits dot-separated usernames", () => {
    const { getByText } = render(<UserAvatar username="john.doe" userId={1} />);
    expect(getByText("JD")).toBeInTheDocument();
  });

  it("falls back to first two characters for single-word names", () => {
    const { getByText } = render(<UserAvatar username="admin" userId={1} />);
    expect(getByText("AD")).toBeInTheDocument();
  });

  it("falls back to a userId-based seed when username is missing", () => {
    // "user-42" splits to ["user", "42"] → "U4"
    const { getByText } = render(<UserAvatar userId={42} />);
    expect(getByText("U4")).toBeInTheDocument();
  });

  it("uppercases all output regardless of input case", () => {
    const { getByText } = render(<UserAvatar username="alice_jones" userId={1} />);
    expect(getByText("AJ")).toBeInTheDocument();
  });
});
