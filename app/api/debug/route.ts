export async function GET() {
  return Response.json({
    MAINTENANCE_MODE: process.env.MAINTENANCE_MODE,
    NODE_ENV: process.env.NODE_ENV,
  })
}