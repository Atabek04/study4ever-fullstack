-- Sample data population for study session stats and leaderboard rankings for user 'ibnmalik'
-- Current date context: Friday, May 30, 2025
-- Populating ~100 records across different time periods for comprehensive dashboard testing

-- =====================================================
-- STUDY SESSION STATS DATA
-- =====================================================

-- DAILY STATS FOR MAY 2025 (Current Month)
-- Week of May 26-30, 2025 (Current week)
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-26', 85, 3, 'DAILY', '2025-05-26', '2025-05-26', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-27', 120, 4, 'DAILY', '2025-05-27', '2025-05-27', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-28', 95, 2, 'DAILY', '2025-05-28', '2025-05-28', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-29', 110, 3, 'DAILY', '2025-05-29', '2025-05-29', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-30', 75, 2, 'DAILY', '2025-05-30', '2025-05-30', NOW(), NOW());

-- Week of May 19-25, 2025
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-19', 90, 3, 'DAILY', '2025-05-19', '2025-05-19', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-20', 135, 4, 'DAILY', '2025-05-20', '2025-05-20', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-21', 105, 3, 'DAILY', '2025-05-21', '2025-05-21', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-22', 80, 2, 'DAILY', '2025-05-22', '2025-05-22', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-23', 115, 3, 'DAILY', '2025-05-23', '2025-05-23', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-24', 160, 5, 'DAILY', '2025-05-24', '2025-05-24', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-25', 140, 4, 'DAILY', '2025-05-25', '2025-05-25', NOW(), NOW());

-- Week of May 12-18, 2025
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-12', 70, 2, 'DAILY', '2025-05-12', '2025-05-12', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-13', 125, 4, 'DAILY', '2025-05-13', '2025-05-13', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-14', 95, 3, 'DAILY', '2025-05-14', '2025-05-14', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-15', 110, 3, 'DAILY', '2025-05-15', '2025-05-15', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-16', 85, 2, 'DAILY', '2025-05-16', '2025-05-16', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-17', 145, 4, 'DAILY', '2025-05-17', '2025-05-17', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-18', 100, 3, 'DAILY', '2025-05-18', '2025-05-18', NOW(), NOW());

-- Week of May 5-11, 2025
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-05', 75, 2, 'DAILY', '2025-05-05', '2025-05-05', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-06', 130, 4, 'DAILY', '2025-05-06', '2025-05-06', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-07', 90, 3, 'DAILY', '2025-05-07', '2025-05-07', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-08', 115, 3, 'DAILY', '2025-05-08', '2025-05-08', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-09', 85, 2, 'DAILY', '2025-05-09', '2025-05-09', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-10', 155, 5, 'DAILY', '2025-05-10', '2025-05-10', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-11', 120, 3, 'DAILY', '2025-05-11', '2025-05-11', NOW(), NOW());

-- First week of May 2025
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-01', 95, 3, 'DAILY', '2025-05-01', '2025-05-01', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-02', 110, 3, 'DAILY', '2025-05-02', '2025-05-02', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-03', 80, 2, 'DAILY', '2025-05-03', '2025-05-03', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-04', 135, 4, 'DAILY', '2025-05-04', '2025-05-04', NOW(), NOW());

-- DAILY STATS FOR APRIL 2025
-- Last week of April
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-04-28', 100, 3, 'DAILY', '2025-04-28', '2025-04-28', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-04-29', 130, 4, 'DAILY', '2025-04-29', '2025-04-29', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-04-30', 75, 2, 'DAILY', '2025-04-30', '2025-04-30', NOW(), NOW());

-- Mid April
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-04-15', 120, 4, 'DAILY', '2025-04-15', '2025-04-15', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-04-16', 85, 2, 'DAILY', '2025-04-16', '2025-04-16', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-04-17', 140, 4, 'DAILY', '2025-04-17', '2025-04-17', NOW(), NOW());

-- Early April
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-04-05', 95, 3, 'DAILY', '2025-04-05', '2025-04-05', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-04-06', 110, 3, 'DAILY', '2025-04-06', '2025-04-06', NOW(), NOW());

-- DAILY STATS FOR MARCH 2025
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-03-15', 120, 4, 'DAILY', '2025-03-15', '2025-03-15', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-03-20', 90, 3, 'DAILY', '2025-03-20', '2025-03-20', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-03-25', 105, 3, 'DAILY', '2025-03-25', '2025-03-25', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-03-10', 135, 4, 'DAILY', '2025-03-10', '2025-03-10', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-03-05', 80, 2, 'DAILY', '2025-03-05', '2025-03-05', NOW(), NOW());

