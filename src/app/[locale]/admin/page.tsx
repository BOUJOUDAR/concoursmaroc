"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Plus, Trash2, Save, Pencil } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type Tab = "concours" | "documents" | "articles";

interface ConcoursRow {
  id: string;
  slug: string;
  title_ar: string;
  title_fr: string;
  description_ar: string;
  description_fr: string;
  institution: string;
  category: string;
  city: string;
  year: number;
  deadline: string;
  concours_date: string;
  eligibility_ar: string;
  eligibility_fr: string;
  diploma_required_ar: string;
  diploma_required_fr: string;
  official_pdf_url: string;
  source_url: string;
  postes_count: number;
  is_active: boolean;
  annonce_officielle: string;
}

interface DocumentRow {
  id: string;
  slug: string;
  title_ar: string;
  title_fr: string;
  file_url: string;
  file_type: string;
  file_size: number;
  category: string;
  subject: string;
  year: number | null;
}

interface ArticleRow {
  id: string;
  slug: string;
  title_ar: string;
  title_fr: string;
  content_ar: string;
  content_fr: string;
  excerpt_ar: string;
  excerpt_fr: string;
  category: string;
  is_published: boolean;
  view_count: number;
}

const emptyConcours = { slug: "", title_ar: "", title_fr: "", description_ar: "", description_fr: "", institution: "", category: "", city: "", year: 2026, deadline: "", concours_date: "", eligibility_ar: "", eligibility_fr: "", diploma_required_ar: "", diploma_required_fr: "", official_pdf_url: "", source_url: "", postes_count: 0, is_active: true, annonce_officielle: "" };
const emptyDoc = { slug: "", title_ar: "", title_fr: "", file_url: "", file_type: "pdf", file_size: 0, category: "", subject: "", year: null as number | null };
const emptyArticle = { slug: "", title_ar: "", title_fr: "", content_ar: "", content_fr: "", excerpt_ar: "", excerpt_fr: "", category: "", is_published: true, view_count: 0 };

