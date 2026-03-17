import * as XLSX from "xlsx";
import type { ColumnMapping, ParsedFile } from "../types";

export function exportXlsx(file: ParsedFile, mappings: ColumnMapping[]): void {
  const validMappings = mappings.filter(
    (m): m is ColumnMapping & { sourceHeader: string } =>
      m.sourceHeader !== null,
  );

  const rows = file.rows.map((row) => {
    const mappedRow: Record<string, string> = {};

    for (const mapping of validMappings) {
      mappedRow[mapping.targetLabel] = row[mapping.sourceHeader] ?? "";
    }

    return mappedRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  XLSX.writeFile(workbook, "output.xlsx");
}
