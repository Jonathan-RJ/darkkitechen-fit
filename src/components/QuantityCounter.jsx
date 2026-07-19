export default function QuantityCounter({ value, min = 0, max = 99, onChange, label }) {
  const decrease = () => onChange(Math.max(min, value - 1));
  const increase = () => onChange(Math.min(max, value + 1));

  return (
    <div className="quantity" aria-label={label}>
      <button type="button" onClick={decrease} disabled={value <= min} aria-label={`Disminuir ${label}`}>
        -
      </button>
      <span>{value}</span>
      <button type="button" onClick={increase} disabled={value >= max} aria-label={`Aumentar ${label}`}>
        +
      </button>
    </div>
  );
}
