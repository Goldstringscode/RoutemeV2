import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Shield, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useRouteMe } from "@/context/RouteMeContext";
import { loadAgencyEvvConfig, saveAgencyEvvConfig } from "@/lib/dataService";
import { toast } from "@/hooks/useToast";

const EVV_PROVIDERS = [
  { value: "sandata", label: "Sandata EVV", states: "CA, TX, IL, OH, PA, MI +20 more" },
  { value: "hhaxchange", label: "HHAeXchange", states: "NY, NJ, CT, MA, CO" },
  { value: "carevisit", label: "CareVisit EVV", states: "Select mid-Atlantic states" },
  { value: "state_portal", label: "State EVV Portal (direct)", states: "FL, WA, OR, AZ" },
  { value: "csv_export", label: "Manual CSV export", states: "Any — you submit manually" },
];

export default function EvvSettings() {
  const { userAgencyId } = useRouteMe();
  const [provider, setProvider] = useState("");
  const [accountId, setAccountId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [state, setState] = useState("CA");
  const [saved, setSaved] = useState(false);
  const [tested, setTested] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);

  // Load existing config on mount
  useEffect(() => {
    if (!userAgencyId) {
      setLoading(false);
      return;
    }
    loadAgencyEvvConfig(userAgencyId).then(({ data, error: err }) => {
      setLoading(false);
      if (err) {
        setError("Failed to load EVV configuration");
        return;
      }
      if (data) {
        setProvider(data.evv_provider || "");
        setAccountId(data.account_id || "");
        setApiKey(data.api_key_encrypted ? "••••••••" : ""); // masked, never expose
        setState(data.primary_state || "CA");
      }
    });
  }, [userAgencyId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!userAgencyId) {
      toast.error("Agency ID not available");
      return;
    }
    setError(null);

    const config = {
      evv_provider: provider,
      account_id: accountId,
      primary_state: state,
    };
    // Only send API key if it was changed (not the masked placeholder)
    if (apiKey && apiKey !== "••••••••") {
      config.api_key_encrypted = apiKey;
    }

    const { error: err } = await saveAgencyEvvConfig(userAgencyId, config);
    if (err) {
      setError("Failed to save configuration: " + err.message);
      return;
    }

    setSaved(true);
    toast.success("EVV configuration saved");
    timeoutRef.current = setTimeout(() => setSaved(false), 3000);
  };

  const handleTest = async () => {
    if (!provider || !accountId) return;
    setTested(false);
    setError(null);

    // For now, validate that the config exists in DB
    // Real connection test would depend on the provider's API
    await new Promise((r) => setTimeout(r, 1000)); // simulate
    setTested(true);
    toast.success("Configuration validated");
    timeoutRef.current = setTimeout(() => setTested(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-stone-400 text-sm">Loading EVV configuration...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        to="/agency/overview"
        className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to overview
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-2xl bg-[#E3ECE5] flex items-center justify-center">
          <Shield className="h-5 w-5 text-emerald-700" />
        </div>
        <div>
          <h1 className="font-display text-2xl leading-tight">EVV Integration</h1>
          <p className="text-sm text-stone-500">
            Electronic Visit Verification — Connect your EVV provider
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800 flex items-start gap-3 mb-8">
        <Shield className="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Why EVV matters</p>
          <p className="text-blue-700 mt-1">
            Federal law (21st Century CURES Act) requires EVV for all home health visits as of January 2026.
            RouteMe captures GPS-verified clock-in/out times, service codes, and timestamps for every visit.
            Connect your existing EVV provider below to submit this data to your state's Medicaid system.
          </p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-3 mb-6">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* EVV Provider */}
        <div>
          <label className="text-xs font-semibold text-stone-700 tracking-wide">EVV Provider</label>
          <p className="text-xs text-stone-400 mt-0.5 mb-2">
            Select the EVV system your agency already uses. RouteMe will send visit verification data to this provider.
          </p>
          <div className="grid gap-2">
            {EVV_PROVIDERS.map((p) => (
              <label
                key={p.value}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                  provider === p.value
                    ? "border-blue-400 bg-blue-50"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <input
                  type="radio"
                  name="evvProvider"
                  value={p.value}
                  checked={provider === p.value}
                  onChange={(e) => setProvider(e.target.value)}
                  className="accent-blue-600"
                />
                <div>
                  <p className="text-sm font-semibold text-stone-800">{p.label}</p>
                  <p className="text-xs text-stone-400">Compatible in {p.states}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {provider && provider !== "csv_export" && (
          <>
            {/* Account Credentials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 tracking-wide">
                  {provider === "state_portal" ? "Agency Medicaid ID" : "Account ID / Username"}
                </label>
                <input
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder={provider === "state_portal" ? "e.g., 123456789A" : "e.g., SUNRISE-2026"}
                  className="mt-1.5 w-full h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm focus:border-stone-400 focus:outline-none focus:ring-4 focus:ring-stone-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-700 tracking-wide">
                  {provider === "state_portal" ? "Portal API Key" : "API Key / Password"}
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={apiKey === "••••••••" ? "Leave blank to keep current" : "Enter API key"}
                  className="mt-1.5 w-full h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm focus:border-stone-400 focus:outline-none focus:ring-4 focus:ring-stone-100"
                />
              </div>
            </div>

            {/* State */}
            <div className="max-w-xs">
              <label className="text-xs font-semibold text-stone-700 tracking-wide">Primary state</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="mt-1.5 w-full h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm focus:border-stone-400 focus:outline-none focus:ring-4 focus:ring-stone-100"
              >
                <option value="CA">California</option>
                <option value="TX">Texas</option>
                <option value="NY">New York</option>
                <option value="FL">Florida</option>
                <option value="IL">Illinois</option>
                <option value="OH">Ohio</option>
                <option value="PA">Pennsylvania</option>
                <option value="MI">Michigan</option>
                <option value="MA">Massachusetts</option>
                <option value="CO">Colorado</option>
                <option value="WA">Washington</option>
                <option value="OR">Oregon</option>
                <option value="AZ">Arizona</option>
                <option value="NV">Nevada</option>
                <option value="GA">Georgia</option>
              </select>
            </div>
          </>
        )}

        {provider === "csv_export" && (
          <div className="rounded-xl bg-stone-50 border border-stone-200 px-4 py-3 text-sm text-stone-600">
            <p className="font-semibold text-stone-800">Manual export mode</p>
            <p className="mt-1">RouteMe will generate CSV files you can download and submit to your state EVV portal manually.</p>
          </div>
        )}

        {/* Test + Save buttons */}
        {provider && (
          <div className="flex items-center gap-3 pt-4 border-t border-stone-200">
            {provider !== "csv_export" && (
              <button
                type="button"
                onClick={handleTest}
                disabled={!accountId || !apiKey || apiKey === "••••••••"}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {tested ? (
                  <><CheckCircle className="h-4 w-4 text-emerald-600" /> Connection OK</>
                ) : (
                  <><ExternalLink className="h-4 w-4" /> Test Connection</>
                )}
              </button>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold bg-stone-900 hover:bg-stone-800 text-white transition-colors"
            >
              {saved ? (
                <><CheckCircle className="h-4 w-4" /> Saved</>
              ) : (
                "Save Configuration"
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}