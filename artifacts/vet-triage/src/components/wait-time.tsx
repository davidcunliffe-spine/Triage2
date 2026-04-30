import { useState, useEffect } from "react";
import { differenceInMinutes, differenceInSeconds } from "date-fns";

interface WaitTimeProps {
  arrivedAt: string;
  className?: string;
  format?: "minutes" | "short" | "long";
}

export function WaitTime({ arrivedAt, className, format = "short" }: WaitTimeProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Tick every second to keep the display perfectly accurate
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const arrival = new Date(arrivedAt);
  const diffSecs = differenceInSeconds(now, arrival);
  const diffMins = Math.floor(diffSecs / 60);

  if (format === "minutes") {
    return <span className={className}>{diffMins}m</span>;
  }

  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  let display = "";
  if (hours > 0) {
    display = format === "long" ? `${hours}h ${mins}m` : `${hours}h ${mins}m`;
  } else {
    display = `${mins}m`;
  }

  return <span className={className}>{display}</span>;
}
