import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Check, AlertTriangle } from "lucide-react";
import { parseXlsx } from "../lib/parser";
import { saveSchema } from "../lib/schemaApi";
import type { TargetColumn } from "../types";

type PageState = "idle" | "preview" | "saving" | "success" | "error";

export function ConfigPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<PageState>("idle");
  const [columns, setColumns] = useState<TargetColumn[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    try {
      const parsed = await parseXlsx(file);

      const newColumns: TargetColumn[] = parsed.rawHeaders
        .filter((h) => h.trim() !== "")
        .map((h) => ({
          key: h
            .toLowerCase()
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, ""),
          label: h,
          required: false,
          aliases: [],
        }));

      setColumns(newColumns);
      setState("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setState("error");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleConfirm = async () => {
    setState("saving");
    try {
      await saveSchema(columns);
      setState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setState("error");
    }
  };

  const handleReset = () => {
    setState("idle");
    setColumns([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Topbar */}
      <div className="border-b border-gray-100 px-8 py-4 flex items-center gap-4 sticky top-0 bg-white z-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer bg-transparent border-none p-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <div className="h-4 w-px bg-gray-200" />
        <div>
          <span className="text-sm font-medium text-gray-900">
            Configuration
          </span>
          <span className="ml-2 text-xs text-gray-400">
            Import d'un schéma de référence
          </span>
        </div>
      </div>

      <div className="px-8 py-8 max-w-2xl mx-auto flex flex-col gap-6">
        {/* Idle — dropzone */}
        {state === "idle" && (
          <>
            <div>
              <h2 className="text-base font-medium text-gray-900 mb-1">
                Importer un fichier de référence
              </h2>
              <p className="text-sm text-gray-500">
                Le schéma sera remplacé par les colonnes du fichier importé.
                L'ordre des colonnes sera conservé.
              </p>
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragActive(true);
              }}
              onDragLeave={() => setIsDragActive(false)}
              onClick={() => inputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-colors
                ${
                  isDragActive
                    ? "border-gray-400 bg-gray-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }
              `}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleInputChange}
                className="hidden"
              />
              <div className="w-10 h-10 mx-auto mb-4 rounded-lg border border-gray-200 bg-white flex items-center justify-center">
                <Upload className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                {isDragActive
                  ? "Dépose le fichier ici..."
                  : "Glisse ton fichier .xlsx de référence ici"}
              </p>
              <p className="text-xs text-gray-400">ou clique pour parcourir</p>
            </div>
          </>
        )}

        {/* Preview */}
        {state === "preview" && (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-medium text-gray-900 mb-1">
                  Aperçu du nouveau schéma
                </h2>
                <p className="text-sm text-gray-500">
                  {columns.length} colonnes détectées. Le schéma actuel sera
                  remplacé.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="text-sm text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-4 py-2 transition-colors cursor-pointer bg-transparent"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex items-center gap-1.5 text-sm font-medium bg-gray-900 text-white rounded-lg px-4 py-2 hover:bg-gray-700 transition-colors cursor-pointer border-none"
                >
                  <Check className="w-3.5 h-3.5" />
                  Confirmer et sauvegarder
                </button>
              </div>
            </div>

            <div className="border border-amber-100 bg-amber-50 rounded-xl px-4 py-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                Cette action remplacera définitivement le schéma actuel dans
                Supabase.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-100 grid grid-cols-[40px_1fr_160px] px-4 py-2.5">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  #
                </span>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Label
                </span>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Clé générée
                </span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {columns.map((col, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-[40px_1fr_160px] px-4 py-2.5 text-sm border-b border-gray-50 last:border-0 ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <span className="text-xs font-mono text-gray-300">
                      {i + 1}
                    </span>
                    <span className="text-gray-900">{col.label}</span>
                    <span className="text-xs font-mono text-gray-400">
                      {col.key}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Saving */}
        {state === "saving" && (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Sauvegarde en cours...</p>
          </div>
        )}

        {/* Success */}
        {state === "success" && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-base font-medium text-gray-900 mb-1">
                Schéma mis à jour
              </p>
              <p className="text-sm text-gray-500">
                {columns.length} colonnes sauvegardées avec succès.
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-4 py-2 transition-colors cursor-pointer bg-transparent mt-2"
            >
              Retour à l'accueil
            </button>
          </div>
        )}

        {/* Error */}
        {state === "error" && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-base font-medium text-red-800 mb-1">Erreur</p>
              <p className="text-xs font-mono text-red-500">{error}</p>
            </div>
            <button
              onClick={handleReset}
              className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-4 py-2 transition-colors cursor-pointer bg-transparent"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
