import React, {useState} from 'react';
import {formatPeriodDisplay, getPeriodTypeIcon} from '../../utils/leaderboardUtils';
import LeaderboardEntry from './LeaderboardEntry';
import { Box, Typography, Button, Paper } from '@mui/material';

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

    if (loading) {
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

    if (!Array.isArray(leaderboard) || leaderboard.length === 0) {
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 6,
                textAlign: 'center'
            }}>
                <Typography variant="h1" sx={{ color: 'text.disabled', fontSize: '4rem', mb: 2 }}>📊</Typography>
                <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>No Data Available</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    No study sessions found for this period. Start studying to appear on the leaderboard!
                </Typography>
                <Button
                    variant="contained"
                    onClick={handleRefresh}
                    color="primary"
                >
                    Refresh
                </Button>
            </Box>
        );
    }

    const maxMinutes = leaderboard && leaderboard.length > 0 ? leaderboard[0].totalStudyMinutes : 0;

    return (
        <Paper elevation={4} sx={{
            borderRadius: 4,
            background: 'linear-gradient(135deg,#FFF5E0 65%, #F9EFD6 120%)'
        }}>

            {/* Leaderboard Entries */}
            <div className="p-6">
                <div className="space-y-3">
                    {leaderboard && leaderboard.map((entry, index) => (
                        <LeaderboardEntry
                            key={`${entry.userId}-${index}`}
                            entry={entry}
                            currentUserId={currentUserId}
                            showProgress={showProgress}
                            maxMinutes={maxMinutes}
                        />
                    ))}
                </div>

                {/* Current User's Rank (if not in top list) */}
                {currentUserId && currentUserRank && !leaderboard?.some(e => e.userId === currentUserId) && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Your Position</h3>
                        <LeaderboardEntry
                            entry={currentUserRank}
                            currentUserId={currentUserId}
                            showProgress={showProgress}
                            maxMinutes={maxMinutes}
                        />
                    </div>
                )}
            </div>
        </Paper>
    );
};

export default LeaderboardList;
