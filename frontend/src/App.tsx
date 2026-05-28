import { Route, Routes } from "react-router-dom";
import Home from "@/pages/Home";
import MovieDetail from "@/pages/MovieDetail";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/movies/:id" element={<MovieDetail />} />
    </Routes>
  );
}
