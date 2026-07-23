import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Galaxy from "./pages/Galaxy";

import Orion from "./pages/Orion";
import Lyra from "./pages/Lyra";
import Cassiopeia from "./pages/Cassiopeia";
import Draco from "./pages/Draco";

import OrionRealm from "./pages/OrionRealm";
import LyraRealm from "./pages/LyraRealm";

import MuseumJourney from "./pages/MuseumJourney";
import CabinJourney from "./pages/CabinJourney";

function App() {
  return (
    <Routes>

      <Route path="/" element={<Landing />} />

      <Route path="/galaxy" element={<Galaxy />} />

      <Route path="/orion" element={<Orion />} />
      <Route path="/lyra" element={<Lyra />} />
      <Route path="/cassiopeia" element={<Cassiopeia />} />
      <Route path="/draco" element={<Draco />} />

      <Route path="/orion/realm" element={<OrionRealm />} />
      <Route path="/lyra/realm" element={<LyraRealm/>}/>

      {/* فعلاً تا فایل‌های واقعی را ببینیم */}
      <Route path="/cassiopeia/museum" element={<MuseumJourney />} />
      <Route path="/draco/realm" element={<CabinJourney />} />

    </Routes>
  );
}

export default App;