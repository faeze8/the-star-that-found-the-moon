import { useNavigate } from "react-router-dom";
import Fog from "../components/Fog";
import StarField from "../components/StarField";
import { motion } from "framer-motion";
import "../styles/landing.css";

export default function Landing() {
  const navigate = useNavigate();

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
        onClick={() => navigate("/galaxy")}
      >
        Enter The Observatory
      </button>

      <StarField />
      <Fog />
    </div>
  );
}