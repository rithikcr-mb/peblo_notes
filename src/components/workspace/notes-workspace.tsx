"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import ReactMarkdown from "react-markdown";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  Bot,
  Check,
  Copy,
  FileText,
  Link2,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { shortDate } from "@/lib/utils";

type Note = {
  id: string;
  title: string;
  content: string;
  category: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  tags: { id: string; name: string; color: string }[];
  aiGenerations: { id: string; type: string; response: string; createdAt: string }[];
  sharedLinks: { token: string; active: boolean }[];
};

type NotePayload = {
  title?: string;
  content?: string;
  category?: string;
  archived?: boolean;
  tags?: string[];
};

type ConfirmAction =
  | { type: "delete"; note: Note }
  | { type: "revoke-share"; note: Note }
  | null;

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    let errorMessage = "Request failed";
    try {
      const errData = await response.json();
      errorMessage = errData.error || errData.message || errorMessage;
    } catch {
      // ignore JSON parse errors for non-JSON responses
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export function NotesWorkspace() {
  const queryClient = useQueryClient();
  const { toast, updateToast } = useToast();
  const saveToastId = useRef<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileEditorOpen, setMobileEditorOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All categories");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"updated" | "newest" | "oldest">("updated");
  const [view, setView] = useState<"write" | "preview">("write");
  const [draft, setDraft] = useState({ title: "", content: "", category: "Personal", tags: "" });
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const lastSavedDraft = useRef("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const notesQuery = useQuery({ queryKey: ["notes"], queryFn: () => jsonFetch<Note[]>("/api/notes") });
  const notes = useMemo(() => notesQuery.data ?? [], [notesQuery.data]);
  const categories = useMemo(
    () => Array.from(new Set(notes.map((note) => note.category))).sort(),
    [notes],
  );
  const tags = useMemo(
    () => Array.from(new Set(notes.flatMap((note) => note.tags.map((tag) => tag.name)))).sort(),
    [notes],
  );
  const selected =
  notes.find((note) => note.id === selectedId) || null;

  function openNoteOnClick(id: string) {
    setSelectedId(id);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileEditorOpen(true);
    }
  }

  useEffect(() => {
    if (!selected) return;
    if (draft.title === selected.title && draft.content === selected.content && draft.category === selected.category) return;
    // The editor draft is intentionally reset only when the user selects another note.
    setDraft({
      title: selected.title,
      content: selected.content,
      category: selected.category,
      tags: selected.tags.map((tag) => tag.name).join(", "),
    });
    lastSavedDraft.current = JSON.stringify({
      title: selected.title,
      content: selected.content,
      category: selected.category,
      tags: selected.tags.map((tag) => tag.name).join(", "),
    });
    setSaveState("idle");
    setSelectedId(selected.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const filteredNotes = useMemo(() => {
    const normalized = query.toLowerCase();
    return notes
      .filter((note) => {
        const matchesArchive = showArchived ? note.archived : !note.archived;
        if (!matchesArchive) return false;

        if (selectedCategory !== "All categories" && note.category !== selectedCategory) return false;

        if (selectedTags.length) {
          const noteTagNames = note.tags.map((tag) => tag.name);
          if (!selectedTags.every((tag) => noteTagNames.includes(tag))) return false;
        }

        const haystack = [note.title, note.content, note.category, ...note.tags.map((tag) => tag.name)]
          .join(" ")
          .toLowerCase();

        return normalized === "" || haystack.includes(normalized);
      })
      .sort((a, b) => {
        if (sortBy === "newest") return b.createdAt.localeCompare(a.createdAt);
        if (sortBy === "oldest") return a.createdAt.localeCompare(b.createdAt);
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [notes, query, showArchived, selectedCategory, selectedTags, sortBy]);

  const updateNote = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: NotePayload }) =>
      jsonFetch<Note>(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    }),
    onSuccess: () => {
      setSaveState("saved");
      if (saveToastId.current) {
        updateToast(saveToastId.current, {
          title: "Note saved",
          description: "Your changes are up to date.",
          status: "success",
          duration: 1600,
        });
        saveToastId.current = null;
      }
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: () => {
      setSaveState("idle");
      if (saveToastId.current) {
        updateToast(saveToastId.current, {
          title: "Save failed",
          description: "Your latest changes could not be saved. Please try again.",
          status: "error",
        });
        saveToastId.current = null;
        return;
      }
      toast({ title: "Save failed", description: "Your latest changes could not be saved. Please try again.", status: "error" });
    },
  });

  useEffect(() => {
    if (!selected) return;

    const currentDraft = JSON.stringify({
      title: draft.title,
      content: draft.content,
      category: draft.category,
      tags: draft.tags,
    });

    if (currentDraft === lastSavedDraft.current) return;

    const handle = setTimeout(() => {
      setSaveState("saving");

      if (!saveToastId.current) {
        saveToastId.current = toast({
          title: "Saving note",
          description: "Syncing your latest edits.",
          status: "loading",
        });
      }

      updateNote.mutate(
        {
          id: selected.id,
          payload: {
            title: draft.title || "Untitled note",
            content: draft.content,
            category: draft.category || "Personal",
            tags: draft.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
          },
        },
        {
          onSuccess: () => {
            lastSavedDraft.current = currentDraft;
          },
        }
      );
    }, 700);

    return () => clearTimeout(handle);
  }, [draft, selected, toast, updateNote]);

  // Dynamically update the browser tab title based on the active note
  useEffect(() => {
    if (selected) {
      document.title = `${draft.title || "Untitled note"} - Peblo Notes`;
    } else {
      document.title = "Peblo Notes";
    }
    return () => {
      document.title = "Peblo Notes";
    };
  }, [selected, draft.title]);

  const archiveNote = useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
      jsonFetch<Note>(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived }),
      }),
    onMutate: async ({ id, archived }) => {
      toast({
        id: `archive-${id}`,
        title: archived ? "Archiving note" : "Restoring note",
        description: archived ? "Moving this note into the archive." : "Bringing this note back to your workspace.",
        status: "loading",
      });
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNotes = queryClient.getQueryData<Note[]>(["notes"]);
      queryClient.setQueryData<Note[]>(["notes"], (current) =>
        current?.map((note) => (note.id === id ? { ...note, archived } : note)) ?? current,
      );
      return { previousNotes };
    },
    onError: (_error, _variables, context) => {
      updateToast(`archive-${_variables.id}`, {
        title: "Archive update failed",
        description: "The note could not be updated. Your list has been restored.",
        status: "error",
      });
      if (context?.previousNotes) queryClient.setQueryData(["notes"], context.previousNotes);
    },
    onSuccess: (_note, variables) => {
      updateToast(`archive-${variables.id}`, {
        title: variables.archived ? "Note archived" : "Note restored",
        description: variables.archived ? "The note is now in your archive." : "The note is back in your active workspace.",
        status: "success",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  const deleteNote = useMutation({
    mutationFn: (id: string) => jsonFetch<{ ok: true }>(`/api/notes/${id}`, { method: "DELETE" }),
    onMutate: async (id) => {
      toast({
        id: `delete-${id}`,
        title: "Deleting note",
        description: "Removing the note and related history.",
        status: "loading",
      });
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNotes = queryClient.getQueryData<Note[]>(["notes"]);
      queryClient.setQueryData<Note[]>(["notes"], (current) => current?.filter((note) => note.id !== id) ?? current);
      if (selectedId === id) {
        const nextNote = previousNotes?.find((note) => note.id !== id && (showArchived || !note.archived));
        setSelectedId(nextNote?.id ?? null);
      }
      return { previousNotes };
    },
    onError: (_error, _id, context) => {
      updateToast(`delete-${_id}`, {
        title: "Delete failed",
        description: "The note could not be deleted. Your list has been restored.",
        status: "error",
      });
      if (context?.previousNotes) queryClient.setQueryData(["notes"], context.previousNotes);
    },
    onSuccess: (_result, id) => {
      updateToast(`delete-${id}`, {
        title: "Note deleted",
        description: "The note has been permanently removed.",
        status: "success",
      });
    },
    onSettled: () => {
      setConfirmAction(null);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  const createNote = useMutation({
    mutationFn: () =>
      jsonFetch<Note>("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled note", content: "", category: "Personal", tags: [] }),
      }),
    onSuccess: (note) => {
      toast({ title: "Note created", description: "A fresh Peblo note is ready.", status: "success" });
      setSelectedId(note.id);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: () => {
      toast({ title: "Create failed", description: "Unable to create a new note right now.", status: "error" });
    },
  });

  const aiMutation = useMutation({
    mutationFn: (type: "summary" | "actions" | "title") =>
      jsonFetch<{ response: string }>(`/api/notes/${selected?.id}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      }),
    onMutate: (type) => {
      toast({
        id: `ai-${type}`,
        title: type === "title" ? "Suggesting title" : type === "actions" ? "Extracting actions" : "Summarizing note",
        description: "Peblo AI is reading the current note.",
        status: "loading",
      });
    },
    onSuccess: (generation, type) => {
      updateToast(`ai-${type}`, {
        title: type === "title" ? "Title suggested" : type === "actions" ? "Actions extracted" : "Summary ready",
        description: "The result has been added to AI history.",
        status: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      if (type === "title" && selected) setDraft((current) => ({ ...current, title: generation.response.trim() }));
    },
    onError: (error, type) => {
      const errorMessage = error instanceof Error ? error.message : "Request failed";
      let description = "Peblo could not complete this request. Please try again.";

      const lowerError = errorMessage.toLowerCase();
      if (lowerError.includes("safety") || lowerError.includes("blocked")) {
        description = "This note contains content that was blocked by AI safety filters.";
      } else if (lowerError.includes("rate") || lowerError.includes("429") || lowerError.includes("quota")) {
        description = "AI generation is currently rate-limited. Please try again in a moment.";
      } else if (errorMessage !== "Request failed") {
        description = errorMessage;
      }

      updateToast(`ai-${type}`, {
        title: "AI generation failed",
        description,
        status: "error",
      });
    },
  });

  const shareMutation = useMutation({
    mutationFn: () => jsonFetch<{ token: string }>(`/api/notes/${selected?.id}/share`, { method: "POST" }),
    onMutate: () => {
      toast({ id: "share-create", title: "Creating share link", description: "Preparing a public read-only URL.", status: "loading" });
    },
    onSuccess: () => {
      updateToast("share-create", { title: "Share link ready", description: "The public link is available in Share settings.", status: "success" });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: () => {
      updateToast("share-create", { title: "Share failed", description: "Unable to create a public link right now.", status: "error" });
    },
  });

  const revokeShare = useMutation({
    mutationFn: (id: string) => jsonFetch<{ ok: true }>(`/api/notes/${id}/share`, { method: "DELETE" }),
    onMutate: async (id) => {
      toast({ id: `revoke-${id}`, title: "Revoking link", description: "Turning off public access for this note.", status: "loading" });
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNotes = queryClient.getQueryData<Note[]>(["notes"]);
      queryClient.setQueryData<Note[]>(["notes"], (current) =>
        current?.map((note) => (note.id === id ? { ...note, sharedLinks: [] } : note)) ?? current,
      );
      return { previousNotes };
    },
    onError: (_error, _id, context) => {
      updateToast(`revoke-${_id}`, {
        title: "Revoke failed",
        description: "The public link could not be revoked. Your share state has been restored.",
        status: "error",
      });
      if (context?.previousNotes) queryClient.setQueryData(["notes"], context.previousNotes);
    },
    onSuccess: (_result, id) => {
      updateToast(`revoke-${id}`, {
        title: "Public link revoked",
        description: "This note is private again.",
        status: "success",
      });
    },
    onSettled: () => {
      setConfirmAction(null);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  // Keyboard shortcuts and accessibility helpers
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const active = document.activeElement as HTMLElement | null;
      const tag = active?.tagName?.toLowerCase();

      // Focus search on '/'
      if (e.key === "/" && tag !== "input" && tag !== "textarea" && searchRef.current) {
        e.preventDefault();
        searchRef.current.focus();
        return;
      }

      // Create new note with Ctrl/Cmd+N
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        createNote.mutate();
        return;
      }

      // Close mobile editor with Escape
      if (e.key === "Escape" && mobileEditorOpen) {
        setMobileEditorOpen(false);
        return;
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [createNote, mobileEditorOpen]);


  function changeDraft(next: Partial<typeof draft>) {
    setDraft((current) => ({ ...current, ...next }));
    setSaveState("saving");
  }

  function toggleArchive(note: Note) {
    archiveNote.mutate({ id: note.id, archived: !note.archived });
  }

  function runConfirmedAction() {
    if (!confirmAction) return;
    if (confirmAction.type === "delete") deleteNote.mutate(confirmAction.note.id);
    if (confirmAction.type === "revoke-share") revokeShare.mutate(confirmAction.note.id);
  }

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  }

  function clearFilters() {
    setQuery("");
    setSelectedCategory("All categories");
    setSelectedTags([]);
    setSortBy("updated");
  }

  const shareUrl =
    typeof window !== "undefined" && selected?.sharedLinks?.[0]
      ? `${window.location.origin}/shared/${selected.sharedLinks[0].token}`
      : "";

  // Extract the AI and Share cards into a variable so we can render them 
  // in the desktop sidebar OR the mobile bottom sheet without duplicating code.
  const sidebarCards = selected ? (
    <>
      <Card className="bg-white/92 p-4 shadow-[0_16px_34px_rgba(74,37,189,0.08)]">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-[var(--peblo-ink)]">AI history</h2>
          <Button variant="ghost" size="sm" onClick={() => aiMutation.mutate("title")} disabled={aiMutation.isPending}>
            Suggest title
          </Button>
        </div>
        <div className="mt-3 space-y-3">
          {selected.aiGenerations.length ? (
            selected.aiGenerations.map((item) => (
              <div key={item.id} className="rounded-[1.75rem] bg-[#f7f2ff] p-4 shadow-[0_10px_28px_rgba(74,37,189,0.08)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[var(--peblo-purple-soft)] px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.24em] text-[var(--peblo-purple-deep)]">
                    {item.type}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--peblo-ink)]">{item.response}</p>
              </div>
            ))
          ) : (
            <div className="rounded-[1.75rem] bg-[#faf7ff] p-4 text-sm text-[var(--peblo-muted)]">
              Generate a summary or action list to build AI history.
            </div>
          )}
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-black text-[var(--peblo-ink)]">Share settings</h2>
            <p className="mt-1 text-sm text-[var(--peblo-muted)]">Public read-only link for reviewers or teammates.</p>
          </div>
          {shareUrl ? (
            <span className="rounded-full bg-[var(--peblo-purple-soft)] px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-[var(--peblo-purple-deep)]">
              Link active
            </span>
          ) : null}
        </div>
        {shareUrl ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-[1.75rem] border border-[var(--peblo-border)] bg-white/95 p-4 shadow-[0_10px_25px_rgba(74,37,189,0.08)]">
              <p className="truncate text-sm font-semibold text-[var(--peblo-ink)]">{shareUrl}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <Button
                className="w-full"
                variant="primary"
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  toast({ title: "Link copied", description: "The public URL is ready to share.", status: "success" });
                }}
              >
                <Copy size={15} /> Copy link
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => setConfirmAction({ type: "revoke-share", note: selected })}
                disabled={revokeShare.isPending}
              >
                <X size={15} /> Revoke
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <Button className="w-full" variant="primary" onClick={() => shareMutation.mutate()}>
              <Link2 size={15} /> Create link
            </Button>
          </div>
        )}
      </Card>
    </>
  ) : null;

  return (
    <div className="grid min-h-screen gap-4 text-[var(--peblo-ink)] lg:grid-cols-[342px_minmax(0,1fr)]">
      {/* Switch between hiding the List or Editor correctly on mobile devices */}
      <section className={cn("lg:block", mobileEditorOpen ? "hidden" : "block")}>
        <div className="space-y-4 p-4">
          <Card className="rounded-[2rem] p-4">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--peblo-purple-deep)]">Notes workspace</p>
                <p className="mt-2 text-sm text-[var(--peblo-muted)]">Showing {filteredNotes.length} note{filteredNotes.length === 1 ? "" : "s"}.</p>
              </div>
              <Button onClick={() => createNote.mutate()} disabled={createNote.isPending}>
                <Plus size={16} /> New note
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b8cc1]" size={16} />
              <Input ref={searchRef} className="pl-9" placeholder="Search notes, tags, content" value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>

            <div className="mt-5 space-y-3">
  <div className="flex flex-wrap gap-3 items-end">
    <div className="flex-1 min-w-[140px] space-y-1.5">
      <div className="text-[0.68rem] font-black uppercase tracking-[0.25em] text-[#8a79ba]">Category</div>
      <Select.Root value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger className="w-full rounded-xl text-sm font-semibold">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All categories">All categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>{category}</SelectItem>
          ))}
        </SelectContent>
      </Select.Root>
    </div>

    <div className="flex-1 min-w-[140px] space-y-1.5">
      <div className="text-[0.68rem] font-black uppercase tracking-[0.25em] text-[#8a79ba]">Sort</div>
      <Select.Root value={sortBy} onValueChange={(value) => setSortBy(value as "updated" | "newest" | "oldest")}>
        <SelectTrigger className="w-full rounded-xl text-sm font-semibold">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="updated">Recently updated</SelectItem>
          <SelectItem value="newest">Newest created</SelectItem>
          <SelectItem value="oldest">Oldest created</SelectItem>
        </SelectContent>
      </Select.Root>
    </div>

    <Button
      variant="secondary"
      size="sm"
      onClick={clearFilters}
      disabled={query === "" && selectedCategory === "All categories" && selectedTags.length === 0 && sortBy === "updated"}
    >
      Clear filters
    </Button>
  </div>
</div>

            <button
              className="mt-5 flex items-center gap-2 text-sm font-bold text-[var(--peblo-muted)] transition hover:text-[var(--peblo-ink)]"
              onClick={() => setShowArchived((value) => !value)}
            >
              <Archive size={15} /> {showArchived ? "Showing archived" : "Hide archived"}
            </button>
          </Card>

          <Card className="rounded-[2rem] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-[var(--peblo-ink)]">Notes list</p>
                <p className="text-xs text-[var(--peblo-muted)]">Tap a note to open the editor.</p>
              </div>
            </div>
            <div role="list" aria-live="polite" className="flex max-h-[calc(100vh-260px)] flex-col gap-3 overflow-y-auto pb-4">
              {notesQuery.isLoading ? (
                <p className="rounded-2xl bg-[var(--peblo-purple-soft)] p-4 text-sm text-[var(--peblo-muted)]">Loading notes…</p>
              ) : null}
              {!notesQuery.isLoading && filteredNotes.length === 0 ? (
                <div className="rounded-2xl border border-[var(--peblo-border)] bg-[#faf7ff] p-6 text-sm text-[var(--peblo-muted)] shadow-sm">
                  <p className="font-black text-[var(--peblo-ink)]">No notes match this filter.</p>
                  <p className="mt-2 leading-relaxed">Try adjusting your search, tags, or category for a better result.</p>
                </div>
              ) : null}
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  role="listitem"
                  className={cn(
                    "group grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-4 rounded-[1.5rem] p-5 text-left transition-all duration-300 ease-out border border-transparent",
                    selected?.id === note.id
                      ? "bg-white shadow-[0_16px_40px_rgba(74,37,189,0.1)] ring-1 ring-[var(--peblo-purple-soft)]"
                      : "bg-white/50 hover:bg-white hover:border-[var(--peblo-border)] hover:shadow-[0_8px_24px_rgba(74,37,189,0.06)]"
                  )}
                >
                  <button aria-label={`Open note ${note.title}`} className="min-w-0 text-left outline-none" onClick={() => openNoteOnClick(note.id)}>
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="truncate text-[0.95rem] font-black text-[var(--peblo-ink)]">{note.title}</div>
                      <div className="shrink-0 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#9b8cc1]">{shortDate(note.updatedAt)}</div>
                    </div>
                    <p className="mt-2.5 line-clamp-2 text-[0.82rem] leading-relaxed text-[#6b6185]">{note.content || "No content yet"}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {note.archived ? (
                        <span className="rounded-full bg-[#f3edff] px-2.5 py-1 text-[0.68rem] font-bold text-[var(--peblo-purple-deep)]">Archived</span>
                      ) : null}
                      {note.tags.map((tag) => (
                        <span key={tag.id} className="rounded-full bg-[var(--peblo-gold-soft)] px-2.5 py-1 text-[0.68rem] font-bold text-[#805600]">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </button>
                  <div className="flex items-start justify-end pt-1">
                    <NoteActionsMenu
                      note={note}
                      onToggleArchive={() => toggleArchive(note)}
                      onDelete={() => setConfirmAction({ type: "delete", note })}
                      disabled={archiveNote.isPending || deleteNote.isPending}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <main className={cn("min-h-screen grid-rows-[auto_1fr]", mobileEditorOpen ? "grid" : "hidden lg:grid")}>
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--peblo-border)] bg-white/90 px-5 py-4 backdrop-blur-sm">
          {mobileEditorOpen ? (
            <button
              aria-label="Back to notes list"
              onClick={() => setMobileEditorOpen(false)}
              className="mr-2 inline-flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 text-sm font-bold text-[var(--peblo-purple-deep)] peblo-button-press"
            >
              <X size={14} /> Back
            </button>
          ) : null}
          <div>
            <div className="text-xs font-black uppercase tracking-[0.24em] text-[var(--peblo-purple)]">{draft.category}</div>
            <div className="mt-2 flex items-center gap-2 text-sm font-bold text-[var(--peblo-muted)]">
              {saveState === "saving" ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
              <span>{saveState === "saving" ? "Saving..." : "Saved"}</span>
            </div>
            <div aria-live="polite" className="sr-only">
              {saveState === "saving" ? "Saving note" : saveState === "saved" ? "Note saved" : ""}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => aiMutation.mutate("summary")} disabled={!selected || aiMutation.isPending}>
              <Sparkles size={15} /> Summarize
            </Button>
            <Button variant="secondary" size="sm" onClick={() => aiMutation.mutate("actions")} disabled={!selected || aiMutation.isPending}>
              <Bot size={15} /> Actions
            </Button>
            <Button variant="secondary" size="sm" onClick={() => shareMutation.mutate()} disabled={!selected || shareMutation.isPending}>
              <Link2 size={15} /> Share
            </Button>
            {selected ? (
              <>
                {/* Mobile Tools Drawer (Bottom Sheet) */}
                <Dialog.Root>
                  <Dialog.Trigger asChild>
                    <Button variant="secondary" size="sm" className="xl:hidden">
                      <Sparkles size={15} /> Tools
                    </Button>
                  </Dialog.Trigger>
                  <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-50 bg-[#20143f]/28 backdrop-blur-sm xl:hidden" />
                    <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-[2rem] border-t border-[var(--peblo-border)] bg-white p-5 shadow-[0_-24px_70px_rgba(74,37,189,0.22)] xl:hidden focus:outline-none">
                      <Dialog.Title className="sr-only">AI Tools and Share Settings</Dialog.Title>
                      <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-zinc-200" />
                      {sidebarCards}
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>
                
                <NoteActionsMenu
                  note={selected}
                  onToggleArchive={() => toggleArchive(selected)}
                  onDelete={() => setConfirmAction({ type: "delete", note: selected })}
                  disabled={archiveNote.isPending || deleteNote.isPending}
                />
              </>
            ) : null}
          </div>
        </header>

        {selected ? (
          <div className="grid min-h-0 gap-0 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="min-h-0 overflow-y-auto p-5">
              <Input
                className="h-14 border-0 bg-transparent px-0 text-3xl font-black text-[var(--peblo-ink)] shadow-none focus:ring-0"
                value={draft.title}
                onChange={(event) => changeDraft({ title: event.target.value })}
              />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Input value={draft.category} onChange={(event) => changeDraft({ category: event.target.value })} placeholder="Category" />
                <Input value={draft.tags} onChange={(event) => changeDraft({ tags: event.target.value })} placeholder="Tags separated by commas" />
              </div>
              <div className="mt-5 flex gap-2">
                <Button variant={view === "write" ? "primary" : "secondary"} size="sm" onClick={() => setView("write")}>
                  <FileText size={15} /> Editor
                </Button>
                <Button variant={view === "preview" ? "primary" : "secondary"} size="sm" onClick={() => setView("preview")}>
                  Preview
                </Button>
              </div>
              {view === "write" ? (
                <Textarea
                  className="mt-4 min-h-[58vh] border border-[var(--peblo-border)] bg-white/92 p-5 font-mono text-sm leading-7 shadow-[0_18px_40px_rgba(74,37,189,0.08)]"
                  value={draft.content}
                  onChange={(event) => changeDraft({ content: event.target.value })}
                  placeholder="Start writing in Markdown..."
                />
              ) : (
                <Card className="markdown-preview mt-4 min-h-[58vh] bg-white/92 p-6 shadow-[0_18px_40px_rgba(74,37,189,0.08)]">
                  <ReactMarkdown>{draft.content || "Nothing to preview yet."}</ReactMarkdown>
                </Card>
              )}
            </section>

            <aside className="hidden xl:block min-h-0 overflow-y-auto border-l border-[var(--peblo-border)] bg-white/78 p-4 backdrop-blur">
              {sidebarCards}
            </aside>
          </div>
        ) : (
          <div className="grid place-items-center p-8 text-center">
            <div>
              <h2 className="text-2xl font-black text-[var(--peblo-ink)]">No notes yet</h2>
              <p className="mt-2 text-[var(--peblo-muted)]">Create your first note to open the editor.</p>
            </div>
          </div>
        )}
      </main>
      <ConfirmActionDialog
        action={confirmAction}
        loading={deleteNote.isPending || revokeShare.isPending}
        onCancel={() => setConfirmAction(null)}
        onConfirm={runConfirmedAction}
      />
    </div>
  );
}

function NoteActionsMenu({
  note,
  disabled,
  onToggleArchive,
  onDelete,
}: {
  note: Note;
  disabled?: boolean;
  onToggleArchive: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="grid h-8 w-8 place-items-center rounded-2xl text-[var(--peblo-purple-deep)] transition hover:bg-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a63f0]"
          aria-label="Note actions"
          disabled={disabled}
        >
          <MoreHorizontal size={16} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-44 rounded-lg border border-[var(--peblo-border)] bg-white/95 p-1 shadow-[0_18px_44px_rgba(74,37,189,0.16)] backdrop-blur"
        >
          <DropdownItem onSelect={onToggleArchive}>
            {note.archived ? <Undo2 size={15} /> : <Archive size={15} />}
            {note.archived ? "Unarchive note" : "Archive note"}
          </DropdownItem>
          <DropdownItem danger onSelect={onDelete}>
            <Trash2 size={15} /> Delete note
          </DropdownItem>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function DropdownItem({
  children,
  danger = false,
  onSelect,
}: {
  children: React.ReactNode;
  danger?: boolean;
  onSelect: () => void;
}) {
  return (
    <DropdownMenu.Item
      onSelect={onSelect}
      className={`flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm font-bold outline-none transition ${
        danger
          ? "text-rose-700 hover:bg-rose-50 focus:bg-rose-50"
          : "text-[var(--peblo-purple-deep)] hover:bg-[var(--peblo-purple-soft)] focus:bg-[var(--peblo-purple-soft)]"
      }`}
    >
      {children}
    </DropdownMenu.Item>
  );
}

function ConfirmActionDialog({
  action,
  loading,
  onCancel,
  onConfirm,
}: {
  action: ConfirmAction;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isDelete = action?.type === "delete";
  const title = isDelete ? "Delete this note?" : "Revoke public link?";
  const body = isDelete
    ? "This permanently removes the note, its tags, AI history, and shared links."
    : "This turns off the current public URL. You can create a new link later.";
  const confirmLabel = isDelete ? "Delete note" : "Revoke link";

  return (
    <Dialog.Root open={Boolean(action)} onOpenChange={(open) => (!open && !loading ? onCancel() : null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#20143f]/28 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[var(--peblo-border)] bg-white p-5 shadow-[0_24px_70px_rgba(74,37,189,0.22)]">
          <Dialog.Title className="text-lg font-black text-[var(--peblo-ink)]">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-6 text-[var(--peblo-muted)]">{body}</Dialog.Description>
          {action ? (
            <div className="mt-4 rounded-md bg-[var(--peblo-purple-soft)] px-3 py-2 text-sm font-bold text-[var(--peblo-purple-deep)]">
              {action.note.title}
            </div>
          ) : null}
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={onConfirm} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={15} /> : null}
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
