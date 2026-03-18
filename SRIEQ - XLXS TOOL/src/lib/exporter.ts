import * as XLSX from "xlsx";
import type { ColumnMapping, ParsedFile } from "../types";

function stripSuffix(header: string): string {
  return header.replace(/__\d+$/, "");
}

export function exportXlsx(file: ParsedFile, mappings: ColumnMapping[]): void {
  // Index source utilisés par le schéma
  const usedSourceIndexes = new Set(
    mappings
      .filter((m) => m.sourceIndex !== null)
      .map((m) => m.sourceIndex as number),
  );

  // Colonnes source non utilisées par le schéma (par index)
  const remainingColumns = file.headers
    .map((h, i) => ({ header: h, index: i }))
    .filter(({ index }) => !usedSourceIndexes.has(index));

  // Ordre final : schéma en premier, reste après
  const orderedColumns: { header: string | null; label: string }[] = [
    ...mappings.map((m) => ({
      header: m.sourceHeader,
      label: m.sourceHeader ? stripSuffix(m.sourceHeader) : m.targetLabel,
    })),
    ...remainingColumns.map(({ header }) => ({
      header,
      label: stripSuffix(header),
    })),
  ];

  // Rebuild les headers dans l'ordre sans suffixes
  const orderedLabels = orderedColumns.map((col) => col.label);

  const worksheet = XLSX.utils.aoa_to_sheet([
    orderedLabels,
    ...file.rows.map((row) =>
      orderedColumns.map((col) => (col.header ? (row[col.header] ?? "") : "")),
    ),
  ]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, "output.xlsx");
}
