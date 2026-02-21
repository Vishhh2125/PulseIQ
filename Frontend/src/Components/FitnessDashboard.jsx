import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Heart, Flame, Moon, RefreshCw, TrendingUp, Zap, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "./AppNavbar";
import "./FitnessDashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  Filler
);

// Animated number counter component
const AnimatedNumber = ({ value, duration = 1.5, suffix = "" }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (value === null || value === undefined) return;
    
    const startValue = 0;
    const endValue = typeof value === 'number' ? value : 0;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
      }
    };

    animate();
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}{suffix}</span>;
};

const FitnessDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [heartRateHistory, setHeartRateHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchFitnessData = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      setError("");
      setNeedsAuth(false);

      const res = await fetch("http://localhost:5000/fitness-data", {
        credentials: "include",
      });

      const body = await res.json().catch(() => ({}));

      if (res.status === 401) {
        setNeedsAuth(true);
        setData(null);
        setHeartRateHistory([]);
        return;
      }

      if (!res.ok) {
        throw new Error(body.error || body.message || `Request failed with ${res.status}`);
      }

      setData(body);

      // Save fitness data to localStorage for real-time chat analysis
      if (body) {
        localStorage.setItem('fitnessData', JSON.stringify({
          heartRate: body.heartRate,
          steps: body.steps,
          calories: body.calories,
          sleep: body.sleep,
          bloodPressure: body.bloodPressure,
          spO2: body.spO2,
          temperature: body.temperature,
        }));
      }

      // Generate heart rate history
      if (body.heartRate) {
        const history = Array.from({ length: 7 }, (_, i) => ({
          label: `${6 - i}h`,
          value: Math.max(
            40,
            Math.min(180, body.heartRate + (Math.random() * 10 - 5))
          ),
        }));
        setHeartRateHistory(history);
      } else {
        setHeartRateHistory([]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load fitness data.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFitnessData();
  }, []);

  // Chart data configurations
  const stepsCaloriesBarData = data
    ? {
        labels: ["Steps", "Calories"],
        datasets: [
          {
            label: "Activity",
            data: [data.steps || 0, data.calories || 0],
            backgroundColor: [
              "rgba(96, 165, 250, 0.8)",
              "rgba(251, 191, 36, 0.8)",
            ],
            borderColor: ["#60a5fa", "#fbbf24"],
            borderWidth: 2,
            borderRadius: 12,
            borderSkipped: false,
          },
        ],
      }
    : null;

  const sleepDoughnutData = data
    ? {
        labels: ["Sleep", "Awake"],
        datasets: [
          {
            data: [
              data.sleepHours || 0,
              Math.max(0, 24 - (data.sleepHours || 0)),
            ],
            backgroundColor: [
              "rgba(52, 211, 153, 0.9)",
              "rgba(229, 231, 235, 0.5)",
            ],
            borderWidth: 0,
            cutout: "75%",
          },
        ],
      }
    : null;

  const heartRateLineData =
    data && heartRateHistory.length > 0
      ? {
          labels: heartRateHistory.map((h) => h.label),
          datasets: [
            {
              label: "Heart Rate (BPM)",
              data: heartRateHistory.map((h) => h.value),
              borderColor: "#f97316",
              backgroundColor: "rgba(249, 115, 22, 0.1)",
              tension: 0.4,
              pointRadius: 5,
              pointHoverRadius: 7,
              pointBackgroundColor: "#f97316",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
              fill: true,
            },
          ],
        }
      : null;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="fitness-dashboard">
      
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fd-header"
      >
        <div className="fd-header-left">
          
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="fd-title"
            >
              <Activity className="fd-title-icon" />
              Health Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="fd-subtitle"
            >
              Daily insights from your Google Fit data
            </motion.p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchFitnessData}
          disabled={loading}
          className="fd-refresh-btn"
        >
          <RefreshCw
            size={18}
            className={isRefreshing ? "fd-refresh-icon spinning" : ""}
          />
          {loading ? "Refreshing..." : "Refresh"}
        </motion.button>
      </motion.header>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fd-state fd-loading"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="fd-spinner"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Loading your fitness data...
            </motion.p>
          </motion.div>
        )}

        {!loading && !needsAuth && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fd-state fd-error"
          >
            <motion.p>{error}</motion.p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="fd-try-again"
              onClick={fetchFitnessData}
            >
              Try Again
            </motion.button>
          </motion.div>
        )}

        {!loading && needsAuth && (
          <motion.div
            key="auth"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fd-state fd-auth"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="fd-auth-icon"
            >
              <Activity size={48} />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Connect your Google Fit account to view your fitness data
            </motion.p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="fd-connect-btn"
              onClick={() => {
                window.location.href = "http://localhost:5000/auth/google";
              }}
            >
              <Zap size={16} />
              Connect Google Fit
            </motion.button>
          </motion.div>
        )}

        {!loading && !error && !needsAuth && data && (
          <motion.div
            key="content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="fd-content"
          >
            {/* Summary Cards */}
            <motion.section variants={containerVariants} className="fd-cards">
              <motion.div
                custom={0}
                variants={cardVariants}
                whileHover="hover"
                className="fd-card fd-card-steps"
              >
                <div className="fd-card-icon-wrapper">
                  <Activity className="fd-card-icon" />
                </div>
                <h2>Steps</h2>
                <p className="fd-card-value">
                  <AnimatedNumber value={data.steps ?? 0} />
                </p>
                <p className="fd-card-sub">Last 24 hours</p>
                <div className="fd-card-glow"></div>
              </motion.div>

              <motion.div
                custom={1}
                variants={cardVariants}
                whileHover="hover"
                className="fd-card fd-card-heart"
              >
                <div className="fd-card-icon-wrapper">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Heart className="fd-card-icon" />
                  </motion.div>
                </div>
                <h2>Heart Rate</h2>
                <p className="fd-card-value">
                  {data.heartRate !== null && data.heartRate !== undefined ? (
                    <>
                      <AnimatedNumber value={data.heartRate} />{" "}
                      <span className="fd-unit">BPM</span>
                    </>
                  ) : (
                    "—"
                  )}
                </p>
                <p className="fd-card-sub">Average today</p>
                <div className="fd-card-glow"></div>
              </motion.div>

              <motion.div
                custom={2}
                variants={cardVariants}
                whileHover="hover"
                className="fd-card fd-card-calories"
              >
                <div className="fd-card-icon-wrapper">
                  <Flame className="fd-card-icon" />
                </div>
                <h2>Calories</h2>
                <p className="fd-card-value">
                  <AnimatedNumber value={data.calories ?? 0} />{" "}
                  <span className="fd-unit">kcal</span>
                </p>
                <p className="fd-card-sub">Burned today</p>
                <div className="fd-card-glow"></div>
              </motion.div>

              <motion.div
                custom={3}
                variants={cardVariants}
                whileHover="hover"
                className="fd-card fd-card-sleep"
              >
                <div className="fd-card-icon-wrapper">
                  <Moon className="fd-card-icon" />
                </div>
                <h2>Sleep</h2>
                <p className="fd-card-value">
                  <AnimatedNumber
                    value={data.sleepHours ?? 0}
                    suffix=" h"
                  />
                </p>
                <p className="fd-card-sub">Last 24 hours</p>
                <div className="fd-card-glow"></div>
              </motion.div>
            </motion.section>

            {/* Charts */}
            <motion.section variants={containerVariants} className="fd-charts-grid">
              <motion.div
                custom={4}
                variants={cardVariants}
                whileHover="hover"
                className="fd-chart-card"
              >
                <div className="fd-chart-header">
                  <div>
                    <h3>Activity Overview</h3>
                    <span>Steps & Calories</span>
                  </div>
                  <TrendingUp className="fd-chart-icon" />
                </div>
                {stepsCaloriesBarData ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="fd-chart-wrapper"
                  >
                    <Bar
                      data={stepsCaloriesBarData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            padding: 12,
                            borderRadius: 8,
                          },
                        },
                        scales: {
                          x: {
                            grid: { display: false },
                            ticks: { font: { size: 12 } },
                          },
                          y: {
                            beginAtZero: true,
                            grid: { color: "rgba(0, 0, 0, 0.05)" },
                            ticks: { font: { size: 12 } },
                          },
                        },
                        animation: {
                          duration: 1500,
                          easing: "easeOutQuart",
                        },
                      }}
                    />
                  </motion.div>
                ) : (
                  <p className="fd-no-data">No activity data available.</p>
                )}
              </motion.div>

              <motion.div
                custom={5}
                variants={cardVariants}
                whileHover="hover"
                className="fd-chart-card"
              >
                <div className="fd-chart-header">
                  <div>
                    <h3>Sleep Pattern</h3>
                    <span>24 hour cycle</span>
                  </div>
                  <Moon className="fd-chart-icon" />
                </div>
                {sleepDoughnutData ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="fd-chart-wrapper fd-doughnut-wrapper"
                  >
                    <Doughnut
                      data={sleepDoughnutData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: "75%",
                        plugins: {
                          legend: {
                            position: "bottom",
                            labels: {
                              padding: 15,
                              font: { size: 12 },
                            },
                          },
                          tooltip: {
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            padding: 12,
                            borderRadius: 8,
                          },
                        },
                        animation: {
                          animateRotate: true,
                          duration: 1500,
                        },
                      }}
                    />
                  </motion.div>
                ) : (
                  <p className="fd-no-data">No sleep data available.</p>
                )}
              </motion.div>

              <motion.div
                custom={6}
                variants={cardVariants}
                whileHover="hover"
                className="fd-chart-card fd-chart-span"
              >
                <div className="fd-chart-header">
                  <div>
                    <h3>Heart Rate Trend</h3>
                    <span>Last 7 hours</span>
                  </div>
                  <Heart className="fd-chart-icon" />
                </div>
                {heartRateLineData ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="fd-chart-wrapper"
                  >
                    <Line
                      data={heartRateLineData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            padding: 12,
                            borderRadius: 8,
                          },
                        },
                        scales: {
                          x: {
                            grid: { display: false },
                            ticks: { font: { size: 12 } },
                          },
                          y: {
                            beginAtZero: false,
                            grid: { color: "rgba(0, 0, 0, 0.05)" },
                            ticks: { font: { size: 12 } },
                          },
                        },
                        animation: {
                          duration: 1500,
                          easing: "easeOutQuart",
                        },
                      }}
                    />
                  </motion.div>
                ) : (
                  <p className="fd-no-data">No heart rate data available.</p>
                )}
              </motion.div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FitnessDashboard;
