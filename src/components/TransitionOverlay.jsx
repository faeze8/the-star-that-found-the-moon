export default function TransitionOverlay({ active }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        pointerEvents: "none",
        opacity: active ? 1 : 0,
        transition: "opacity 1.5s ease",
        zIndex: 9999,
      }}
    />
  );
}