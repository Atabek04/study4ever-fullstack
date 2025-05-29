-- Study Session Statistics Table Creation Script
-- This script creates the study_session_stats table for storing aggregated study session data
-- Run this script if the table is not automatically created by JPA

-- Create the study_session_stats table
CREATE TABLE IF NOT EXISTS study_session_stats (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    stat_type VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER,
    week INTEGER,
    date DATE,
    total_study_minutes INTEGER NOT NULL DEFAULT 0,
    session_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_study_session_stats_user_id ON study_session_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_study_session_stats_stat_type ON study_session_stats(stat_type);
CREATE INDEX IF NOT EXISTS idx_study_session_stats_date ON study_session_stats(date);
CREATE INDEX IF NOT EXISTS idx_study_session_stats_year_month ON study_session_stats(year, month);
CREATE INDEX IF NOT EXISTS idx_study_session_stats_year_week ON study_session_stats(year, week);

-- Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_study_session_stats_user_type_date 
    ON study_session_stats(user_id, stat_type, date);
CREATE INDEX IF NOT EXISTS idx_study_session_stats_user_type_year_month 
    ON study_session_stats(user_id, stat_type, year, month);
CREATE INDEX IF NOT EXISTS idx_study_session_stats_user_type_year_week 
    ON study_session_stats(user_id, stat_type, year, week);

-- Add constraints
ALTER TABLE study_session_stats 
    ADD CONSTRAINT chk_study_session_stats_stat_type 
    CHECK (stat_type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'));

ALTER TABLE study_session_stats 
    ADD CONSTRAINT chk_study_session_stats_minutes 
    CHECK (total_study_minutes >= 0);

ALTER TABLE study_session_stats 
    ADD CONSTRAINT chk_study_session_stats_sessions 
    CHECK (session_count >= 0);

-- Add constraint for month values (1-12)
ALTER TABLE study_session_stats 
    ADD CONSTRAINT chk_study_session_stats_month 
    CHECK (month IS NULL OR (month >= 1 AND month <= 12));

-- Add constraint for week values (1-53)
ALTER TABLE study_session_stats 
    ADD CONSTRAINT chk_study_session_stats_week 
    CHECK (week IS NULL OR (week >= 1 AND week <= 53));

-- Add constraint for year values (reasonable range)
ALTER TABLE study_session_stats 
    ADD CONSTRAINT chk_study_session_stats_year 
    CHECK (year >= 2020 AND year <= 2050);

-- Create unique constraints to prevent duplicate statistics
ALTER TABLE study_session_stats 
    ADD CONSTRAINT uk_study_session_stats_daily 
    UNIQUE (user_id, stat_type, date) 
    DEFERRABLE INITIALLY DEFERRED;

-- Comments for documentation
COMMENT ON TABLE study_session_stats IS 'Aggregated study session statistics for users';
COMMENT ON COLUMN study_session_stats.user_id IS 'ID of the user these statistics belong to';
COMMENT ON COLUMN study_session_stats.stat_type IS 'Type of statistic: DAILY, WEEKLY, MONTHLY, or YEARLY';
COMMENT ON COLUMN study_session_stats.year IS 'Year for the statistic';
COMMENT ON COLUMN study_session_stats.month IS 'Month (1-12) for MONTHLY statistics, NULL for others';
COMMENT ON COLUMN study_session_stats.week IS 'Week of year (1-53) for WEEKLY statistics, NULL for others';
COMMENT ON COLUMN study_session_stats.date IS 'Specific date for DAILY statistics, NULL for others';
COMMENT ON COLUMN study_session_stats.total_study_minutes IS 'Total study time in minutes for this period';
COMMENT ON COLUMN study_session_stats.session_count IS 'Number of study sessions in this period';
COMMENT ON COLUMN study_session_stats.created_at IS 'Timestamp when this record was created';
COMMENT ON COLUMN study_session_stats.updated_at IS 'Timestamp when this record was last updated';
