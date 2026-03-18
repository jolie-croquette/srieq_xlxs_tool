import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import type { Schema, TargetColumn } from "../types";

interface SchemaViewerProps {
  schema: Schema;
  onSchemaUpdate: (columns: TargetColumn[]) => void;
}

export function SchemaViewer({ schema }: SchemaViewerProps) {
  const navigate = useNavigate();

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">
          Schéma attendu
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {schema.columns.length} colonnes
          </span>
          <button
            onClick={() => navigate("/schema")}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-2.5 py-1 transition-colors cursor-pointer bg-transparent"
          >
            <Pencil className="w-3 h-3" />
            Modifier
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide w-12">
                #
              </th>
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                Colonne
              </th>
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                Clé
              </th>
            </tr>
          </thead>
          <tbody>
            {schema.columns.map((col, i) => (
              <tr
                key={col.key}
                className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-5 py-2 text-xs font-mono text-gray-300">
                  {i + 1}
                </td>
                <td className="px-5 py-2 text-gray-900">{col.label}</td>
                <td className="px-5 py-2 font-mono text-xs text-gray-400">
                  {col.key}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
