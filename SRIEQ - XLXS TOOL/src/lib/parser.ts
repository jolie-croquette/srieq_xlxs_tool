import xlsx from "xlsx";
import type { ParsedFile } from "../types";

export function parseXlsx(file: File): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("Fichier vide ou illisible");

        const workbook = xlsx.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rows = xlsx.utils.sheet_to_json<Record<string, string>>(sheet, {
          defval: "",
        });

        if (rows.length === 0)
          throw new Error("Aucune donnée trouvée dans le fichier");

        const headers = Object.keys(rows[0]);

        resolve({ headers, rows });
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
