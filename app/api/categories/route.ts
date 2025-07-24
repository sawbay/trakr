import { NextResponse } from 'next/server'
import { storage } from '@/lib/storage'

export async function GET() {
  try {
    const categories = await storage.getCategories()
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch categories", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}