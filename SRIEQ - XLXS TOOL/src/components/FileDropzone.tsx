import { useCallback, useState, useRef } from "react";
import { Upload } from "lucide-react";

interface FileDropzoneProps {
  onFileParsed: (file: File) => void;
}

export function FileDropzone({ onFileParsed }: FileDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.match(/\.(xlsx|xls)$/)) return;
      onFileParsed(file);
    },
    [onFileParsed],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div
      onDrop={onDrop}
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
        onChange={onInputChange}
        className="hidden"
      />
      <div
        className={`
        w-10 h-10 mx-auto mb-4 rounded-lg border flex items-center justify-center transition-colors
        ${isDragActive ? "border-gray-400 bg-white" : "border-gray-200 bg-white"}
      `}
      >
        <Upload className="w-5 h-5 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-700 mb-1">
        {isDragActive
          ? "Dépose le fichier ici..."
          : "Glisse ton fichier .xlsx ici"}
      </p>
      <p className="text-xs text-gray-400">ou clique pour parcourir</p>
    </div>
  );
}