-- DAILY STATS FOR FEBRUARY 2025
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-02-14', 125, 4, 'DAILY', '2025-02-14', '2025-02-14', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-02-20', 95, 3, 'DAILY', '2025-02-20', '2025-02-20', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-02-25', 110, 3, 'DAILY', '2025-02-25', '2025-02-25', NOW(), NOW());

-- DAILY STATS FOR JANUARY 2025
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-01-15', 100, 3, 'DAILY', '2025-01-15', '2025-01-15', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-01-20', 115, 3, 'DAILY', '2025-01-20', '2025-01-20', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-01-25', 90, 2, 'DAILY', '2025-01-25', '2025-01-25', NOW(), NOW());

-- DAILY STATS FOR 2024 (Sample days)
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2024-12-15', 140, 4, 'DAILY', '2024-12-15', '2024-12-15', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2024-11-20', 105, 3, 'DAILY', '2024-11-20', '2024-11-20', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2024-10-10', 125, 4, 'DAILY', '2024-10-10', '2024-10-10', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2024-09-15', 95, 3, 'DAILY', '2024-09-15', '2024-09-15', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2024-08-20', 110, 3, 'DAILY', '2024-08-20', '2024-08-20', NOW(), NOW());

-- DAILY STATS FOR 2023 (Sample days)
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2023-12-10', 135, 4, 'DAILY', '2023-12-10', '2023-12-10', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2023-09-15', 85, 2, 'DAILY', '2023-09-15', '2023-09-15', NOW(), NOW());
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2023-06-20', 120, 4, 'DAILY', '2023-06-20', '2023-06-20', NOW(), NOW());

-- WEEKLY STATS
-- Current week (May 26-30, 2025) - partial week
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-30', 485, 14, 'WEEKLY', '2025-05-26', '2025-05-30', NOW(), NOW());

-- Previous week (May 19-25, 2025)
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-25', 925, 27, 'WEEKLY', '2025-05-19', '2025-05-25', NOW(), NOW());

-- Week of May 12-18, 2025
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-18', 800, 22, 'WEEKLY', '2025-05-12', '2025-05-18', NOW(), NOW());

-- Week of May 5-11, 2025
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-11', 750, 20, 'WEEKLY', '2025-05-05', '2025-05-11', NOW(), NOW());

-- Week of April 28 - May 4, 2025
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-04', 680, 18, 'WEEKLY', '2025-04-28', '2025-05-04', NOW(), NOW());

-- MONTHLY STATS
-- May 2025 (partial month)
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-05-31', 2640, 101, 'MONTHLY', '2025-05-01', '2025-05-31', NOW(), NOW());

-- April 2025
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-04-30', 3200, 95, 'MONTHLY', '2025-04-01', '2025-04-30', NOW(), NOW());

-- March 2025
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-03-31', 2890, 88, 'MONTHLY', '2025-03-01', '2025-03-31', NOW(), NOW());

-- February 2025
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-02-28', 2650, 82, 'MONTHLY', '2025-02-01', '2025-02-28', NOW(), NOW());

-- January 2025
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-01-31', 2980, 92, 'MONTHLY', '2025-01-01', '2025-01-31', NOW(), NOW());

-- YEARLY STATS
-- 2025 (partial year)
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2025-12-31', 14360, 458, 'YEARLY', '2025-01-01', '2025-12-31', NOW(), NOW());

-- 2024
INSERT INTO study_session_stats (id, user_id, stats_date, duration_minutes, session_count, type, start_date, end_date, created_at, updated_at) 
VALUES (gen_random_uuid(), 'ibnmalik', '2024-12-31', 28950, 876, 'YEARLY', '2024-01-01', '2024-12-31', NOW(), NOW());

-- =====================================================
-- LEADERBOARD RANKINGS DATA
-- =====================================================

-- DAILY RANKINGS
-- Today (May 30, 2025)
INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('ibnmalik', 75, 2, 1, 'DAILY', '2025-05-30', '2025-05-30', NOW(), NOW());

-- Yesterday (May 29, 2025)
INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('ibnmalik', 110, 3, 1, 'DAILY', '2025-05-29', '2025-05-29', NOW(), NOW());

-- May 28, 2025
INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('ibnmalik', 95, 2, 1, 'DAILY', '2025-05-28', '2025-05-28', NOW(), NOW());

