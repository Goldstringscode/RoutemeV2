import React, { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Users,
  Sparkles,
  Zap,
  Crown,
  ShieldCheck,
  Mail,
  Lock,
  User,
  Building2,
  Phone,
  Eye,
  EyeOff,
  Award,
} from "lucide-react";
import HipaaBadge from "@/components/HipaaBadge";
import { useRouteMe } from "@/context/RouteMeContext";

const TIER_MAP = {
  solo: {
    id: "solo",
    name: "Solo",
    kicker: "For the independent nurse",
    icon: Users,
    price: 0,
    priceLabel: "Free",
    priceSub: "forever · 1 seat",
    features: [
      "Route optimization for up to 8 daily stops",
      "Voice-to-text visit notes",
      "Personal HIPAA audit trail",
      "Care flag templates",
    ],
    audience: "nurse",
  },
  growth: {
    id: "growth",
    name: "Growth",
    kicker: "For small home health teams",
    icon: Sparkles,
    price: 65,
    priceLabel: "$65",
    priceSub: "per seat / month · up to 20 seats",
    features: [
      "Agency admin console",
      "Live Command Center map",
      "Full HIPAA audit exports",
      "Nurse invites via secure link",
    ],
    audience: "agency",
    highlight: true,
  },
  scale: {
    id: "scale",
    name: "Scale",
    kicker: "For multi-region agencies",
    icon: Zap,
    price: 55,
    priceLabel: "$55",
    priceSub: "per seat / month · up to 100 seats",
    features: [
      "SSO / SAML authentication",
      "Custom BAA",
      "Dedicated CS Manager",
      "API access & webhooks",
    ],
    audience: "agency",
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    kicker: "For hospital networks & MSOs",
    icon: Crown,
    price: null,
    priceLabel: "Custom",
    priceSub: "tailored quote",
    features: [
      "Unlimited seats & agencies",
      "White-label branding",
      "On-prem / private cloud",
      "24/7 phone · 99.99% SLA",
    ],
    audience: "agency",
  },
};

