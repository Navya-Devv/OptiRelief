import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, AlertTriangle, Search, Plus, FileText } from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

interface Message {
  id: number;
  message: string;
  source: string;
  timestamp: string;
  urgency_score: number;
  urgency_level: string;
  keywords_found: string[];
}

const RequestAnalyzer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [analysisText, setAnalysisText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const response = await apiService.get('/messages');
      setMessages(response.data);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const analyzeMessage = async () => {
    if (!analysisText.trim()) {
      toast.error('Please enter a message to analyze');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.post('/analyze-message', {
        message: analysisText,
        source: 'manual_input'
      });
      
      setMessages([response.data, ...messages]);
      setAnalysisText('');
      toast.success('Message analyzed using Boyer-Moore algorithm');
    } catch (error) {
      toast.error('Failed to analyze message');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const highlightKeywords = (text: string, keywords: string[]) => {
    if (!keywords || keywords.length === 0) return text;
    
    let highlightedText = text;
    keywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-300 text-black px-1 rounded">$1</mark>');
    });
    
    return highlightedText;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Request Analyzer</h1>
          <p className="text-gray-400 mt-1">Boyer-Moore algorithm for urgent keyword detection</p>
        </div>
        <div className="flex items-center space-x-2 text-blue-400">
          <Search className="h-5 w-5" />
          <span className="text-sm">String Matching Algorithm</span>
        </div>
      </div>

      {/* Message Analysis Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Analyze New Message</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Message Content
            </label>
            <textarea
              value={analysisText}
              onChange={(e) => setAnalysisText(e.target.value)}
              placeholder="Enter emergency message to analyze for urgency keywords..."
              className="w-full h-32 bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white resize-none"
            />
          </div>
          <button
            onClick={analyzeMessage}
            disabled={loading || !analysisText.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Search className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Analyze Message</span>
          </button>
        </div>
      </motion.div>

      {/* Urgent Keywords Reference */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Detected Keywords</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {['urgent', 'emergency', 'help', 'critical', 'injured', 'trapped', 'fire', 'flood', 'collapse', 'medical', 'rescue', 'immediate'].map((keyword) => (
            <div key={keyword} className="bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-2 text-center">
              <span className="text-red-300 font-medium">{keyword}</span>
            </div>
          ))}
        </div>
        <p className="text-gray-400 text-sm mt-4">
          Boyer-Moore algorithm searches for these critical keywords to determine message urgency.
        </p>
      </motion.div>

      {/* Analyzed Messages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Analyzed Messages</h3>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-black/20 rounded-lg p-4 border border-white/10"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-gray-400 text-sm">From: {message.source}</p>
                    <p className="text-gray-400 text-xs">{new Date(message.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(message.urgency_level)}`}>
                    {message.urgency_level}
                  </div>
                  <div className="text-white font-bold mt-1">
                    Score: {message.urgency_score}/100
                  </div>
                </div>
              </div>
              
              <div 
                className="text-white mb-3 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: highlightKeywords(message.message, message.keywords_found) 
                }}
              />
              
              {message.keywords_found && message.keywords_found.length > 0 && (
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-medium">Keywords found:</span>
                  <div className="flex flex-wrap gap-1">
                    {message.keywords_found.map((keyword, idx) => (
                      <span 
                        key={idx} 
                        className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {messages.length === 0 && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No messages analyzed yet. Enter a message above to get started.</p>
          </div>
        )}
      </motion.div>

      {/* Sample Messages for Testing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Sample Messages for Testing</h3>
        <div className="grid gap-3">
          {[
            "URGENT: Building collapse at downtown area, people trapped inside, need immediate rescue!",
            "Medical emergency - injured person needs help, send ambulance quickly",
            "Flood waters rising fast, residents need evacuation assistance",
            "Fire spreading in residential area, critical situation",
            "Road accident with injuries, emergency services required"
          ].map((sample, index) => (
            <div key={index} className="bg-black/20 rounded-lg p-3">
              <p className="text-gray-300 text-sm mb-2">{sample}</p>
              <button
                onClick={() => setAnalysisText(sample)}
                className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
              >
                Use this sample →
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default RequestAnalyzer;