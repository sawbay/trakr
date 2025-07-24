import { NextResponse } from 'next/server'
import { storage } from '@/lib/storage'

export async function GET() {
  try {
    const summary = await storage.getAnalyticsSummary()
    return NextResponse.json(summary)
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch analytics summary", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}