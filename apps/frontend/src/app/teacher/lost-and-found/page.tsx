"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Search, Plus, MapPin, Calendar, Tag, Package, X, ImagePlus, CheckCircle, RotateCcw } from "lucide-react";
import clsx from "clsx";

type ItemType = "lost" | "found";
type ItemStatus = "active" | "claimed";
type PostedByRole = "teacher" | "principal";
type TabFilter = "all" | "lost" | "found" | "claimed";

interface LostFoundItem {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  location: string;
  date: string;
  postedBy: string;
  postedByRole: PostedByRole;
  status: ItemStatus;
  bgColor: string;
  tags: string[];
}

const INITIAL_ITEMS: LostFoundItem[] = [
  {
    id: "1", type: "lost", title: "Black School Bag", description: "A black Jansport backpack with a broken zipper on the front pocket. Has a keychain attached.", location: "Grade 10-A Classroom", date: "2026-04-22", postedBy: "Samantha Perera", postedByRole: "teacher", status: "active", bgColor: "bg-slate-200", tags: ["bag", "uniform"],
  },
  {
    id: "2", type: "found", title: "Water Bottle (Blue)", description: "Blue metal water bottle found near the canteen. Has stickers on the side.", location: "Canteen", date: "2026-04-21", postedBy: "Samantha Perera", postedByRole: "teacher", status: "active", bgColor: "bg-blue-100", tags: ["bottle"],
  },
  {
    id: "3", type: "lost", title: "Scientific Calculator", description: "Casio fx-991EX scientific calculator. Student name written on the back.", location: "Library", date: "2026-04-20", postedBy: "Mr. De Silva", postedByRole: "principal", status: "active", bgColor: "bg-yellow-100", tags: ["stationery", "electronics"],
  },
  {
    id: "4", type: "found", title: "Glasses Case", description: "Brown leather glasses case with a pair of prescription glasses inside.", location: "School Office", date: "2026-04-19", postedBy: "Mr. De Silva", postedByRole: "principal", status: "claimed", bgColor: "bg-amber-100", tags: ["accessories"],
  },
  {
    id: "5", type: "found", title: "ID Card — Nimal Bandara", description: "Student ID card found near the sports ground. Grade 9 student.", location: "Sports Ground", date: "2026-04-18", postedBy: "Samantha Perera", postedByRole: "teacher", status: "active", bgColor: "bg-green-100", tags: ["id", "documents"],
  },
  {
    id: "6", type: "lost", title: "PE Kit Bag", description: "White drawstring PE kit bag with red stripes. Contains shorts and a t-shirt.", location: "Changing Room", date: "2026-04-17", postedBy: "Samantha Perera", postedByRole: "teacher", status: "claimed", bgColor: "bg-red-100", tags: ["bag", "uniform"],
  },
  {
    id: "7", type: "found", title: "Geometry Box", description: "Blue plastic geometry box containing compass, protractor, and rulers.", location: "Grade 8-B Classroom", date: "2026-04-16", postedBy: "Mr. De Silva", postedByRole: "principal", status: "active", bgColor: "bg-purple-100", tags: ["stationery"],
  },
];

interface PostForm {
  type: ItemType;
  title: string;
  location: string;
  date: string;
  description: string;
}

const EMPTY_FORM: PostForm = { type: "lost", title: "", location: "", date: "", description: "" };

