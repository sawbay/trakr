import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { storage } from '@/lib/storage'
import { insertTransactionSchema } from '@/shared/schema'

export async function GET() {
  try {
    const transactions = await storage.getTransactions()
    return NextResponse.json(transactions)
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch transactions", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = insertTransactionSchema.parse(body)
    const transaction = await storage.createTransaction(validatedData)
    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid transaction data", errors: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { message: "Invalid transaction data", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    )
  }
}