import { useEffect, useRef } from "react";

export default function SnowFootstepsAudio() {

  const ref = useRef();

  useEffect(() => {

    let timeout;

    const handle = () => {

      ref.current.pause();

      ref.current.currentTime = 0;

      ref.current.play()
        .catch(() => {});

      clearTimeout(timeout);

      timeout = setTimeout(() => {

        ref.current.pause();

      }, 350);

    };

    window.addEventListener(
      "scroll",
      handle
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handle
      );

  }, []);

  return (
    <audio
      ref={ref}
      src="/sounds/snow-step.mp3"
    />
  );
}