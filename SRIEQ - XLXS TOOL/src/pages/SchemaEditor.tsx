import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, Plus, Save, RotateCcw, Check } from "lucide-react";
import { useSchema } from "../hooks/useSchema";
import { saveSchema } from "../lib/schemaApi";
import { SchemaStatusCard } from "../components/SchemaStatusCard";
import type { TargetColumn } from "../types";

interface EditableColumn extends TargetColumn {
  _id: string;
}

function toEditable(columns: TargetColumn[]): EditableColumn[] {
  return columns.map((col, i) => ({ ...col, _id: `${col.key}_${i}` }));
}

const DotGrid = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="9" cy="5" r="1.5" />
    <circle cx="9" cy="12" r="1.5" />
    <circle cx="9" cy="19" r="1.5" />
    <circle cx="15" cy="5" r="1.5" />
    <circle cx="15" cy="12" r="1.5" />
    <circle cx="15" cy="19" r="1.5" />
  </svg>
);

const EditIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

interface SortableRowProps {
  col: EditableColumn;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (field: keyof TargetColumn, value: string | boolean) => void;
}

function SortableRow({
  col,
  index,
  isEditing,
  onEdit,
  onDelete,
  onUpdate,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: col._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const rowBg = isDragging
    ? "bg-blue-50 border border-blue-300 rounded-lg shadow-sm"
    : isEditing
      ? "bg-green-50"
      : index % 2 === 0
        ? "bg-white"
        : "bg-gray-50";

  return (
    <tr
      ref={setNodeRef}
      style={{ ...style, opacity: isDragging ? 0.85 : 1 }}
      className={`border-b border-gray-50 last:border-0 transition-colors ${rowBg}`}
    >
      {/* Drag handle */}
      <td className="px-3 py-3">
        <button
          {...attributes}
          {...listeners}
          className={`cursor-grab active:cursor-grabbing flex items-center bg-transparent border-none p-0 transition-colors ${
            isDragging ? "text-blue-400" : "text-gray-300 hover:text-gray-500"
          }`}
        >
          <DotGrid />
        </button>
      </td>

      {/* Position */}
      <td className="px-3 py-3 text-xs font-mono text-gray-300 w-10">
        {index + 1}
      </td>

      {/* Label */}
      <td className="px-4 py-3">
        {isEditing ? (
          <input
            type="text"
            value={col.label}
            onChange={(e) => onUpdate("label", e.target.value)}
            className="w-full text-sm border-2 border-green-400 rounded-lg px-3 py-1.5 outline-none bg-white text-gray-900"
            autoFocus
          />
        ) : (
          <span className="text-sm text-gray-900">{col.label}</span>
        )}
      </td>

      {/* Key */}
      <td className="px-4 py-3 w-44">
        {isEditing ? (
          <input
            type="text"
            value={col.key}
            onChange={(e) => onUpdate("key", e.target.value)}
            className="w-full text-xs font-mono border-2 border-green-400 rounded-lg px-3 py-1.5 outline-none bg-white text-gray-700"
          />
        ) : (
          <span className="text-xs font-mono text-gray-400">{col.key}</span>
        )}
      </td>

      {/* Required */}
      <td className="px-4 py-3 text-center w-20">
        <button
          onClick={() => onUpdate("required", !col.required)}
          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border-none cursor-pointer transition-colors ${
            col.required
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
          }`}
        >
          {col.required && <Check className="w-3 h-3" />}
          {col.required ? "Oui" : "Non"}
        </button>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 w-20">
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={onEdit}
            className={`p-1.5 rounded-md transition-colors cursor-pointer border-none ${
              isEditing
                ? "text-green-600 bg-green-100"
                : "text-gray-300 hover:text-blue-500 hover:bg-blue-50 bg-transparent"
            }`}
          >
            <EditIcon />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer border-none bg-transparent"
          >
            <TrashIcon />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function SchemaEditor() {
  const navigate = useNavigate();
  const { schema, status, error, retry } = useSchema();
  const [columns, setColumns] = useState<EditableColumn[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (schema && columns === null) {
    setColumns(toEditable(schema.columns));
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setColumns((prev) => {
      if (!prev) return prev;
      const oldIndex = prev.findIndex((c) => c._id === active.id);
      const newIndex = prev.findIndex((c) => c._id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const updateColumn = (
    id: string,
    field: keyof TargetColumn,
    value: string | boolean,
  ) => {
    setColumns((prev) =>
      prev
        ? prev.map((col) => (col._id === id ? { ...col, [field]: value } : col))
        : prev,
    );
  };

  const deleteColumn = (id: string) => {
    setColumns((prev) => (prev ? prev.filter((col) => col._id !== id) : prev));
    if (editingId === id) setEditingId(null);
  };

  const addColumn = () => {
    const newCol: EditableColumn = {
      _id: `new_${Date.now()}`,
      key: `col_${Date.now()}`,
      label: "Nouvelle colonne",
      required: false,
      aliases: [],
    };
    setColumns((prev) => (prev ? [...prev, newCol] : [newCol]));
    setEditingId(newCol._id);
  };

  const handleSave = async () => {
    if (!columns) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const toSave: TargetColumn[] = columns.map((col) => {
        const { key, label, required, aliases } = col;
        return { key, label, required, aliases };
      });
      await saveSchema(toSave);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!schema) return;
    setColumns(toEditable(schema.columns));
    setEditingId(null);
  };

  if (status === "loading")
    return (
      <div className="min-h-screen bg-white flex items-start justify-center p-8 pt-16">
        <div className="w-full max-w-3xl">
          <SchemaStatusCard status="loading" />
        </div>
      </div>
    );

  if (status === "error")
    return (
      <div className="min-h-screen bg-white flex items-start justify-center p-8 pt-16">
        <div className="w-full max-w-3xl">
          <SchemaStatusCard status="error" error={error} onRetry={retry} />
        </div>
      </div>
    );

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
            Édition du schéma
          </span>
          <span className="ml-2 text-xs text-gray-400">
            {columns?.length ?? 0} colonnes
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
              <Check className="w-3 h-3" /> Sauvegardé
            </span>
          )}
          {saveError && (
            <span className="text-xs text-red-500">{saveError}</span>
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors cursor-pointer bg-transparent"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 text-sm font-medium bg-gray-900 text-white rounded-lg px-4 py-1.5 hover:bg-gray-700 transition-colors cursor-pointer border-none disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="px-8 py-6 max-w-4xl mx-auto">
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="w-10 px-3 py-3" />
                <th className="w-10 px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Label
                </th>
                <th className="w-44 px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Clé
                </th>
                <th className="w-20 px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Requis
                </th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={columns?.map((c) => c._id) ?? []}
                strategy={verticalListSortingStrategy}
              >
                <tbody>
                  {columns?.map((col, i) => (
                    <SortableRow
                      key={col._id}
                      col={col}
                      index={i}
                      isEditing={editingId === col._id}
                      onEdit={() =>
                        setEditingId(editingId === col._id ? null : col._id)
                      }
                      onDelete={() => deleteColumn(col._id)}
                      onUpdate={(field, value) =>
                        updateColumn(col._id, field, value)
                      }
                    />
                  ))}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>

          <button
            onClick={addColumn}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 border-t border-gray-100 px-5 py-3 w-full hover:bg-gray-50 transition-colors cursor-pointer bg-transparent"
          >
            <Plus className="w-4 h-4" />
            Ajouter une colonne
          </button>
        </div>
      </div>
    </div>
  );
}
