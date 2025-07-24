import { NextRequest, NextResponse } from 'next/server'
import { parseTransactionText } from '@/lib/ai-service'
import { storage } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const text = formData.get('text') as string

    if (!text) {
      return NextResponse.json(
        { message: "Text is required" },
        { status: 400 }
      )
    }

    const parsedTransactions = await parseTransactionText(text)
    
    if (parsedTransactions.length === 0) {
      return NextResponse.json(
        { message: "No transactions found in the provided text" },
        { status: 400 }
      )
    }

    const createdTransactions = []
    for (const parsedTransaction of parsedTransactions) {
      const transaction = await storage.createTransaction(parsedTransaction)
      createdTransactions.push(transaction)
    }

    return NextResponse.json({
      message: `Successfully imported ${createdTransactions.length} transaction(s)`,
      transactions: createdTransactions,
      count: createdTransactions.length 
    })
  } catch (error) {
    return NextResponse.json(
      { 
        message: "Failed to import transactions", 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 400 }
    )
  }
}