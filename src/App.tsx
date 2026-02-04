import { BrowserRouter, Route, Routes } from "react-router-dom";

import Index from "./pages/index.tsx";
import Poll from "./pages/Poll.tsx";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/polls/:selectedPoll" element={<Poll />} />
      </Routes>
    </BrowserRouter>
  );
}
