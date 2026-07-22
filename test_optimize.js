// Test the optimization engine directly
const { optimizeRoute } = require('./frontend/src/lib/routeEngine');

const stops = [
  { id: "c1", lat: 34.0982, lng: -118.3519, window: "08:00 – 09:30", duration: 45, priority: "high" },
  { id: "c2", lat: 34.0498, lng: -118.1759, window: "10:00 – 11:00", duration: 30, priority: "medium" },
  { id: "c3", lat: 33.8403, lng: -118.1854, window: "11:45 – 12:45", duration: 50, priority: "high" },
  { id: "c4", lat: 34.1939, lng: -118.4497, window: "13:30 – 14:15", duration: 25, priority: "low" },
  { id: "c5", lat: 33.9812, lng: -118.4094, window: "15:00 – 15:45", duration: 40, priority: "medium" },
  { id: "c6", lat: 34.1454, lng: -118.1341, window: "16:15 – 17:00", duration: 30, priority: "medium" },
];

const initialOrder = stops.map(s => s.id);
console.log("Initial order:", initialOrder.join(", "));

const modes = ["ai", "fastest", "mileage", "custom"];
for (const mode of modes) {
  const result = optimizeRoute(stops, mode);
  console.log(`\n${mode.toUpperCase()}:`);
  console.log("  Order:", result.order.join(", "));
  console.log("  Same as initial?", JSON.stringify(result.order) === JSON.stringify(initialOrder) ? "YES — NO CHANGE" : "NO — CHANGED");
  console.log("  Metrics:", JSON.stringify(result.metrics));
}