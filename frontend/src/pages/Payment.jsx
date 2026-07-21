import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  ShieldCheck,
  CreditCard,
  Calendar,
  Building2,
  MapPin,
  Sparkles,
  Zap,
  Crown,
  Users,
} from "lucide-react";
import HipaaBadge from "@/components/HipaaBadge";

const TIER_ICONS = { solo: Users, growth: Sparkles, scale: Zap, enterprise: Crown };
const TIER_NAMES = { solo: "Solo", growth: "Growth", scale: "Scale", enterprise: "Enterprise" };

export default function Payment() {
  const [params] = useSearchParams();
  const plan = params.get("plan") ?? "growth";
  const seats = parseInt(params.get("seats") ?? "1", 10);
  const billing = params.get("billing") ?? "monthly";
  const total = parseInt(params.get("total") ?? "0", 10);
  const name = params.get("name") ?? "";
  const email = params.get("email") ?? "";
  const org = params.get("org") ?? "";
  const Icon = TIER_ICONS[plan] ?? Sparkles;
  const tierName = TIER_NAMES[plan] ?? "Growth";

  const navigate = useNavigate();

  const [method, setMethod] = useState("card"); // card | ach
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [card, setCard] = useState({
    holder: name || "",
    number: "",
    exp: "",
    cvc: "",
  });
  const [billingAddr, setBillingAddr] = useState({
    line1: "",
    city: "",
    state: "TX",
    zip: "",
    country: "US",
  });

  const formatCard = (v) =>
    v.replace(/[^\d]/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExp = (v) => {
    const d = v.replace(/[^\d]/g, "").slice(0, 4);
    if (d.length < 3) return d;
    return `${d.slice(0, 2)} / ${d.slice(2)}`;
  };

  const canPay =
    card.holder && card.number.replace(/\s/g, "").length >= 15 &&
    card.exp.length >= 5 && card.cvc.length >= 3 &&
    billingAddr.line1 && billingAddr.city && billingAddr.zip;

  const pay = (e) => {
    e.preventDefault();
    if (!canPay) return;
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        const q = new URLSearchParams({ plan, name }).toString();
        navigate(`/welcome?${q}`);
      }, 1600);
    }, 1600);
  };

  const cardBrand = (() => {
    const n = card.number.replace(/\s/g, "");
    if (n.startsWith("4")) return "Visa";
    if (/^5[1-5]/.test(n)) return "Mastercard";
    if (/^3[47]/.test(n)) return "Amex";
    if (/^6/.test(n)) return "Discover";
    return null;
  })();

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-900">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-[#F9F8F6]/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative h-8 w-8 rounded-xl bg-stone-900 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 20 L10 6 L14 14 L20 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#D95D39] border-2 border-[#F9F8F6]" />
            </div>
            <span className="font-display text-xl font-semibold">RouteMe</span>
          </Link>
          <div className="flex items-center gap-3">
            <HipaaBadge compact />
            <div className="hidden md:inline-flex items-center gap-1.5 text-xs text-stone-500 rounded-full border border-stone-200 bg-white px-3 py-1.5">
              <Lock className="h-3 w-3" /> Secure checkout · 256-bit TLS
            </div>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="mx-auto max-w-6xl px-6 lg:px-10 pt-8">
        <div className="flex items-center gap-2 text-xs">
          <button onClick={() => navigate(-1)} data-testid="pay-back" className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-900">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to account
          </button>
          <span className="text-stone-300">·</span>
          <Step label="Plan" done />
          <span className="text-stone-300">→</span>
          <Step label="Account" done />
          <span className="text-stone-300">→</span>
          <Step label="Payment" current />
        </div>
      </div>

      {/* Success overlay */}
      {success && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-3xl bg-white p-8 text-center rm-fade-up">
            <div className="mx-auto h-16 w-16 rounded-full bg-[#E3ECE5] flex items-center justify-center">
              <Check className="h-8 w-8 text-emerald-600" strokeWidth={2.5} />
            </div>
            <h2 className="font-display text-3xl mt-5">You&apos;re in.</h2>
            <p className="text-stone-600 mt-2 text-sm">
              Welcome to RouteMe {tierName}. Setting up your {plan === "solo" ? "workspace" : "agency console"}…
            </p>
            <div className="mt-6 h-1 w-full rounded-full bg-stone-100 overflow-hidden">
              <div className="h-full bg-[#D95D39] animate-[progress_1.4s_ease-in-out]" style={{ width: "100%" }} />
            </div>
          </div>
          <style>{`@keyframes progress { from { width: 0% } to { width: 100% } }`}</style>
        </div>
      )}

      <section className="mx-auto max-w-6xl px-6 lg:px-10 py-10 lg:py-14 grid lg:grid-cols-12 gap-10">
        {/* LEFT — form */}
        <div className="lg:col-span-7">
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-4">
            Step 3 · Payment
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            Almost <span className="font-serif-i text-[#D95D39]">there</span>.
          </h1>
          <p className="mt-3 text-stone-600">
            Your card is charged today and every {billing === "annual" ? "year" : "month"}. Cancel anytime — refund guaranteed for 14 days.
          </p>

          {/* Method toggle */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            <MethodTile
              active={method === "card"}
              onClick={() => setMethod("card")}
              testId="pay-method-card"
              icon={CreditCard}
              label="Card"
              sub="Visa · MC · Amex · Discover"
            />
            <MethodTile
              active={method === "ach"}
              onClick={() => setMethod("ach")}
              testId="pay-method-ach"
              icon={Building2}
              label="ACH / Bank"
              sub="US only · saves 1% fee"
            />
          </div>

          <form onSubmit={pay} className="mt-6 space-y-5" data-testid="pay-form">
            {method === "card" ? (
              <>
                <Field label="Cardholder name" required>
                  <PayInput
                    data-testid="pay-holder"
                    required
                    value={card.holder}
                    onChange={(e) => setCard({ ...card, holder: e.target.value })}
                    placeholder="AMARA OKAFOR"
                  />
                </Field>

                <Field label="Card number" required>
                  <div className="relative">
                    <PayInput
                      data-testid="pay-number"
                      required
                      value={card.number}
                      onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })}
                      placeholder="4242 4242 4242 4242"
                      inputMode="numeric"
                      icon={CreditCard}
                    />
                    {cardBrand && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-widest text-stone-500 rounded-md border border-stone-200 bg-stone-50 px-1.5 py-0.5">
                        {cardBrand}
                      </span>
                    )}
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Expiry" required>
                    <PayInput
                      data-testid="pay-exp"
                      required
                      value={card.exp}
                      onChange={(e) => setCard({ ...card, exp: formatExp(e.target.value) })}
                      placeholder="MM / YY"
                      icon={Calendar}
                      maxLength={7}
                    />
                  </Field>
                  <Field label="CVC" required>
                    <PayInput
                      data-testid="pay-cvc"
                      required
                      value={card.cvc}
                      onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                      placeholder="123"
                      icon={Lock}
                    />
                  </Field>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center">
                <Building2 className="h-8 w-8 text-[#D95D39] mx-auto" />
                <p className="mt-3 font-semibold">ACH direct debit</p>
                <p className="text-sm text-stone-600 mt-1">
                  You&apos;ll be redirected to our banking partner to verify micro-deposits. Takes 1–2 business days to activate — meanwhile enjoy a 7-day free bridge.
                </p>
                <p className="mt-4 text-xs text-stone-500">(Mocked in this prototype — click Pay to simulate)</p>
              </div>
            )}

            <div className="pt-4 border-t border-stone-200">
              <p className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-3">
                Billing address
              </p>
              <div className="space-y-4">
                <Field label="Street" required>
                  <PayInput
                    data-testid="pay-addr-line1"
                    required
                    value={billingAddr.line1}
                    onChange={(e) => setBillingAddr({ ...billingAddr, line1: e.target.value })}
                    placeholder="1204 Pecan Grove Ln"
                    icon={MapPin}
                  />
                </Field>
                <div className="grid grid-cols-6 gap-4">
                  <Field label="City" required>
                    <PayInput
                      data-testid="pay-city"
                      required
                      value={billingAddr.city}
                      onChange={(e) => setBillingAddr({ ...billingAddr, city: e.target.value })}
                      placeholder="Austin"
                    />
                  </Field>
                  <div className="col-span-2">
                    <Field label="State">
                      <PaySelect
                        data-testid="pay-state"
                        value={billingAddr.state}
                        onChange={(e) => setBillingAddr({ ...billingAddr, state: e.target.value })}
                        options={["TX", "CA", "FL", "NY", "MN", "CO", "OR", "WA", "IL", "MA", "AZ", "LA", "TN"]}
                      />
                    </Field>
                  </div>
                  <div className="col-span-2">
                    <Field label="ZIP" required>
                      <PayInput
                        data-testid="pay-zip"
                        required
                        value={billingAddr.zip}
                        onChange={(e) => setBillingAddr({ ...billingAddr, zip: e.target.value.replace(/\D/g, "").slice(0, 5) })}
                        placeholder="78745"
                        inputMode="numeric"
                      />
                    </Field>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!canPay || processing}
              data-testid="pay-submit"
              className={`w-full inline-flex items-center justify-center gap-2 rounded-full h-14 text-sm font-semibold transition-colors ${
                canPay && !processing
                  ? "bg-[#D95D39] hover:bg-[#C05030] text-white"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed"
              }`}
            >
              {processing ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Pay ${total.toLocaleString()} · activate {tierName}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="flex items-center gap-2 justify-center text-xs text-stone-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Payments processed by Stripe · PCI-DSS Level 1 · your card details never touch our servers
            </div>
          </form>
        </div>

        {/* RIGHT — Order summary */}
        <aside className="lg:col-span-5 lg:sticky lg:top-24 self-start">
          <div className="rounded-3xl bg-stone-900 text-white p-7 relative overflow-hidden">
            <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-[#D95D39]/40 blur-3xl" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60 font-semibold">Order summary</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-[#F7E5DD]" />
                </div>
                <div>
                  <h2 className="font-display text-2xl">RouteMe · {tierName}</h2>
                  <p className="text-xs text-white/60 capitalize">{billing} billing</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-black/40 border border-white/10 p-4 space-y-3">
                <Row label={`${seats} seat${seats === 1 ? "" : "s"}`} value={`× ${tierName}`} />
                <Row label="Cycle" value={billing === "annual" ? "12 months" : "1 month"} />
                {billing === "annual" && (
                  <Row label="Annual discount" value="−15%" tone="emerald" />
                )}
                {org && <Row label="Organization" value={org} />}
                {email && <Row label="Billed to" value={email} />}
              </div>

              <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span>Subtotal</span>
                  <span className="tabular-nums">${total.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-white/70 mt-1">
                  <span>Tax</span>
                  <span className="tabular-nums">calculated after ZIP</span>
                </div>
                <div className="flex items-end justify-between mt-3 pt-3 border-t border-white/10">
                  <span className="text-sm font-semibold text-white">Due today</span>
                  <span className="font-display text-4xl tabular-nums" data-testid="pay-total">
                    ${total.toLocaleString()}
                  </span>
                </div>
              </div>

              <ul className="mt-6 space-y-2 text-sm">
                <Perk>14-day money-back guarantee</Perk>
                <Perk>Cancel anytime from account settings</Perk>
                <Perk>BAA included · HIPAA-aligned</Perk>
                <Perk>Free onboarding session with your CSM</Perk>
              </ul>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#F7E5DD] flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-[#D95D39]" />
            </div>
            <div>
              <p className="text-sm font-semibold">Encrypted end-to-end</p>
              <p className="text-xs text-stone-500">Card details tokenized · never stored on RouteMe servers</p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function Step({ label, done, current }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest font-semibold ${
        current
          ? "bg-stone-900 text-white"
          : done
            ? "bg-[#E3ECE5] text-emerald-800 border border-emerald-100"
            : "bg-stone-100 text-stone-500 border border-stone-200"
      }`}
    >
      {done && <Check className="h-3 w-3" />}
      {label}
    </span>
  );
}

function MethodTile({ active, onClick, testId, icon: Icon, label, sub }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={`rounded-2xl border p-4 text-left transition-colors ${
        active
          ? "border-stone-900 bg-white ring-4 ring-stone-100"
          : "border-stone-200 bg-white hover:border-stone-400"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#D95D39]" />
        <span className="font-semibold text-sm">{label}</span>
        {active && <Check className="h-4 w-4 text-emerald-500 ml-auto" />}
      </div>
      <p className="text-xs text-stone-500 mt-1">{sub}</p>
    </button>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-stone-700 tracking-wide flex items-center gap-1">
        {label}
        {required && <span className="text-[#D95D39]">*</span>}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function PayInput({ icon: Icon, ...props }) {
  return (
    <div className="flex items-center gap-2 h-12 rounded-xl border border-stone-200 bg-white px-3 focus-within:border-stone-500 focus-within:ring-4 focus-within:ring-stone-100">
      {Icon && <Icon className="h-4 w-4 text-stone-400" />}
      <input {...props} className="flex-1 bg-transparent text-sm outline-none tabular-nums placeholder:text-stone-400" />
    </div>
  );
}

function PaySelect({ options, ...props }) {
  return (
    <div className="flex items-center gap-2 h-12 rounded-xl border border-stone-200 bg-white px-3 focus-within:border-stone-500 focus-within:ring-4 focus-within:ring-stone-100">
      <select {...props} className="flex-1 bg-transparent text-sm outline-none">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Row({ label, value, tone }) {
  const c = tone === "emerald" ? "text-emerald-300" : "text-white/80";
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/60">{label}</span>
      <span className={`tabular-nums ${c}`}>{value}</span>
    </div>
  );
}

function Perk({ children }) {
  return (
    <li className="flex items-start gap-2 text-white/80">
      <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  );
}