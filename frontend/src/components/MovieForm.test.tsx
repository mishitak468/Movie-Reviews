import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MovieForm from "./MovieForm";
import { ApiError, type Movie } from "@/api";

function makeMovie(overrides: Partial<Movie> = {}): Movie {
  return {
    id: 1,
    title: "The Test Film",
    release_year: 2000,
    genre: "Drama",
    poster_url: null,
    created_at: "2020-01-01T00:00:00Z",
    average_rating: null,
    review_count: 0,
    ...overrides,
  };
}

describe("MovieForm", () => {
  it("disables submit on an empty create form", () => {
    render(<MovieForm mode="create" onSubmit={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Add film/i })).toBeDisabled();
  });

  it("filters non-digit characters from the year input", async () => {
    const user = userEvent.setup();
    render(<MovieForm mode="create" onSubmit={vi.fn()} />);

    const year = screen.getByLabelText("Year") as HTMLInputElement;
    await user.type(year, "1a9b9c7");
    expect(year.value).toBe("1997");
  });

  it("caps the year input at 4 digits", async () => {
    const user = userEvent.setup();
    render(<MovieForm mode="create" onSubmit={vi.fn()} />);

    const year = screen.getByLabelText("Year") as HTMLInputElement;
    await user.type(year, "20251");
    expect(year.value).toBe("2025");
  });

  it("flags a duplicate when title and year match an existing film", async () => {
    const user = userEvent.setup();
    const existing = makeMovie({ id: 1, title: "King Kong", release_year: 1933 });

    render(<MovieForm mode="create" existingFilms={[existing]} onSubmit={vi.fn()} />);

    // case + whitespace tolerant — "king kong" should still match "King Kong"
    await user.type(screen.getByLabelText("Title"), "king kong");
    await user.type(screen.getByLabelText("Year"), "1933");

    expect(await screen.findByText(/already in the catalog/i)).toBeInTheDocument();
  });

  it("does not flag duplicates when the year differs (sequels/remakes)", async () => {
    const user = userEvent.setup();
    const existing = makeMovie({ id: 1, title: "King Kong", release_year: 1933 });

    render(<MovieForm mode="create" existingFilms={[existing]} onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText("Title"), "King Kong");
    await user.type(screen.getByLabelText("Year"), "1976");

    expect(screen.queryByText(/already in the catalog/i)).toBeNull();
  });

  it("surfaces ApiError messages inline when submit fails", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new ApiError(400, "Server says no"));

    // edit mode lets us bypass the radix Select interaction — the initial
    // values pre-fill every field so the form is immediately submittable.
    render(
      <MovieForm
        mode="edit"
        initialValues={{
          title: "Existing",
          release_year: 2000,
          genre: "Drama",
          poster_url: null,
        }}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Save changes/i }));

    expect(await screen.findByText("Server says no")).toBeInTheDocument();
  });
});
