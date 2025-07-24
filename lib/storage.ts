import { 
  IStorage, 
  MemStorage, 
  type AnalyticsSummary 
} from '@/server/storage'
import { type Transaction, type Category, type InsertTransaction } from '@shared/schema'

// Create a singleton storage instance for the Next.js app
export const storage: IStorage = new MemStorage()

// Re-export types and interfaces
export type { Transaction, Category, InsertTransaction, AnalyticsSummary, IStorage }