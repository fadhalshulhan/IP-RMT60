// components/LoadingSpinnerLottie.jsx
import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function LoadingSpinnerLottie({ size = 32, className = "" }) {
  return (
    <DotLottieReact
      src="https://lottie.host/a68f381b-cfab-4715-8025-8d7b371d0849/bb7BXsc6ll.lottie"
      loop
      autoplay
      style={{ width: size, height: size }}
      className={className}
    />
  );
}
