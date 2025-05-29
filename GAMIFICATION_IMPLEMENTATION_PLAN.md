# Study Session Dashboard & Gamification System Implementation Plan

## Overview

This document outlines the implementation plan for the Study4Ever platform's study session dashboard and gamification features. The plan is structured in phases, starting with extending the existing `progress-service` to track and aggregate study session data, followed by creating a new `gamification-service` to handle rewards, badges, and leaderboards.

## Phase 1: Study Session Tracking & Analytics in progress-service

### 1.1 Progress Service Enhancements

#### Backend Changes (progress-service)
- Add session duration calculation logic 
- Create aggregate queries for daily, weekly, and monthly study time
- Implement REST endpoints for retrieving analytics data
- Add scheduler for daily data aggregation

#### Database Schema Updates
```sql
-- Table to store aggregated study data
CREATE TABLE study_session_stats (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  stats_date DATE NOT NULL, 
  duration_minutes BIGINT NOT NULL,
  session_count INTEGER NOT NULL,
  type VARCHAR(10) NOT NULL, -- DAILY, WEEKLY, MONTHLY
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Index for faster querying
CREATE INDEX idx_study_stats_user_date ON study_session_stats(user_id, stats_date, type);
```

#### New Endpoints

```
GET /api/v1/sessions/stats/weekly?startDate=YYYY-MM-DD
GET /api/v1/sessions/stats/monthly?year=YYYY
GET /api/v1/sessions/stats/yearly
GET /api/v1/sessions/stats/summary
```

#### Service Layer Implementations

```java
@Service
public class StudyStatsService {
    
    // Calculate daily statistics for a user
    public DailyStatsDTO getDailyStats(UUID userId, LocalDate date) {
        // Logic to gather all sessions for the day and calculate total duration
    }
    
    // Calculate weekly statistics for a user
    public WeeklyStatsDTO getWeeklyStats(UUID userId, LocalDate startDate) {
        // Logic to gather all sessions for the week and aggregate by day
    }
    
    // Calculate monthly statistics for a user
    public MonthlyStatsDTO getMonthlyStats(UUID userId, int year) {
        // Logic to gather all sessions for the year and aggregate by month
    }
    
    // Scheduled task to pre-calculate statistics for faster retrieval
    @Scheduled(cron = "0 5 0 * * *") // 5 minutes after midnight
    public void calculateDailyStats() {
        // Logic to calculate stats for previous day and store in study_session_stats
    }
}
```

### 1.2 Frontend Study Dashboard Implementation

#### New Pages
- Create `StudyStatsPage.jsx` with tabs for weekly and monthly views
- Implement date range picker for selecting specific time periods

#### Components
- Create reusable chart components for visualization
- Implement empty state messaging for periods with no data
- Add download/export functionality for study data

#### Routes
- Add `/dashboard/study-stats` route for the stats dashboard
- Configure proper authentication guards

#### API Integration
- Create `studyStatsHooks.js` with custom hooks for data fetching
- Implement proper loading and error states

## Phase 2: Leaderboard System in progress-service

### 2.1 Backend Implementation

#### Database Updates
```sql
-- Table to track user rankings
CREATE TABLE leaderboard_rankings (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  username VARCHAR(255) NOT NULL,
  duration_minutes BIGINT NOT NULL,
  rank INTEGER NOT NULL,
  period_type VARCHAR(10) NOT NULL, -- DAILY, WEEKLY, MONTHLY, YEARLY
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP NOT NULL
);

-- Index for faster querying
CREATE INDEX idx_leaderboard_period ON leaderboard_rankings(period_type, period_start, period_end);
```

#### New Endpoints
```
GET /api/v1/leaderboard/daily?date=YYYY-MM-DD
GET /api/v1/leaderboard/weekly?startDate=YYYY-MM-DD
GET /api/v1/leaderboard/monthly?year=YYYY&month=MM
GET /api/v1/leaderboard/yearly?year=YYYY
```

