import { ArrowRight } from "lucide-react";
import type { ColumnMapping } from "../types";

interface MappingResultCardProps {
  mappings: ColumnMapping[];
}

const badgeClass = (confidence: ColumnMapping["confidence"]) => {
  if (confidence === "exact") return "bg-green-100 text-green-800";
  if (confidence === "fuzzy") return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
};

export function MappingResultCard({ mappings }: MappingResultCardProps) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2.5">
        <div className="w-2 h-2 rounded-full bg-green-600 flex-shrink-0" />
        <span className="text-sm font-medium text-gray-900">
          Traitement complété
        </span>
        <span className="ml-auto text-xs text-gray-400">
          {mappings.length} colonnes mappées
        </span>
      </div>

      <div className="px-5 py-4 flex flex-col gap-2.5">
        {mappings.map((m) => (
          <div key={m.targetKey} className="flex items-center gap-2 text-sm">
            <span className="font-mono text-xs text-gray-400 flex-1 truncate">
              {m.sourceHeader ?? "—"}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
            <span className="text-gray-900 flex-1">{m.targetLabel}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${badgeClass(m.confidence)}`}
            >
              {m.confidence}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