export default function Signup() {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan") || "growth";
  const tier = TIER_MAP[planId] ?? TIER_MAP.growth;
  const Icon = tier.icon;
  const isFree = tier.price === 0;
  const isEnterprise = tier.price === null;
  const isAgency = tier.audience === "agency";

  const navigate = useNavigate();
  const { setAuthed, setAgencyAuthed } = useRouteMe();

  const [seats, setSeats] = useState(isAgency ? (tier.id === "scale" ? 25 : 5) : 1);
  const [billing, setBilling] = useState("monthly");
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    orgName: "",
    role: isAgency ? "Agency Director" : "Registered Nurse",
    licenseState: "TX",
    password: "",
  });

  const monthlyTotal = useMemo(() => {
    if (isFree || isEnterprise) return 0;
    const base = tier.price * seats;
    return billing === "annual" ? Math.round(base * 0.85) : base;
  }, [tier, seats, billing, isFree, isEnterprise]);

  const dueToday = isFree ? 0 : isEnterprise ? null : billing === "annual" ? monthlyTotal * 12 : monthlyTotal;

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const validPw = form.password.length >= 8;
  const canSubmit =
    form.firstName && form.lastName && validEmail && validPw && agree &&
    (!isAgency || (form.orgName && form.phone));

  const submit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    const fullName = `${form.firstName} ${form.lastName}`;
    if (isFree) {
      navigate(`/welcome?plan=solo&name=${encodeURIComponent(fullName)}`);
      return;
    }
    if (isEnterprise) {
      navigate(`/welcome?plan=enterprise&name=${encodeURIComponent(fullName)}`);
      return;
    }
    // paid → continue to payment
    const q = new URLSearchParams({
      plan: tier.id,
      seats: String(seats),
      billing,
      total: String(dueToday),
      name: fullName,
      email: form.email,
      org: form.orgName,
    }).toString();
    navigate(`/payment?${q}`);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-900">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-[#F9F8F6]/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="signup-home-link">
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
            <Link
              to="/login"
              data-testid="signup-signin-link"
              className="text-sm font-semibold text-stone-700 hover:text-stone-900"
            >
              Already have an account? <span className="underline underline-offset-4 decoration-stone-300">Sign in</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="mx-auto max-w-6xl px-6 lg:px-10 pt-8">
        <div className="flex items-center gap-2 text-xs">
          <Link to="/pricing" className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-900" data-testid="signup-back-pricing">
            <ArrowLeft className="h-3.5 w-3.5" /> Change plan
          </Link>
          <span className="text-stone-300">·</span>
          <Step label="Plan" done />
          <span className="text-stone-300">→</span>
          <Step label="Account" current />
          {!isFree && !isEnterprise && (
            <>
              <span className="text-stone-300">→</span>
              <Step label="Payment" />
            </>
          )}
        </div>
      </div>

      {/* Main grid */}
      <section className="mx-auto max-w-6xl px-6 lg:px-10 py-10 lg:py-14 grid lg:grid-cols-12 gap-10">
        {/* LEFT — Plan summary */}
        <aside className="lg:col-span-5 lg:sticky lg:top-24 self-start">
          <div className={`relative rounded-3xl p-7 overflow-hidden ${
            tier.highlight ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-900"
          }`}>
            {tier.highlight && (
              <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-[#D95D39]/40 blur-3xl" />
            )}
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${tier.highlight ? "text-[#F7E5DD]" : "text-[#D95D39]"}`} strokeWidth={1.8} />
                  <span className={`text-[10px] uppercase tracking-[0.22em] font-semibold ${tier.highlight ? "text-white/60" : "text-stone-500"}`}>
                    Selected plan
                  </span>
                </div>
                {tier.highlight && (
                  <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-[#D95D39] text-white">
                    Most loved
                  </span>
                )}
              </div>
              <h2 className="font-display text-4xl mt-4 leading-tight">{tier.name}</h2>
              <p className={`text-sm mt-1 ${tier.highlight ? "text-white/60" : "text-stone-500"}`}>
                {tier.kicker}
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl leading-none">{tier.priceLabel}</span>
                {!isFree && !isEnterprise && (
                  <span className={`text-sm ${tier.highlight ? "text-white/60" : "text-stone-500"}`}>
                    /seat/mo
                  </span>
                )}
              </div>
              <p className={`text-xs mt-1 ${tier.highlight ? "text-white/60" : "text-stone-500"}`}>
                {tier.priceSub}
              </p>

              {/* Seat & billing controls */}
              {!isFree && !isEnterprise && (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className={`text-[10px] uppercase tracking-widest font-semibold ${tier.highlight ? "text-white/60" : "text-stone-500"}`}>
                      Seats
                    </label>
                    <div className={`mt-2 flex items-center gap-3 rounded-full p-1 ${tier.highlight ? "bg-white/10" : "bg-stone-100 border border-stone-200"}`}>
                      <button
                        type="button"
                        onClick={() => setSeats((s) => Math.max(1, s - 1))}
                        data-testid="seats-decrement"
                        className={`h-9 w-9 rounded-full font-display text-lg ${tier.highlight ? "hover:bg-white/10 text-white" : "hover:bg-stone-200 text-stone-900"}`}
                      >
                        −
                      </button>
                      <div className="flex-1 text-center">
                        <span className="font-display text-2xl tabular-nums" data-testid="seats-display">{seats}</span>
                        <span className={`text-xs ml-2 ${tier.highlight ? "text-white/50" : "text-stone-500"}`}>
                          seat{seats === 1 ? "" : "s"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSeats((s) => s + 1)}
                        data-testid="seats-increment"
                        className={`h-9 w-9 rounded-full font-display text-lg ${tier.highlight ? "hover:bg-white/10 text-white" : "hover:bg-stone-200 text-stone-900"}`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={`text-[10px] uppercase tracking-widest font-semibold ${tier.highlight ? "text-white/60" : "text-stone-500"}`}>
                      Billing
                    </label>
                    <div className={`mt-2 inline-flex rounded-full p-1 w-full ${tier.highlight ? "bg-white/10" : "bg-stone-100 border border-stone-200"}`}>
                      {["monthly", "annual"].map((b) => (
                        <button
                          type="button"
                          key={b}
                          onClick={() => setBilling(b)}
                          data-testid={`signup-billing-${b}`}
                          className={`flex-1 px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                            billing === b
                              ? tier.highlight ? "bg-white text-stone-900" : "bg-stone-900 text-white"
                              : tier.highlight ? "text-white/60" : "text-stone-600"
                          }`}
                        >
                          {b}
                          {b === "annual" && (
                            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-[#F7E5DD] text-[#D95D39]">
                              −15%
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className={`rounded-2xl p-4 mt-3 ${tier.highlight ? "bg-black/40 border border-white/10" : "bg-[#EFE9DF] border border-stone-200"}`}>
                    <div className="flex items-center justify-between text-sm">
                      <span className={tier.highlight ? "text-white/70" : "text-stone-600"}>Subtotal</span>
                      <span className="tabular-nums">${monthlyTotal}/mo</span>
                    </div>
                    {billing === "annual" && (
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className={tier.highlight ? "text-white/50" : "text-stone-500"}>Billed yearly</span>
                        <span className="tabular-nums text-emerald-500">saves ${Math.round(tier.price * seats * 12 * 0.15)}</span>
                      </div>
                    )}
                    <div className={`flex items-center justify-between mt-3 pt-3 border-t ${tier.highlight ? "border-white/10" : "border-stone-300"}`}>
                      <span className="font-semibold text-sm">Due today</span>
                      <span className="font-display text-2xl tabular-nums" data-testid="due-today">
                        ${dueToday.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {isFree && (
                <div className={`mt-6 rounded-2xl p-4 bg-[#E3ECE5] border border-emerald-100 text-emerald-900`}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
                    Free forever
                  </p>
                  <p className="mt-1 text-sm">No credit card. No expiry. Upgrade whenever you outgrow it.</p>
                </div>
              )}

              {isEnterprise && (
                <div className={`mt-6 rounded-2xl p-4 ${tier.highlight ? "bg-black/40 border border-white/10" : "bg-[#EFE9DF] border border-stone-200"}`}>
                  <p className={`text-xs font-semibold uppercase tracking-widest ${tier.highlight ? "text-white/60" : "text-stone-500"}`}>
                    Custom quote
                  </p>
                  <p className={`mt-1 text-sm ${tier.highlight ? "text-white/80" : "text-stone-700"}`}>
                    Submit your details — our team responds within 1 business day with a tailored proposal.
                  </p>
                </div>
              )}

              <div className={`mt-6 pt-6 border-t ${tier.highlight ? "border-white/10" : "border-stone-200"}`}>
                <p className={`text-xs uppercase tracking-widest font-semibold mb-3 ${tier.highlight ? "text-white/60" : "text-stone-500"}`}>
                  What&apos;s included
                </p>
                <ul className="space-y-2 text-sm">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className={`h-4 w-4 shrink-0 mt-0.5 ${tier.highlight ? "text-emerald-400" : "text-emerald-600"}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-stone-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            HIPAA-aligned · BAA included · SOC2 in progress
          </div>
        </aside>

        {/* RIGHT — Sign up form */}
        <div className="lg:col-span-7">
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-4">
            Step 2 · Create your account
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            {isAgency ? (
              <>Set up your <span className="font-serif-i text-[#D95D39]">agency</span>.</>
            ) : (
              <>Let&apos;s make today <span className="font-serif-i text-[#D95D39]">calmer</span>.</>
            )}
          </h1>
          <p className="mt-3 text-stone-600 max-w-lg">
            {isAgency
              ? "You'll be the initial director. You can invite nurses and admins after activation."
              : "Solo nurse — everything you need to plan tomorrow's route, in under two minutes."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5" data-testid="signup-form">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name" required>
                <Input
                  data-testid="signup-first"
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Amara"
                  icon={User}
                />
              </Field>
              <Field label="Last name" required>
                <Input
                  data-testid="signup-last"
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Okafor"
                />
              </Field>
            </div>

            <Field label={isAgency ? "Work email" : "Email"} required hint="We'll never share this.">
              <Input
                data-testid="signup-email"
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={isAgency ? "director@yourhealthagency.com" : "amara@nurse.io"}
                icon={Mail}
                valid={form.email && validEmail}
                invalid={form.email && !validEmail}
              />
            </Field>

            {isAgency ? (
              <>
                <Field label="Agency / practice name" required>
                  <Input
                    data-testid="signup-org"
                    required
                    value={form.orgName}
                    onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                    placeholder="Sunrise Home Health"
                    icon={Building2}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Work phone" required>
                    <Input
                      data-testid="signup-phone"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="(512) 555-0142"
                      icon={Phone}
                    />
                  </Field>
                  <Field label="Your role">
                    <Select
                      data-testid="signup-role"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      options={["Agency Director", "Owner", "COO", "Director of Nursing", "Operations Lead"]}
                    />
                  </Field>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Primary role">
                  <Select
                    data-testid="signup-nurse-role"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    options={["Registered Nurse", "Licensed Practical Nurse", "Nurse Practitioner", "Home Health Aide"]}
                  />
                </Field>
                <Field label="License state" hint="Where you primarily practice.">
                  <Select
                    data-testid="signup-license-state"
                    value={form.licenseState}
                    onChange={(e) => setForm({ ...form, licenseState: e.target.value })}
                    options={["TX", "CA", "FL", "NY", "MN", "CO", "OR", "WA", "IL", "MA", "AZ", "LA", "TN"]}
                  />
                </Field>
              </div>
            )}

            <Field label="Password" required hint="Minimum 8 characters.">
              <div className="relative">
                <Input
                  data-testid="signup-password"
                  required
                  minLength={8}
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 8 characters"
                  icon={Lock}
                  valid={form.password && validPw}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  data-testid="signup-toggle-pw"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <PwStrength value={form.password} />
            </Field>

            {/* Agreement */}
            <label className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 cursor-pointer hover:border-stone-400 transition-colors">
              <input
                data-testid="signup-agree"
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#D95D39] focus:ring-[#D95D39]"
              />
              <div className="text-sm text-stone-700">
                I agree to the{" "}
                <a href="#" className="underline underline-offset-2 decoration-stone-400 hover:text-stone-900">Terms</a>,{" "}
                <a href="#" className="underline underline-offset-2 decoration-stone-400 hover:text-stone-900">Privacy Policy</a>, and the{" "}
                <a href="#" className="underline underline-offset-2 decoration-stone-400 hover:text-stone-900">HIPAA Business Associate Agreement</a>.
                <p className="text-xs text-stone-500 mt-1">
                  <ShieldCheck className="h-3 w-3 inline mr-1 text-emerald-600" />
                  Your account is protected by end-to-end encryption and immutable audit logging.
                </p>
              </div>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              data-testid="signup-submit"
              className={`w-full inline-flex items-center justify-center gap-2 rounded-full h-14 text-sm font-semibold transition-colors ${
                canSubmit
                  ? "bg-[#D95D39] hover:bg-[#C05030] text-white"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed"
              }`}
            >
              {isFree ? (
                <>Start free · enter RouteMe</>
              ) : isEnterprise ? (
                <>Request custom quote</>
              ) : (
                <>Continue to payment · ${dueToday.toLocaleString()}</>
              )}
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 justify-center text-xs text-stone-500 pt-2">
              <Award className="h-3.5 w-3.5 text-[#D95D39]" />
              {isFree
                ? "No credit card required · cancel anytime"
                : isEnterprise
                  ? "No payment collected · sales team responds in 1 business day"
                  : "14-day money-back guarantee · cancel anytime"}
            </div>
          </form>
        </div>
      </section>

      <footer className="border-t border-stone-200 py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© 2026 RouteMe · Built with care for traveling nurses.</p>
          <p>Prototype · signup is mocked, no real charges</p>
        </div>
      </footer>
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

function Field({ label, hint, required, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-stone-700 tracking-wide flex items-center gap-1">
        {label}
        {required && <span className="text-[#D95D39]">*</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="text-xs text-stone-400 mt-1">{hint}</p>}
    </div>
  );
}

function Input({ icon: Icon, valid, invalid, ...props }) {
  return (
    <div
      className={`flex items-center gap-2 h-12 rounded-xl border bg-white px-3 transition-colors ${
        invalid
          ? "border-red-300 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100"
          : valid
            ? "border-emerald-300 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-50"
            : "border-stone-200 focus-within:border-stone-500 focus-within:ring-4 focus-within:ring-stone-100"
      }`}
    >
      {Icon && <Icon className="h-4 w-4 text-stone-400" />}
      <input
        {...props}
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400"
      />
      {valid && <Check className="h-4 w-4 text-emerald-500" />}
    </div>
  );
}

function Select({ options, ...props }) {
  return (
    <div className="flex items-center gap-2 h-12 rounded-xl border border-stone-200 bg-white px-3 focus-within:border-stone-500 focus-within:ring-4 focus-within:ring-stone-100">
      <select {...props} className="flex-1 bg-transparent text-sm outline-none">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function PwStrength({ value }) {
  if (!value) return null;
  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  const labels = ["Too short", "Weak", "Fair", "Strong", "Excellent"];
  const colors = ["bg-red-400", "bg-red-400", "bg-amber-400", "bg-emerald-500", "bg-emerald-600"];
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex-1 flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i < score ? colors[score] : "bg-stone-200"}`} />
        ))}
      </div>
      <span className="text-[11px] font-semibold tabular-nums text-stone-500">{labels[score]}</span>
    </div>
  );
}