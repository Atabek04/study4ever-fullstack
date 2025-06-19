import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Paper,
  Tooltip
} from '@mui/material';
import { formatStudyDuration, formatRank, getMedalEmoji, getAchievementLevel } from '../../utils/leaderboardUtils';

// Palette mapping from your theme for clarity
const rankGradients = {
  1: 'linear-gradient(90deg, #ffe259 0%, #ffa751 100%)',
  2: 'linear-gradient(90deg, #dadada 0%, #a3a3a3 100%)',
  3: 'linear-gradient(90deg, #f7971e 0%, #ffd200 100%)',
  other: 'linear-gradient(90deg, #C70039 0%, #FF6969 100%)'
};

const LeaderboardEntry = ({
                            entry,
                            currentUserId,
                            showProgress = true,
                            maxMinutes = 0
                          }) => {
  const isCurrentUser = entry.userId === currentUserId;
  const achievement = getAchievementLevel(entry.totalStudyMinutes);
  const progressPercentage = maxMinutes > 0 ? (entry.totalStudyMinutes / maxMinutes) * 100 : 0;
  const rankGradient = rankGradients[entry.rank] || rankGradients.other;

  return (
      <Paper
          elevation={isCurrentUser ? 7 : 3}
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            mb: 1.5,
            background: isCurrentUser
                ? 'linear-gradient(90deg,#FFF5E0 70%, #ffefef 130%)'
                : '#F9EFD6',
            borderLeft: isCurrentUser ? '6px solid #C70039' : 'none',
            boxShadow: isCurrentUser ? '0px 4px 20px 1px #FF696950' : '0px 2px 8px rgba(199, 0, 57, 0.03)',
            transition: 'box-shadow 0.2s, background 0.3s',
          }}
      >
        {/* Rank */}
        <Box sx={{
          width: 60,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mr: 2
        }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#C70039', mb: -1 }}>
            {getMedalEmoji(entry.rank)}
          </Typography>
          <Typography
              variant="subtitle2"
              fontWeight={entry.rank < 4 ? 700 : 500}
              sx={{ color: '#C70039', textShadow: '0px 2px 4px #fff5e0' }}
          >
            {formatRank(entry.rank)}
          </Typography>
        </Box>

        {/* User */}
        <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Avatar
                sx={{
                  mr: 1.2,
                  bgcolor: 'transparent',
                  color: '#C70039',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #FFF5E0 0%, #FF6969 100%)',
                  border: isCurrentUser ? '2.5px solid #FF6969' : '2.5px solid #F9EFD6',
                  width: 42,
                  height: 42,
                  fontSize: 24,
                  boxShadow: '0px 3px 10px 1px #ffe0e0a0'
                }}
            >
              {(entry.userName?.[0] ?? 'U').toUpperCase()}
            </Avatar>
            <Typography
                variant="subtitle1"
                fontWeight={isCurrentUser ? 'bold' : 500}
                sx={{ color: '#141E46', mr: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}
            >
              {entry.userName || `${entry.userId}`}
            </Typography>
            {isCurrentUser && (
                <Chip label="You" size="small" sx={{
                  bgcolor: '#C70039',
                  color: '#FFF5E0',
                  fontWeight: 600,
                  boxShadow: '0 2px 10px -3px #FF6969'
                }} />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
                size="small"
                label={
                  <span>
                <span style={{ fontSize: '1.2em', marginRight: 4 }}>{achievement.icon}</span>
                    {achievement.level}
              </span>
                }
                sx={{
                  backgroundColor: '#FF6969',
                  color: '#FFF5E0',
                  fontWeight: 500,
                  letterSpacing: '.02em',
                  px: 0.7
                }}
            />
            {!!entry.streak && entry.streak > 1 && (
                <Chip
                    size="small"
                    icon={<span style={{ fontSize: '1.1em' }}>🔥</span>}
                    label={`${entry.streak}d streak`}
                    sx={{
                      bgcolor: '#fce4d6',
                      color: '#C70039',
                      fontWeight: 500
                    }}
                />
            )}
          </Box>
        </Box>

        {/* Study stats (right) */}
        <Box sx={{ minWidth: 100, textAlign: 'right', mr: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#141E46' }}>
            {formatStudyDuration(entry.totalStudyMinutes)}
          </Typography>
          {entry.sessionCount && (
              <Typography variant="caption" sx={{ color: '#38456C' }}>
                {entry.sessionCount} session{entry.sessionCount !== 1 ? 's' : ''}
              </Typography>
          )}
        </Box>

        {/* Progress bar & extra */}
        {showProgress && maxMinutes > 0 && (
            <Box sx={{ width: 150 }}>
              <Tooltip title="Your progress vs Top" arrow>
                <LinearProgress
                    variant="determinate"
                    value={Math.min(progressPercentage, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      mb: 0.6,
                      background: '#ffecec',
                      '& .MuiLinearProgress-bar': {
                        backgroundImage: rankGradient,
                        borderRadius: 4,
                        boxShadow: entry.rank < 4 ? '0px 1.5px 10px 1.5px #FF696980' : undefined,
                      }
                    }}
                />
              </Tooltip>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: '#38456C' }}>
                  {Math.round(progressPercentage)}% of top
                </Typography>
                {entry.averageSessionDuration && (
                    <Typography variant="caption" sx={{ color: '#38456C' }}>
                      Avg: {formatStudyDuration(entry.averageSessionDuration)}
                    </Typography>
                )}
              </Box>
            </Box>
        )}
      </Paper>
  );
};
export default LeaderboardEntry;