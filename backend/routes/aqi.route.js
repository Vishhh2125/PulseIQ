import { Router } from "express";
import fetch from "node-fetch";

const router = Router();
const OPENAQ_V3 = "https://api.openaq.org/v3";
const RADIUS_M = 100000;
const OPENAQ_API_KEY = process.env.OPENAQ_API_KEY;

/**
 * GET /api/v1/aqi?lat=...&lon=...
 * Proxies OpenAQ API v3 (v2 returns 410 Gone). Returns same shape as before
 * so the frontend can keep existing parsing (results[0].measurements pm25).
 * If OpenAQ is unavailable or returns an error, we gracefully fall back to
 * a null PM2.5 value instead of surfacing 5xx to the frontend.
 */
router.get("/", async (req, res) => {
  const lat = req.query.lat ?? req.query.latitude;
  const lon = req.query.lon ?? req.query.longitude;

  if (lat == null || lon == null || lat === "" || lon === "") {
    return res.status(400).json({
      error: "Missing parameters",
      message:
        "Query parameters 'lat' and 'lon' (or 'latitude' and 'longitude') are required.",
    });
  }

  const numLat = Number(lat);
  const numLon = Number(lon);
  if (Number.isNaN(numLat) || Number.isNaN(numLon)) {
    return res.status(400).json({
      error: "Invalid parameters",
      message: "lat and lon must be valid numbers.",
    });
  }

  let pm25 = null;

  try {
    const coords = `${numLat.toFixed(4)},${numLon.toFixed(4)}`;

    const commonHeaders = {
      Accept: "application/json",
      ...(OPENAQ_API_KEY ? { "X-API-Key": OPENAQ_API_KEY } : {}),
    };

    const locationsUrl = `${OPENAQ_V3}/locations?coordinates=${coords}&radius=${RADIUS_M}&limit=5`;
    const locationsRes = await fetch(locationsUrl, {
      headers: commonHeaders,
    });

    if (!locationsRes.ok) {
      const errText = await locationsRes.text();
      console.error(
        "OpenAQ v3 locations error:",
        locationsRes.status,
        errText
      );
      // Graceful fallback: return null AQI rather than a 5xx
      return res.json({
        results: [{ measurements: [{ parameter: "pm25", value: null }] }],
      });
    }

    const locationsData = await locationsRes.json();
    const locations = locationsData.results || [];
    if (locations.length === 0) {
      return res.json({
        results: [{ measurements: [{ parameter: "pm25", value: null }] }],
      });
    }

    const loc = locations[0];
    const locId = loc.id;
    const sensors = loc.sensors || [];
    const pm25Sensor = sensors.find(
      (s) =>
        s.parameter &&
        (String(s.parameter.name || "").toLowerCase() === "pm25" ||
          String(s.parameter.name || "").toLowerCase() === "pm2.5")
    );
    const pm25SensorId = pm25Sensor ? pm25Sensor.id : null;

    const latestUrl = `${OPENAQ_V3}/locations/${locId}/latest?limit=100`;
    const latestRes = await fetch(latestUrl, {
      headers: commonHeaders,
    });

    if (!latestRes.ok) {
      const errText = await latestRes.text();
      console.error("OpenAQ v3 latest error:", latestRes.status, errText);
      return res.json({
        results: [{ measurements: [{ parameter: "pm25", value: null }] }],
      });
    }

    const latestData = await latestRes.json();
    const latestResults = latestData.results || [];

    if (pm25SensorId != null) {
      const pm25Row = latestResults.find((r) => r.sensorsId === pm25SensorId);
      if (pm25Row != null && typeof pm25Row.value === "number") {
        pm25 = pm25Row.value;
      }
    }
    if (pm25 == null && latestResults.length > 0) {
      const first = latestResults[0];
      if (typeof first.value === "number") pm25 = first.value;
    }

    res.json({
      results: [
        {
          measurements: [{ parameter: "pm25", value: pm25 }],
        },
      ],
    });
  } catch (err) {
    console.error("AQI proxy error:", err);
    // Graceful fallback on unexpected errors as well
    res.json({
      results: [{ measurements: [{ parameter: "pm25", value: null }] }],
    });
  }
});

export default router;