export default function TeacherLostAndFoundPage() {
  const [items, setItems] = useState<LostFoundItem[]>(INITIAL_ITEMS);
  const [tab, setTab] = useState<TabFilter>("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<PostForm>(EMPTY_FORM);

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

  const stats = {
    active: items.filter((i) => i.status === "active").length,
    lost: items.filter((i) => i.type === "lost" && i.status === "active").length,
    found: items.filter((i) => i.type === "found" && i.status === "active").length,
  };

  const handleToggleStatus = (id: string) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, status: item.status === "active" ? "claimed" : "active" } : item));
  };

  const handlePost = () => {
    if (!form.title || !form.location) return;
    const newItem: LostFoundItem = {
      id: Date.now().toString(),
      type: form.type,
      title: form.title,
      description: form.description,
      location: form.location,
      date: form.date || new Date().toISOString().split("T")[0],
      postedBy: "Samantha Perera",
      postedByRole: "teacher",
      status: "active",
      bgColor: form.type === "lost" ? "bg-orange-100" : "bg-teal-100",
      tags: [],
    };
    setItems((prev) => [newItem, ...prev]);
    setShowModal(false);
    setForm(EMPTY_FORM);
    setTab("all");
  };

  const TABS: { key: TabFilter; label: string }[] = [
    { key: "all", label: "All Items" },
    { key: "lost", label: "Lost" },
    { key: "found", label: "Found" },
    { key: "claimed", label: "Claimed / Closed" },
  ];

  return (
    <div className="flex flex-col gap-6 pb-12 w-full pr-2">
      <PageHeader title="Lost & Found" subtitle="Track and manage lost and found items across the school." />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Items", value: stats.active, color: "text-[#4f46e5]", bg: "bg-indigo-50" },
          { label: "Lost Items", value: stats.lost, color: "text-red-600", bg: "bg-red-50" },
          { label: "Found Items", value: stats.found, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-[16px] p-5 shadow-sm flex items-center gap-4">
            <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center", bg)}>
              <Package className={clsx("w-5 h-5", color)} />
            </div>
            <div>
              <p className="text-[22px] font-bold text-[#0f172a]">{value}</p>
              <p className="text-[12px] font-medium text-[#64748b]">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + Search + Post button */}
      <div className="bg-white border border-gray-200 rounded-[20px] p-5 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={clsx(
                  "px-4 py-2 rounded-lg text-[13px] font-bold transition-all",
                  tab === key ? "bg-white text-[#0f172a] shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search + Post */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items..."
                className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-[13px] font-medium text-[#0f172a] outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100 w-[200px]"
              />
            </div>
            <button
              onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#4f46e5] hover:bg-indigo-700 text-white text-[13px] font-bold rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Post Item
            </button>
          </div>
        </div>
      </div>

      {/* Item Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 bg-white border border-gray-200 rounded-[20px]">
          <Package className="w-10 h-10 mb-3 text-gray-300" />
          <p className="font-semibold text-[#334155]">No items found</p>
          <p className="text-sm mt-1">Try adjusting your filters or post a new item.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} onToggleStatus={handleToggleStatus} />
          ))}
        </div>
      )}

      {/* Post Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#0f172a]">Post an Item</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Type Toggle */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-[#64748b]">Item Type</label>
              <div className="flex gap-3">
                {(["lost", "found"] as ItemType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm((p) => ({ ...p, type: t }))}
                    className={clsx(
                      "flex-1 py-2.5 rounded-xl border-2 text-[13px] font-bold capitalize transition-all",
                      form.type === t
                        ? t === "lost" ? "border-red-500 bg-red-50 text-red-600" : "border-emerald-500 bg-emerald-50 text-emerald-600"
                        : "border-gray-200 text-gray-400 hover:border-gray-300"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-bold text-[#64748b]">Item Title <span className="text-red-400">*</span></label>
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Black School Bag" className="px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-medium text-[#0f172a] outline-none focus:border-[#4f46e5] focus:ring-[3px] focus:ring-indigo-100/50 bg-gray-50/30" />
            </div>

            {/* Location + Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-[6px]">
                <label className="text-[13px] font-bold text-[#64748b]">Location <span className="text-red-400">*</span></label>
                <input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="e.g. Library" className="px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-medium text-[#0f172a] outline-none focus:border-[#4f46e5] focus:ring-[3px] focus:ring-indigo-100/50 bg-gray-50/30" />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[13px] font-bold text-[#64748b]">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-medium text-[#0f172a] outline-none focus:border-[#4f46e5] focus:ring-[3px] focus:ring-indigo-100/50 bg-gray-50/30" />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-bold text-[#64748b]">Description</label>
              <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Describe the item..." rows={3} className="px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-medium text-[#0f172a] outline-none focus:border-[#4f46e5] focus:ring-[3px] focus:ring-indigo-100/50 bg-gray-50/30 resize-none" />
            </div>

            {/* Image placeholder */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-bold text-[#64748b]">Photo (Optional)</label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 cursor-pointer hover:border-indigo-300 hover:text-indigo-400 transition-colors">
                <ImagePlus className="w-5 h-5" />
                <span className="text-[13px] font-medium">Click to attach a photo</span>
              </div>
            </div>

            <button
              onClick={handlePost}
              disabled={!form.title || !form.location}
              className={clsx(
                "w-full py-3 rounded-xl text-[14px] font-bold transition-colors",
                !form.title || !form.location
                  ? "bg-indigo-300 text-white cursor-not-allowed"
                  : "bg-[#4f46e5] hover:bg-indigo-700 text-white shadow-sm"
              )}
            >
              Post Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemCard({ item, onToggleStatus }: { item: LostFoundItem; onToggleStatus: (id: string) => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-[20px] shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Image placeholder */}
      <div className={clsx("w-full h-[120px] flex items-center justify-center relative", item.bgColor)}>
        <Package className="w-10 h-10 text-white/60" />
        <div className={clsx(
          "absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold",
          item.type === "lost" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
        )}>
          {item.type === "lost" ? "Lost" : "Found"}
        </div>
        <div className={clsx(
          "absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold",
          item.status === "active" ? "bg-white/90 text-gray-700" : "bg-gray-800/80 text-white"
        )}>
          {item.status === "active" ? "Active" : "Claimed"}
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="text-[15px] font-bold text-[#0f172a] leading-tight">{item.title}</h3>

        <p className="text-[13px] text-[#64748b] leading-relaxed line-clamp-2">{item.description}</p>

        <div className="flex flex-col gap-1.5 text-[12px] text-[#64748b] font-medium">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            {item.location}
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            {new Date(item.date + "T12:00:00").toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-[11px] font-medium text-gray-500">
                <Tag className="w-2.5 h-2.5" />{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
              {item.postedBy.charAt(0)}
            </div>
            <div>
              <p className="text-[12px] font-bold text-[#334155]">{item.postedBy}</p>
              <span className={clsx(
                "text-[10px] font-bold capitalize",
                item.postedByRole === "principal" ? "text-amber-600" : "text-indigo-500"
              )}>
                {item.postedByRole}
              </span>
            </div>
          </div>

          <button
            onClick={() => onToggleStatus(item.id)}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors",
              item.status === "active"
                ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            )}
          >
            {item.status === "active" ? (
              <><CheckCircle className="w-3.5 h-3.5" /> Mark Claimed</>
            ) : (
              <><RotateCcw className="w-3.5 h-3.5" /> Reopen</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
