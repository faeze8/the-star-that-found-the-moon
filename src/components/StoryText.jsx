export default function StoryText({
  text,
  visible
}) {

  return (
    <div
      className={`story-text ${
        visible ? "show" : ""
      }`}
    >
      {text}
    </div>
  );
}