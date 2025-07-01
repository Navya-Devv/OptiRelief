import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Truck, Clock, Route, Calculator } from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

interface DispatchCenter {
  id: string;
  name: string;
  coordinates: [number, number];
}

interface DispatchResult {
  cost_matrix: number[][];
  optimal_routes: Array<{
    from: string;
    to: string;
    cost: number;
    path: string[];
  }>;
  total_cost: number;
  dispatch_plan: Array<{
    center: string;
    destinations: string[];
    total_time: number;
  }>;
}

const MultiDispatch: React.FC = () => {
  const [centers, setCenters] = useState<DispatchCenter[]>([]);
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);
  const [result, setResult] = useState<DispatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDispatchCenters();
  }, []);

  const loadDispatchCenters = async () => {
    try {
      const response = await apiService.get('/dispatch-centers');
      setCenters(response.data);
    } catch (error) {
      toast.error('Failed to load dispatch centers');
    }
  };

  const calculateOptimalDispatch = async () => {
    if (selectedCenters.length < 2) {
      toast.error('Please select at least 2 dispatch centers');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.post('/multi-dispatch', {
        centers: selectedCenters
      });
      setResult(response.data);
      toast.success('Multi-dispatch optimized using Floyd-Warshall algorithm');
    } catch (error) {
      toast.error('Failed to optimize dispatch plan');
    } finally {
      setLoading(false);
    }
  };

  const toggleCenterSelection = (centerId: string) => {
    setSelectedCenters(prev =>
      prev.includes(centerId)
        ? prev.filter(id => id !== centerId)
        : [...prev, centerId]
    );
  };

  const getCostColor = (cost: number, maxCost: number) => {
    const ratio = cost / maxCost;
    if (ratio <= 0.3) return 'text-green-400';
    if (ratio <= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Multi-Dispatch Planning</h1>
          <p className="text-gray-400 mt-1">Floyd-Warshall algorithm for all-pairs shortest paths</p>
        </div>
        <button
          onClick={calculateOptimalDispatch}
          disabled={loading || selectedCenters.length < 2}
          className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Calculator className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Optimize Dispatch</span>
        </button>
      </div>

      {/* Dispatch Center Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Select Dispatch Centers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {centers.map((center) => (
            <div
              key={center.id}
              onClick={() => toggleCenterSelection(center.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedCenters.includes(center.id)
                  ? 'bg-blue-500/20 border-blue-500/50 ring-2 ring-blue-500/50'
                  : 'bg-black/20 border-white/20 hover:border-blue-500/30'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedCenters.includes(center.id)
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-400'
                }`} />
                <div>
                  <h4 className="text-white font-medium">{center.name}</h4>
                  <p className="text-gray-400 text-sm">
                    Coordinates: {center.coordinates[0]}, {center.coordinates[1]}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-gray-400 text-sm mt-4">
          Selected: {selectedCenters.length} centers | Minimum required: 2
        </p>
      </motion.div>

      {/* Optimization Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Optimization Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Route className="h-5 w-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">Total Routes</span>
                </div>
                <p className="text-2xl font-bold text-white">{result.optimal_routes.length}</p>
              </div>
              <div className="bg-green-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-5 w-5 text-green-400" />
                  <span className="text-green-400 font-medium">Total Cost</span>
                </div>
                <p className="text-2xl font-bold text-white">{result.total_cost}</p>
              </div>
              <div className="bg-purple-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Truck className="h-5 w-5 text-purple-400" />
                  <span className="text-purple-400 font-medium">Dispatch Plans</span>
                </div>
                <p className="text-2xl font-bold text-white">{result.dispatch_plan.length}</p>
              </div>
            </div>
          </div>

          {/* Cost Matrix */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">All-Pairs Shortest Path Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-gray-400 text-left p-2">From / To</th>
                    {selectedCenters.map((centerId) => (
                      <th key={centerId} className="text-gray-400 text-center p-2 min-w-24">
                        {centers.find(c => c.id === centerId)?.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedCenters.map((fromId, i) => (
                    <tr key={fromId} className="border-t border-white/10">
                      <td className="text-white font-medium p-2">
                        {centers.find(c => c.id === fromId)?.name}
                      </td>
                      {selectedCenters.map((toId, j) => (
                        <td key={toId} className="text-center p-2">
                          {i === j ? (
                            <span className="text-gray-500">-</span>
                          ) : (
                            <span className={`font-bold ${getCostColor(
                              result.cost_matrix[i][j], 
                              Math.max(...result.cost_matrix.flat())
                            )}`}>
                              {result.cost_matrix[i][j]}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Optimal Routes */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Optimal Routes</h3>
            <div className="grid gap-4">
              {result.optimal_routes.map((route, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-black/20 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Route className="h-5 w-5 text-blue-400" />
                      <div>
                        <h4 className="text-white font-medium">
                          {route.from} → {route.to}
                        </h4>
                        <p className="text-gray-400 text-sm">Cost: {route.cost} units</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">Path:</span>
                    <div className="flex items-center space-x-1 overflow-x-auto">
                      {route.path.map((step, stepIndex) => (
                        <React.Fragment key={step}>
                          <span className="text-blue-300 font-medium whitespace-nowrap">{step}</span>
                          {stepIndex < route.path.length - 1 && (
                            <span className="text-gray-400">→</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Dispatch Plans */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Dispatch Plans</h3>
            <div className="grid gap-4">
              {result.dispatch_plan.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Truck className="h-5 w-5 text-green-400" />
                      <div>
                        <h4 className="text-white font-medium">{plan.center}</h4>
                        <p className="text-gray-400 text-sm">Total Time: {plan.total_time} minutes</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Destinations:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {plan.destinations.map((dest, destIndex) => (
                        <span
                          key={destIndex}
                          className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm"
                        >
                          {dest}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {centers.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No dispatch centers available.</p>
        </div>
      )}
    </div>
  );
};

export default MultiDispatch;