import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { storage } from '@/lib/storage'
import { insertTransactionSchema } from '@/shared/schema'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transaction = await storage.getTransaction(params.id)
    if (!transaction) {
      return NextResponse.json(
        { message: "Transaction not found" },
        { status: 404 }
      )
    }
    return NextResponse.json(transaction)
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch transaction", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = insertTransactionSchema.parse(body)
    const transaction = await storage.updateTransaction(params.id, validatedData)
    if (!transaction) {
      return NextResponse.json(
        { message: "Transaction not found" },
        { status: 404 }
      )
    }
    return NextResponse.json(transaction)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await storage.deleteTransaction(params.id)
    if (!success) {
      return NextResponse.json(
        { message: "Transaction not found" },
        { status: 404 }
      )
    }
    return NextResponse.json({ message: "Transaction deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete transaction", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}