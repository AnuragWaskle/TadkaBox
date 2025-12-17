import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Users, DollarSign, ShoppingBag, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const COLORS = ['#FA4A0C', '#FF9F1C', '#FFBB28', '#FF8042', '#00C49F', '#0088FE'];

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            {/* Trend logic can be added later comparing to previous period */}
        </div>
        <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
        <h4 className="text-3xl font-bold text-gray-800">{value}</h4>
    </div>
);

export default function StatsDashboard() {
    const [timeRange, setTimeRange] = useState('All Time');
    const [stats, setStats] = useState({
        revenue: 0,
        orders: 0,
        customers: 0,
        avgOrderValue: 0
    });
    const [chartData, setChartData] = useState([]);
    const [pieData, setPieData] = useState([]);
    const [topItems, setTopItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);
                const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // 1. Calculate Summary Stats
                const totalRevenue = orders.reduce((acc, order) => acc + (Number(order.totalAmount) || 0), 0);
                const totalOrders = orders.length;
                const uniqueCustomers = new Set(orders.map(o => o.userId)).size;
                const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

                setStats({
                    revenue: totalRevenue,
                    orders: totalOrders,
                    customers: uniqueCustomers,
                    avgOrderValue
                });

                // 2. Prepare Chart Data (Group by Date)
                const groupedByDate = orders.reduce((acc, order) => {
                    if (!order.createdAt) return acc;
                    const date = order.createdAt.toDate ? new Date(order.createdAt.toDate()).toLocaleDateString('en-US', { weekday: 'short' }) : 'Unknown';
                    if (!acc[date]) acc[date] = { name: date, revenue: 0, orders: 0 };
                    acc[date].revenue += (Number(order.totalAmount) || 0);
                    acc[date].orders += 1;
                    return acc;
                }, {});

                // Sort by day of week if possible, or just use the order they appear (descending) then reverse
                const chartDataArray = Object.values(groupedByDate).reverse();
                setChartData(chartDataArray);

                // 3. Prepare Pie Data (Group by Item Name)
                const itemCounts = {};
                orders.forEach(order => {
                    if (order.items && Array.isArray(order.items)) {
                        order.items.forEach(item => {
                            const name = item.name || 'Unknown';
                            itemCounts[name] = (itemCounts[name] || 0) + (item.quantity || 1);
                        });
                    }
                });

                const pieDataArray = Object.entries(itemCounts)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5); // Top 5 items
                setPieData(pieDataArray);
                setTopItems(pieDataArray);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [timeRange]);

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Food App Analytics Report", 20, 20);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);

        doc.autoTable({
            startY: 40,
            head: [['Metric', 'Value']],
            body: [
                ['Total Revenue', `₹${stats.revenue.toFixed(2)}`],
                ['Total Orders', stats.orders],
                ['Unique Customers', stats.customers],
                ['Avg. Order Value', `₹${stats.avgOrderValue.toFixed(2)}`]
            ]
        });

        doc.save('report.pdf');
    };

    if (loading) return <div className="p-10 text-center">Loading dashboard data...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                    <p className="text-gray-500">Real-time data from your database.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExportPDF}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition flex items-center gap-2"
                    >
                        <ArrowDownRight size={16} className="rotate-[-45deg]" /> Export Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats.revenue.toFixed(2)}`}
                    icon={DollarSign}
                    color="bg-green-500"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.orders}
                    icon={ShoppingBag}
                    color="bg-orange-500"
                />
                <StatCard
                    title="Unique Customers"
                    value={stats.customers}
                    icon={Users}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Avg. Order Value"
                    value={`₹${stats.avgOrderValue.toFixed(2)}`}
                    icon={TrendingUp}
                    color="bg-purple-500"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue Analytics</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} dx={-10} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#FA4A0C"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: '#FA4A0C', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Popular Items */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Top Items</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 mt-4">
                        {pieData.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-sm text-gray-600 truncate max-w-[150px]">{item.name}</span>
                                </div>
                                <span className="text-sm font-bold text-gray-800">{item.value} sold</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

