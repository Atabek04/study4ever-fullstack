import React, { useState } from 'react';
import { formatPeriodDisplay, getPeriodTypeIcon } from '../../utils/leaderboardUtils';
import LeaderboardEntry from './LeaderboardEntry';

const LeaderboardList = ({ 
  leaderboard, 
  loading, 
  error, 
  currentUserId, 
  onRefresh,
  periodType = 'weekly',
  showProgress = true 
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (loading && !leaderboard) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading leaderboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="text-red-500 text-lg mb-2">⚠️ Error Loading Leaderboard</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!leaderboard || !leaderboard.entries || leaderboard.entries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600 mb-4">
            No study sessions found for this period. Start studying to appear on the leaderboard!
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const maxMinutes = leaderboard.entries.length > 0 ? leaderboard.entries[0].totalStudyMinutes : 0;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              {getPeriodTypeIcon(periodType)}
              <span className="ml-2">
                {periodType.charAt(0).toUpperCase() + periodType.slice(1)} Leaderboard
              </span>
            </h2>
            {leaderboard.periodStart && (
              <p className="text-gray-600 mt-1">
                {formatPeriodDisplay(periodType, leaderboard.periodStart)}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {leaderboard.totalParticipants && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">{leaderboard.totalParticipants}</span> participants
              </div>
            )}
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-lg border transition-colors ${
                isRefreshing 
                  ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
              title="Refresh leaderboard"
            >
              <svg 
                className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {leaderboard.stats && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {leaderboard.stats.totalStudyTime && (
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-sm text-blue-600 font-medium">Total Study Time</div>
                <div className="text-lg font-bold text-blue-900">
                  {Math.round(leaderboard.stats.totalStudyTime / 60)}h {leaderboard.stats.totalStudyTime % 60}m
                </div>
              </div>
            )}
            
            {leaderboard.stats.averageStudyTime && (
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-sm text-green-600 font-medium">Average Study Time</div>
                <div className="text-lg font-bold text-green-900">
                  {Math.round(leaderboard.stats.averageStudyTime / 60)}h {leaderboard.stats.averageStudyTime % 60}m
                </div>
              </div>
            )}
            
            {leaderboard.stats.totalSessions && (
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-sm text-purple-600 font-medium">Total Sessions</div>
                <div className="text-lg font-bold text-purple-900">
                  {leaderboard.stats.totalSessions}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Leaderboard Entries */}
      <div className="p-6">
        <div className="space-y-3">
          {leaderboard.entries.map((entry, index) => (
            <LeaderboardEntry
              key={`${entry.userId}-${index}`}
              entry={entry}
              currentUserId={currentUserId}
              showProgress={showProgress}
              maxMinutes={maxMinutes}
            />
          ))}
        </div>

        {/* Load More Button */}
        {leaderboard.hasMore && (
          <div className="mt-6 text-center">
            <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Load More
            </button>
          </div>
        )}

        {/* Current User's Rank (if not in top list) */}
        {currentUserId && leaderboard.currentUserRank && !leaderboard.entries.some(e => e.userId === currentUserId) && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Your Position</h3>
            <LeaderboardEntry
              entry={leaderboard.currentUserRank}
              currentUserId={currentUserId}
              showProgress={showProgress}
              maxMinutes={maxMinutes}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardList;
