package com.study4ever.progressservice.repository;

import com.study4ever.progressservice.model.LeaderboardRankings;
import com.study4ever.progressservice.model.PeriodType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeaderboardRankingsRepository extends JpaRepository<LeaderboardRankings, Long> {
    
    /**
     * Find leaderboard rankings for a specific period ordered by rank
     */
    List<LeaderboardRankings> findByPeriodTypeAndStartDateOrderByRankAsc(
            PeriodType periodType, LocalDate startDate, Pageable pageable);
    
    /**
     * Find user's ranking for a specific period
     */
    Optional<LeaderboardRankings> findByUserIdAndPeriodTypeAndStartDate(
            String userId, PeriodType periodType, LocalDate startDate);
    
    /**
     * Delete rankings for a specific period (used for recalculation)
     */
    void deleteByPeriodTypeAndStartDate(PeriodType periodType, LocalDate startDate);
    
    /**
     * Check if rankings exist for a specific period
     */
    boolean existsByPeriodTypeAndStartDate(PeriodType periodType, LocalDate startDate);
    
    /**
     * Get user's ranking position for a specific period
     */
    @Query("SELECT lr.rank FROM LeaderboardRankings lr WHERE lr.userId = :userId " +
           "AND lr.periodType = :periodType AND lr.startDate = :startDate")
    Optional<Integer> getUserRankForPeriod(
            @Param("userId") String userId,
            @Param("periodType") PeriodType periodType,
            @Param("startDate") LocalDate startDate);
    
    /**
     * Find all rankings for a period ordered by rank
     */
    List<LeaderboardRankings> findByPeriodTypeAndStartDateOrderByRankAsc(
            PeriodType periodType, LocalDate startDate);
    
    /**
     * Get top N rankings for a specific period
     */
    @Query("SELECT lr FROM LeaderboardRankings lr WHERE lr.periodType = :periodType " +
           "AND lr.startDate = :startDate ORDER BY lr.rank ASC")
    List<LeaderboardRankings> findTopRankingsForPeriod(
            @Param("periodType") PeriodType periodType,
            @Param("startDate") LocalDate startDate,
            Pageable pageable);
}
