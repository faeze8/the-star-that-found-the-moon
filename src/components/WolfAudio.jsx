import { useEffect, useRef } from "react";

export default function WolfAudio() {

  const audioRef = useRef(null);

  useEffect(() => {

    let started = false;
    let interval;

    const startWolf = () => {

      if (started) return;

      started = true;

      interval = setInterval(() => {

        if (!audioRef.current) return;

        audioRef.current.volume = 0.15;

        audioRef.current.currentTime = 0;

        audioRef.current.play()
          .catch(() => {});

      }, 25000);

      // اولین زوزه بعد از 5 ثانیه
      setTimeout(() => {

        if (!audioRef.current) return;

        audioRef.current.volume = 0.15;

        audioRef.current.currentTime = 0;

        audioRef.current.play()
          .catch(() => {});

      }, 5000);

    };

    window.addEventListener(
      "scroll",
      startWolf,
      { once: true }
    );

    return () => {

      window.removeEventListener(
        "scroll",
        startWolf
      );

      clearInterval(interval);

    };

  }, []);

  return (
    <audio
      ref={audioRef}
      src="/sounds/wolf.mp3"
    />
  );
}