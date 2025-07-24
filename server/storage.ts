import { transactions, categories, type Transaction, type InsertTransaction, type Category, type InsertCategory } from "@shared/schema";

export interface AnalyticsSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  topCategories: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
}

export interface IStorage {
  // Transaction methods
  getTransactions(): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Analytics methods
  getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]>;
  getTransactionsByCategory(category: string): Promise<Transaction[]>;
  getAnalyticsSummary(): Promise<AnalyticsSummary>;
}

export class MemStorage implements IStorage {
  private transactions: Map<number, Transaction>;
  private categories: Map<number, Category>;
  private currentTransactionId: number;
  private currentCategoryId: number;

  constructor() {
    this.transactions = new Map();
    this.categories = new Map();
    this.currentTransactionId = 1;
    this.currentCategoryId = 1;
    
    // Initialize default categories
    this.initializeDefaultCategories();
  }

  private initializeDefaultCategories() {
    const defaultCategories: InsertCategory[] = [
      { name: "Food & Dining", icon: "fas fa-utensils", color: "#E74C3C" },
      { name: "Transportation", icon: "fas fa-bus", color: "#F39C12" },
      { name: "Entertainment", icon: "fas fa-film", color: "#9B59B6" },
      { name: "Shopping", icon: "fas fa-shopping-bag", color: "#3498DB" },
      { name: "Bills & Utilities", icon: "fas fa-bolt", color: "#E67E22" },
      { name: "Healthcare", icon: "fas fa-heartbeat", color: "#1ABC9C" },
      { name: "Income", icon: "fas fa-plus", color: "#2ECC71" },
    ];

    defaultCategories.forEach(category => {
      const id = this.currentCategoryId++;
      const fullCategory: Category = { ...category, id };
      this.categories.set(id, fullCategory);
    });
  }

  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      amount: insertTransaction.amount.toString(),
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: number, updateData: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const existing = this.transactions.get(id);
    if (!existing) return undefined;

    const updated: Transaction = {
      ...existing,
      ...updateData,
      amount: updateData.amount?.toString() || existing.amount,
    };
    this.transactions.set(id, updated);
    return updated;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    return this.transactions.delete(id);
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    const allTransactions = await this.getTransactions();
    return allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }

  async getTransactionsByCategory(category: string): Promise<Transaction[]> {
    const allTransactions = await this.getTransactions();
    return allTransactions.filter(transaction => transaction.category === category);
  }

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const allTransactions = await this.getTransactions();
    
    const totalBalance = allTransactions.reduce((sum, transaction) => {
      return transaction.type === 'income' ? sum + transaction.amount : sum - transaction.amount;
    }, 0);
    
    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const monthlyTransactions = allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });
    
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const categoryStats = new Map<string, { amount: number; count: number }>();
    monthlyTransactions.forEach(transaction => {
      const existing = categoryStats.get(transaction.category) || { amount: 0, count: 0 };
      categoryStats.set(transaction.category, {
        amount: existing.amount + transaction.amount,
        count: existing.count + 1
      });
    });
    
    const topCategories = Array.from(categoryStats.entries())
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      topCategories
    };
  }
}

export const storage = new MemStorage();
