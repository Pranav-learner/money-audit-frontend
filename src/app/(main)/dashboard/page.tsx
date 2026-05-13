'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Target, ArrowUpRight } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { 
  getDashboardSummary, 
  getDashboardCharts, 
  getRecentActivity,
  DashboardSummary,
  DashboardCharts,
  RecentActivity
} from '@/lib/services/dashboard';
import { toast } from 'react-hot-toast';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, chartsData, activityData] = await Promise.all([
          getDashboardSummary(),
          getDashboardCharts(),
          getRecentActivity()
        ]);
        setSummary(summaryData);
        setCharts(chartsData);
        setActivities(activityData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // toast.error('Failed to load real data. Backend might be down.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const dashboard = summary || { totalBalance: 0, monthlyExpenses: 0, totalSavings: 0, balanceTrend: '', expenseTrend: '', savingsTrend: '', budgetUsedPct: 0 };
  const chartData = charts || { spendingOverview: [], categoryDistribution: [], expenseTrend: [] };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Balance"
          value={formatCurrency(dashboard.totalBalance)}
          icon={<Wallet className="w-5 h-5" />}
          trend={dashboard.balanceTrend || '0%'}
          trendUp={!(dashboard.balanceTrend || '').startsWith('-')}
          color="from-primary to-emerald-400"
        />
        <SummaryCard
          title="Monthly Expenses"
          value={formatCurrency(dashboard.monthlyExpenses)}
          icon={<TrendingDown className="w-5 h-5" />}
          trend={dashboard.expenseTrend || '0%'}
          trendUp={(dashboard.expenseTrend || '').startsWith('-')}
          color="from-rose-400 to-orange-400"
        />
        <SummaryCard
          title="Total Savings/Income"
          value={formatCurrency(dashboard.totalSavings)}
          icon={<PiggyBank className="w-5 h-5" />}
          trend={dashboard.savingsTrend || '0%'}
          trendUp={!(dashboard.savingsTrend || '').startsWith('-')}
          color="from-accent to-violet-400"
        />
        <SummaryCard
          title="Budget Used"
          value={`${dashboard.budgetUsedPct}%`}
          subtitle="Budget Usage"
          icon={<Target className="w-5 h-5" />}
          color="from-amber-400 to-yellow-400"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Spending Trend Bar Chart */}
        <div className="lg:col-span-2 glass-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Spending Overview</h3>
            <span className="badge badge-info">2026</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData.spendingOverview} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                formatter={(value: number) => [formatCurrency(value), 'Spent']}
              />
              <Bar dataKey="amount" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#2dd4a8" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="glass-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">By Category</h3>
            <span className="badge badge-info">April</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData.categoryDistribution}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.categoryDistribution?.map((entry: any, idx: number) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '12px' }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Expense Trend */}
        <div className="lg:col-span-2 glass-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Expense Trend</h3>
            <span className="text-2xl font-bold text-foreground">{formatCurrency(dashboard.monthlyExpenses)}</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData.expenseTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '12px' }}
                formatter={(value: number) => [formatCurrency(value), 'Total']}
              />
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2.5} fill="url(#areaGradient)" dot={{ r: 3, fill: '#6366f1' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Transactions */}
        <div className="glass-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Transactions</h3>
            <button className="text-xs text-primary font-semibold hover:underline">See All</button>
          </div>
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 py-2 border-b border-white/20 last:border-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm">
                  {activity.type === 'expense' ? '💸' : '💰'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                  <p className="text-xs text-muted">{activity.date}</p>
                </div>
                <span className={`text-sm font-semibold ${activity.type === 'expense' ? 'text-danger' : 'text-success'}`}>
                  {activity.type === 'expense' ? '-' : '+'}{formatCurrency(activity.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Budget Usage */}
      {chartData.budgetUsage && (chartData.budgetUsage as any[]).length > 0 && (
        <div className="glass-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Budget vs Spending</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData.budgetUsage as any[]} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip
                contentStyle={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '12px' }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Bar dataKey="budget" fill="rgba(148,163,184,0.2)" radius={[0, 6, 6, 0]} name="Budget" />
              <Bar dataKey="spent" fill="#2dd4a8" radius={[0, 6, 6, 0]} name="Spent" />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, subtitle, icon, trend, trendUp, color }: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color: string;
}) {
  return (
    <div className="glass-card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-semibold ${trendUp ? 'text-success' : 'text-danger'}`}>
            {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs text-muted font-medium uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

