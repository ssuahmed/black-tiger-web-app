"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import Card from "@/components/ui/Card";
import { Alert, EmptyState, LoadingCenter } from "@/components/ui";
import {
  createSavedList,
  deleteSavedList,
  listSavedLists,
  updateSavedList,
} from "@/lib/api/lists";
import { normalizeListSummary } from "@/lib/lists/mapLists.mjs";
import { formatApiError } from "@/lib/formatApiError";

export default function AccountListsClient() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [newName, setNewName] = useState("");

  const loadLists = useCallback(async () => {
    setError("");
    const data = await listSavedLists({ page: 1, pageSize: 50, sort: "updatedAt_desc" });
    const items = Array.isArray(data?.items) ? data.items : [];
    setRows(items.map((row) => normalizeListSummary(row && typeof row === "object" ? row : {})));
  }, []);

  useEffect(() => {
    let alive = true;
    loadLists()
      .catch((err) => {
        if (!alive) return;
        setError(formatApiError(err, "Could not load lists."));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [loadLists]);

  const subtitle = useMemo(
    () => (rows.length ? `${rows.length} saved list${rows.length === 1 ? "" : "s"}` : "Saved product lists"),
    [rows.length],
  );

  async function handleCreate(e) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setBusy(true);
    setError("");
    try {
      await createSavedList({ name, listType: "wishlist" });
      setNewName("");
      await loadLists();
    } catch (err) {
      setError(formatApiError(err, "Could not create list."));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(listId) {
    if (!listId) return;
    setBusy(true);
    setError("");
    try {
      await deleteSavedList(listId);
      await loadLists();
    } catch (err) {
      setError(formatApiError(err, "Could not delete list."));
    } finally {
      setBusy(false);
    }
  }

  async function handleRename(listId, currentName) {
    const next = window.prompt("Rename list", currentName);
    if (!next || next.trim() === currentName) return;
    setBusy(true);
    setError("");
    try {
      await updateSavedList(listId, { name: next.trim() });
      await loadLists();
    } catch (err) {
      setError(formatApiError(err, "Could not rename list."));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingCenter className="min-h-[30vh]" />;

  return (
    <>
      <AccountPageHeader title="Lists" description={subtitle} />
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}

      <Card className="mb-6 p-4">
        <form className="flex flex-wrap items-end gap-3" onSubmit={handleCreate}>
          <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-sm">
            <span className="font-medium">New list</span>
            <input
              type="text"
              className="min-h-10 rounded border border-neutral-300 px-3 py-2"
              placeholder="List name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={busy}
            />
          </label>
          <button
            type="submit"
            className="min-h-10 rounded bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            disabled={busy || !newName.trim()}
          >
            Create list
          </button>
        </form>
      </Card>

      {!rows.length && !error ? (
        <EmptyState title="No lists yet" description="Create a list to save products for later." />
      ) : null}

      {rows.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((list) => (
            <Card key={list.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="m-0 text-base font-semibold">{list.name}</h3>
                  {list.description ? (
                    <p className="mt-1 mb-0 text-sm text-neutral-600">{list.description}</p>
                  ) : null}
                  <p className="mt-2 mb-0 text-xs text-neutral-500">
                    {list.itemCount} item{list.itemCount === 1 ? "" : "s"}
                    {list.isDefault ? " · Default" : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    className="text-sm font-medium text-neutral-700 underline"
                    onClick={() => handleRename(list.id, list.name)}
                    disabled={busy}
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    className="text-sm font-medium text-red-700 underline"
                    onClick={() => handleDelete(list.id)}
                    disabled={busy}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </>
  );
}
