/**
 * RouteMe — Production server with Stripe, OpenWeather, and auth proxy.
 *
 * Serves the React build, proxies /api/weather to OpenWeather,
 * proxies /api/auth/login to Supabase Auth with rate limiting,
 * and handles Stripe Checkout + webhooks for subscription billing.
 *
 * Designed for Render Web Service deployment.
 */

const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const OWM_KEY = process.env.OPENWEATHER_API_KEY;
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const APP_URL = process.env.APP_URL || "http://localhost:3000";

/* ─── Stripe init ───────────────────────────────────────── */
const stripe = process.env.STRIPE_SECRET_KEY
  ? require("stripe")(process.env.STRIPE_SECRET_KEY)
  : null;

const PRICE_MAP = {
  growth: {
    monthly: process.env.STRIPE_PRICE_GROWTH_MONTHLY,
    annual:  process.env.STRIPE_PRICE_GROWTH_ANNUAL,
  },
  scale: {
    monthly: process.env.STRIPE_PRICE_SCALE_MONTHLY,
    annual:  process.env.STRIPE_PRICE_SCALE_ANNUAL,
  },
};

/* ─── Stripe webhook MUST register BEFORE express.json() ─ */
app.post("/api/webhook/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !endpointSecret) {
    return res.status(400).json({ error: "Missing stripe-signature or webhook secret" });
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("[Stripe] Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }
  console.log("[Stripe] Webhook received:", event.type, event.id);
  // Full event handlers to be added when supabase client is available
  // See: migration 00005_stripe_subscriptions.sql + webhook handler in next phase
  switch (event.type) {
    case "checkout.session.completed":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "invoice.payment_succeeded":
    case "invoice.payment_failed":
      break;
  }
  res.json({ received: true });
});

/* ─── Global JSON parser (AFTER webhook route) ─────────── */
app.use(express.json({ limit: "1mb" }));

/* ─── Rate limiter: auth endpoints ─────────────────────── */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again in 15 minutes." },
  skipSuccessfulRequests: true,
});

/* ─── Auth proxy: rate-limited login ───────────────────── */
app.post("/api/auth/login", authLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).json({ error: "Supabase credentials not configured" });
  }
  try {
    const authUrl = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
    const sbRes = await fetch(authUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ email, password }),
    });
    const data = await sbRes.json();
    if (!sbRes.ok) {
      return res.status(401).json({
        error: data.msg || data.error_description || data.message || "Invalid email or password.",
      });
    }
    if (!data.access_token || !data.user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    return res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        user_metadata: data.user.user_metadata || {},
        app_metadata: data.user.app_metadata || {},
      },
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
  } catch (err) {
    console.error("Auth proxy error:", err.message);
    res.status(502).json({ error: "Authentication service unavailable." });
  }
});

/* ─── Weather proxy ───────────────────────────────────── */
app.get("/api/weather", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: "lat and lon query params required" });
  }
  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  if (isNaN(latNum) || isNaN(lonNum) || latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
    return res.status(400).json({ error: "Invalid lat/lon values" });
  }
  if (!OWM_KEY) {
    return res.status(500).json({ error: "OPENWEATHER_API_KEY not configured" });
  }
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&units=imperial&appid=${OWM_KEY}`;
    const owmRes = await fetch(url);
    if (!owmRes.ok) {
      const text = await owmRes.text();
      return res.status(owmRes.status).json({ error: `OpenWeather error: ${text}` });
    }
    const data = await owmRes.json();
    res.json({
      temp: Math.round(data.main?.temp ?? 72),
      feelsLike: Math.round(data.main?.feels_like ?? 70),
      humidity: data.main?.humidity ?? 50,
      condition: (data.weather?.[0]?.description ?? "clear").replace(/\b\w/g, (c) => c.toUpperCase()),
      icon: data.weather?.[0]?.icon ?? "01d",
    });
  } catch (err) {
    console.error("Weather proxy error:", err.message);
    res.status(502).json({ error: "Weather service unavailable" });
  }
});

/* ─── Stripe: Create Checkout Session ──────────────────── */
app.post("/api/create-checkout-session", async (req, res) => {
  const { priceId, agencyId, email, successUrl, cancelUrl } = req.body;
  if (!stripe) return res.status(503).json({ error: "Stripe not configured" });
  if (!priceId || !agencyId) return res.status(400).json({ error: "priceId and agencyId required" });
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      client_reference_id: agencyId,
      metadata: { agency_id: agencyId },
      success_url: successUrl || `${APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${APP_URL}/cancel`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("[Stripe] create-checkout-session error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ─── Stripe: Check Session Status ─────────────────────── */
app.get("/api/check-session-status", async (req, res) => {
  const { session_id } = req.query;
  if (!stripe) return res.status(503).json({ error: "Stripe not configured" });
  if (!session_id) return res.status(400).json({ error: "session_id query param required" });
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    res.json({
      status: session.status,
      customer_email: session.customer_details?.email,
      subscription_id: session.subscription,
      customer_id: session.customer,
    });
  } catch (err) {
    console.error("[Stripe] check-session-status error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ─── Stripe: Create Customer Portal Session ───────────── */
app.post("/api/create-portal-session", async (req, res) => {
  const { customerId, returnUrl } = req.body;
  if (!stripe) return res.status(503).json({ error: "Stripe not configured" });
  if (!customerId) return res.status(400).json({ error: "customerId required" });
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${APP_URL}/agency/billing`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("[Stripe] create-portal-session error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ─── Serve static files ──────────────────────────────── */
const buildDir = path.join(__dirname, "build");
app.use(express.static(buildDir, {
  maxAge: "1y",
  immutable: true,
  setHeaders(res, filePath) {
    if (filePath.endsWith(".html")) {
      res.setHeader("Cache-Control", "no-cache");
    }
  },
}));

/* ─── Health check ─────────────────────────────────────── */
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

/* ─── SPA fallback (Express 5 compatible) ──────────────── */
app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(buildDir, "index.html"));
});

/* ─── Centralized error handler ─────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`RouteMe server running on port ${PORT}`);
});