
export async function GET() {
  return new Response(
    JSON.stringify({
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Loaded" : "Not Found",
    }),
    { status: 200 }
  );
}
