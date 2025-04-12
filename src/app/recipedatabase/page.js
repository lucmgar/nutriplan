import Image from "next/image";
import * as React from 'react';
import AccordionGroup from '@mui/joy/AccordionGroup';
import Accordion from '@mui/joy/Accordion';
import AccordionDetails from '@mui/joy/AccordionDetails';
import AccordionSummary from '@mui/joy/AccordionSummary';

export default function Recipedatabase() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
      <h1 className="text-4xl font-bold">
        <span className="text-green-500">Recipe Database </span><span className="text-teal-400">Page</span>
      </h1>
        <ul className="list-inside text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
            <li className="mb-2">
              Placeholder.
            </li>
        </ul>
        <input
          placeholder="Search"
          className='class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"'
          style={{ display: 'block', width: '100%', marginBottom: 10 }}
        />
      <div className="text-white">
        <AccordionGroup disableDivider sx={{ maxWidth: 400 }}>
          <Accordion>
            <AccordionSummary>First accordion</AccordionSummary>
            <AccordionDetails>
              <p>Test</p>
              <button>Test</button>
              <p>Test</p>
            </AccordionDetails>
          </Accordion>
        </AccordionGroup>
      </div>
      </main>
    </div>
  );
}