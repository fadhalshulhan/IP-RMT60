import { useState, useEffect } from "react";

const TimeAgo = ({ updatedAt }) => {
  const [timeString, setTimeString] = useState("");

  const calculateTimeAgo = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) {
      return "Tidak diketahui";
    }

    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    // Baru saja (<1 menit)
    if (seconds < 60) {
      return "Baru saja";
    }
    // Kurang dari 1 jam (1-59 menit)
    else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} menit yang lalu`;
    }
    // Kurang dari 1 hari (1-23 jam)
    else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `${hours} jam yang lalu`;
    }
    // Kemarin (1 hari lalu)
    else if (seconds < 172800) {
      // 2 hari = 172800 detik
      return "Kemarin";
    }
    // Kurang dari 7 hari (2-6 hari lalu)
    else if (seconds < 604800) {
      // 7 hari = 604800 detik
      const days = Math.floor(seconds / 86400);
      return `${days} hari yang lalu`;
    } else {
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  };

  useEffect(() => {
    if (!updatedAt) {
      setTimeString("Tidak diketahui");
      return;
    }

    setTimeString(calculateTimeAgo(updatedAt));

    const date = new Date(updatedAt);
    const secondsSince = Math.floor((new Date() - date) / 1000);

    if (secondsSince < 86400) {
      const interval = setInterval(() => {
        setTimeString(calculateTimeAgo(updatedAt));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [updatedAt]);

  return <span>{timeString}</span>;
};

export default TimeAgo;
