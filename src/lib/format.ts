const numberFormatters = new Map<string, Intl.NumberFormat>();

function getFormatter(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = locale + JSON.stringify(options);
  let f = numberFormatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, options);
    numberFormatters.set(key, f);
  }
  return f;
}

export function formatNumber(value: number, locale = "en-US", digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  return getFormatter(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatCurrency(value: number, locale = "en-US"): string {
  if (!Number.isFinite(value)) return "—";
  return getFormatter(locale, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, locale = "en-US", digits = 1): string {
  if (!Number.isFinite(value)) return "—";
  return getFormatter(locale, {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}
