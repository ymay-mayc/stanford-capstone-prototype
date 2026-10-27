export function HeartButton({
  pressed,
  label,
  onClick,
}: {
  pressed: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={pressed ? "heart heart--on" : "heart"}
      aria-pressed={pressed}
      aria-label={label}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20.2s-6.6-4.2-9.1-8C1.1 9.8 1.6 6.6 4.1 5.3 6.2 4.2 8.3 4.8 12 8.1c3.7-3.3 5.8-3.9 7.9-2.8 2.5 1.3 3 4.5 1.2 6.9-2.5 3.8-9.1 8-9.1 8z" />
      </svg>
    </button>
  );
}
