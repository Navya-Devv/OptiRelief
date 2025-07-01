import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Users, Package, MapPin, TrendingUp, Clock } from 'lucide-react';
import { apiService } from '../services/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalRequests: 0,
    activeVolunteers: 0,
    deliveriesInProgress: 0,
    resolvedCases: 0
  });

  const [requestData, setRequestData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, requestsRes, priorityRes] = await Promise.all([
        apiService.get('/dashboard/stats'),
        apiService.get('/dashboard/request-types'),
        apiService.get('/dashboard/priority-distribution')
      ]);
      
      setStats(statsRes.data);
      setRequestData(requestsRes.data);
      setPriorityData(priorityRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6'];

  const statCards = [
    { title: 'Total Requests', value: stats.totalRequests, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/20' },
    { title: 'Active Volunteers', value: stats.activeVolunteers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { title: 'Deliveries in Progress', value: stats.deliveriesInProgress, icon: Package, color: 'text-amber-400', bg: 'bg-amber-500/20' },
    { title: 'Resolved Cases', value: stats.resolvedCases, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/20' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Emergency Response Dashboard</h1>
          <p className="text-gray-400 mt-1">Real-time disaster relief coordination</p>
        </div>
        <div className="flex items-center space-x-2 text-gray-400">
          <Clock className="h-4 w-4" />
          <span className="text-sm">Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{card.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Types Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Request Types Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={requestData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {requestData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Priority Distribution Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="priority" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg p-4 text-left transition-colors">
            <AlertTriangle className="h-6 w-6 text-red-400 mb-2" />
            <p className="text-white font-medium">Report Emergency</p>
            <p className="text-gray-400 text-sm">Submit new disaster report</p>
          </button>
          <button className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg p-4 text-left transition-colors">
            <MapPin className="h-6 w-6 text-blue-400 mb-2" />
            <p className="text-white font-medium">Plan Route</p>
            <p className="text-gray-400 text-sm">Optimize delivery paths</p>
          </button>
          <button className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg p-4 text-left transition-colors">
            <Users className="h-6 w-6 text-green-400 mb-2" />
            <p className="text-white font-medium">Assign Volunteers</p>
            <p className="text-gray-400 text-sm">Match skills to needs</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;