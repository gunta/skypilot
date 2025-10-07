interface Props {
  className?: string;
  size?: number;
}

export default function Logo({ className = "w-8 h-8", size = 32 }: Props) {
  return (
    <picture>
      <source srcSet="/skypilot/skypilotlogo.webp" type="image/webp" />
      <source srcSet="/skypilot/skypilotlogo.png" type="image/png" />
      <img
        src="/skypilot/skypilotlogo.svg"
        alt="Sky Pilot Logo"
        className={className}
        width={size}
        height={size}
        loading="eager"
      />
    </picture>
  );
}
