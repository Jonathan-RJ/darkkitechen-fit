export const formatMoney = (value, currency = "MXN") =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

export const roundMacro = (value) => {
  const number = Number(value) || 0;
  return Number.isInteger(number) ? number : Number(number.toFixed(1));
};

export const formatMacro = (value, unit) => `${roundMacro(value)} ${unit}`;

export const joinNames = (items) => {
  const names = items.filter(Boolean);
  if (names.length === 0) return "Sin seleccionar";
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} y ${names.at(-1)}`;
};

export const titleCase = (value) =>
  value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : "";

export const formatDateTime = (value = new Date()) =>
  new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeStyle: "short"
  }).format(new Date(value));
