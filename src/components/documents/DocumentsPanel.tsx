"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { AppDocument, DocumentEntityType } from "@/lib/database.types";
import { formatDate } from "@/lib/utils";
import { Button, ErrorBlock, Field, Input, Select } from "@/components/ui/Primitives";
import { Modal } from "@/components/ui/Modal";

const CATEGORIES = [
  "Terms of reference",
  "Client brief",
  "Proposal",
  "Contract",
  "Work plan",
  "Meeting minutes",
  "Research instrument",
  "Data file",
  "Presentation",
  "Draft report",
  "Final report",
  "Invoice",
  "Payment evidence",
  "Consultant CV",
  "Template",
  "Client feedback",
  "Project closeout document",
  "Other",
];

export function DocumentsPanel({
  entityType,
  entityId,
}: {
  entityType: DocumentEntityType;
  entityId: string;
}) {
  const [docs, setDocs] = useState<AppDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("linked_entity_type", entityType)
      .eq("linked_entity_id", entityId)
      .order("created_at", { ascending: false });
    setDocs((data as AppDocument[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId]);

  async function openDoc(doc: AppDocument) {
    if (doc.external_link) {
      window.open(doc.external_link, "_blank");
      return;
    }
    if (doc.storage_path) {
      const { data } = await supabase.storage.from("documents").createSignedUrl(doc.storage_path, 60);
      if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Documents</h2>
        <button className="text-xs font-medium underline" onClick={() => setShowAdd(true)}>
          + Add
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : docs.length === 0 ? (
        <p className="text-sm text-slate-400">No documents linked yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {docs.map((d) => (
            <li key={d.id} className="flex items-center justify-between py-2 text-sm">
              <button className="text-left font-medium hover:underline" onClick={() => openDoc(d)}>
                {d.label}
              </button>
              <span className="text-xs text-slate-400">
                {d.category} · {formatDate(d.created_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
      {showAdd && (
        <AddDocumentModal
          entityType={entityType}
          entityId={entityId}
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function AddDocumentModal({
  entityType,
  entityId,
  onClose,
  onSaved,
}: {
  entityType: DocumentEntityType;
  entityId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { profile } = useAuth();
  const [mode, setMode] = useState<"link" | "upload">("link");
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [externalLink, setExternalLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return setError("A label is required.");
    if (mode === "link" && !externalLink.trim()) return setError("Paste a link or switch to upload.");
    if (mode === "upload" && !file) return setError("Choose a file to upload.");

    setSaving(true);
    setError(null);

    let storagePath: string | null = null;
    if (mode === "upload" && file) {
      storagePath = `${entityType}/${entityId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("documents").upload(storagePath, file);
      if (uploadError) {
        setSaving(false);
        return setError(uploadError.message);
      }
    }

    const { error: insertError } = await supabase.from("documents").insert({
      label,
      category,
      external_link: mode === "link" ? externalLink : null,
      storage_path: storagePath,
      linked_entity_type: entityType,
      linked_entity_id: entityId,
      uploaded_by: profile?.id,
    });
    setSaving(false);
    if (insertError) return setError(insertError.message);
    onSaved();
  }

  return (
    <Modal title="Add Document" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Label *">
          <Input required value={label} onChange={(e) => setLabel(e.target.value)} />
        </Field>
        <Field label="Category">
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 ${mode === "link" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-slate-100 dark:bg-slate-800"}`}
            onClick={() => setMode("link")}
          >
            Link (Drive, etc.)
          </button>
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 ${mode === "upload" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-slate-100 dark:bg-slate-800"}`}
            onClick={() => setMode("upload")}
          >
            Upload file
          </button>
        </div>
        {mode === "link" ? (
          <Field label="URL">
            <Input value={externalLink} onChange={(e) => setExternalLink(e.target.value)} placeholder="https://drive.google.com/…" />
          </Field>
        ) : (
          <Field label="File">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm"
            />
          </Field>
        )}
        {error && <ErrorBlock message={error} />}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
