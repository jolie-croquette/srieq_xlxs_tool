import { RefreshCw, WifiOff } from "lucide-react";

interface SchemaStatusCardProps {
  status: "loading" | "error";
  error?: string | null;
  onRetry?: () => void;
}

export function SchemaStatusCard({
  status,
  error,
  onRetry,
}: SchemaStatusCardProps) {
  if (status === "loading") {
    return (
      <div className="border border-gray-200 rounded-xl p-8 flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Chargement du schéma...</p>
      </div>
    );
  }

  return (
    <div className="border border-red-200 bg-red-50 rounded-xl p-6 flex flex-col items-center gap-4 text-center">
      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
        <WifiOff className="w-5 h-5 text-red-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-red-800 mb-1">
          Impossible de charger le schéma
        </p>
        <p className="text-xs text-red-500 font-mono">{error}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 text-sm text-red-700 border border-red-200 rounded-lg px-4 py-2 hover:bg-red-100 transition-colors cursor-pointer bg-transparent"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Réessayer
        </button>
      )}
    </div>
  );
}
