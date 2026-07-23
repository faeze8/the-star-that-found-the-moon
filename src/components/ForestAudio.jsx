import { useEffect, useRef } from "react";

export default function ForestAudio() {

  const audioRef = useRef(null);

  useEffect(() => {

    let started = false;

    const startAudio = () => {

      if (started) return;

      started = true;

      if (audioRef.current) {

        audioRef.current.volume = 0.18;

        audioRef.current.play()
          .catch(() => {});

      }

    };

    window.addEventListener(
      "scroll",
      startAudio,
      { once: true }
    );

    return () =>
      window.removeEventListener(
        "scroll",
        startAudio
      );

  }, []);

  return (
    <audio
      ref={audioRef}
      src="/sounds/forest-ambient.mp3"
      loop
    />
  );
}