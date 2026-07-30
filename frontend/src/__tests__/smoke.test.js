/**
 * Smoke tests for RouteMe — utility functions.
 * Asserts actual function behavior — if these fail because the
 * function changed, update the test, not the function.
 */

// ─── Directions utility tests ──────────────────────────

describe("directions utils", () => {
  let metersToMiles, secondsToShort, googleMapsUrl, appleMapsUrl;

  beforeAll(() => {
    const dirs = require("../lib/directions");
    metersToMiles = dirs.metersToMiles;
    secondsToShort = dirs.secondsToShort;
    googleMapsUrl = dirs.googleMapsUrl;
    appleMapsUrl = dirs.appleMapsUrl;
  });

  test("metersToMiles returns a string (formatted number)", () => {
    const result = metersToMiles(1609.34);
    expect(typeof result).toBe("string");
    expect(parseFloat(result)).toBeCloseTo(1.0, 0);
  });

  test("metersToMiles: 0m = '0.0'", () => {
    expect(metersToMiles(0)).toBe("0.0");
  });

  test("metersToMiles: negative returns negative string", () => {
    const result = metersToMiles(-100);
    expect(typeof result).toBe("string");
    expect(parseFloat(result)).toBeLessThan(0);
  });

  test("secondsToShort: 3661s = '1h 1m'", () => {
    expect(secondsToShort(3661)).toBe("1h 1m");
  });

  test("secondsToShort: 3600s = '1h 0m' (includes minutes)", () => {
    expect(secondsToShort(3600)).toBe("1h 0m");
  });

  test("secondsToShort: 600s = '10m'", () => {
    expect(secondsToShort(600)).toBe("10m");
  });

  test("secondsToShort: 0s = '0m'", () => {
    expect(secondsToShort(0)).toBe("0m");
  });

  test("secondsToShort: 61s = '1m'", () => {
    expect(secondsToShort(61)).toBe("1m");
  });

  test("googleMapsUrl builds destination-only directions URL", () => {
    const url = googleMapsUrl(33.77, -117.59, 34.05, -118.25);
    expect(url).toMatch(/^https:\/\/www\.google\.com\/maps\/dir\//);
    expect(url).toContain("destination=33.77,-117.59");
  });

  test("appleMapsUrl builds directions URL", () => {
    const url = appleMapsUrl(33.77, -117.59, 34.05, -118.25);
    expect(url).toMatch(/^https:\/\/maps\.apple\.com\//);
    expect(url).toContain("daddr=");
    expect(url).toContain("33.77");
  });
});

// ─── Maps utility tests ────────────────────────────────

describe("maps util", () => {
  let detectMapsApp, resolveNav;

  beforeAll(() => {
    const maps = require("../lib/maps");
    detectMapsApp = maps.detectMapsApp;
    resolveNav = maps.resolveNav;
  });

  test("detectMapsApp returns 'google' on unknown user agent", () => {
    const origUA = navigator.userAgent;
    Object.defineProperty(navigator, "userAgent", {
      value: "TestBrowser/1.0",
      configurable: true,
    });
    expect(detectMapsApp()).toBe("google");
    Object.defineProperty(navigator, "userAgent", { value: origUA, configurable: true });
  });

  test("detectMapsApp returns 'apple' on iOS", () => {
    const origUA = navigator.userAgent;
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      configurable: true,
    });
    expect(detectMapsApp()).toBe("apple");
    Object.defineProperty(navigator, "userAgent", { value: origUA, configurable: true });
  });

  test("resolveNav uses explicit preference when set", () => {
    expect(resolveNav("google")).toBe("google");
    expect(resolveNav("apple")).toBe("apple");
    expect(resolveNav("both")).toBe("both");
  });

  test("resolveNav uses auto-detect when preference is 'auto'", () => {
    const result = resolveNav("auto");
    expect(["google", "apple"]).toContain(result);
  });
});

// ─── Build verification tests ──────────────────────────

describe("build configuration", () => {
  test("React is available", () => {
    const React = require("react");
    expect(typeof React.createElement).toBe("function");
  });
});