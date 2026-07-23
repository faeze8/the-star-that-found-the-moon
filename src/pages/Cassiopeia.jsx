import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/cassiopeia.css";

export default function Cassiopeia() {

  const navigate = useNavigate();

  const [leaving, setLeaving] = useState(false);

  const jewels = [
    {
      name: "Schedar",
      title: "Royal Heart"
    },
    {
      name: "Caph",
      title: "Crown Light"
    },
    {
      name: "Ruchbah",
      title: "Sky Jewel"
    }
  ];

  const handleEnter = () => {

    setLeaving(true);

    setTimeout(() => {

      navigate("/cassiopeia/museum");

    }, 1200);

  };

  return (
    <div className="cass-page">

      <div className="crown crown1">👑</div>
      <div className="crown crown2">✨</div>
      <div className="crown crown3">💎</div>

      <section className="cass-hero">

        <div className="queen-icon">
          👑
        </div>

        <h1>CASSIOPEIA</h1>

        <h2>
          Queen Of The Celestial Throne
        </h2>

      </section>

      <section className="royal-card">

        <h3>
          👑 Royal Legend
        </h3>

        <p>
          Cassiopeia was a queen whose beauty
          became legend among mortals and gods.

          Her throne was lifted into the stars,
          where she shines forever across the sky.
        </p>

      </section>

      <section className="throne">

        <div>👑</div>
        <div>✨</div>
        <div>💎</div>
        <div>✨</div>
        <div>👑</div>

      </section>

      <section className="royal-stars">

        <h3>
          💎 Crown Jewels
        </h3>

        <div className="jewel-grid">

          {jewels.map((star) => (

            <div
              key={star.name}
              className="jewel-card"
            >

              <div className="jewel-symbol">
                💎
              </div>

              <h4>{star.name}</h4>

              <p>{star.title}</p>

            </div>

          ))}

        </div>

      </section>

      <section className="palace-box">

        <h3>
          🏰 Palace Beyond The Stars
        </h3>

        <p>
          Hidden among celestial clouds lies
          the forgotten palace of the queen...
        </p>

        <button
          onClick={handleEnter}
          className="palace-btn"
        >
          👑 Enter The Museum
        </button>

      </section>

      <Link
        to="/galaxy"
        className="back-btn"
      >
        ← Return To Galaxy
      </Link>

      <div
        className={`fade-screen ${
          leaving ? "active" : ""
        }`}
      />

    </div>
  );
}