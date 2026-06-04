import { Download } from "lucide-react";
import { downloadCsv } from "./csv-utils";

interface ExportCsvButtonProps<T extends object> {
  fileName: string;
  rows: T[];
  label?: string;
}

/** Renders a reusable CSV export button for chart and table datasets. */
export function ExportCsvButton<T extends object>({
  fileName,
  rows,
  label = "Export CSV",
}: ExportCsvButtonProps<T>): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={() => downloadCsv(fileName, rows)}
      className="ui-export-btn inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm font-semibold transition-smooth"
    >
      <Download className="h-4 w-4" />
      {label}
    </button>
  );
}
