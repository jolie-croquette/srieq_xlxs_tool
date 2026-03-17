import * as XLSX from "xlsx";
import type { ColumnMapping, ParsedFile } from "../types";

function stripSuffix(header: string): string {
  return header.replace(/__\d+$/, "");
}

export function exportXlsx(file: ParsedFile, mappings: ColumnMapping[]): void {
  const validMappings = mappings.filter(
    (m): m is ColumnMapping & { sourceHeader: string } =>
      m.sourceHeader !== null,
  );

  // Colonnes du schéma en premier (dans l'ordre cible)
  const schemaHeaders = validMappings.map((m) => m.sourceHeader);

  // Reste des colonnes source non incluses dans le schéma
  const remainingHeaders = file.headers.filter(
    (h) => !schemaHeaders.includes(h),
  );

  const allHeaders = [...schemaHeaders, ...remainingHeaders];

  const rows = file.rows.map((row) => {
    const mappedRow: Record<string, string> = {};

    for (const header of allHeaders) {
      const cleanLabel = stripSuffix(header);
      mappedRow[cleanLabel] = row[header] ?? "";
    }

    return mappedRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  XLSX.writeFile(workbook, "output.xlsx");
}
