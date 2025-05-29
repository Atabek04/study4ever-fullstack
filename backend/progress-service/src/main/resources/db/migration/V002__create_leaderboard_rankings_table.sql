-- Migration for leaderboard rankings table
-- Version: V002
-- Description: Create leaderboard rankings table for tracking user rankings

-- Table to track user rankings
CREATE TABLE leaderboard_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    username VARCHAR(255) NOT NULL,
    duration_minutes BIGINT NOT NULL,
    rank INTEGER NOT NULL,
    period_type VARCHAR(10) NOT NULL CHECK (period_type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster querying by period type and dates
CREATE INDEX idx_leaderboard_period ON leaderboard_rankings(period_type, period_start, period_end);

-- Index for faster querying by user and period
CREATE INDEX idx_leaderboard_user_period ON leaderboard_rankings(user_id, period_type, period_start);

-- Index for faster ranking queries
CREATE INDEX idx_leaderboard_rank ON leaderboard_rankings(period_type, period_start, period_end, rank);

-- Unique constraint to ensure one ranking per user per period
CREATE UNIQUE INDEX idx_leaderboard_unique_user_period ON leaderboard_rankings(user_id, period_type, period_start, period_end);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_leaderboard_rankings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leaderboard_rankings_updated_at
    BEFORE UPDATE ON leaderboard_rankings
    FOR EACH ROW
    EXECUTE FUNCTION update_leaderboard_rankings_updated_at();
