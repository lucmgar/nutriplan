// /app/api/quote/route.js
export async function GET() {
    try {
      const response = await fetch("https://quotes.rest/qod.json?category=inspiration", {
        headers: { Accept: "application/json" },
        cache: "no-cache",
      });
  
      const data = await response.json();
      console.log("Fixed quote data:", data);
  
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Quote fetch failed (server):", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch quote" }),
        { status: 500 }
      );
    }
  }
  