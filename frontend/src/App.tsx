import { useEffect, useState } from "react";
import { api, type Movie } from "@/api";

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setMovies(await api.getMovies());
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  return (
    <ul className="p-8 text-blue-400">
      {movies.map((m) => (
        <li key={m.id}>
          {m.title} ({m.release_year}) — {m.average_rating ?? "no rating"}
        </li>
      ))}
    </ul>
  );
}
