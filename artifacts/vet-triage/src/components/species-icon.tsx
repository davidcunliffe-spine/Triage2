import { PawPrint, Dog, Cat, Bird, Rabbit, Snail, Fish, Bug } from "lucide-react";
import type { Species } from "@workspace/api-client-react";

interface SpeciesIconProps {
  species: Species;
  className?: string;
}

export function SpeciesIcon({ species, className = "h-5 w-5" }: SpeciesIconProps) {
  const normalized = species.toLowerCase();
  
  if (normalized.includes("dog")) return <Dog className={className} />;
  if (normalized.includes("cat")) return <Cat className={className} />;
  if (normalized.includes("bird") || normalized.includes("avian")) return <Bird className={className} />;
  if (normalized.includes("rabbit") || normalized.includes("bunny")) return <Rabbit className={className} />;
  if (normalized.includes("reptile") || normalized.includes("snake") || normalized.includes("lizard")) return <Snail className={className} />;
  if (normalized.includes("fish")) return <Fish className={className} />;
  if (normalized.includes("insect") || normalized.includes("bug")) return <Bug className={className} />;
  
  return <PawPrint className={className} />;
}
