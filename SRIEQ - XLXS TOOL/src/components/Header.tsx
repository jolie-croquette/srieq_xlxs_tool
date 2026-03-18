import { useNavigate } from "react-router-dom";
import { Settings, SlidersHorizontal } from "lucide-react";

type Tab = "tool" | "schema";

interface HeaderProps {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function Header({ tab, onTabChange }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">
        SRIEQ
      </p>
      <h1 className="text-2xl font-medium text-gray-900">Reformatteur XLSX</h1>
      <p className="text-sm text-gray-500 mt-1">
        Importe un fichier, reçois le fichier corrigé.
      </p>

      <div className="flex items-center mt-4 border-b border-gray-100">
        {(["tool", "schema"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => onTabChange(t)}
            className={`text-sm px-4 py-2 border-b-2 transition-colors cursor-pointer bg-transparent ${
              tab === t
                ? "border-gray-900 text-gray-900 font-medium"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {t === "tool" ? "Outil" : "Schéma attendu"}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2 mb-1">
          <button
            onClick={() => navigate("/config")}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors cursor-pointer bg-transparent"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Configuration
          </button>
          <button
            onClick={() => navigate("/schema")}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors cursor-pointer bg-transparent"
          >
            <Settings className="w-3.5 h-3.5" />
            Modifier le schéma
          </button>
        </div>
      </div>
    </div>
  );
}
