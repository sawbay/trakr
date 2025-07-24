import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import AddTransactionModal from "@/components/add-transaction-modal";
import AIImportModal from "@/components/ai-import-modal";
import BottomNavigation from "@/components/bottom-navigation";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics/summary"],
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const recentTransactions = transactions.slice(0, 4);
  
  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find((c: any) => c.name === categoryName);
    return category?.icon || "fas fa-circle";
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((c: any) => c.name === categoryName);
    return category?.color || "#3498DB";
  };

  const formatAmount = (amount: string, type: string) => {
    const num = parseFloat(amount);
    const formatted = `$${num.toFixed(2)}`;
    return type === 'income' ? `+${formatted}` : `-${formatted}`;
  };

  if (analyticsLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-primary text-2xl mb-2"></i>
          <p className="text-gray">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      {/* Header */}
      <header className="bg-primary text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <i className="fas fa-wallet text-lg"></i>
            </div>
            <div>
              <h1 className="text-lg font-semibold">Money Tracker</h1>
              <p className="text-sm opacity-90">John Doe</p>
            </div>
          </div>
          <button className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <i className="fas fa-cog"></i>
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-sm opacity-90 mb-1">Total Balance</p>
          <h2 className="text-3xl font-bold">
            ${analytics?.totalBalance?.toFixed(2) || "0.00"}
          </h2>
          <div className="flex justify-center space-x-6 mt-4">
            <div className="text-center">
              <p className="text-xs opacity-80">Income</p>
              <p className="font-semibold">${analytics?.monthlyIncome?.toFixed(2) || "0.00"}</p>
            </div>
            <div className="text-center">
              <p className="text-xs opacity-80">Expenses</p>
              <p className="font-semibold">${analytics?.monthlyExpenses?.toFixed(2) || "0.00"}</p>
            </div>
          </div>
        </div>
      </header>

      {/* AI Import Section */}
      <div className="p-6">
        <div className="bg-gradient-to-r from-secondary to-purple p-4 rounded-2xl text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">AI Smart Import</h3>
              <p className="text-sm opacity-90">Import transactions from text</p>
            </div>
            <button
              className="bg-white bg-opacity-20 px-4 py-2 rounded-lg text-sm font-medium"
              onClick={() => setShowAIModal(true)}
            >
              Try Now
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                <i className="fas fa-chart-line text-primary"></i>
              </div>
              <div>
                <p className="text-xs text-gray">This Month</p>
                <p className="font-semibold text-dark">
                  ${analytics?.monthlyExpenses?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-warning bg-opacity-10 rounded-full flex items-center justify-center">
                <i className="fas fa-target text-warning"></i>
              </div>
              <div>
                <p className="text-xs text-gray">Budget Left</p>
                <p className="font-semibold text-dark">
                  ${(1500 - (analytics?.monthlyExpenses || 0)).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-dark">Recent Transactions</h3>
          <button 
            className="text-primary text-sm font-medium"
            onClick={() => setLocation("/transactions")}
          >
            View All
          </button>
        </div>

        <div className="space-y-3">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray">
              <i className="fas fa-receipt text-4xl mb-4"></i>
              <p>No transactions yet</p>
              <p className="text-sm">Add your first transaction to get started</p>
            </div>
          ) : (
            recentTransactions.map((transaction: any) => (
              <div key={transaction.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: `${getCategoryColor(transaction.category)}20`,
                      }}
                    >
                      <i 
                        className={`${getCategoryIcon(transaction.category)}`}
                        style={{ color: getCategoryColor(transaction.category) }}
                      ></i>
                    </div>
                    <div>
                      <p className="font-medium text-dark">{transaction.description}</p>
                      <p className="text-sm text-gray">{transaction.category}</p>
                      <p className="text-xs text-gray">
                        {format(new Date(transaction.date), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p 
                      className={`font-semibold ${
                        transaction.type === 'income' ? 'text-primary' : 'text-destructive'
                      }`}
                    >
                      {formatAmount(transaction.amount, transaction.type)}
                    </p>
                    <button className="text-xs text-primary mt-1">Edit</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Category Overview */}
      {analytics?.categoryBreakdown && Object.keys(analytics.categoryBreakdown).length > 0 && (
        <div className="p-6 mt-6">
          <h3 className="text-lg font-semibold text-dark mb-4">Spending Categories</h3>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="space-y-4">
              {Object.entries(analytics.categoryBreakdown).map(([categoryName, amount]: [string, any]) => {
                const maxAmount = Math.max(...Object.values(analytics.categoryBreakdown));
                const percentage = (amount / maxAmount) * 100;
                
                return (
                  <div key={categoryName} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ 
                          backgroundColor: `${getCategoryColor(categoryName)}20`,
                        }}
                      >
                        <i 
                          className={`${getCategoryIcon(categoryName)} text-sm`}
                          style={{ color: getCategoryColor(categoryName) }}
                        ></i>
                      </div>
                      <span className="text-dark font-medium">{categoryName}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-dark">${amount.toFixed(2)}</p>
                      <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: getCategoryColor(categoryName)
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        className="fixed bottom-20 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-transform hover:scale-105"
        onClick={() => setShowAddModal(true)}
      >
        <i className="fas fa-plus text-xl"></i>
      </button>

      {/* Bottom Navigation */}
      <BottomNavigation onNavigate={setLocation} />

      {/* Modals */}
      <AddTransactionModal open={showAddModal} onOpenChange={setShowAddModal} />
      <AIImportModal open={showAIModal} onOpenChange={setShowAIModal} />

      {/* Bottom padding */}
      <div className="h-24"></div>
    </div>
  );
}