#### Service Layer Implementation
```java
@Service
public class LeaderboardService {
    
    // Get top learners for a specific day
    public List<LeaderboardEntryDTO> getDailyLeaderboard(LocalDate date, int limit) {
        // Logic to retrieve and rank users by study time for the day
    }
    
    // Get top learners for a specific week
    public List<LeaderboardEntryDTO> getWeeklyLeaderboard(LocalDate startDate, int limit) {
        // Logic to retrieve and rank users by study time for the week
    }
    
    // Get top learners for a specific month
    public List<LeaderboardEntryDTO> getMonthlyLeaderboard(int year, int month, int limit) {
        // Logic to retrieve and rank users by study time for the month
    }
    
    // Scheduled task to calculate rankings
    @Scheduled(cron = "0 15 0 * * *") // 15 minutes after midnight
    public void calculateDailyLeaderboard() {
        // Logic to calculate rankings for previous day
    }
}
```

### 2.2 Frontend Leaderboard Implementation

#### New Pages
- Create `LeaderboardPage.jsx` with tabs for different time periods
- Implement user highlighting for the current user's position

#### Components
- Create `LeaderboardEntry` component for consistent display
- Add animations for rank changes
- Implement podium view for top 3 users

#### Routes
- Add `/leaderboard` route
- Configure proper authentication guards

## Phase 3: Awards and Badges System in progress-service

### 3.1 Backend Implementation

#### Database Updates
```sql
-- Table to store awards
CREATE TABLE user_awards (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  username VARCHAR(255) NOT NULL,
  award_type VARCHAR(20) NOT NULL, -- DAILY_CHAMPION, WEEKLY_CHAMPION, MONTHLY_CHAMPION, YEARLY_CHAMPION
  display_name VARCHAR(255) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  study_duration_minutes BIGINT NOT NULL,
  awarded_at TIMESTAMP NOT NULL
);

-- Table to store badge counts
CREATE TABLE user_badges (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_type VARCHAR(50) NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  first_earned_at TIMESTAMP NOT NULL,
  last_earned_at TIMESTAMP NOT NULL
);

-- Indexes
CREATE INDEX idx_user_awards ON user_awards(user_id, award_type);
CREATE UNIQUE INDEX idx_user_badge_type ON user_badges(user_id, badge_type);
```

#### New Endpoints
```
GET /api/v1/users/{userId}/awards
GET /api/v1/users/{userId}/badges
GET /api/v1/awards/recent
```

#### Service Layer Implementation
```java
@Service
public class AwardService {
    
    // Award badges to top performers
    @Scheduled(cron = "0 30 0 * * *") // 30 minutes after midnight
    public void assignDailyAwards() {
        // Logic to identify and award daily champions
    }
    
    @Scheduled(cron = "0 30 0 * * 1") // 30 minutes after midnight on Mondays
    public void assignWeeklyAwards() {
        // Logic to identify and award weekly champions
    }
    
    // Get all awards for a user
    public List<AwardDTO> getUserAwards(UUID userId) {
        // Logic to retrieve user awards
    }
    
    // Get all badges for a user
    public List<BadgeDTO> getUserBadges(UUID userId) {
        // Logic to retrieve user badges
    }
}
```

### 3.2 Frontend Awards Implementation

#### New Pages
- Create `AwardsPage.jsx` to display user achievements
- Implement `ProfileBadgesSection` for display in user profiles

#### Components
- Create `AwardCard` component for displaying awards
- Create `BadgeIcon` component for consistent badge display
- Implement notification system for new awards

#### API Integration
- Create `awardsHooks.js` with custom hooks for data fetching
- Implement proper loading and error states

## Phase 4: New Gamification Service

### 4.1 Create gamification-service Microservice

