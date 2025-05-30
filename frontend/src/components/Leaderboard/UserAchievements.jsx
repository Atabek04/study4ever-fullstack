import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUserRank } from '../../hooks/leaderboardHooks';
import { formatStudyDuration, getAchievementLevel, formatRank } from '../../utils/leaderboardUtils';

const UserAchievements = ({ studyStats = null }) => {
  const { user } = useAuth();
  const { userRank } = useUserRank();

  // Calculate total study time from stats if available
  const totalStudyMinutes = studyStats?.totalMinutes || userRank?.totalStudyMinutes || 0;
  const achievement = getAchievementLevel(totalStudyMinutes);

  // Calculate some basic achievements
  const achievements = [
    {
      id: 'first_session',
      name: 'First Steps',
      description: 'Complete your first study session',
      icon: '🌱',
      achieved: totalStudyMinutes > 0,
      progress: totalStudyMinutes > 0 ? 100 : 0
    },
    {
      id: 'study_1_hour',
      name: 'Hour Scholar',
      description: 'Study for 1 hour total',
      icon: '⏰',
      achieved: totalStudyMinutes >= 60,
      progress: Math.min((totalStudyMinutes / 60) * 100, 100)
    },
    {
      id: 'study_10_hours',
      name: 'Dedicated Learner',
      description: 'Study for 10 hours total',
      icon: '📚',
      achieved: totalStudyMinutes >= 600,
      progress: Math.min((totalStudyMinutes / 600) * 100, 100)
    },
    {
      id: 'top_10',
      name: 'Rising Star',
      description: 'Reach top 10 in weekly leaderboard',
      icon: '⭐',
      achieved: userRank?.rank && userRank.rank <= 10,
      progress: userRank?.rank ? Math.max(100 - (userRank.rank * 10), 0) : 0
    }
  ];

  const achievedCount = achievements.filter(a => a.achieved).length;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">🏅 Your Progress</h3>
        <div className="text-right">
          <div className={`text-sm font-medium ${achievement.color}`}>
            {achievement.icon} {achievement.level}
          </div>
          <div className="text-xs text-gray-500">
            {formatStudyDuration(totalStudyMinutes)} studied
          </div>
        </div>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-blue-900">
            {formatStudyDuration(totalStudyMinutes)}
          </div>
          <div className="text-xs text-blue-600">Total Study Time</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-green-900">
            {userRank?.rank ? formatRank(userRank.rank) : 'Unranked'}
          </div>
          <div className="text-xs text-green-600">Weekly Rank</div>
        </div>
      </div>

      {/* Achievement Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">Achievements</h4>
          <span className="text-xs text-gray-500">
            {achievedCount}/{achievements.length} unlocked
          </span>
        </div>

        {achievements.map((achievement) => (
          <div key={achievement.id} className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              achievement.achieved 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              {achievement.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${
                  achievement.achieved ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {achievement.name}
                </p>
                {achievement.achieved && (
                  <span className="text-xs text-green-600 font-medium">✓</span>
                )}
              </div>
              
              <p className="text-xs text-gray-500 mb-1">
                {achievement.description}
              </p>
              
              {!achievement.achieved && achievement.progress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${achievement.progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Next Achievement */}
      {achievedCount < achievements.length && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-600">🎯</span>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Keep studying to unlock more achievements!
                </p>
                <p className="text-xs text-yellow-600">
                  Next: {achievements.find(a => !a.achieved)?.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAchievements;
