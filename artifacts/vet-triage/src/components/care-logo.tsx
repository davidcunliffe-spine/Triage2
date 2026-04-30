const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

interface CareLogoProps {
  className?: string;
  alt?: string;
}

export function CareLogo({ className, alt = "CARE — Centre for Animal Referral & Emergency" }: CareLogoProps) {
  return (
    <img
      src={`${basePath}/brand/care-logo.png`}
      alt={alt}
      className={className}
      draggable={false}
    />
  );
}

export function CareWordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="font-extrabold tracking-tight">CARE</span>
      <span className="font-medium opacity-80"> Triage</span>
    </span>
  );
}
