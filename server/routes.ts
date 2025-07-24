import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { insertTransactionSchema, aiImportSchema, aiImageImportSchema } from "@shared/schema";
import { parseTransactionText, parseTransactionImage } from "./services/openai";

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Transaction routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getTransaction(id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data", error: error.message });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(id, validatedData);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data", error: error.message });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTransaction(id);
      if (!deleted) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // AI Import route
  app.post("/api/ai-import", async (req, res) => {
    try {
      const { text } = aiImportSchema.parse(req.body);
      const parsedTransactions = await parseTransactionText(text);
      
      // Create transactions in storage
      const createdTransactions = [];
      for (const parsed of parsedTransactions) {
        const transactionData = {
          amount: parsed.amount,
          description: parsed.description,
          category: parsed.category,
          type: parsed.type,
          date: new Date(), // Use current date, could be enhanced to parse dates from text
        };
        
        const created = await storage.createTransaction(transactionData);
        createdTransactions.push({ ...created, confidence: parsed.confidence });
      }
      
      res.json({ 
        success: true, 
        transactions: createdTransactions,
        count: createdTransactions.length 
      });
    } catch (error) {
      res.status(400).json({ 
        message: "Failed to import transactions", 
        error: error.message 
      });
    }
  });

  // AI Image Import route
  app.post("/api/ai-import-image", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Convert buffer to base64
      const base64Image = req.file.buffer.toString('base64');
      const parsedTransactions = await parseTransactionImage(base64Image);
      
      // Create transactions in storage
      const createdTransactions = [];
      for (const parsed of parsedTransactions) {
        const transactionData = {
          amount: parsed.amount,
          description: parsed.description,
          category: parsed.category,
          type: parsed.type,
          date: new Date(), // Use current date, could be enhanced to parse dates from image
        };
        
        const created = await storage.createTransaction(transactionData);
        createdTransactions.push({ ...created, confidence: parsed.confidence });
      }
      
      res.json({ 
        success: true, 
        transactions: createdTransactions,
        count: createdTransactions.length 
      });
    } catch (error) {
      res.status(400).json({ 
        message: "Failed to import transactions from image", 
        error: error.message 
      });
    }
  });

  // Analytics routes
  app.get("/api/analytics/summary", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);
      
      const monthlyTransactions = transactions.filter(t => 
        new Date(t.date) >= currentMonth
      );
      
      const income = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const expenses = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const balance = income - expenses;
      
      // Category breakdown
      const categoryTotals = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
          return acc;
        }, {} as Record<string, number>);
      
      res.json({
        totalBalance: balance,
        monthlyIncome: income,
        monthlyExpenses: expenses,
        categoryBreakdown: categoryTotals,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
