import React from 'react';
import { useWeeklyLeaderboard } from '../../hooks/leaderboardHooks';
import { useAuth } from '../../context/AuthContext';
import { formatStudyDuration, formatRank, getMedalEmoji } from '../../utils/leaderboardUtils';

const LeaderboardWidget = () => {
  const { user } = useAuth();
  const { leaderboard, loading, error } = useWeeklyLeaderboard(5); // Top 5 for widget

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Weekly Leaderboard</h3>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Weekly Leaderboard</h3>
        <div className="text-center py-4">
          <p className="text-red-500 text-sm">Failed to load leaderboard</p>
        </div>
      </div>
    );
  }

  if (!leaderboard || !leaderboard.entries || leaderboard.entries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Weekly Leaderboard</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 text-3xl mb-2">📊</div>
          <p className="text-gray-500 text-sm">No data available</p>
          <p className="text-gray-400 text-xs mt-1">Start studying to see rankings!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">🏆 Weekly Leaderboard</h3>
        <a 
          href="/leaderboard" 
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View All →
        </a>
      </div>

      <div className="space-y-3">
        {leaderboard.entries.slice(0, 5).map((entry, index) => {
          const isCurrentUser = entry.userId === user?.userId;
          
          return (
            <div 
              key={entry.userId} 
              className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-8 h-8">
                <span className="text-lg">{getMedalEmoji(entry.rank)}</span>
                {!getMedalEmoji(entry.rank) && (
                  <span className="text-sm font-bold text-gray-600">
                    {entry.rank}
                  </span>
                )}
              </div>

              {/* User Avatar */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {entry.userName ? entry.userName.charAt(0).toUpperCase() : 'U'}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium text-gray-900 truncate ${
                    isCurrentUser ? 'font-bold' : ''
                  }`}>
                    {entry.userName || `User ${entry.userId}`}
                    {isCurrentUser && (
                      <span className="ml-1 text-xs text-blue-600">(You)</span>
                    )}
                  </p>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatStudyDuration(entry.totalStudyMinutes)}
                  </span>
                </div>
                {entry.sessionCount && (
                  <p className="text-xs text-gray-500">
                    {entry.sessionCount} session{entry.sessionCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current User's Rank (if not in top 5) */}
      {user?.userId && leaderboard.currentUserRank && 
       !leaderboard.entries.slice(0, 5).some(e => e.userId === user.userId) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-center w-8 h-8">
              <span className="text-sm font-bold text-blue-600">
                {formatRank(leaderboard.currentUserRank.rank)}
              </span>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-900">
                  You
                </p>
                <span className="text-sm font-semibold text-gray-900">
                  {formatStudyDuration(leaderboard.currentUserRank.totalStudyMinutes)}
                </span>
              </div>
              <p className="text-xs text-gray-500">Your current position</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {leaderboard.totalParticipants && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            {leaderboard.totalParticipants} total participants this week
          </p>
        </div>
      )}
    </div>
  );
};

export default LeaderboardWidget;
