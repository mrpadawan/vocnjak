interface Props {
  items: string[];
  className?: string;
  /** Tailwind classes for the dot separator. */
  dot?: string;
}

/** Infinite horizontal ticker. Content is duplicated so the -50% keyframe loops seamlessly. */
export default function Marquee({ items, className = '', dot = 'bg-apple-500' }: Props) {
  const row = (
    <>
      {items.map((item, i) => (
        <span key={i} className="flex shrink-0 items-center gap-8 pr-8">
          <span>{item}</span>
          <span className={`size-2.5 rounded-full ${dot}`} aria-hidden />
        </span>
      ))}
    </>
  );
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`} aria-hidden>
      <div className="flex w-max animate-marquee">
        <div className="flex">{row}</div>
        <div className="flex">{row}</div>
      </div>
    </div>
  );
}
