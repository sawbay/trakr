import { NextRequest, NextResponse } from 'next/server'
import { parseTransactionImage } from '@/lib/ai-service'
import { storage } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json(
        { message: "Image file is required" },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    const parsedTransactions = await parseTransactionImage(base64Image)
    
    if (parsedTransactions.length === 0) {
      return NextResponse.json(
        { message: "No transactions found in the image" },
        { status: 400 }
      )
    }

    const createdTransactions = []
    for (const parsedTransaction of parsedTransactions) {
      const transaction = await storage.createTransaction(parsedTransaction)
      createdTransactions.push(transaction)
    }

    return NextResponse.json({
      message: `Successfully imported ${createdTransactions.length} transaction(s) from image`,
      transactions: createdTransactions,
      count: createdTransactions.length 
    })
  } catch (error) {
    return NextResponse.json(
      { 
        message: "Failed to import transactions from image", 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 400 }
    )
  }
}