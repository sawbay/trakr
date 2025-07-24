import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.YOUR_SITE_URL || "http://localhost:5000",
    "X-Title": "Money Tracker App",
  }
});

export interface ParsedTransaction {
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  confidence: number;
}

export async function parseTransactionText(text: string): Promise<ParsedTransaction[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o", // OpenRouter format for OpenAI's GPT-4o model
      messages: [
        {
          role: "system",
          content: `You are a financial transaction parser. Parse the given text and extract individual transactions. 
          
          For each transaction, determine:
          - amount (positive number, no currency symbols)
          - description (brief, descriptive)
          - category (one of: "Food & Dining", "Transportation", "Entertainment", "Shopping", "Bills & Utilities", "Healthcare", "Income")
          - type ("income" or "expense")
          - confidence (0-1, how confident you are in the parsing)
          
          Return a JSON array of transactions. If no transactions are found, return an empty array.
          
          Example output:
          [
            {
              "amount": 12.50,
              "description": "Lunch at Cafe",
              "category": "Food & Dining",
              "type": "expense",
              "confidence": 0.95
            }
          ]`
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Ensure we return an array
    if (Array.isArray(result)) {
      return result;
    } else if (result.transactions && Array.isArray(result.transactions)) {
      return result.transactions;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Failed to parse transaction text:", error);
    throw new Error("Failed to parse transaction text with AI");
  }
}