#### Project Structure
```
gamification-service/
  ├── src/
  │   ├── main/
  │   │   ├── java/com/study4ever/gamification/
  │   │   │   ├── config/
  │   │   │   ├── controller/
  │   │   │   ├── dto/
  │   │   │   ├── exception/
  │   │   │   ├── model/
  │   │   │   ├── repository/
  │   │   │   ├── service/
  │   │   │   └── GamificationServiceApplication.java
  │   │   └── resources/
  │   │       └── application.yml
  │   └── test/
  └── pom.xml
```

#### Dependencies
- Spring Boot
- Spring Cloud (for service discovery and config)
- Spring Data JPA
- PostgreSQL or MongoDB
- Spring Kafka (for event-based communication)
- Spring Security

#### Core Entities
```java
// XP and Levels
@Entity
public class UserProgress {
    @Id
    private UUID userId;
    private int level;
    private int currentXp;
    private int xpToNextLevel;
    // ...
}

// Achievements
@Entity
public class Achievement {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String name;
    private String description;
    private String iconUrl;
    private AchievementCategory category;
    private int xpReward;
    // ...
}

@Entity
public class UserAchievement {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private UUID userId;
    private UUID achievementId;
    private LocalDateTime earnedAt;
    // ...
}
```

### 4.2 Event-Based Integration

#### Event Types
- `StudySessionCompletedEvent`
- `UserLevelUpEvent`
- `AchievementUnlockedEvent`
- `BadgeAwardedEvent`

#### Event Consumers
```java
@Service
public class StudySessionEventConsumer {
    
    @KafkaListener(topics = "study-sessions")
    public void processStudySession(StudySessionEvent event) {
        // Process session data
        // Update leaderboards
        // Award XP
        // Check for achievements
    }
}
```

### 4.3 Gamification Features

#### XP and Leveling System
- Award XP for study time (e.g., 1 XP per minute)
- Implement level progression with increasing XP requirements
- Create special rewards for level milestones

#### Achievements System
- Create achievements for study streaks, milestones, and special events
- Implement achievement unlocking logic
- Create achievement notification system

#### Activity Streaks
- Track daily login and study streaks
- Provide multipliers for consistent activity
- Implement streak recovery mechanics

#### Challenges
- Create time-limited challenges (daily, weekly)
- Implement challenge progression tracking
- Award special badges for challenge completion

## Phase 5: Frontend Gamification Features

#### New Pages
- Create `ProfilePage.jsx` with sections for badges, awards, and achievements
- Implement `GamificationDashboard.jsx` for XP, level, and progress display

#### Components
- Create `XpProgressBar` component
- Implement `AchievementCard` component
- Create `ChallengeTracker` component

#### Animations and Notifications
- Add level-up animations
- Implement achievement unlock notifications
- Create confetti effects for major milestones

## Phase 6: Testing and Optimization

### 6.1 Testing Strategy
- Unit tests for core service logic
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Performance tests for leaderboard calculations

### 6.2 Performance Optimization
- Implement caching for frequently accessed leaderboard data
- Use materialized views for expensive aggregations
- Optimize database indexes
- Implement batch processing for high-volume events

## Phase 7: Deployment and Monitoring

### 7.1 Deployment
- Update Docker Compose configurations
- Create Kubernetes deployment files
- Configure CI/CD pipelines

### 7.2 Monitoring
- Implement custom metrics for gamification events
- Create dashboards for system health
- Set up alerts for service degradation

## Timeline

1. **Phase 1** (Study Session Analytics): 2-3 weeks
2. **Phase 2** (Leaderboard System): 1-2 weeks
3. **Phase 3** (Awards and Badges): 2 weeks
4. **Phase 4** (Gamification Service): 3-4 weeks
5. **Phase 5** (Frontend Integration): 2-3 weeks
6. **Phase 6** (Testing and Optimization): 1-2 weeks
7. **Phase 7** (Deployment and Monitoring): 1 week

**Total Estimated Time**: 12-17 weeks

## Future Enhancements

- Social features (friends, teams, competitions)
- Gamified learning paths
- In-platform economy with virtual currency
- Custom achievement creation
- Interactive challenges between users
