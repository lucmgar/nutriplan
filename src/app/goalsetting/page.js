"use client";
import { useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { LinearProgressBar } from "react-percentage-bar";
import "react-circular-progressbar/dist/styles.css";

export default function Goalsetting() {
  const [progress1, setProgress1] = useState(0);
  const [progress2, setProgress2] = useState(0);
  const [progress3, setProgress3] = useState(0);

  useEffect(() => {
    const timeout1 = setTimeout(() => setProgress1(42), 300);
    const timeout2 = setTimeout(() => setProgress2(76), 500);
    const timeout3 = setTimeout(() => setProgress3(88), 700);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex flex-row gap-8 items-center justify-center flex-wrap px-6 py-4">
          <div style={{ width: 200, height: 200 }}>
            <CircularProgressbar
              value={progress1}
              text={`${progress1}%`}
              strokeWidth={12}
              styles={buildStyles({
                pathColor: "#4ade80",
                trailColor: "#e5e7eb",
                textColor: "#ffffff",
                textSize: "1.25rem",
              })}
            />
          </div>
          <div style={{ width: 200, height: 200 }}>
            <CircularProgressbar
              value={progress2}
              text={`${progress2}%`}
              strokeWidth={12}
              styles={buildStyles({
                pathColor: "#38bdf8",
                trailColor: "#e5e7eb",
                textColor: "#ffffff",
                textSize: "1.25rem",
              })}
            />
          </div>
          <div style={{ width: 200, height: 200 }}>
            <CircularProgressbar
              value={progress3}
              text={`${progress3}%`}
              strokeWidth={12}
              styles={buildStyles({
                pathColor: "#ff0000",
                trailColor: "#e5e7eb",
                textColor: "#ffffff",
                textSize: "1.25rem",
              })}
            />
          </div>
        </div>
        <LinearProgressBar
          text="Goal"
          color={['#fc2947','#7149c6']}
          percentageColor="white"
          textStyle={{
            color: 'white'
          }}
        />
        <LinearProgressBar
          text="Goal"
          color={['#fc2947','#7149c6']}
          percentageColor="white"
          textStyle={{
            color: 'white'
          }}
        />
        <LinearProgressBar
          text="Goal"
          color={['#fc2947','#7149c6']}
          percentageColor="white"
          textStyle={{
            color: 'white'
          }}
        />
        <h1 className="text-4xl font-bold">
          <span className="text-green-500">Goalsetting </span>
          <span className="text-teal-400">Page</span>
        </h1>

        <ul className="list-inside text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">Placeholder.</li>
        </ul>
      </main>
    </div>
  );
}
