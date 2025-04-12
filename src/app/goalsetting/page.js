'use client';

import { useState, useEffect } from "react";
import { auth, db } from '../../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from "firebase/auth";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import CalendarHeatmap from 'react-calendar-heatmap';
import "react-circular-progressbar/dist/styles.css";
import { LinearProgressBar } from "react-percentage-bar";

export default function Goalsetting() {
  const [progress1, setProgress1] = useState(0); // Steps %
  const [progress2, setProgress2] = useState(0); // Water %
  const [progress3, setProgress3] = useState(0); // Placeholder (calories)
  const [uid, setUid] = useState(null);
  const [goals, setGoals] = useState({});
  const [stats, setStats] = useState({});

  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(today.getMonth() - 6);
  const todayStr = today.toISOString().split("T")[0]; // "YYYY-MM-DD"

  const formatDayWithSuffix = (day) => {
    if (day > 3 && day < 21) return `${day}th`;
    switch (day % 10) {
      case 1: return `${day}st`;
      case 2: return `${day}nd`;
      case 3: return `${day}rd`;
      default: return `${day}th`;
    }
  };

  const formattedDate = (() => {
    const day = today.getDate();
    const month = today.toLocaleString("en-US", { month: "long" });
    const year = today.getFullYear();
    return `${month} ${formatDayWithSuffix(day)}, ${year}`;
  })();

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore listeners
  useEffect(() => {
    if (!uid) return;

    const goalsRef = doc(db, `users/${uid}`);
    const statsRef = doc(db, `users/${uid}/stats/${todayStr}`);

    const unsubGoals = onSnapshot(goalsRef, (docSnap) => {
      const newGoals = docSnap.data()?.goals || {};
      setGoals(newGoals);
      updateProgress(newGoals, stats);
    });

    const unsubStats = onSnapshot(statsRef, (docSnap) => {
      const newStats = docSnap.data() || {};
      setStats(newStats);
      updateProgress(goals, newStats);
    });

    const updateProgress = (g, s) => {
      const stepPercent = g.steps ? Math.min(100, Math.round((s.steps || 0) / g.steps * 100)) : 0;
      const waterPercent = g.water ? Math.min(100, Math.round((s.water || 0) / g.water * 100)) : 0;
      setProgress1(stepPercent);
      setProgress2(waterPercent);
      setProgress3(88); // Placeholder
    };

    return () => {
      unsubGoals();
      unsubStats();
    };
  }, [uid, todayStr, goals, stats]);

  return (
    <div className="flex flex-col items-center min-h-screen w-full px-4 sm:px-8 py-6 gap-12 bg-black text-white">
      <div className="text-center">
        <h1 className="text-4xl font-black">
          <span>{formattedDate}</span>
        </h1>
        <ul className="list-inside text-sm font-[family-name:var(--font-geist-mono)] mt-2">
          <li className="mb-2">"Generic motivational quote" - Some Guy</li>
        </ul>
      </div>

      {/* CIRCULAR PROGRESS BARS */}
      <div className="flex flex-wrap justify-center gap-12 w-full max-w-6xl">
        {[ 
          { value: progress1, color: "#4ade80", label: "Steps" },
          { value: progress2, color: "#38bdf8", label: "Water" },
          { value: progress3, color: "#ff0000", label: "Calories" },
        ].map((item, index) => (
          <div key={index} style={{ width: 200, height: 200, position: "relative" }}>
            <CircularProgressbar
              value={item.value}
              strokeWidth={12}
              styles={buildStyles({
                pathColor: item.color,
                trailColor: "#e5e7eb",
              })}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <span className="text-3xl font-bold">{item.value}%</span>
              <span className="text-sm">{item.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* LINEAR PROGRESS BARS */}
      <div className="flex flex-wrap justify-center gap-12 w-full max-w-6xl">
        <LinearProgressBar
          text="Sugar Intake"
          color={['#fc2947', '#7149c6']}
          percentageColor="white"
          percentage={90}
          textStyle={{ color: 'white' }}
        />
        <LinearProgressBar
          text="Protein Intake"
          color={['#3bef00', '#00efba']}
          percentageColor="white"
          percentage={75}
          textStyle={{ color: 'white' }}
        />
        <LinearProgressBar
          text="Sodium Intake"
          color={['#efc100', '#ef9a00']}
          percentageColor="white"
          percentage={31}
          textStyle={{ color: 'white' }}
        />
        <LinearProgressBar
          text="Iron Intake"
          color={['#142787', '#26aeed']}
          percentageColor="white"
          percentage={45}
          textStyle={{ color: 'white' }}
        />
      </div>

      {/* CALENDAR HEATMAP */}
      <div className="w-1/2 max-w-3xl overflow-hidden animate-fadeIn">
        <CalendarHeatmap
          startDate={sixMonthsAgo}
          endDate={today}
          rectProps={{ rx: '100' }}
          values={[
            { date: "2024-12-23", count: 1 },
            { date: "2024-11-23", count: 1 },
          ]}
          gutterSize={4}
          showWeekdayLabels={true}
          weekdayLabels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
        />
      </div>
    </div>
  );
}
