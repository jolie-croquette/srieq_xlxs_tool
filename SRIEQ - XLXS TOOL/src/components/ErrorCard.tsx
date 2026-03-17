interface ErrorCardProps {
  message: string;
  onReset: () => void;
}

export function ErrorCard({ message, onReset }: ErrorCardProps) {
  return (
    <div className="border border-red-200 bg-red-50 rounded-xl p-5">
      <p className="text-sm font-medium text-red-800 mb-1">
        Erreur lors du traitement
      </p>
      <p className="text-sm text-red-600 mb-4">{message}</p>
      <button
        onClick={onReset}
        className="text-sm text-red-700 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-100 transition-colors cursor-pointer bg-transparent"
      >
        Réessayer
      </button>
    </div>
  );
}
