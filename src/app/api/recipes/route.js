import { NextResponse } from 'next/server';

// Nutrients you want to extract and map from Spoonacular's response
const desiredNutrients = {
  calories: 'Calories',
  totalFat: 'Fat',
  saturatedFat: 'Saturated Fat',
  cholesterol: 'Cholesterol',
  sodium: 'Sodium',
  totalCarbs: 'Carbohydrates',
  dietaryFiber: 'Fiber',
  sugars: 'Sugar',
  protein: 'Protein',
  vitaminA: 'Vitamin A',
  vitaminC: 'Vitamin C',
  calcium: 'Calcium',
  iron: 'Iron',
};

// API route handler for GET requests
export async function GET(req) {
  try {
    // Extract query string from the URL
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');

    // Spoonacular API key from environment variables
    const apiKey = process.env.SPOONACULAR_API_KEY;

    // Search for recipes based on the user query
    const searchUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=5&apiKey=${apiKey}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    // Enrich each recipe result with additional information (nutrition, ingredients, etc.)
    const enrichedResults = await Promise.all(
      (searchData.results || []).map(async (recipe) => {
        // Get detailed information for each recipe including nutrition
        const infoUrl = `https://api.spoonacular.com/recipes/${recipe.id}/information?includeNutrition=true&apiKey=${apiKey}`;
        const infoRes = await fetch(infoUrl);
        const infoData = await infoRes.json();

        // Extract and map nutrition data based on desiredNutrients
        const nutrients = infoData.nutrition?.nutrients || [];
        const nutrition = {};

        for (const [key, displayName] of Object.entries(desiredNutrients)) {
          const match = nutrients.find((n) => n.name.toLowerCase() === displayName.toLowerCase());
          if (match) {
            nutrition[key] = `${match.amount} ${match.unit}`;
          }
        }

        // Return the enriched recipe object
        return {
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
          summary: infoData.summary,
          sourceUrl: infoData.sourceUrl,
          nutrition,
          extendedIngredients: infoData.extendedIngredients || [], // ✅ Now included!
        };
      })
    );

    // Respond with the enriched recipe results
    return NextResponse.json({ results: enrichedResults });
  } catch (err) {
    // Catch and log any errors, then return a 500 response
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
