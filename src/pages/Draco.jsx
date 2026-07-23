import { Link } from "react-router-dom";
import "../styles/draco.css";

export default function Draco() {

  const relics = [
    {
      name: "Eltanin",
      title: "Dragon's Eye"
    },
    {
      name: "Rastaban",
      title: "Ancient Flame"
    },
    {
      name: "Thuban",
      title: "The Lost King"
    }
  ];

  return (
    <div className="draco-page">

      <div className="dragon d1">🐉</div>
      <div className="dragon d2">🔥</div>
      <div className="dragon d3">💚</div>
      <div className="dragon d4">✨</div>

      <section className="draco-hero">

        <div className="dragon-icon">
          🐉
        </div>

        <h1>DRACO</h1>

        <h2>
          The Ancient Dragon Of The Stars
        </h2>

      </section>

      <section className="dragon-card">

        <h3>
          🔥 Dragon Legend
        </h3>

        <p>
          Before kingdoms existed,
          Draco coiled around the northern sky.

          Its emerald scales reflected
          the light of distant stars,
          and its breath became
          celestial fire.
        </p>

      </section>

      <section className="fire-circle">

        <div>🔥</div>
        <div>💚</div>
        <div>🐉</div>
        <div>💚</div>
        <div>🔥</div>

      </section>

      <section className="dragon-stars">

        <h3>
          💎 Dragon Relics
        </h3>

        <div className="dragon-grid">

          {relics.map((star) => (

            <div
              key={star.name}
              className="dragon-box"
            >

              <div className="dragon-symbol">
                ✦
              </div>

              <h4>{star.name}</h4>

              <p>{star.title}</p>

            </div>

          ))}

        </div>

      </section>

      <section className="cave-box">

        <h3>
          ⛰ Dragon Caverns
        </h3>

        <p>
          Somewhere beyond the stars,
          hidden caves glow with
          emerald fire...
        </p>

        <Link
          to="/draco/realm"
          className="cave-btn"
        >
          🐉 Enter Dragon Realm
        </Link>

      </section>

      <Link
        to="/galaxy"
        className="back-btn"
      >
        ← Return To Galaxy
      </Link>

    </div>
  );
}
