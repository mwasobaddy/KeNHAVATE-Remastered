import React, { useState } from 'react';
import { MessageSquare, Users, Check, X, Edit3, FileText, TrendingUp, Lightbulb, AlertCircle, Send, ThumbsUp, Clock, CheckCircle } from 'lucide-react';

const CollaborationUI = () => {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [selectedSection, setSelectedSection] = useState(null);
  const [newSuggestion, setNewSuggestion] = useState('');
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);

  // Mock data
  const ideaData = {
    title: "Smart Traffic Management System for Nairobi CBD",
    author: "John Kamau",
    category: "Infrastructure & Technology",
    collaborationEnabled: true,
    sections: {
      problem_statement: "Current traffic congestion in Nairobi CBD causes an average of 2 hours daily commute delays, costing the economy approximately KES 50M daily in lost productivity.",
      proposed_solution: "Implement AI-powered traffic light synchronization combined with real-time traffic monitoring using existing CCTV infrastructure and mobile data from major telecom providers.",
      cost_benefit: "Initial investment: KES 200M. Expected ROI within 18 months through reduced fuel consumption, improved productivity, and decreased vehicle maintenance costs."
    }
  };

  const collaborators = [
    { id: 1, name: "Sarah Wanjiku", avatar: "SW", contributions: 12, joinedDays: 5 },
    { id: 2, name: "David Omondi", avatar: "DO", contributions: 8, joinedDays: 3 },
    { id: 3, name: "Grace Achieng", avatar: "GA", contributions: 15, joinedDays: 7 }
  ];

  const suggestions = [
    {
      id: 1,
      user: "Sarah Wanjiku",
      avatar: "SW",
      section: "proposed_solution",
      status: "pending",
      timestamp: "2 hours ago",
      suggestion: "Consider integrating with the existing Nairobi Intelligent Transport System (NaITS) to avoid duplication of infrastructure. This could reduce initial costs by approximately 30%.",
      likes: 5,
      replies: 2
    },
    {
      id: 2,
      user: "David Omondi",
      avatar: "DO",
      section: "cost_benefit",
      status: "accepted",
      timestamp: "1 day ago",
      suggestion: "Add analysis of environmental benefits - reduced emissions from vehicles spending less time idling in traffic. This could strengthen the proposal with sustainability metrics.",
      likes: 8,
      replies: 1
    },
    {
      id: 3,
      user: "Grace Achieng",
      avatar: "GA",
      section: "problem_statement",
      status: "pending",
      timestamp: "3 hours ago",
      suggestion: "Include data on accident rates during peak hours. Traffic accidents in CBD increased by 23% last year according to NTSA reports. This adds urgency to the problem.",
      likes: 3,
      replies: 0
    }
  ];

  const sectionIcons = {
    problem_statement: AlertCircle,
    proposed_solution: Lightbulb,
    cost_benefit: TrendingUp
  };

  const getSectionLabel = (section) => {
    const labels = {
      problem_statement: "Problem Statement",
      proposed_solution: "Proposed Solution",
      cost_benefit: "Cost-Benefit Analysis"
    };
    return labels[section];
  };

  const getStatusColor = (status) => {
    return status === 'accepted' ? 'bg-green-100 text-green-800' : 
           status === 'rejected' ? 'bg-red-100 text-red-800' : 
           'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {ideaData.category}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Collaboration Enabled
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {ideaData.title}
              </h1>
              <p className="text-gray-600">
                By <span className="font-medium text-gray-900">{ideaData.author}</span> • 
                <span className="ml-2">{collaborators.length} active collaborators</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="col-span-2 space-y-6">
            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="flex gap-8 px-6">
                  <button
                    onClick={() => setActiveTab('suggestions')}
                    className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'suggestions'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Suggestions ({suggestions.length})
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('document')}
                    className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'document'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Idea Details
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('collaborators')}
                    className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'collaborators'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Collaborators ({collaborators.length})
                    </div>
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Suggestions Tab */}
                {activeTab === 'suggestions' && (
                  <div className="space-y-4">
                    {/* Filter/Sort */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                          All Suggestions
                        </button>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                          Pending
                        </button>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                          Accepted
                        </button>
                      </div>
                      <button
                        onClick={() => setShowSuggestionForm(!showSuggestionForm)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        Add Suggestion
                      </button>
                    </div>

                    {/* New Suggestion Form */}
                    {showSuggestionForm && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h3 className="font-medium text-gray-900 mb-3">New Suggestion</h3>
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Which section does this relate to?
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option>Problem Statement</option>
                            <option>Proposed Solution</option>
                            <option>Cost-Benefit Analysis</option>
                            <option>General Feedback</option>
                          </select>
                        </div>
                        <textarea
                          value={newSuggestion}
                          onChange={(e) => setNewSuggestion(e.target.value)}
                          placeholder="Share your suggestion or improvement idea..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-24 mb-3"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setShowSuggestionForm(false)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            Submit Suggestion
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Suggestions List */}
                    {suggestions.map((suggestion) => {
                      const SectionIcon = sectionIcons[suggestion.section];
                      return (
                        <div key={suggestion.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                              {suggestion.avatar}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{suggestion.user}</span>
                                  <span className="text-gray-400 text-sm">•</span>
                                  <span className="text-gray-500 text-sm">{suggestion.timestamp}</span>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(suggestion.status)}`}>
                                  {suggestion.status === 'accepted' ? (
                                    <span className="flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" />
                                      Accepted
                                    </span>
                                  ) : suggestion.status === 'rejected' ? (
                                    'Rejected'
                                  ) : (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      Pending Review
                                    </span>
                                  )}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 mb-3">
                                <SectionIcon className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{getSectionLabel(suggestion.section)}</span>
                              </div>

                              <p className="text-gray-700 mb-3">
                                {suggestion.suggestion}
                              </p>

                              <div className="flex items-center gap-4">
                                <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 text-sm">
                                  <ThumbsUp className="w-4 h-4" />
                                  <span>{suggestion.likes}</span>
                                </button>
                                <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 text-sm">
                                  <MessageSquare className="w-4 h-4" />
                                  <span>{suggestion.replies} replies</span>
                                </button>
                                
                                {suggestion.status === 'pending' && (
                                  <div className="ml-auto flex gap-2">
                                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 flex items-center gap-1">
                                      <Check className="w-4 h-4" />
                                      Accept
                                    </button>
                                    <button className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 flex items-center gap-1">
                                      <X className="w-4 h-4" />
                                      Decline
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Idea Details Tab */}
                {activeTab === 'document' && (
                  <div className="space-y-6">
                    {Object.entries(ideaData.sections).map(([key, value]) => {
                      const SectionIcon = sectionIcons[key];
                      return (
                        <div key={key} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                          <div className="flex items-center gap-2 mb-3">
                            <SectionIcon className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-gray-900">{getSectionLabel(key)}</h3>
                            <button className="ml-auto text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              Comment on this section
                            </button>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{value}</p>
                          
                          {/* Show relevant suggestions for this section */}
                          {suggestions.filter(s => s.section === key).length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-sm text-gray-600 mb-2">
                                {suggestions.filter(s => s.section === key).length} suggestion(s) for this section
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Collaborators Tab */}
                {activeTab === 'collaborators' && (
                  <div className="space-y-4">
                    <p className="text-gray-600 mb-4">
                      People who have contributed suggestions and improvements to this idea
                    </p>
                    {collaborators.map((collab) => (
                      <div key={collab.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
                            {collab.avatar}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{collab.name}</h4>
                            <p className="text-sm text-gray-600">Joined {collab.joinedDays} days ago</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{collab.contributions}</div>
                          <div className="text-sm text-gray-600">contributions</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Collaboration Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Total Suggestions</span>
                  <span className="font-bold text-gray-900">{suggestions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Pending Review</span>
                  <span className="font-bold text-yellow-600">
                    {suggestions.filter(s => s.status === 'pending').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Accepted</span>
                  <span className="font-bold text-green-600">
                    {suggestions.filter(s => s.status === 'accepted').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Active Collaborators</span>
                  <span className="font-bold text-gray-900">{collaborators.length}</span>
                </div>
              </div>
            </div>

            {/* Collaboration Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Settings</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">Allow new collaborators</span>
                  <div className="relative inline-block w-10 h-6">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </div>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">Email notifications</span>
                  <div className="relative inline-block w-10 h-6">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </div>
                </label>
              </div>
              <button className="mt-4 w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200">
                Close Collaboration
              </button>
            </div>

            {/* Activity Feed */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                  <div>
                    <p className="text-gray-900">You accepted a suggestion from <span className="font-medium">David Omondi</span></p>
                    <p className="text-gray-500 text-xs">1 day ago</p>
                  </div>
                </div>
                <div className="flex gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                  <div>
                    <p className="text-gray-900"><span className="font-medium">Grace Achieng</span> added a new suggestion</p>
                    <p className="text-gray-500 text-xs">3 hours ago</p>
                  </div>
                </div>
                <div className="flex gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                  <div>
                    <p className="text-gray-900"><span className="font-medium">Sarah Wanjiku</span> joined as collaborator</p>
                    <p className="text-gray-500 text-xs">5 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationUI;