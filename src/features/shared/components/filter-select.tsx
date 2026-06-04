interface FilterSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

/** Renders a themed select control for filters. */
export function FilterSelect({
  label,
  value,
  options,
  onChange,
}: FilterSelectProps): React.JSX.Element {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-ui-label text-xs font-semibold tracking-wide">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
