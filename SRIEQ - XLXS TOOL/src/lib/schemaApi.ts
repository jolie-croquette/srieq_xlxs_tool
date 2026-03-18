import { supabase } from "./supabase";
import type { TargetColumn } from "../types";

export async function fetchSchema(): Promise<TargetColumn[]> {
  const { data, error } = await supabase
    .from("schema_columns")
    .select("key, label, required, aliases")
    .order("position", { ascending: true });

  if (error) throw new Error(`Erreur chargement schéma : ${error.message}`);

  return data.map((row) => ({
    key: row.key,
    label: row.label,
    required: row.required,
    aliases: row.aliases ?? [],
  }));
}

export async function saveSchema(columns: TargetColumn[]): Promise<void> {
  // Supprime tout et réinsère dans le bon ordre
  const { error: deleteError } = await supabase
    .from("schema_columns")
    .delete()
    .neq("id", 0);

  if (deleteError)
    throw new Error(`Erreur suppression : ${deleteError.message}`);

  const rows = columns.map((col, i) => ({
    key: col.key,
    label: col.label,
    required: col.required,
    aliases: col.aliases ?? [],
    position: i + 1,
  }));

  const { error: insertError } = await supabase
    .from("schema_columns")
    .insert(rows);

  if (insertError)
    throw new Error(`Erreur sauvegarde : ${insertError.message}`);
}
