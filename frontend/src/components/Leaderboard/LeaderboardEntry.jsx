import React from 'react';
import { formatStudyDuration, formatRank, getMedalEmoji, getRankColorClass, getAchievementLevel } from '../../utils/leaderboardUtils';

const LeaderboardEntry = ({ entry, currentUserId, showProgress = true, maxMinutes = 0 }) => {
  const isCurrentUser = entry.userId === currentUserId;
  const achievement = getAchievementLevel(entry.totalStudyMinutes);
  const progressPercentage = maxMinutes > 0 ? (entry.totalStudyMinutes / maxMinutes) * 100 : 0;

  return (
    <div className={`flex items-center p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
      isCurrentUser 
        ? 'bg-blue-50 border-blue-200 shadow-sm' 
        : 'bg-white border-gray-200 hover:bg-gray-50'
    }`}>
      
      {/* Rank Section */}
      <div className="flex items-center justify-center w-16 h-16 mr-4">
        <div className="text-center">
          <div className={`text-lg font-bold ${getRankColorClass(entry.rank)}`}>
            {getMedalEmoji(entry.rank)}
          </div>
          <div className={`text-sm ${getRankColorClass(entry.rank)}`}>
            {formatRank(entry.rank)}
          </div>
        </div>
      </div>

      {/* User Info Section */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {entry.userName ? entry.userName.charAt(0).toUpperCase() : 'U'}
            </div>
            
            {/* Name and Achievement */}
            <div>
              <div className="flex items-center space-x-2">
                <h3 className={`font-medium text-gray-900 ${isCurrentUser ? 'font-bold' : ''}`}>
                  {entry.userName || `User ${entry.userId}`}
                  {isCurrentUser && (
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      You
                    </span>
                  )}
                </h3>
              </div>
              
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-xs font-medium ${achievement.color}`}>
                  {achievement.icon} {achievement.level}
                </span>
                {entry.streak && entry.streak > 1 && (
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                    🔥 {entry.streak} day streak
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Study Time */}
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              {formatStudyDuration(entry.totalStudyMinutes)}
            </div>
            {entry.sessionCount && (
              <div className="text-xs text-gray-500">
                {entry.sessionCount} session{entry.sessionCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && maxMinutes > 0 && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  entry.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                  entry.rank === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                  entry.rank === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                  'bg-gradient-to-r from-blue-400 to-blue-600'
                }`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">
                {Math.round(progressPercentage)}% of top performer
              </span>
              {entry.averageSessionDuration && (
                <span className="text-xs text-gray-500">
                  Avg: {formatStudyDuration(entry.averageSessionDuration)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Additional Stats */}
      {(entry.totalSessions || entry.averageScore) && (
        <div className="ml-4 text-right">
          {entry.totalSessions && (
            <div className="text-sm text-gray-600">
              📊 {entry.totalSessions} sessions
            </div>
          )}
          {entry.averageScore && (
            <div className="text-sm text-gray-600">
              ⭐ {entry.averageScore}% avg score
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaderboardEntry;
