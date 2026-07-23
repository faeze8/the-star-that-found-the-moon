import { Link } from "react-router-dom";
import "../styles/lyra.css";

export default function Lyra() {

  const relics = [
    {
      name: "Vega",
      title: "The Bright Singer"
    },
    {
      name: "Sheliak",
      title: "Keeper of Echoes"
    },
    {
      name: "Sulafat",
      title: "Crystal Voice"
    }
  ];

  return (
    <div className="lyra-page">

      <div className="floating-note note1">
        🎵
      </div>

      <div className="floating-note note2">
        ✨
      </div>

      <div className="floating-note note3">
        🎶
      </div>

      <div className="floating-note note4">
        💜
      </div>

      <section className="lyra-hero">

        <div className="lyra-icon">
          🎼
        </div>

        <h1>LYRA</h1>

        <h2>
          The Celestial Harp
        </h2>

      </section>

      <section className="music-card">

        <h3>
          🎵 Song of the Stars
        </h3>

        <p>
          Long ago, Lyra's music was said
          to calm storms, guide lost souls,
          and awaken sleeping forests.

          Even now, its melody drifts
          through the heavens.
        </p>

      </section>

      <section className="crystal-area">

        <div className="crystal">
          🔮
        </div>

        <div className="crystal">
          ✨
        </div>

        <div className="crystal">
          💎
        </div>

      </section>

      <section className="lyra-stars">

        <h3>
          ⭐ Harmonic Stars
        </h3>

        <div className="star-grid">

          {relics.map((star) => (

            <div
              key={star.name}
              className="star-card"
            >

              <div className="star-symbol">
                ✦
              </div>

              <h4>{star.name}</h4>

              <p>{star.title}</p>

            </div>

          ))}

        </div>

      </section>

      <section className="portal-box">

        <h3>
          🌸 The Crystal Garden
        </h3>

        <p>
          Somewhere beyond the stars,
          a magical garden hums
          with Lyra's forgotten songs...
        </p>

        <Link
          to="/lyra/realm"
          className="garden-btn"
        >
          🌸 Enter The Crystal Garden
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