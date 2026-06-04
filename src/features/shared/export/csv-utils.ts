/** Converts an array of objects into CSV content with stable column order. */
export function toCsv<T extends object>(rows: T[]): string {
  if (rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0] as Record<string, unknown>);
  const escapeCell = (value: unknown): string => {
    const stringValue = String(value ?? "");
    const escaped = stringValue.replace(/"/g, '""');
    return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
  };

  const lines = [headers.join(",")];
  rows.forEach((row) => {
    const rowMap = row as Record<string, unknown>;
    lines.push(headers.map((header) => escapeCell(rowMap[header])).join(","));
  });

  return lines.join("\n");
}

/** Downloads object rows as a CSV file in the browser. */
export function downloadCsv<T extends object>(fileName: string, rows: T[]): void {
  const csv = toCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
