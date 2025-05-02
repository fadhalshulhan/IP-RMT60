// components/LoadingSpinnerLottie.jsx
import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function LoadingSpinnerLottie({ size = 48, className = "" }) {
  return (
    <DotLottieReact
      src="https://lottie.host/b2bc56f7-233c-4f46-9e3f-bce27faf11fa/2fU3X2ar7a.lottie"
      loop
      autoplay
      style={{ width: size, height: size }}
      className={className}
    />
  );
}
