import Image from "next/image";

export default function Nutriplanning() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
      <h1 className="text-4xl font-bold">
        <span className="text-green-500">Nutriplanning </span><span className="text-teal-400">Page</span>
      </h1>
        <ul className="list-inside text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
            <li className="mb-2">
              Placeholder.
            </li>
        </ul>
      </main>
    </div>
  );
}