import { NextResponse } from 'next/server';

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

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    const apiKey = process.env.SPOONACULAR_API_KEY;

    const searchUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=5&apiKey=${apiKey}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    const enrichedResults = await Promise.all(
      (searchData.results || []).map(async (recipe) => {
        const infoUrl = `https://api.spoonacular.com/recipes/${recipe.id}/information?includeNutrition=true&apiKey=${apiKey}`;
        const infoRes = await fetch(infoUrl);
        const infoData = await infoRes.json();

        const nutrients = infoData.nutrition?.nutrients || [];
        const nutrition = {};

        for (const [key, displayName] of Object.entries(desiredNutrients)) {
          const match = nutrients.find((n) => n.name.toLowerCase() === displayName.toLowerCase());
          if (match) {
            nutrition[key] = `${match.amount} ${match.unit}`;
          }
        }

        return {
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
          summary: infoData.summary,
          sourceUrl: infoData.sourceUrl,
          nutrition,
        };
      })
    );

    return NextResponse.json({ results: enrichedResults });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
