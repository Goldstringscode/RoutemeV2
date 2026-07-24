import React, { useState } from "react";
import { X, Plus, Search, UserPlus } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

export default function RouteBuilderModal({ open, onClose }) {
  const { clients, scheduleIds, addClient, createRoute } = useRouteMe();

  // Tabs: "new" | "existing"
  const [tab, setTab] = useState("new");

  // New client form
  const [form, setForm] = useState({
    fullName: "",
    address: "",
    lat: "",
    lng: "",
    window: "",
    duration: 30,
    priority: "medium",
    phone: "",
    condition: "",
  });

  // Existing client search
  const [search, setSearch] = useState("");

  if (!open) return null;

  const handleAddNew = (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) return;
    addClient({
      fullName: form.fullName.trim(),
      address: form.address.trim(),
      lat: parseFloat(form.lat) || undefined,
      lng: parseFloat(form.lng) || undefined,
      window: form.window,
      duration: parseInt(form.duration, 10) || 30,
      priority: form.priority,
      phone: form.phone,
      condition: form.condition,
    });
    setForm({ fullName: "", address: "", lat: "", lng: "", window: "", duration: 30, priority: "medium", phone: "", condition: "" });
    onClose();
  };

  const handleAddExisting = (clientId) => {
    createRoute([...scheduleIds, clientId]);
    onClose();
  };

  // Clients not already on the route
  const availableClients = clients.filter((c) => !scheduleIds.includes(c.id));
  const filteredClients = search
    ? availableClients.filter((c) =>
        c.fullName?.toLowerCase().includes(search.toLowerCase())
      )
    : availableClients;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-3xl border border-stone-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
          <div>
            <h2 className="font-display text-2xl">Add to route</h2>
            <p className="text-xs text-stone-500 mt-1">Add a new client or pick an existing one.</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-stone-100">
            <X className="h-4 w-4 text-stone-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-100 px-6">
          <button
            onClick={() => setTab("new")}
            className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors ${
              tab === "new"
                ? "border-[#D95D39] text-[#D95D39]"
                : "border-transparent text-stone-500 hover:text-stone-700"
            }`}
          >
            New client
          </button>
          <button
            onClick={() => setTab("existing")}
            className={`pb-3 px-1 text-sm font-semibold border-b-2 ml-6 transition-colors ${
              tab === "existing"
                ? "border-[#D95D39] text-[#D95D39]"
                : "border-transparent text-stone-500 hover:text-stone-700"
            }`}
          >
            Add existing client
          </button>
        </div>

        {/* Tab: New client form */}
        {tab === "new" && (
          <form onSubmit={handleAddNew} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Full name *</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                placeholder="e.g. Jane Doe"
                required
                className="w-full rounded-xl border border-stone-200 bg-[#F9F8F6] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D95D39]/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="123 Main St"
                  className="w-full rounded-xl border border-stone-200 bg-[#F9F8F6] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D95D39]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Time window</label>
                <input
                  type="text"
                  value={form.window}
                  onChange={(e) => setForm((f) => ({ ...f, window: e.target.value }))}
                  placeholder="08:00 – 09:30"
                  className="w-full rounded-xl border border-stone-200 bg-[#F9F8F6] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D95D39]/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={form.lat}
                  onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
                  placeholder="34.05"
                  className="w-full rounded-xl border border-stone-200 bg-[#F9F8F6] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D95D39]/30 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={form.lng}
                  onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
                  placeholder="-118.24"
                  className="w-full rounded-xl border border-stone-200 bg-[#F9F8F6] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D95D39]/30 font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Duration (min)</label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                  className="w-full rounded-xl border border-stone-200 bg-[#F9F8F6] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D95D39]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                  className="w-full rounded-xl border border-stone-200 bg-[#F9F8F6] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D95D39]/30"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Condition</label>
              <input
                type="text"
                value={form.condition}
                onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value }))}
                placeholder="e.g. Post-op care"
                className="w-full rounded-xl border border-stone-200 bg-[#F9F8F6] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D95D39]/30"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-[#D95D39] text-white py-3 text-sm font-semibold hover:bg-[#C05030] transition-colors"
            >
              <Plus className="h-4 w-4 inline mr-1" /> Add to route
            </button>
          </form>
        )}

        {/* Tab: Add existing client */}
        {tab === "existing" && (
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clients..."
                className="w-full rounded-xl border border-stone-200 bg-[#F9F8F6] pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D95D39]/30"
              />
            </div>
            {filteredClients.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="h-8 w-8 mx-auto text-stone-300" />
                <p className="text-sm text-stone-500 mt-2">
                  {search ? "No matching clients found." : "All clients are already on the route."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredClients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleAddExisting(c.id)}
                    className="w-full text-left flex items-center justify-between rounded-xl border border-stone-200 p-3 hover:bg-stone-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{c.fullName}</p>
                      <p className="text-xs text-stone-500 truncate">{c.address || "—"}</p>
                    </div>
                    <Plus className="h-4 w-4 text-[#D95D39] shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
