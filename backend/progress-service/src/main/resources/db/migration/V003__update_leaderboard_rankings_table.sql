-- Migration to update leaderboard_rankings table structure
-- Version: V003
-- Description: Update leaderboard rankings table to match service implementation

-- Drop the existing table and recreate with correct structure
DROP TABLE IF EXISTS leaderboard_rankings;

-- Create leaderboard_rankings table with updated structure
CREATE TABLE leaderboard_rankings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    total_study_minutes BIGINT NOT NULL DEFAULT 0,
    session_count INT NOT NULL DEFAULT 0,
    rank INT NOT NULL,
    period_type VARCHAR(10) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_leaderboard_period_rank ON leaderboard_rankings(period_type, start_date, rank);
CREATE INDEX idx_leaderboard_user_period ON leaderboard_rankings(user_id, period_type, start_date);
CREATE INDEX idx_leaderboard_period_type ON leaderboard_rankings(period_type, start_date, end_date);

-- Create constraint to ensure period_type is valid
ALTER TABLE leaderboard_rankings ADD CONSTRAINT chk_period_type 
    CHECK (period_type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'));

-- Create unique constraint to prevent duplicate rankings for same user/period
ALTER TABLE leaderboard_rankings ADD CONSTRAINT uk_user_period 
    UNIQUE (user_id, period_type, start_date);
