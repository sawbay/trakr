import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BottomNavigation from "@/components/bottom-navigation";
import AddTransactionModal from "@/components/add-transaction-modal";
import { useLocation } from "wouter";

export default function Transactions() {
  const [, setLocation] = useLocation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

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

  const filteredTransactions = transactions.filter((transaction: any) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || transaction.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-primary text-2xl mb-2"></i>
          <p className="text-gray">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      {/* Header */}
      <header className="bg-primary text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => setLocation("/")}
            className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
          >
            <i className="fas fa-arrow-left text-lg"></i>
          </button>
          <h1 className="text-lg font-semibold">All Transactions</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
          >
            <i className="fas fa-plus text-lg"></i>
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="p-6 space-y-4">
        <Input
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category: any) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Transaction List */}
      <div className="px-6 pb-24">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray">
            <i className="fas fa-search text-4xl mb-4"></i>
            <p className="text-lg font-medium">No transactions found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction: any) => (
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
                        {format(new Date(transaction.date), "MMM d, yyyy 'at' h:mm a")}
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
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation onNavigate={setLocation} />

      {/* Add Transaction Modal */}
      <AddTransactionModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  );
}
