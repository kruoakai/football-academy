export default function FounderPlaceholder({
  initials,
  className = "",
}: {
  initials: string;
  className?: string;
}) {
  return (
    <div
      className={`flex aspect-square w-full items-center justify-center rounded-2xl bg-gradient-to-br from-pitch-700 to-pitch-950 ${className}`}
      role="img"
      aria-label="รูปประจำตัวชั่วคราว รอรูปภาพจริง"
    >
      <span className="font-heading text-5xl font-bold text-gold-400 sm:text-6xl">
        {initials}
      </span>
    </div>
  );
}
