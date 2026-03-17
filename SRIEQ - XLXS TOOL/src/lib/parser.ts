import * as XLSX from "xlsx";
import type { ParsedFile } from "../types";

function deduplicateHeaders(headers: string[]): string[] {
  const seen = new Map<string, number>();

  return headers.map((h) => {
    const key = h ?? "";
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);
    return count === 0 ? key : `${key}__${count + 1}`;
  });
}

export function parseXlsx(file: File): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("Fichier vide ou illisible");

        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const range = XLSX.utils.decode_range(sheet["!ref"] ?? "A1");
        const numCols = range.e.c + 1;
        const numRows = range.e.r + 1;

        const rawRows: string[][] = [];

        for (let r = 0; r < numRows; r++) {
          const row: string[] = [];
          for (let c = 0; c < numCols; c++) {
            const cellAddress = XLSX.utils.encode_cell({ r, c });
            const cell = sheet[cellAddress];
            row.push(cell ? String(cell.w ?? cell.v ?? "") : "");
          }
          rawRows.push(row);
        }

        if (rawRows.length === 0)
          throw new Error("Aucune donnée trouvée dans le fichier");

        const rawHeaders = rawRows[0];
        const headers = deduplicateHeaders(rawHeaders);

        const rows = rawRows.slice(1).map((row) => {
          const mapped: Record<string, string> = {};
          headers.forEach((header, i) => {
            mapped[header] = row[i] ?? "";
          });
          return mapped;
        });

        resolve({ headers, rawHeaders, rows });
      } catch (err) {
        reject(
          err instanceof Error ? err : new Error("Erreur lors du parsing"),
        );
      }
    };

    reader.onerror = () =>
      reject(new Error("Erreur lors de la lecture du fichier"));
    reader.readAsArrayBuffer(file);
  });
}
