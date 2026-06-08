import { Download } from "lucide-react";
import { useState } from "react";
import { downloadCsv } from "./csv-utils";

interface ExportCsvButtonProps<T extends object> {
  fileName: string;
  rows?: T[];
  getRows?: () => Promise<T[]>;
  label?: string;
}

/** Renders a reusable CSV export button for chart and table datasets. */
export function ExportCsvButton<T extends object>({
  fileName,
  rows = [],
  getRows,
  label = "Export CSV",
}: ExportCsvButtonProps<T>): React.JSX.Element {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!getRows) {
      downloadCsv(fileName, rows);
      return;
    }

    setIsExporting(true);
    try {
      downloadCsv(fileName, await getRows());
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      disabled={isExporting}
      onClick={() => void handleExport()}
      className="ui-export-btn inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm font-semibold transition-smooth"
    >
      <Download className="h-4 w-4" />
      {isExporting ? "Exporting…" : label}
    </button>
  );
}
