"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Search, Plus, MapPin, Calendar, Package, X, CheckCircle, RotateCcw, Loader2 } from "lucide-react";
import clsx from "clsx";
import { request } from "@/shared/lib/api-client";
import { toast } from "react-hot-toast";

type ItemType = "lost" | "found";
type ItemStatus = "active" | "claimed";
type TabFilter = "all" | "lost" | "found" | "claimed";

interface LostFoundItem {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  location: string;
  date: string;
  postedBy: string;
  postedByRole: string;
  status: ItemStatus;
  bgColor: string;
}

interface PostForm {
  type: ItemType;
  title: string;
  location: string;
  date: string;
  description: string;
}

interface BoardPost {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  location: string;
  timeAgo: string;
  authorName: string;
  role: string;
  status: string;
  photo_url?: string;
}

const EMPTY_FORM: PostForm = { type: "found", title: "", location: "", date: "", description: "" };

export default function AdminLostAndFoundPage() {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [tab, setTab] = useState<TabFilter>("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<PostForm>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    const res = await request<BoardPost[]>("/api/lost-found/board");
    if (res.ok) {
      const mapped: LostFoundItem[] = res.data.map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        location: item.location,
        date: item.timeAgo,
        postedBy: item.authorName,
        postedByRole: item.role,
        status: item.status === "unclaimed" || item.status === "open" ? "active" : "claimed",
        bgColor: item.type === "lost" ? "bg-red-50" : "bg-emerald-50",
      }));
      setItems(mapped);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchItems();
    }, 0);
    return () => clearTimeout(timeout);
  }, [fetchItems]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchTab =
        tab === "all" ? true :
        tab === "claimed" ? item.status === "claimed" :
        item.type === tab && item.status === "active";
      const matchSearch = search === "" || item.title.toLowerCase().includes(search.toLowerCase()) || item.location.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [items, tab, search]);

  const handleToggleStatus = async (id: string, type: ItemType) => {
    const endpoint = type === 'found' ? `/api/lost-found/items/${id}/collected` : `/api/lost-found/reports/${id}/recovered`;
    const res = await request(endpoint, { method: 'PUT' });
    if (res.ok) {
      toast.success("Status updated");
      void fetchItems();
    } else {
      toast.error("Failed to update status");
    }
  };

  const handlePost = async () => {
    if (!form.title || !form.location) return;
    const endpoint = form.type === 'found' ? '/api/lost-found/items' : '/api/lost-found/reports';
    const body = form.type === 'found' ? {
      item_name: form.title,
      description: form.description,
      found_at: form.location,
      found_date: form.date || new Date().toISOString()
    } : {
      item_name: form.title,
      description: form.description,
      student_id: "", // Admin might need to select a student if posting LOST.
      date_lost: form.date || new Date().toISOString()
    };

    const res = await request(endpoint, { method: 'POST', body: JSON.stringify(body) });
    if (res.ok) {
      toast.success("Posted successfully");
      setShowModal(false);
      setForm(EMPTY_FORM);
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to post");
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 w-full pr-2">
      <PageHeader title="Lost & Found Management" subtitle="Overview of all items reported lost or found across the institution." />

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-[20px] p-5 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
            {[
              { key: "all", label: "All Items" },
              { key: "lost", label: "Lost" },
              { key: "found", label: "Found" },
              { key: "claimed", label: "Claimed" },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key as TabFilter)} className={clsx("px-4 py-2 rounded-lg text-[13px] font-bold transition-all", tab === key ? "bg-white text-[#0f172a] shadow-sm" : "text-gray-500 hover:text-gray-700")}>
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items..." className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-[13px] font-medium outline-none focus:border-[#4f46e5] w-[200px]" />
            </div>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#4f46e5] text-white text-[13px] font-bold rounded-xl hover:bg-indigo-700 transition-colors">
              <Plus className="w-4 h-4" /> Post Item
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center text-gray-400 bg-white border border-gray-200 rounded-[20px]">
            <Package className="w-10 h-10 mb-3 text-gray-300" />
            <p className="font-semibold text-[#334155]">No items found</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-[20px] shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className={clsx("w-full h-[120px] flex items-center justify-center relative", item.bgColor)}>
                <Package className="w-10 h-10 text-white/60" />
                <div className={clsx("absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold", item.type === "lost" ? "bg-red-500 text-white" : "bg-emerald-500 text-white")}>
                  {item.type === "lost" ? "Lost" : "Found"}
                </div>
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 text-gray-700">
                  {item.status}
                </div>
              </div>
              <div className="p-5 flex flex-col gap-3 flex-1">
                <h3 className="text-[15px] font-bold text-[#0f172a] leading-tight">{item.title}</h3>
                <p className="text-[13px] text-[#64748b] leading-relaxed line-clamp-2">{item.description}</p>
                <div className="flex flex-col gap-1.5 text-[12px] text-[#64748b] font-medium">
                  <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {item.location}</div>
                  <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" /> {new Date(item.date).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                  <div className="flex flex-col">
                    <p className="text-[12px] font-bold text-[#334155]">{item.postedBy}</p>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">{item.postedByRole}</span>
                  </div>
                  <button onClick={() => handleToggleStatus(item.id, item.type)} className={clsx("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors", item.status === "active" ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-gray-100 text-gray-500")}>
                    {item.status === "active" ? <><CheckCircle className="w-3.5 h-3.5" /> Close</> : <><RotateCcw className="w-3.5 h-3.5" /> Reopen</>}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal placeholder - similar to teacher modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
           <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#0f172a]">Post an Item</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-[#64748b]">Item Type</label>
              <div className="flex gap-3">
                {(["lost", "found"] as ItemType[]).map((t) => (
                  <button key={t} onClick={() => setForm((p) => ({ ...p, type: t }))} className={clsx("flex-1 py-2.5 rounded-xl border-2 text-[13px] font-bold capitalize transition-all", form.type === t ? (t === "lost" ? "border-red-500 bg-red-50 text-red-600" : "border-emerald-500 bg-emerald-50 text-emerald-600") : "border-gray-200 text-gray-400 hover:border-gray-300")}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-bold text-[#64748b]">Item Title</label>
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Black School Bag" className="px-4 py-3 rounded-xl border border-gray-200 text-[14px] outline-none focus:border-[#4f46e5]" />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-bold text-[#64748b]">Location</label>
              <input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="e.g. Library" className="px-4 py-3 rounded-xl border border-gray-200 text-[14px] outline-none focus:border-[#4f46e5]" />
            </div>
            <button onClick={handlePost} className="w-full py-3 rounded-xl bg-[#4f46e5] text-white font-bold hover:bg-indigo-700 transition-colors">Post Item</button>
           </div>
        </div>
      )}
    </div>
  );
}
