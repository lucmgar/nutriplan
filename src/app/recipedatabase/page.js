'use client';

import { useState } from 'react';
import Image from 'next/image';
import AccordionGroup from '@mui/joy/AccordionGroup';
import Accordion from '@mui/joy/Accordion';
import AccordionDetails from '@mui/joy/AccordionDetails';
import AccordionSummary from '@mui/joy/AccordionSummary';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { app } from '../../../firebase';

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export default function Recipedatabase() {
  // UI and data states
  const [search, setSearch] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);

  // Handles recipe search via API
  const handleSearch = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/recipes?query=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.results) {
        setRecipes(data.results);
      } else {
        setError('No recipes found.');
      }
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to fetch recipes.');
    }
    setLoading(false);
  };

  // Handles adding recipe ingredients to Firestore shopping list
  const handleAddToShoppingList = async (recipe) => {
    const user = auth.currentUser;
    if (!user) {
      setError('You must be signed in to save recipes.');
      return;
    }

    try {
      await addDoc(collection(db, `users/${user.uid}/shoppinglist`), {
        title: recipe.title,
        ingredients: recipe.extendedIngredients || [],
        image: recipe.image,
        timestamp: new Date(),
      });
      alert('Added to shopping list!');
    } catch (err) {
      console.error('Error saving to shopping list:', err);
      setError('Failed to save to shopping list.');
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-black text-white">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full max-w-3xl">
        {/* Page Heading */}
        <h1 className="text-4xl font-bold text-center sm:text-left">
          <span className="text-green-500">Recipe </span>
          <span className="text-teal-400">Search</span>
        </h1>

        {/* Subtext instructions */}
        <ul className="list-inside text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)] text-gray-300">
          <li className="mb-2">Search for healthy meals and view their nutrition facts.</li>
        </ul>

        {/* Search Bar */}
        <div className="flex gap-4 w-full">
          <input
            type="text"
            placeholder="Search for recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-neutral-900 text-white border border-neutral-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleSearch}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-bold"
          >
            Search
          </button>
        </div>

        {/* Feedback messages */}
        {error && <p className="text-red-400">{error}</p>}
        {loading && <p className="text-gray-400">Loading recipes...</p>}

        {/* Accordion List of Results */}
        <AccordionGroup disableDivider sx={{ width: '100%' }}>
          {recipes.map((recipe) => (
            <Accordion
              key={recipe.id}
              expanded={openAccordion === recipe.id}
              onChange={() =>
                setOpenAccordion(openAccordion === recipe.id ? null : recipe.id)
              }
              className="bg-neutral-800 text-white rounded-lg border border-neutral-700 mb-4"
            >
              {/* Recipe Title */}
              <AccordionSummary className="font-semibold text-lg text-white" sx={{ color: 'white' }}>
                <p className="text-white">{recipe.title}</p>
              </AccordionSummary>

              {/* Recipe Details */}
              <AccordionDetails className="text-sm text-gray-300 flex flex-col gap-4">
                {/* Recipe Image */}
                {recipe.image && (
                  <Image
                    src={recipe.image}
                    alt={recipe.title}
                    width={600}
                    height={400}
                    className="rounded-lg"
                    unoptimized
                  />
                )}

                {/* Summary Text */}
                {recipe.summary && (
                  <p className="text-gray-400 leading-relaxed">
                    {recipe.summary.replace(/<[^>]+>/g, '')}
                  </p>
                )}

                {/* Nutrition Facts Section */}
                {recipe.nutrition && Object.keys(recipe.nutrition).length > 0 && (
                  <div>
                    <h4 className="font-semibold text-white mb-2">Nutrition Facts</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {Object.entries(recipe.nutrition).map(([key, value]) => (
                        <div
                          key={key}
                          className="bg-neutral-900 p-2 rounded-md border border-neutral-700"
                        >
                          <span className="text-white font-medium">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}:
                          </span>{' '}
                          <span className="text-gray-300">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Link to Original Recipe */}
                <a
                  href={recipe.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline mt-2"
                >
                  View full recipe →
                </a>

                {/* Add to Shopping List Button */}
                <button
                  onClick={() => handleAddToShoppingList(recipe)}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded font-semibold mt-4"
                >
                  Add Ingredients to Shopping List
                </button>
              </AccordionDetails>
            </Accordion>
          ))}
        </AccordionGroup>
      </main>
    </div>
  );
}
