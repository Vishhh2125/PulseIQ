import React, { useEffect, useState, useMemo } from "react";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const OUTBREAK_DATA_URL = import.meta.env.VITE_OUTBREAK_DATA_URL;
// ─── STEP 2: Hyper-Local Disease Risk Engine ─────────────────────────────────
function runDiseaseRiskEngine(env, outbreakData) {
  if (!outbreakData) return [];
  const alerts = [];
  const { temp, humidity, rainfall } = env;
  const city = outbreakData.city || "Pune";

  // 1. Dengue Risk: humidity > 60% AND dengue riskLevel = "High"
  if (humidity > 60 && outbreakData.dengue?.riskLevel === "High") {
    alerts.push({
      id: "dengue",
      title: `High Dengue Risk in ${city}`,
      severity: "High",
      reason: "High humidity and recent dengue cases",
      reportedCases: outbreakData.dengue.reportedCases,
      affectedAreas: outbreakData.dengue.affectedAreas || [],
      prevention: outbreakData.dengue.prevention || ["Use mosquito repellent", "Avoid stagnant water"],
    });
  }

  // 2. Malaria Risk: humidity > 55% AND stagnant water indicators
  if (humidity > 55 && outbreakData.malaria?.stagnantWaterIndicators) {
    alerts.push({
      id: "malaria",
      title: `Malaria Risk in ${city}`,
      severity: "Moderate",
      reason: "High humidity and stagnant water indicators present",
      reportedCases: outbreakData.malaria.reportedCases,
      affectedAreas: outbreakData.malaria.affectedAreas || [],
      prevention: outbreakData.malaria.prevention || ["Drain standing water", "Use mosquito nets"],
    });
  }

  // 3. Swine Flu Risk: temperature < 20°C AND season = "Winter"
  const isWinter = [11, 12, 1, 2].includes(new Date().getMonth() + 1);
  if (temp != null && temp < 20 && isWinter) {
    alerts.push({
      id: "swineFlu",
      title: `Flu Risk in ${city}`,
      severity: "Moderate",
      reason: "Low temperature and winter season",
      reportedCases: outbreakData.swineFlu?.reportedCases,
      affectedAreas: outbreakData.swineFlu?.affectedAreas || [],
      prevention: outbreakData.swineFlu?.prevention || ["Wash hands frequently", "Avoid crowded places", "Get flu vaccine"],
    });
  }

  // 4. Chikungunya Risk: humidity > 65% AND outbreak present
  if (humidity > 65 && outbreakData.chikungunya?.outbreakPresent) {
    alerts.push({
      id: "chikungunya",
      title: `Moderate Chikungunya Risk in ${city}`,
      severity: "Moderate",
      reason: "High humidity and active outbreak",
      reportedCases: outbreakData.chikungunya.reportedCases,
      affectedAreas: outbreakData.chikungunya.affectedAreas || [],
      prevention: outbreakData.chikungunya.prevention || ["Use mosquito nets", "Clear water containers"],
    });
  }

  return alerts;
}

