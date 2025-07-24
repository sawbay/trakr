import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import BottomNavigation from "@/components/bottom-navigation";
import { useLocation } from "wouter";

export default function Analytics() {
  const [, setLocation] = useLocation();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics/summary"],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((c: any) => c.name === categoryName);
    return category?.color || "#3498DB";
  };

  const pieData = analytics?.categoryBreakdown ? Object.entries(analytics.categoryBreakdown).map(([name, value]: [string, any]) => ({
    name,
    value,
    color: getCategoryColor(name),
  })) : [];

  const barData = analytics?.categoryBreakdown ? Object.entries(analytics.categoryBreakdown).map(([name, value]: [string, any]) => ({
    category: name.length > 10 ? name.substring(0, 10) + "..." : name,
    amount: value,
  })) : [];

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-primary text-2xl mb-2"></i>
          <p className="text-gray">Loading analytics...</p>
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
          <h1 className="text-lg font-semibold">Analytics</h1>
          <div className="w-10 h-10"></div>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="p-6 grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-center">
            <i className="fas fa-arrow-up text-primary text-2xl mb-2"></i>
            <p className="text-xs text-gray mb-1">Total Income</p>
            <p className="text-lg font-bold text-primary">
              ${analytics?.monthlyIncome?.toFixed(2) || "0.00"}
            </p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-center">
            <i className="fas fa-arrow-down text-destructive text-2xl mb-2"></i>
            <p className="text-xs text-gray mb-1">Total Expenses</p>
            <p className="text-lg font-bold text-destructive">
              ${analytics?.monthlyExpenses?.toFixed(2) || "0.00"}
            </p>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="px-6 mb-6">
        <div className="bg-gradient-to-r from-primary to-secondary p-6 rounded-xl text-white">
          <div className="text-center">
            <p className="text-sm opacity-90 mb-2">Net Balance</p>
            <p className="text-2xl font-bold">
              ${analytics?.totalBalance?.toFixed(2) || "0.00"}
            </p>
            <p className="text-xs opacity-80 mt-2">This Month</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      {pieData.length > 0 && (
        <>
          {/* Pie Chart */}
          <div className="px-6 mb-6">
            <h3 className="text-lg font-semibold text-dark mb-4">Expense Distribution</h3>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className="text-xs text-gray truncate">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="px-6 mb-6">
            <h3 className="text-lg font-semibold text-dark mb-4">Category Breakdown</h3>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category" 
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]} />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {pieData.length === 0 && (
        <div className="px-6 text-center py-12">
          <i className="fas fa-chart-pie text-gray text-4xl mb-4"></i>
          <p className="text-lg font-medium text-gray mb-2">No data to analyze</p>
          <p className="text-sm text-gray">Add some transactions to see your spending analytics</p>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation onNavigate={setLocation} />

      {/* Bottom padding */}
      <div className="h-24"></div>
    </div>
  );
}