-- May 27, 2025
INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('ibnmalik', 120, 4, 1, 'DAILY', '2025-05-27', '2025-05-27', NOW(), NOW());

-- May 26, 2025
INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('ibnmalik', 85, 3, 1, 'DAILY', '2025-05-26', '2025-05-26', NOW(), NOW());

-- WEEKLY RANKINGS
-- Current week (May 26-30, 2025)
INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('ibnmalik', 485, 14, 1, 'WEEKLY', '2025-05-26', '2025-05-30', NOW(), NOW());

-- Previous week (May 19-25, 2025)
INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('ibnmalik', 925, 27, 1, 'WEEKLY', '2025-05-19', '2025-05-25', NOW(), NOW());

-- Week of May 12-18, 2025
INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('ibnmalik', 800, 22, 1, 'WEEKLY', '2025-05-12', '2025-05-18', NOW(), NOW());

-- Week of May 5-11, 2025
INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('ibnmalik', 750, 20, 1, 'WEEKLY', '2025-05-05', '2025-05-11', NOW(), NOW());

-- MONTHLY RANKINGS
-- May 2025
INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('ibnmalik', 2640, 101, 1, 'MONTHLY', '2025-05-01', '2025-05-31', NOW(), NOW());

-- April 2025
INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('ibnmalik', 3200, 95, 1, 'MONTHLY', '2025-04-01', '2025-04-30', NOW(), NOW());

-- March 2025
INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('ibnmalik', 2890, 88, 1, 'MONTHLY', '2025-03-01', '2025-03-31', NOW(), NOW());

-- February 2025
INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('ibnmalik', 2650, 82, 1, 'MONTHLY', '2025-02-01', '2025-02-28', NOW(), NOW());

-- YEARLY RANKINGS
-- 2025
INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('ibnmalik', 14360, 458, 1, 'YEARLY', '2025-01-01', '2025-12-31', NOW(), NOW());

-- 2024
INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('ibnmalik', 28950, 876, 1, 'YEARLY', '2024-01-01', '2024-12-31', NOW(), NOW());

-- Additional sample users for more realistic leaderboard
-- User: johndoe
INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('johndoe', 65, 2, 2, 'DAILY', '2025-05-30', '2025-05-30', NOW(), NOW());

INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('johndoe', 420, 12, 2, 'WEEKLY', '2025-05-26', '2025-05-30', NOW(), NOW());

INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('johndoe', 2150, 85, 2, 'MONTHLY', '2025-05-01', '2025-05-31', NOW(), NOW());

INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('johndoe', 12500, 398, 2, 'YEARLY', '2025-01-01', '2025-12-31', NOW(), NOW());

-- User: alicesmith
INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('alicesmith', 55, 1, 3, 'DAILY', '2025-05-30', '2025-05-30', NOW(), NOW());

INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('alicesmith', 380, 10, 3, 'WEEKLY', '2025-05-26', '2025-05-30', NOW(), NOW());

INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('alicesmith', 1950, 78, 3, 'MONTHLY', '2025-05-01', '2025-05-31', NOW(), NOW());

INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('alicesmith', 11200, 356, 3, 'YEARLY', '2025-01-01', '2025-12-31', NOW(), NOW());

-- User: mikebrown
INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('mikebrown', 45, 1, 4, 'DAILY', '2025-05-30', '2025-05-30', NOW(), NOW());

INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('mikebrown', 340, 9, 4, 'WEEKLY', '2025-05-26', '2025-05-30', NOW(), NOW());

INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('mikebrown', 1800, 72, 4, 'MONTHLY', '2025-05-01', '2025-05-31', NOW(), NOW());

INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('mikebrown', 10800, 324, 4, 'YEARLY', '2025-01-01', '2025-12-31', NOW(), NOW());

-- User: sarawilson
INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('sarawilson', 40, 1, 5, 'DAILY', '2025-05-30', '2025-05-30', NOW(), NOW());

INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('sarawilson', 310, 8, 5, 'WEEKLY', '2025-05-26', '2025-05-30', NOW(), NOW());

INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('sarawilson', 1650, 68, 5, 'MONTHLY', '2025-05-01', '2025-05-31', NOW(), NOW());

INSERT INTO leaderboard_rankings (user_id, total_study_minutes, session_count, rank, period_type, start_date, end_date, created_at, updated_at) 
VALUES ('sarawilson', 9800, 298, 5, 'YEARLY', '2025-01-01', '2025-12-31', NOW(), NOW());
