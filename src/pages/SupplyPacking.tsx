import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Weight, TrendingUp, Plus, Calculator } from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

interface SupplyItem {
  id: number;
  item_name: string;
  weight: number;
  utility: number;
  quantity: number;
  selected?: boolean;
  selected_quantity?: number;
}

interface KnapsackResult {
  selected_items: SupplyItem[];
  total_weight: number;
  total_utility: number;
  efficiency: number;
}

const SupplyPacking: React.FC = () => {
  const [items, setItems] = useState<SupplyItem[]>([]);
  const [capacity, setCapacity] = useState(100);
  const [result, setResult] = useState<KnapsackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    item_name: '',
    weight: 1,
    utility: 1,
    quantity: 1
  });

  useEffect(() => {
    loadSupplyItems();
  }, []);

  const loadSupplyItems = async () => {
    try {
      const response = await apiService.get('/supply-items');
      setItems(response.data);
    } catch (error) {
      toast.error('Failed to load supply items');
    }
  };

  const optimizeSupply = async () => {
    setLoading(true);
    try {
      const response = await apiService.post('/optimize-supply', {
        items: items,
        capacity: capacity
      });
      setResult(response.data);
      toast.success('Supply optimized using 0/1 Knapsack algorithm');
    } catch (error) {
      toast.error('Failed to optimize supply');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.post('/supply-items', newItem);
      setNewItem({ item_name: '', weight: 1, utility: 1, quantity: 1 });
      setShowAddForm(false);
      loadSupplyItems();
      toast.success('Supply item added');
    } catch (error) {
      toast.error('Failed to add item');
    }
  };

  const getUtilityColor = (utility: number) => {
    if (utility >= 8) return 'text-green-400';
    if (utility >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Supply Packing Optimization</h1>
          <p className="text-gray-400 mt-1">0/1 Knapsack algorithm for maximum utility packing</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Capacity and Optimize */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Knapsack Configuration</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-gray-300 text-sm font-medium mb-2">Vehicle Capacity (kg)</label>
            <input
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value))}
              className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={optimizeSupply}
              disabled={loading || items.length === 0}
              className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Calculator className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Optimize Packing</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Add Item Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Add Supply Item</h3>
          <form onSubmit={addItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Item Name</label>
              <input
                type="text"
                value={newItem.item_name}
                onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Weight (kg)</label>
              <input
                type="number"
                min="1"
                value={newItem.weight}
                onChange={(e) => setNewItem({ ...newItem, weight: parseInt(e.target.value) })}
                className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Utility Score (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={newItem.utility}
                onChange={(e) => setNewItem({ ...newItem, utility: parseInt(e.target.value) })}
                className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Available Quantity</label>
              <input
                type="number"
                min="1"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>
            <div className="md:col-span-2 flex space-x-3">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Item
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

      {/* Optimization Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Optimization Result</h3>
          
          {/* Result Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="h-5 w-5 text-blue-400" />
                <span className="text-blue-400 font-medium">Selected Items</span>
              </div>
              <p className="text-2xl font-bold text-white">{result.selected_items.length}</p>
            </div>
            <div className="bg-amber-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Weight className="h-5 w-5 text-amber-400" />
                <span className="text-amber-400 font-medium">Total Weight</span>
              </div>
              <p className="text-2xl font-bold text-white">{result.total_weight} kg</p>
            </div>
            <div className="bg-green-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-medium">Total Utility</span>
              </div>
              <p className="text-2xl font-bold text-white">{result.total_utility}</p>
            </div>
            <div className="bg-purple-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calculator className="h-5 w-5 text-purple-400" />
                <span className="text-purple-400 font-medium">Efficiency</span>
              </div>
              <p className="text-2xl font-bold text-white">{result.efficiency.toFixed(2)}%</p>
            </div>
          </div>

          {/* Selected Items */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Selected Items for Packing</h4>
            <div className="grid gap-3">
              {result.selected_items.map((item, index) => (
                <div key={item.id} className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-white font-medium">{item.item_name}</h5>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                        <span>Weight: {item.weight}kg</span>
                        <span>Utility: {item.utility}/10</span>
                        <span>Quantity: {item.selected_quantity || item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold">✓ Selected</div>
                      <div className="text-xs text-gray-400">Ratio: {(item.utility / item.weight).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Available Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Available Supply Items</h3>
        <div className="grid gap-3">
          {items.map((item) => (
            <div key={item.id} className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-white font-medium">{item.item_name}</h5>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                    <span>Weight: {item.weight}kg</span>
                    <span className={getUtilityColor(item.utility)}>Utility: {item.utility}/10</span>
                    <span>Available: {item.quantity}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">{(item.utility / item.weight).toFixed(2)}</div>
                  <div className="text-xs text-gray-400">Value/Weight Ratio</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {items.length === 0 && (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No supply items found. Add some items to get started.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SupplyPacking;