export default function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("concours");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("secret");
    const stored = localStorage.getItem("admin_secret");
    if ((s && s === process.env.NEXT_PUBLIC_ADMIN_SECRET) || stored === process.env.NEXT_PUBLIC_ADMIN_SECRET) {
      setIsAuthed(true);
      if (s) localStorage.setItem("admin_secret", s);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (secret === process.env.NEXT_PUBLIC_ADMIN_SECRET) {
      setIsAuthed(true);
      localStorage.setItem("admin_secret", secret);
      setError("");
    } else {
      setError("Invalid secret");
    }
  };

  if (!isAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <form onSubmit={handleLogin} className="p-8 rounded-xl border border-border bg-card w-full max-w-sm">
          <h1 className="text-xl font-bold mb-4">Admin Access</h1>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Enter admin secret"
            className="w-full rounded-lg border border-border px-4 py-2.5 mb-3 text-sm"
          />
          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
          <button type="submit" className="w-full rounded-lg bg-brand-600 text-white py-2.5 font-medium hover:bg-brand-700 transition-colors">
            Access Admin
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <button onClick={() => { localStorage.removeItem("admin_secret"); setIsAuthed(false); }} className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm">
            Logout
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {(["concours", "documents", "articles"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? "bg-brand-600 text-white" : "border border-border hover:bg-muted"}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          {activeTab === "concours" && <ConcoursManager />}
          {activeTab === "documents" && <DocumentsManager />}
          {activeTab === "articles" && <ArticlesManager />}
        </div>
      </div>
    </div>
  );
}

function ConcoursManager() {
  const [items, setItems] = useState<ConcoursRow[]>([]);
  const [editing, setEditing] = useState<ConcoursRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("concours").select("*").order("created_at", { ascending: false }).then(({ data }) => { setItems(data || []); setLoading(false); });
  }, []);

  const handleSave = async () => {
    if (!editing) return;
    const { id, ...rest } = editing;
    if (editing.id.startsWith("new-")) {
      const { data } = await supabase.from("concours").insert(rest).select().single();
      if (data) setItems((prev) => [data, ...prev.filter((i) => !i.id.startsWith("new-"))]);
    } else {
      await supabase.from("concours").update(rest).eq("id", id);
      setItems((prev) => prev.map((i) => (i.id === id ? editing : i)));
    }
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this concours?")) return;
    await supabase.from("concours").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  if (loading) return <p className="text-muted">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Concours ({items.length})</h2>
        <button onClick={() => setEditing({ ...emptyConcours, id: "new-" + Date.now() })} className="inline-flex items-center gap-1 rounded-lg bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
          <Plus className="h-4 w-4" /> Add Concours
        </button>
      </div>

      {editing && <ConcoursForm item={editing} onChange={setEditing} onSave={handleSave} onCancel={() => setEditing(null)} />}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.title_fr}</p>
              <p className="text-xs text-muted">{item.institution} • {item.category} • {item.city} • {item.year}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {item.is_active ? "Active" : "Inactive"}
            </span>
            <button onClick={() => setEditing(item)} className="p-1.5 rounded-lg hover:bg-muted"><Pencil className="h-4 w-4" /></button>
            <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="h-4 w-4 text-red-500" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConcoursForm({ item, onChange, onSave, onCancel }: { item: ConcoursRow; onChange: (i: ConcoursRow) => void; onSave: () => void; onCancel: () => void }) {
  const set = (k: keyof ConcoursRow, v: string | number | boolean) => onChange({ ...item, [k]: v });
  return (
    <div className="mb-4 p-4 rounded-lg border border-brand-200 bg-brand-50/50 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Slug" value={item.slug} onChange={(e) => set("slug", e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm" />
        <input placeholder="Institution" value={item.institution} onChange={(e) => set("institution", e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm" />
        <input placeholder="Title FR" value={item.title_fr} onChange={(e) => set("title_fr", e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm" />
        <input placeholder="Title AR" value={item.title_ar} onChange={(e) => set("title_ar", e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm" />
        <input placeholder="Category" value={item.category} onChange={(e) => set("category", e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm" />
        <input placeholder="City" value={item.city} onChange={(e) => set("city", e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm" />
        <input type="number" placeholder="Year" value={item.year} onChange={(e) => set("year", parseInt(e.target.value) || 2026)} className="rounded-lg border border-border px-3 py-2 text-sm" />
        <input type="number" placeholder="Postes" value={item.postes_count} onChange={(e) => set("postes_count", parseInt(e.target.value) || 0)} className="rounded-lg border border-border px-3 py-2 text-sm" />
        <div>
          <label className="block text-xs font-medium mb-1">Date Limite (Deadline)</label>
          <input type="date" value={item.deadline} onChange={(e) => set("deadline", e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Date du Concours</label>
          <input type="date" value={item.concours_date} onChange={(e) => set("concours_date", e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Annonce Officielle (URL)</label>
        <input type="url" placeholder="https://..." value={item.annonce_officielle} onChange={(e) => set("annonce_officielle", e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Eligibility FR" value={item.eligibility_fr} onChange={(e) => set("eligibility_fr", e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm" />
        <input placeholder="Eligibility AR" value={item.eligibility_ar} onChange={(e) => set("eligibility_ar", e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm" />
        <input placeholder="Diploma Required FR" value={item.diploma_required_fr} onChange={(e) => set("diploma_required_fr", e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm" />
        <input placeholder="Diploma Required AR" value={item.diploma_required_ar} onChange={(e) => set("diploma_required_ar", e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm" />
        <input placeholder="Official PDF URL" value={item.official_pdf_url} onChange={(e) => set("official_pdf_url", e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm" />
        <input placeholder="Source URL" value={item.source_url} onChange={(e) => set("source_url", e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm" />
      </div>
      <textarea placeholder="Description FR" value={item.description_fr} onChange={(e) => set("description_fr", e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" rows={2} />
      <textarea placeholder="Description AR" value={item.description_ar} onChange={(e) => set("description_ar", e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" rows={2} />
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={item.is_active} onChange={(e) => set("is_active", e.target.checked)} />
        <label className="text-sm">Active</label>
      </div>
      <div className="flex gap-2">
        <button onClick={onSave} className="inline-flex items-center gap-1 rounded-lg bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700"><Save className="h-4 w-4" /> Save</button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted">Cancel</button>
      </div>
    </div>
  );
}

function DocumentsManager() {
  const [items, setItems] = useState<DocumentRow[]>([]);
  const [editing, setEditing] = useState<DocumentRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("documents").select("*").order("created_at", { ascending: false }).then(({ data }) => { setItems(data || []); setLoading(false); });
  }, []);

  const handleSave = async () => {
    if (!editing) return;
    const { id, ...rest } = editing;
    if (editing.id.startsWith("new-")) {
      const { data } = await supabase.from("documents").insert(rest).select().single();
      if (data) setItems((prev) => [data, ...prev.filter((i) => !i.id.startsWith("new-"))]);
    } else {
      await supabase.from("documents").update(rest).eq("id", id);
      setItems((prev) => prev.map((i) => (i.id === id ? editing : i)));
    }
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    await supabase.from("documents").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  if (loading) return <p className="text-muted">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Documents ({items.length})</h2>
        <button onClick={() => setEditing({ ...emptyDoc, id: "new-" + Date.now() })} className="inline-flex items-center gap-1 rounded-lg bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
          <Plus className="h-4 w-4" /> Add Document
        </button>
      </div>

      {editing && (
        <div className="mb-4 p-4 rounded-lg border border-brand-200 bg-brand-50/50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Slug" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm" />
            <input placeholder="File URL" value={editing.file_url} onChange={(e) => setEditing({ ...editing, file_url: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm" />
            <input placeholder="Title FR" value={editing.title_fr} onChange={(e) => setEditing({ ...editing, title_fr: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm" />
            <input placeholder="Title AR" value={editing.title_ar} onChange={(e) => setEditing({ ...editing, title_ar: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm" />
            <input placeholder="Category" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm" />
            <input placeholder="Subject" value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm" />
            <input type="number" placeholder="Year" value={editing.year ?? ""} onChange={(e) => setEditing({ ...editing, year: parseInt(e.target.value) || null })} className="rounded-lg border border-border px-3 py-2 text-sm" />
            <input placeholder="File Type" value={editing.file_type} onChange={(e) => setEditing({ ...editing, file_type: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="inline-flex items-center gap-1 rounded-lg bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700"><Save className="h-4 w-4" /> Save</button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.title_fr}</p>
              <p className="text-xs text-muted">{item.category} • {item.subject} • {item.year || "N/A"}</p>
            </div>
            <button onClick={() => setEditing(item)} className="p-1.5 rounded-lg hover:bg-muted"><Pencil className="h-4 w-4" /></button>
            <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="h-4 w-4 text-red-500" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArticlesManager() {
  const [items, setItems] = useState<ArticleRow[]>([]);
  const [editing, setEditing] = useState<ArticleRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("articles").select("*").order("created_at", { ascending: false }).then(({ data }) => { setItems(data || []); setLoading(false); });
  }, []);

  const handleSave = async () => {
    if (!editing) return;
    const { id, ...rest } = editing;
    if (editing.id.startsWith("new-")) {
      const { data } = await supabase.from("articles").insert(rest).select().single();
      if (data) setItems((prev) => [data, ...prev.filter((i) => !i.id.startsWith("new-"))]);
    } else {
      await supabase.from("articles").update(rest).eq("id", id);
      setItems((prev) => prev.map((i) => (i.id === id ? editing : i)));
    }
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    await supabase.from("articles").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  if (loading) return <p className="text-muted">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Articles ({items.length})</h2>
        <button onClick={() => setEditing({ ...emptyArticle, id: "new-" + Date.now() })} className="inline-flex items-center gap-1 rounded-lg bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
          <Plus className="h-4 w-4" /> Add Article
        </button>
      </div>

      {editing && (
        <div className="mb-4 p-4 rounded-lg border border-brand-200 bg-brand-50/50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Slug" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm" />
            <input placeholder="Category" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm" />
            <input placeholder="Title FR" value={editing.title_fr} onChange={(e) => setEditing({ ...editing, title_fr: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm" />
            <input placeholder="Title AR" value={editing.title_ar} onChange={(e) => setEditing({ ...editing, title_ar: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm" />
          </div>
          <input placeholder="Excerpt FR" value={editing.excerpt_fr} onChange={(e) => setEditing({ ...editing, excerpt_fr: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
          <input placeholder="Excerpt AR" value={editing.excerpt_ar} onChange={(e) => setEditing({ ...editing, excerpt_ar: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
          <textarea placeholder="Content FR" value={editing.content_fr} onChange={(e) => setEditing({ ...editing, content_fr: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm" rows={4} />
          <textarea placeholder="Content AR" value={editing.content_ar} onChange={(e) => setEditing({ ...editing, content_ar: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm" rows={4} />
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={editing.is_published} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
            <label className="text-sm">Published</label>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="inline-flex items-center gap-1 rounded-lg bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700"><Save className="h-4 w-4" /> Save</button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.title_fr}</p>
              <p className="text-xs text-muted">{item.category || "Uncategorized"} • {item.view_count ?? 0} views</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
              {item.is_published ? "Published" : "Draft"}
            </span>
            <button onClick={() => setEditing(item)} className="p-1.5 rounded-lg hover:bg-muted"><Pencil className="h-4 w-4" /></button>
            <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="h-4 w-4 text-red-500" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
