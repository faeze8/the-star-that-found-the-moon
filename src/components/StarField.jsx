export default function StarField() {
  const stars = Array.from({ length: 120 });

  return (
    <div className="star-field">
      {stars.map((_, index) => (
        <span
          key={index}
          className="star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
}