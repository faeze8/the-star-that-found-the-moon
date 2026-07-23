import { useEffect, useRef } from "react";

export default function WindAudio() {

  const ref = useRef();

  useEffect(() => {

    let started = false;

    const start = () => {

      if (started) return;

      started = true;

      ref.current.volume = 0.2;

      ref.current.play()
        .catch(() => {});

    };

    window.addEventListener(
      "scroll",
      start,
      { once: true }
    );

  }, []);

  return (
    <audio
      ref={ref}
      src="/sounds/wind.mp3"
      loop
    />
  );
}