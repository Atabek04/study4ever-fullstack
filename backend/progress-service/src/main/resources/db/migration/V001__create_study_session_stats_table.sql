-- Study Session Statistics Table Migration
-- Database: PostgreSQL
-- Version: 1.0
-- Date: 2025-05-29

-- Create StudySessionStats table for storing aggregated study statistics
CREATE TABLE IF NOT EXISTS study_session_stats (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    stats_date DATE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_minutes BIGINT DEFAULT 0,
    session_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT unique_user_stats_date_type UNIQUE (user_id, stats_date, type),
    CONSTRAINT valid_duration CHECK (duration_minutes >= 0),
    CONSTRAINT valid_session_count CHECK (session_count >= 0),
    CONSTRAINT valid_date_range CHECK (start_date <= end_date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_study_session_stats_user_id ON study_session_stats (user_id);
CREATE INDEX IF NOT EXISTS idx_study_session_stats_date ON study_session_stats (stats_date);
CREATE INDEX IF NOT EXISTS idx_study_session_stats_type ON study_session_stats (type);
CREATE INDEX IF NOT EXISTS idx_study_session_stats_user_date_type ON study_session_stats (user_id, stats_date, type);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_study_session_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_study_session_stats_updated_at
    BEFORE UPDATE ON study_session_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_study_session_stats_updated_at();

-- Comments for documentation
COMMENT ON TABLE study_session_stats IS 'Stores aggregated study session statistics for different time periods';
COMMENT ON COLUMN study_session_stats.user_id IS 'ID of the user these statistics belong to';
COMMENT ON COLUMN study_session_stats.stats_date IS 'The date these statistics represent (start date for the period)';
COMMENT ON COLUMN study_session_stats.type IS 'Type of aggregation: DAILY, WEEKLY, MONTHLY, or YEARLY';
COMMENT ON COLUMN study_session_stats.start_date IS 'Start date of the statistical period';
COMMENT ON COLUMN study_session_stats.end_date IS 'End date of the statistical period';
COMMENT ON COLUMN study_session_stats.duration_minutes IS 'Total study duration in minutes for this period';
COMMENT ON COLUMN study_session_stats.session_count IS 'Number of study sessions in this period';

-- Grant permissions (adjust as needed for your application user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON study_session_stats TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE study_session_stats_id_seq TO your_app_user;
