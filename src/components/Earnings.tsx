import { DollarSign, TrendingUp, TrendingDown, Users, Calendar, CreditCard, Download, Eye, Heart } from 'lucide-react';
import { useState } from 'react';

interface Transaction {
    id: number;
    type: 'subscription' | 'tip' | 'post' | 'message';
    amount: number;
    from: string;
    avatar: string;
    date: string;
    status: 'completed' | 'pending';
}

export function Earnings() {
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

    const stats = {
        totalEarnings: 45280.50,
        thisMonth: 12450.75,
        lastMonth: 10230.40,
        pending: 2340.20,
        subscribers: 1247,
        newSubscribers: 89,
        averagePerSubscriber: 36.32,
    };

    const monthlyData = [
        { month: 'Jan', earnings: 8200 },
        { month: 'Feb', earnings: 9100 },
        { month: 'Mar', earnings: 10500 },
        { month: 'Apr', earnings: 9800 },
        { month: 'May', earnings: 11200 },
        { month: 'Jun', earnings: 12450 },
    ];

    const revenueBreakdown = [
        { type: 'Subscriptions', amount: 8240, percentage: 66, color: 'from-blue-500 to-blue-600' },
        { type: 'Tips', amount: 2850, percentage: 23, color: 'from-pink-500 to-pink-600' },
        { type: 'PPV Posts', amount: 980, percentage: 8, color: 'from-purple-500 to-purple-600' },
        { type: 'Messages', amount: 380, percentage: 3, color: 'from-green-500 to-green-600' },
    ];

    const recentTransactions: Transaction[] = [
        {
            id: 1,
            type: 'subscription',
            amount: 14.99,
            from: 'John Smith',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
            date: '2 hours ago',
            status: 'completed',
        },
        {
            id: 2,
            type: 'tip',
            amount: 50.00,
            from: 'Sarah Johnson',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
            date: '5 hours ago',
            status: 'completed',
        },
        {
            id: 3,
            type: 'post',
            amount: 9.99,
            from: 'Mike Davis',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
            date: '1 day ago',
            status: 'completed',
        },
        {
            id: 4,
            type: 'subscription',
            amount: 14.99,
            from: 'Emily Brown',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
            date: '1 day ago',
            status: 'pending',
        },
        {
            id: 5,
            type: 'message',
            amount: 4.99,
            from: 'Chris Wilson',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
            date: '2 days ago',
            status: 'completed',
        },
        {
            id: 6,
            type: 'tip',
            amount: 25.00,
            from: 'Jessica Lee',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
            date: '2 days ago',
            status: 'completed',
        },
    ];

    const getTransactionIcon = (type: Transaction['type']) => {
        switch (type) {
            case 'subscription':
                return <Users className="w-4 h-4" />;
            case 'tip':
                return <Heart className="w-4 h-4" />;
            case 'post':
                return <Eye className="w-4 h-4" />;
            case 'message':
                return <CreditCard className="w-4 h-4" />;
        }
    };

    const getTransactionLabel = (type: Transaction['type']) => {
        switch (type) {
            case 'subscription':
                return 'Subscription';
            case 'tip':
                return 'Tip';
            case 'post':
                return 'PPV Post';
            case 'message':
                return 'Paid Message';
        }
    };

    const percentageChange = ((stats.thisMonth - stats.lastMonth) / stats.lastMonth * 100).toFixed(1);
    const isPositive = stats.thisMonth > stats.lastMonth;

    const maxEarning = Math.max(...monthlyData.map(d => d.earnings));

    return (
        <div className="px-6 py-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl flex items-center gap-3 mb-2">
                    <DollarSign className="w-8 h-8 text-green-500" />
                    Earnings
                </h1>
                <p className="text-gray-400">Track your revenue and financial performance</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Total Earnings</span>
                        <DollarSign className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-2xl mb-1">${stats.totalEarnings.toLocaleString()}</div>
                    <div className="text-xs text-green-400">All time revenue</div>
                </div>

                <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">This Month</span>
                        <Calendar className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-2xl mb-1">${stats.thisMonth.toLocaleString()}</div>
                    <div className={`text-xs flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(Number(percentageChange))}% vs last month
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Pending</span>
                        <CreditCard className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="text-2xl mb-1">${stats.pending.toLocaleString()}</div>
                    <div className="text-xs text-purple-400">Available in 7 days</div>
                </div>

                <div className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 border border-pink-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Subscribers</span>
                        <Users className="w-5 h-5 text-pink-500" />
                    </div>
                    <div className="text-2xl mb-1">{stats.subscribers.toLocaleString()}</div>
                    <div className="text-xs text-pink-400">+{stats.newSubscribers} this month</div>
                </div>
            </div>

            {/* Earnings Chart */}
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl">Revenue Overview</h2>
                    <div className="flex gap-2">
                        {(['week', 'month', 'year'] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-3 py-1 rounded-lg text-sm transition ${timeRange === range
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                            >
                                {range.charAt(0).toUpperCase() + range.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Simple Bar Chart */}
                <div className="flex items-end gap-2 h-48">
                    {monthlyData.map((data) => (
                        <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full flex flex-col justify-end h-full">
                                <div
                                    className="w-full bg-gradient-to-t from-blue-600 to-pink-600 rounded-t-lg transition-all hover:opacity-80"
                                    style={{ height: `${(data.earnings / maxEarning) * 100}%` }}
                                />
                            </div>
                            <div className="text-xs text-gray-500">{data.month}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl mb-4">Revenue Breakdown</h2>
                <div className="space-y-4">
                    {revenueBreakdown.map((item) => (
                        <div key={item.type}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm">{item.type}</span>
                                <span className="text-sm text-gray-400">${item.amount.toLocaleString()} ({item.percentage}%)</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r ${item.color} transition-all`}
                                    style={{ width: `${item.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl">Recent Transactions</h2>
                    <button className="text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>

                <div className="space-y-3">
                    {recentTransactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-gray-800 hover:border-gray-700 transition"
                        >
                            <div className="flex items-center gap-3">
                                <img
                                    src={transaction.avatar}
                                    alt={transaction.from}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">{transaction.from}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${transaction.type === 'subscription' ? 'bg-blue-600/20 text-blue-400' :
                                                transaction.type === 'tip' ? 'bg-pink-600/20 text-pink-400' :
                                                    transaction.type === 'post' ? 'bg-purple-600/20 text-purple-400' :
                                                        'bg-green-600/20 text-green-400'
                                            }`}>
                                            {getTransactionIcon(transaction.type)}
                                            {getTransactionLabel(transaction.type)}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500">{transaction.date}</div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-green-400 font-medium">+${transaction.amount.toFixed(2)}</div>
                                <div className={`text-xs ${transaction.status === 'completed' ? 'text-green-500' : 'text-yellow-500'
                                    }`}>
                                    {transaction.status === 'completed' ? '✓ Completed' : '⏱ Pending'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="w-full mt-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">
                    View All Transactions
                </button>
            </div>

            {/* Payout Info */}
            <div className="mt-6 bg-gradient-to-r from-blue-600/20 to-pink-600/20 border border-blue-500/30 rounded-lg p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg mb-2">Ready to Withdraw?</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            You have ${stats.pending.toLocaleString()} available for payout
                        </p>
                        <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-pink-600 rounded-lg hover:opacity-90 transition">
                            Request Payout
                        </button>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-400">Next auto-payout</div>
                        <div className="text-lg">Dec 15, 2025</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
