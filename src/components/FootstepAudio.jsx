import { useEffect, useRef } from "react";

export default function FootstepAudio() {

  const audioRef = useRef(null);

  useEffect(() => {

    let lastScroll = window.scrollY;
    let timeout;

    const handleScroll = () => {

      const current = window.scrollY;

      if (
        Math.abs(current - lastScroll) > 5
      ) {

        if (
          audioRef.current &&
          audioRef.current.paused
        ) {

          audioRef.current.volume = 0.12;

          audioRef.current.play()
            .catch(() => {});
        }

        clearTimeout(timeout);

        timeout = setTimeout(() => {

          if (audioRef.current) {

            audioRef.current.pause();
            audioRef.current.currentTime = 0;

          }

        }, 300);

      }

      lastScroll = current;

    };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );

  }, []);

  return (
    <audio
      ref={audioRef}
      loop
      src="/sounds/footsteps.mp3"
    />
  );
}