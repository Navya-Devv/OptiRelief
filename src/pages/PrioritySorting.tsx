import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, MapPin, Users, Clock, Plus, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

interface DisasterArea {
  id: number;
  name: string;
  severity: number;
  population: number;
  delay_time: number;
  urgency_score: number;
}

const PrioritySorting: React.FC = () => {
  const [areas, setAreas] = useState<DisasterArea[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newArea, setNewArea] = useState({
    name: '',
    severity: 1,
    population: 1000,
    delay_time: 0
  });

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/areas');
      setAreas(response.data);
    } catch (error) {
      toast.error('Failed to load disaster areas');
    } finally {
      setLoading(false);
    }
  };

  const sortAreas = async () => {
    setLoading(true);
    try {
      const response = await apiService.post('/sort-priority');
      setAreas(response.data);
      toast.success('Areas sorted by priority using Merge Sort algorithm');
    } catch (error) {
      toast.error('Failed to sort areas');
    } finally {
      setLoading(false);
    }
  };

  const addArea = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.post('/areas', newArea);
      setNewArea({ name: '', severity: 1, population: 1000, delay_time: 0 });
      setShowAddForm(false);
      loadAreas();
      toast.success('New disaster area added');
    } catch (error) {
      toast.error('Failed to add area');
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'text-red-400 bg-red-500/20';
    if (score >= 60) return 'text-orange-400 bg-orange-500/20';
    if (score >= 40) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-green-400 bg-green-500/20';
  };

  const getPriorityLabel = (score: number) => {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Priority Sorting</h1>
          <p className="text-gray-400 mt-1">Merge Sort algorithm for disaster area prioritization</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Area</span>
          </button>
          <button
            onClick={sortAreas}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sort by Priority</span>
          </button>
        </div>
      </div>

      {/* Add Area Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Add New Disaster Area</h3>
          <form onSubmit={addArea} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Area Name</label>
              <input
                type="text"
                value={newArea.name}
                onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
                className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Severity (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={newArea.severity}
                onChange={(e) => setNewArea({ ...newArea, severity: parseInt(e.target.value) })}
                className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Population</label>
              <input
                type="number"
                min="1"
                value={newArea.population}
                onChange={(e) => setNewArea({ ...newArea, population: parseInt(e.target.value) })}
                className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Delay Time (hours)</label>
              <input
                type="number"
                min="0"
                value={newArea.delay_time}
                onChange={(e) => setNewArea({ ...newArea, delay_time: parseInt(e.target.value) })}
                className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>
            <div className="md:col-span-2 flex space-x-3">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Area
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Areas List */}
      <div className="grid gap-4">
        {areas.map((area, index) => (
          <motion.div
            key={area.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                <div>
                  <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-blue-400" />
                    <span>{area.name}</span>
                  </h3>
                  <div className="flex items-center space-x-6 mt-2 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Severity: {area.severity}/10</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>Population: {area.population.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Delay: {area.delay_time}h</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(area.urgency_score)}`}>
                  {getPriorityLabel(area.urgency_score)}
                </div>
                <div className="text-2xl font-bold text-white mt-1">
                  {area.urgency_score.toFixed(1)}
                </div>
                <div className="text-xs text-gray-400">Urgency Score</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {areas.length === 0 && !loading && (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No disaster areas found. Add some areas to get started.</p>
        </div>
      )}
    </div>
  );
};

export default PrioritySorting;