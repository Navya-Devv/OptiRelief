import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, Award, Clock, UserCheck, Shuffle } from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

interface Volunteer {
  id: number;
  name: string;
  skills: string;
  location: string;
  status: string;
  assigned_to?: string;
}

interface AssignmentResult {
  assignments: Array<{
    volunteer: Volunteer;
    region: string;
    match_score: number;
  }>;
  total_coverage: number;
  unassigned_volunteers: number;
}

const VolunteerAssignment: React.FC = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [result, setResult] = useState<AssignmentResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVolunteers();
    loadRegions();
  }, []);

  const loadVolunteers = async () => {
    try {
      const response = await apiService.get('/volunteers');
      setVolunteers(response.data);
    } catch (error) {
      toast.error('Failed to load volunteers');
    }
  };

  const loadRegions = async () => {
    try {
      const response = await apiService.get('/regions');
      setRegions(response.data);
    } catch (error) {
      toast.error('Failed to load regions');
    }
  };

  const assignVolunteers = async () => {
    setLoading(true);
    try {
      const response = await apiService.post('/assign-volunteers');
      setResult(response.data);
      toast.success('Volunteers assigned using backtracking algorithm');
    } catch (error) {
      toast.error('Failed to assign volunteers');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'text-green-400 bg-green-500/20';
      case 'assigned':
        return 'text-blue-400 bg-blue-500/20';
      case 'busy':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Volunteer Assignment</h1>
          <p className="text-gray-400 mt-1">Backtracking algorithm for optimal volunteer-region matching</p>
        </div>
        <button
          onClick={assignVolunteers}
          disabled={loading || volunteers.length === 0}
          className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Shuffle className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Assign Volunteers</span>
        </button>
      </div>

      {/* Assignment Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Assignment Result</h3>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <UserCheck className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-medium">Total Coverage</span>
              </div>
              <p className="text-2xl font-bold text-white">{result.total_coverage}%</p>
            </div>
            <div className="bg-blue-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-blue-400" />
                <span className="text-blue-400 font-medium">Assigned</span>
              </div>
              <p className="text-2xl font-bold text-white">{result.assignments.length}</p>
            </div>
            <div className="bg-amber-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-amber-400" />
                <span className="text-amber-400 font-medium">Unassigned</span>
              </div>
              <p className="text-2xl font-bold text-white">{result.unassigned_volunteers}</p>
            </div>
          </div>

          {/* Assignments */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Volunteer Assignments</h4>
            <div className="grid gap-4">
              {result.assignments.map((assignment, index) => (
                <motion.div
                  key={assignment.volunteer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {assignment.volunteer.name.charAt(0)}
                      </div>
                      <div>
                        <h5 className="text-white font-medium">{assignment.volunteer.name}</h5>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Award className="h-4 w-4" />
                            <span>{assignment.volunteer.skills}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{assignment.volunteer.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">→ {assignment.region}</div>
                      <div className={`text-sm font-bold ${getMatchScoreColor(assignment.match_score)}`}>
                        Match: {assignment.match_score}%
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* All Volunteers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Volunteer Database</h3>
        <div className="grid gap-4">
          {volunteers.map((volunteer, index) => (
            <motion.div
              key={volunteer.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-black/20 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                    {volunteer.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-white font-medium">{volunteer.name}</h5>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Award className="h-4 w-4" />
                        <span>{volunteer.skills}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{volunteer.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(volunteer.status)}`}>
                    {volunteer.status}
                  </div>
                  {volunteer.assigned_to && (
                    <div className="text-xs text-gray-400 mt-1">
                      Assigned to: {volunteer.assigned_to}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {volunteers.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No volunteers found in the database.</p>
          </div>
        )}
      </motion.div>

      {/* Available Regions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Disaster Regions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regions.map((region, index) => (
            <motion.div
              key={region}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="bg-red-500/20 border border-red-500/30 rounded-lg p-4"
            >
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-red-400" />
                <span className="text-white font-medium">{region}</span>
              </div>
              <p className="text-gray-400 text-sm mt-1">Needs volunteer assistance</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default VolunteerAssignment;