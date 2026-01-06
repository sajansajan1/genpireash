// utils/formatUSD.js

export function formatUSD(value: any) {
  const formatNumber = (num: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);

  // Handle range like "1000-12000" or "$1000-$12000 USD"
  if (typeof value === "string" && value.includes("-")) {
    const parts = value.split("-").map((part) => parseFloat(part.replace(/[^0-9.]+/g, "")));

    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return `${formatNumber(parts[0])}–${formatNumber(parts[1])} USD`;
    }
  }

  // Handle single number
  if (typeof value === "string") {
    const numericString = value.replace(/[^0-9.]+/g, "");
    value = parseFloat(numericString);
  }

  if (typeof value !== "number" || isNaN(value)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
