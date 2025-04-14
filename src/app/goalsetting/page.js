'use client';

import { useState, useEffect } from "react";
import { auth, db } from '../../../firebase';
import { doc, getDocs, collection, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from "firebase/auth";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import CalendarHeatmap from 'react-calendar-heatmap';
import "react-circular-progressbar/dist/styles.css";
import { LinearProgressBar } from "react-percentage-bar";

// Define core goals and optional nutrient categories
const coreGoals = ["steps", "water", "calories"];
const categories = {
  Macronutrients: ["protein", "sodium", "sugars"],
  Micronutrients: ["iron", "vitaminC", "calcium", "zinc", "magnesium"],
  Other: ["caffeine", "netCarbs", "glycemicIndex"],
};

// Utility to convert camelCase to Title Case
const formatFieldName = (name) => {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
};

export default function Goalsetting() {
  // State setup
  const [uid, setUid] = useState(null);
  const [goals, setGoals] = useState({});
  const [stats, setStats] = useState({});
  const [quote, setQuote] = useState(null);
  const [author, setAuthor] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [progress, setProgress] = useState({ steps: 0, water: 0, calories: 0 });

  // Date helpers
  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(today.getMonth() - 6);
  const todayStr = today.toISOString().split("T")[0];

  // Pretty format date for display
  const formattedDate = (() => {
    const day = today.getDate();
    const month = today.toLocaleString("en-US", { month: "long" });
    const suffix = (d) => ["th", "st", "nd", "rd"][(d % 10 > 3 || (d % 100 >= 11 && d % 100 <= 13)) ? 0 : d % 10];
    return `${month} ${day}${suffix(day)}, ${today.getFullYear()}`;
  })();

  // Listen for user auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
    });
    return () => unsubscribe();
  }, []);

  // Fetch motivational quote on mount
  useEffect(() => {
    async function fetchQuote() {
      try {
        const res = await fetch("/api/quote");
        const data = await res.json();
        const quoteObj = data.contents?.quotes?.[0];
        setQuote(quoteObj?.quote ?? "Push yourself, because no one else is going to do it for you.");
        setAuthor(quoteObj?.author ?? "Unknown");
      } catch {
        setQuote("Greatness comes from grit.");
        setAuthor("Fallback");
      }
    }
    fetchQuote();
  }, []);

  // Realtime listener for goals from Firestore
  useEffect(() => {
    if (!uid) return;
    const goalsRef = doc(db, `users/${uid}`);
    const unsubGoals = onSnapshot(goalsRef, async (docSnap) => {
      const newGoals = docSnap.data()?.goals || {};
      setGoals(newGoals);
      await fetchAndProcessStats(newGoals);
    });
    return () => unsubGoals();
  }, [uid]);

  // Realtime listener for today's stats
  useEffect(() => {
    if (!uid || !goals.steps || !goals.water || !goals.calories) return;

    const statsRef = doc(db, `users/${uid}/stats/${todayStr}`);
    const unsubStats = onSnapshot(statsRef, async (docSnap) => {
      const todayStats = docSnap.data() || {};

      // Fetch today's meals
      const mealDocs = await getDocs(collection(db, `users/${uid}/stats/${todayStr}/meals`));
      const mealData = mealDocs.docs.map(d => d.data());

      // Sum calories from meals
      const totalCals = mealData.reduce((acc, m) => acc + (Number(m.calories) || 0), 0);

      const mergedStats = { ...todayStats, calories: totalCals };

      // Sum each goal from meal fields if not already in stats
      for (const field of Object.keys(goals)) {
        if (!mergedStats[field]) {
          mergedStats[field] = 0;
        }
        if (!coreGoals.includes(field)) {
          for (const meal of mealData) {
            if (meal[field]) {
              mergedStats[field] += Number(meal[field]) || 0;
            }
          }
        }
      }

      setStats(mergedStats);
      updateProgress(goals, mergedStats);
    });

    return () => unsubStats();
  }, [uid, goals, todayStr]);

  // Update progress circle values
  const updateProgress = (goals, stats) => {
    const p = {};
    for (const key of coreGoals) {
      const goalVal = goals[key] || 1;
      const statVal = stats[key] || 0;
      p[key] = Math.min(100, Math.round((statVal / goalVal) * 100));
    }
    setProgress(p);
  };

  // Build calendar heatmap based on 6-month stats
  const fetchAndProcessStats = async (currentGoals) => {
    setCalendarLoading(true);
    const statsRef = collection(db, `users/${uid}/stats`);
    const snapshot = await getDocs(statsRef);
    const statsMap = {};
    snapshot.forEach(docSnap => {
      statsMap[docSnap.id] = docSnap.data();
    });

    const values = [];
    const cursor = new Date(sixMonthsAgo);
    while (cursor <= today) {
      const dateStr = cursor.toISOString().split("T")[0];
      const s = statsMap[dateStr] || {};

      // Fetch meal data for the day
      const mealsSnap = await getDocs(collection(db, `users/${uid}/stats/${dateStr}/meals`));
      const meals = mealsSnap.docs.map(d => d.data());

      // Total calories
      s.calories = meals.reduce((acc, m) => acc + (Number(m.calories) || 0), 0);

      // Total for optional nutrients
      for (const field of Object.keys(currentGoals)) {
        if (!coreGoals.includes(field)) {
          s[field] = meals.reduce((acc, m) => acc + (Number(m[field]) || 0), 0);
        }
      }

      // Determine goal completion level (0–3)
      const mainGoalsMet = coreGoals.filter(g => currentGoals[g] && s[g] >= currentGoals[g]);
      const optionalGoals = Object.keys(currentGoals).filter(g => !coreGoals.includes(g));
      const allOptionalsMet = optionalGoals.every(g => s[g] >= currentGoals[g]);

      let count = 0;
      if (mainGoalsMet.length === 3 && allOptionalsMet) count = 3;
      else if (mainGoalsMet.length === 3) count = 2;
      else if (mainGoalsMet.length >= 1) count = 1;

      values.push({ date: dateStr, count });
      cursor.setDate(cursor.getDate() + 1);
    }

    setHeatmapData(values);
    setCalendarLoading(false);
  };

  return (
    <div className="flex flex-col items-center min-h-screen w-full px-4 sm:px-8 py-6 gap-12 bg-black text-white">
      {/* Header & Quote */}
      <div className="text-center">
        <h1 className="text-4xl font-black">{formattedDate}</h1>
        {quote && (
          <ul className="list-inside text-sm mt-2 max-w-xl mx-auto px-4 text-gray-300 italic animate-fadeIn">
            <li className="mb-2">"{quote}"</li>
            <li className="text-right not-italic">— {author}</li>
          </ul>
        )}
      </div>

      {/* CIRCULAR PROGRESS BARS for Steps, Water, Calories */}
      <div className="flex flex-wrap justify-center gap-12 w-full max-w-6xl">
        {[
          { value: progress.steps, color: "#4ade80", label: "Steps" },
          { value: progress.water, color: "#38bdf8", label: "Water" },
          { value: progress.calories, color: "#f87171", label: "Calories" },
        ].map((item, index) => (
          <div key={index} style={{ width: 200, height: 200, position: "relative" }}>
            {item.value === 100 && (
              <div className="absolute inset-0 rounded-full z-0 animate-slowPing"
                   style={{ backgroundColor: item.color, opacity: 0.4, filter: "blur(20px)" }} />
            )}
            <CircularProgressbar
              value={item.value}
              strokeWidth={12}
              styles={buildStyles({ pathColor: item.color, trailColor: "#e5e7eb" })}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
              <span className={`text-3xl font-bold ${item.value === 100 ? "text-yellow-400 animate-soft-pulse" : ""}`}>
                {item.value}%
              </span>
              <span className="text-sm">{item.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* LINEAR PROGRESS BARS for all enabled goals */}
      {Object.entries(categories).map(([cat, fields]) => (
        <div key={cat} className="w-full max-w-5xl">
          <h3 className="text-xl font-bold mt-6 mb-2">{cat}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {fields
              .filter((field) => goals[field] > 0) // Show only fields that have a goal value
              .map((field) => {
                const val = stats[field] || 0;
                const goal = goals[field];
                const rawPercent = Math.round((val / goal) * 100);
                const percent = Math.min(rawPercent, 100);                
                const color = cat === "Macronutrients"
                  ? ["#f97316", "#facc15"]
                  : cat === "Micronutrients"
                  ? ["#3b82f6", "#9333ea"]
                  : ["#10b981", "#14b8a6"];

                return (
                  <LinearProgressBar
                    key={field}
                    text={formatFieldName(field)}
                    color={color}
                    percentage={percent}
                    textStyle={{ color: "white" }}
                    percentageColor="white"
                  />
                );
              })}
          </div>
        </div>
      ))}

      {/* CALENDAR HEATMAP */}
      <div className="w-1/2 max-w-3xl overflow-hidden animate-fadeIn relative min-h-[180px]">
        <h3 className="text-xl font-bold mt-6 mb-2">Your Progress (Last 6 Months)</h3>
        {calendarLoading ? (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin" />
          </div>
        ) : (
          <CalendarHeatmap
            startDate={sixMonthsAgo}
            endDate={today}
            values={heatmapData}
            gutterSize={4}
            showWeekdayLabels
            weekdayLabels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
            classForValue={(val) => {
              if (!val) return "fill-gray-300";
              if (val.count === 3) return "fill-yellow-300 animate-glow";
              if (val.count === 2) return "fill-green-600";
              if (val.count === 1) return "fill-lime-400";
              return "fill-gray-300";
            }}
            rectProps={{ rx: 100 }}
          />
        )}
      </div>
    </div>
  );
}
