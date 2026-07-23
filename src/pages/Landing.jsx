import Fog from "../components/Fog";
import StarField from "../components/StarField";
import { motion } from "framer-motion";
import "../styles/landing.css";

export default function Landing() {
  return (
    <div className="landing">
      <StarField />

      <motion.h1>
        Happy Birthday
      </motion.h1>

      <motion.h2>
        Fatemeh
      </motion.h2>

     <button
  className="enter-button"
  onClick={() => window.location.href = "/galaxy"}
>
  Enter The Observatory
</button>
<StarField />
<Fog />
    </div>
  );
}