const HealthRiskDashboard = () => {
  const [data, setData] = useState({
    aqi: null,
    temp: null,
    humidity: null,
    area: "Fetching location...",
  });
  const [outbreakData, setOutbreakData] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    fetch(OUTBREAK_DATA_URL)
      .then((res) => res.ok ? res.json() : null)
      .then((json) => setOutbreakData(json))
      .catch(() => setOutbreakData(null));
  }, []);

  // Run risk engine when env + outbreak data available
  useEffect(() => {
    if (!outbreakData) return;
    const env = {
      temp: data.temp,
      humidity: data.humidity,
      rainfall: null,
    };
    const newAlerts = runDiseaseRiskEngine(env, outbreakData);
    setAlerts(newAlerts);
  }, [outbreakData, data.temp, data.humidity]);

  // 📍 Get user location
  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      setData((prev) => ({
        ...prev,
        area: `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`,
      }));

      fetchWeather(latitude, longitude);
      fetchAQI(latitude, longitude);
    });
  };

  // 🌡️ Weather API
  const fetchWeather = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      const result = await res.json();

      if (!res.ok || !result.main) {
        console.error("Weather fetch error", result?.message || res.status);
        setData((prev) => ({
          ...prev,
          temp: null,
          humidity: null,
          area: prev.area || "Weather unavailable",
        }));
        return;
      }

      setData((prev) => ({
        ...prev,
        temp: result.main.temp,
        humidity: result.main.humidity,
        area: result.name ?? prev.area,
      }));
    } catch (err) {
      console.error("Weather fetch error", err);
      setData((prev) => ({
        ...prev,
        temp: null,
        humidity: null,
        area: prev.area || "Weather unavailable",
      }));
    }
  };

  // 🌫️ AQI API (via backend proxy to avoid CORS)
  const fetchAQI = async (lat, lon) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/aqi?lat=${lat}&lon=${lon}`
      );
      const result = await res.json();

      const pm25 =
        result.results?.[0]?.measurements?.find((m) => m.parameter === "pm25")
          ?.value || "N/A";

      setData((prev) => ({
        ...prev,
        aqi: pm25,
      }));
    } catch (err) {
      console.error("AQI fetch error", err);
    }
  };

  // 🎨 Red → Green risk color (0 = green, 1 = red)
  const getRiskColor = (level) => {
    if (level == null || level < 0) return "#9ca3af";
    if (level <= 0.25) return "#16a34a";
    if (level <= 0.5) return "#84cc16";
    if (level <= 0.75) return "#eab308";
    return "#dc2626";
  };

  const getSeverityColor = (severity) => {
    if (severity === "High") return "#dc2626";
    if (severity === "Moderate") return "#f97316";
    return "#16a34a";
  };

  const getAQIRiskLevel = (aqi) => {
    if (aqi == null || typeof aqi !== "number") return null;
    if (aqi <= 12) return 0;
    if (aqi <= 35.4) return 0.25;
    if (aqi <= 55.4) return 0.5;
    if (aqi <= 150.4) return 0.75;
    return 1;
  };

  const getTempRiskLevel = (temp) => {
    if (temp == null || typeof temp !== "number") return null;
    if (temp >= 18 && temp <= 28) return 0;
    if ((temp >= 15 && temp < 18) || (temp > 28 && temp <= 32)) return 0.35;
    if ((temp >= 10 && temp < 15) || (temp > 32 && temp <= 36)) return 0.6;
    if (temp < 10 || temp > 36) return 1;
    return 0.5;
  };

  const getHumidityRiskLevel = (h) => {
    if (h == null || typeof h !== "number") return null;
    if (h >= 40 && h <= 60) return 0;
    if ((h >= 30 && h < 40) || (h > 60 && h <= 70)) return 0.3;
    if ((h >= 20 && h < 30) || (h > 70 && h <= 80)) return 0.55;
    if (h < 20 || h > 80) return 1;
    return 0.5;
  };

  const aqiRiskLevel = getAQIRiskLevel(typeof data.aqi === "number" ? data.aqi : null);
  const tempRiskLevel = getTempRiskLevel(data.temp);
  const humidityRiskLevel = getHumidityRiskLevel(data.humidity);

  const alertsRiskLevel = useMemo(() => {
    if (alerts.length === 0) return 0;
    const hasHigh = alerts.some((a) => a.severity === "High");
    return hasHigh ? 0.9 : 0.5;
  }, [alerts]);

  // "In your area..." insight lines (AQI → respiratory; temp → heatstroke/dehydration; humidity → infection/fungal; outbreaks → Dengue, flu)
  const getInsightLines = () => {
    const area = "In your area";
    const lines = [];
    if (data.aqi === null && data.temp === null && data.humidity === null) {
      return ["We're loading hyper-local data. We use AQI (respiratory risk — asthma, COPD), temperature (heatstroke, dehydration), humidity (infection, fungal risk), and outbreak alerts (Dengue, flu) to flag risks before symptoms appear."];
    }
    if (typeof data.aqi === "number") {
      if (data.aqi <= 50) lines.push(`${area} air quality (PM2.5) is good — respiratory risk is low; better for asthma and COPD.`);
      else if (data.aqi <= 100) lines.push(`${area} air quality is moderate — respiratory risk is elevated; people with asthma or COPD should limit prolonged outdoor activity.`);
      else lines.push(`${area} air quality is poor — respiratory risk is high and may worsen asthma and COPD; consider staying indoors or wearing a mask.`);
    } else if (data.aqi === "N/A" || data.aqi === null) {
      lines.push(`${area} we couldn't get live AQI; we monitor respiratory risk (asthma, COPD) when data is available.`);
    }
    if (data.temp !== null) {
      if (data.temp >= 30) lines.push(`${area} temperature is high, which may cause dehydration and heatstroke risk — stay hydrated and avoid peak heat.`);
      else if (data.temp <= 15) lines.push(`${area} temperature is low; cold stress and dehydration risk can increase if you're not drinking enough.`);
      else lines.push(`${area} temperature is in a comfortable range; heatstroke and dehydration risk are lower.`);
    }
    if (data.humidity !== null) {
      if (data.humidity >= 70) lines.push(`${area} humidity is high, which can raise infection and fungal disease risk — keep skin dry and avoid prolonged damp exposure.`);
      else if (data.humidity <= 30) lines.push(`${area} humidity is low; dry air can irritate airways and skin. Infection and fungal risk are generally lower.`);
      else lines.push(`${area} humidity is moderate; infection and fungal disease risk are not elevated.`);
    }
    if (alerts.length > 0) {
      lines.push(`${area} we detected ${alerts.length} disease risk alert(s): ${alerts.map((a) => a.title.replace(/ in Pune$/, "")).join(", ")}. Follow prevention tips above.`);
    }
    lines.push("We combine AQI, temperature, humidity, and disease outbreak data (Dengue, Malaria, Chikungunya, Flu) for proactive, neighborhood-level health risk awareness.");
    return lines;
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Health Risk Monitor</h1>
      <p style={styles.subtitle}>{data.area}</p>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>AQI (PM2.5)</h2>
          <p style={styles.riskLabel}>Respiratory risk · Asthma, COPD</p>
          <p style={{ ...styles.value, color: getRiskColor(aqiRiskLevel) }}>
            {data.aqi ?? "Loading..."}
          </p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Temperature</h2>
          <p style={styles.riskLabel}>Heatstroke risk · Dehydration</p>
          <p style={{ ...styles.value, color: getRiskColor(tempRiskLevel) }}>
            {data.temp !== null ? `${data.temp}°C` : "Loading..."}
          </p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Humidity</h2>
          <p style={styles.riskLabel}>Infection risk · Fungal diseases</p>
          <p style={{ ...styles.value, color: getRiskColor(humidityRiskLevel) }}>
            {data.humidity !== null ? `${data.humidity}%` : "Loading..."}
          </p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Disease outbreaks</h2>
          <p style={styles.riskLabel}>Epidemic alerts · Dengue, flu</p>
          <p style={{ ...styles.value, color: getRiskColor(alertsRiskLevel) }}>
            {alerts.length > 0 ? `${alerts.length} active alert${alerts.length > 1 ? "s" : ""}` : "No active alerts"}
          </p>
        </div>
      </div>

      {alerts.length > 0 && (
        <div style={styles.alertsSection}>
          <h2 style={styles.alertsSectionTitle}>Disease risk alerts</h2>
          {alerts.map((alert) => (
            <div key={alert.id} style={{ ...styles.alertCard, borderLeftColor: getSeverityColor(alert.severity) }}>
              <div style={styles.alertTitle}>🚨 {alert.title}</div>
              {alert.reportedCases != null && (
                <p style={styles.alertDetail}>• {alert.reportedCases} reported cases</p>
              )}
              <p style={styles.alertDetail}>• {alert.reason}</p>
              {alert.affectedAreas?.length > 0 && (
                <p style={styles.alertDetail}>• Affected areas: {alert.affectedAreas.join(", ")}</p>
              )}
              <div style={styles.preventionBlock}>
                <span style={styles.preventionLabel}>Prevention:</span>
                <ul style={styles.preventionList}>
                  {alert.prevention?.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={styles.insightsCard}>
        <h2 style={styles.cardTitle}>Hyper-local health insight</h2>
        <ul style={styles.insightList}>
          {getInsightLines().map((line, i) => (
            <li key={i} style={styles.insightsText}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HealthRiskDashboard;

/* 🎨 Minimal White–Blue Theme */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f7fbff",
    fontFamily: "Segoe UI, sans-serif",
    padding: "40px 20px",
    textAlign: "center",
  },

  title: {
    color: "#0a66c2",
    fontSize: "2.2rem",
    marginBottom: "5px",
  },

  subtitle: {
    color: "#6b7280",
    marginBottom: "30px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    maxWidth: "700px",
    margin: "0 auto",
  },

  card: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "25px",
    boxShadow: "0 10px 25px rgba(0, 102, 204, 0.08)",
  },

  cardTitle: {
    color: "#0a66c2",
    fontSize: "1.2rem",
    marginBottom: "4px",
  },

  riskLabel: {
    fontSize: "0.75rem",
    color: "#6b7280",
    marginBottom: "8px",
  },

  value: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#111827",
  },
  alertsSection: {
    marginTop: "28px",
    maxWidth: "800px",
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "left",
  },
  alertsSectionTitle: {
    color: "#0a66c2",
    fontSize: "1.2rem",
    marginBottom: "12px",
    textAlign: "center",
  },
  alertCard: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "16px 20px",
    marginBottom: "12px",
    boxShadow: "0 4px 12px rgba(10, 102, 194, 0.08)",
    borderLeft: "4px solid #0a66c2",
  },
  alertTitle: {
    fontWeight: "600",
    fontSize: "1rem",
    color: "#111827",
    marginBottom: "8px",
  },
  alertDetail: {
    fontSize: "0.9rem",
    color: "#4b5563",
    margin: "4px 0",
    lineHeight: 1.5,
  },
  preventionBlock: {
    marginTop: "12px",
  },
  preventionLabel: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#0a66c2",
  },
  preventionList: {
    margin: "6px 0 0 0",
    paddingLeft: "18px",
    fontSize: "0.85rem",
    color: "#4b5563",
    lineHeight: 1.6,
  },
  insightsCard: {
    marginTop: "30px",
    maxWidth: "800px",
    marginLeft: "auto",
    marginRight: "auto",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "20px 24px",
    boxShadow: "0 10px 25px rgba(15, 118, 255, 0.08)",
    textAlign: "left",
  },
  insightList: {
    marginTop: "8px",
    paddingLeft: "20px",
    listStyle: "disc",
  },
  insightsText: {
    marginBottom: "10px",
    fontSize: "0.95rem",
    lineHeight: 1.6,
    color: "#4b5563",
  },
};