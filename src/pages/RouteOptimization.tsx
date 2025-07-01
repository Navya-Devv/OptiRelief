import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Route, Clock, Navigation, Zap } from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

interface Location {
  id: string;
  name: string;
  coordinates: [number, number];
}

interface RouteResult {
  path: string[];
  total_distance: number;
  estimated_time: number;
  steps: Array<{
    from: string;
    to: string;
    distance: number;
  }>;
}

const RouteOptimization: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const response = await apiService.get('/locations');
      setLocations(response.data);
    } catch (error) {
      toast.error('Failed to load locations');
    }
  };

  const findOptimalRoute = async () => {
    if (!startLocation || !endLocation) {
      toast.error('Please select both start and end locations');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.get(`/shortest-route?from=${startLocation}&to=${endLocation}`);
      setRouteResult(response.data);
      toast.success('Route optimized using Dijkstra\'s algorithm');
    } catch (error) {
      toast.error('Failed to find optimal route');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Route Optimization</h1>
          <p className="text-gray-400 mt-1">Dijkstra's algorithm for shortest path finding</p>
        </div>
        <div className="flex items-center space-x-2 text-blue-400">
          <Zap className="h-5 w-5" />
          <span className="text-sm">Powered by Graph Algorithms</span>
        </div>
      </div>

      {/* Route Planning Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Plan Your Route</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Start Location</label>
            <select
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              <option value="">Select start location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">End Location</label>
            <select
              value={endLocation}
              onChange={(e) => setEndLocation(e.target.value)}
              className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              <option value="">Select end location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={findOptimalRoute}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <Navigation className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Find Optimal Route</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Route Result */}
      {routeResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Optimal Route Found</h3>
          
          {/* Route Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Route className="h-5 w-5 text-blue-400" />
                <span className="text-blue-400 font-medium">Total Distance</span>
              </div>
              <p className="text-2xl font-bold text-white">{routeResult.total_distance} km</p>
            </div>
            <div className="bg-green-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-medium">Estimated Time</span>
              </div>
              <p className="text-2xl font-bold text-white">{routeResult.estimated_time} min</p>
            </div>
            <div className="bg-purple-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="h-5 w-5 text-purple-400" />
                <span className="text-purple-400 font-medium">Waypoints</span>
              </div>
              <p className="text-2xl font-bold text-white">{routeResult.path.length}</p>
            </div>
          </div>

          {/* Route Steps */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Route Steps</h4>
            <div className="space-y-3">
              {routeResult.steps.map((step, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-black/20 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-white">
                      From <span className="font-semibold">{step.from}</span> to <span className="font-semibold">{step.to}</span>
                    </p>
                    <p className="text-gray-400 text-sm">{step.distance} km</p>
                  </div>
                  <div className="text-blue-400">
                    <Navigation className="h-5 w-5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Route Path Visualization */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-white mb-4">Route Path</h4>
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {routeResult.path.map((location, index) => (
                <React.Fragment key={location}>
                  <div className="flex-shrink-0 bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-2">
                    <span className="text-blue-300 font-medium">{location}</span>
                  </div>
                  {index < routeResult.path.length - 1 && (
                    <div className="flex-shrink-0 text-gray-400">
                      →
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Available Locations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Available Locations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((location) => (
            <div key={location.id} className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span className="text-white font-medium">{location.name}</span>
              </div>
              <p className="text-gray-400 text-sm">
                Coordinates: {location.coordinates[0]}, {location.coordinates[1]}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default RouteOptimization;