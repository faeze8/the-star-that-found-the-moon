import { Link } from "react-router-dom";
import "../styles/orion.css";

export default function Orion() {

  const stars = [
    {
      name: "Betelgeuse",
      type: "The Red Giant"
    },
    {
      name: "Rigel",
      type: "Blue Supergiant"
    },
    {
      name: "Bellatrix",
      type: "Warrior Star"
    },
    {
      name: "Saiph",
      type: "Sword Keeper"
    }
  ];

  return (
    <div className="orion-page">

      <div className="moon">🌙</div>
      <div className="sparkle s1">✨</div>
      <div className="sparkle s2">⭐</div>
      <div className="sparkle s3">✨</div>

      <section className="hero">

        <div className="hunter-icon">
          🏹
        </div>

        <h1>ORION</h1>

        <h2>
          The Hunter Who Walks Among Stars
        </h2>

      </section>

      <section className="legend-card">

        <h3>📜 Ancient Legend</h3>

        <p>
          Long before kingdoms rose and fell,
          Orion hunted beneath the moonlit sky.

          The gods placed his spirit among
          the stars so travelers would never
          lose their path in darkness.
        </p>

      </section>

      <section className="star-guardians">

        <h3>⭐ Star Guardians</h3>

        <div className="guardian-grid">

          {stars.map((star) => (

            <div
              key={star.name}
              className="guardian-card"
            >

              <div className="guardian-star">
                ✦
              </div>

              <h4>{star.name}</h4>

              <p>{star.type}</p>

            </div>

          ))}

        </div>

      </section>

      <section className="forest-teaser">

        <div className="forest-box">

          <div className="forest-emoji">
            🌲🌲🌲
          </div>

          <h3>
            Beyond The Constellation
          </h3>

          <p>
            A forgotten forest waits beneath
            Orion's stars...
          </p>

          <Link
            to="/orion/realm"
            className="forest-btn"
          >
            🌙 Walk Into The Forest
          </Link>

        </div>

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