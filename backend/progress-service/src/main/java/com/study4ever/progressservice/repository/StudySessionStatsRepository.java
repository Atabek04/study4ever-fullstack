package com.study4ever.progressservice.repository;

import com.study4ever.progressservice.model.StudySessionStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudySessionStatsRepository extends JpaRepository<StudySessionStats, UUID> {

    List<StudySessionStats> findByUserIdAndType(String userId, StudySessionStats.StatsType type);

    List<StudySessionStats> findByUserIdAndTypeAndStatsDateBetween(
            String userId, 
            StudySessionStats.StatsType type, 
            LocalDate startDate, 
            LocalDate endDate
    );

    Optional<StudySessionStats> findByUserIdAndTypeAndStatsDate(
            String userId, 
            StudySessionStats.StatsType type, 
            LocalDate statsDate
    );

    @Query("""
        SELECT s FROM StudySessionStats s 
        WHERE s.userId = :userId 
        AND s.type = :type 
        AND s.startDate <= :date 
        AND s.endDate >= :date
        """)
    Optional<StudySessionStats> findByUserIdAndTypeAndDateInRange(
            @Param("userId") String userId,
            @Param("type") StudySessionStats.StatsType type,
            @Param("date") LocalDate date
    );

    @Query("""
        SELECT s FROM StudySessionStats s 
        WHERE s.userId = :userId 
        AND s.type = 'WEEKLY' 
        AND s.startDate <= :date 
        AND s.endDate >= :date
        """)
    Optional<StudySessionStats> findWeeklyStatsForDate(
            @Param("userId") String userId,
            @Param("date") LocalDate date
    );

    @Query("""
        SELECT s FROM StudySessionStats s 
        WHERE s.userId = :userId 
        AND s.type = 'MONTHLY' 
        AND YEAR(s.statsDate) = :year
        ORDER BY MONTH(s.statsDate)
        """)
    List<StudySessionStats> findMonthlyStatsByYear(
            @Param("userId") String userId,
            @Param("year") int year
    );

    void deleteByUserIdAndTypeAndStatsDate(
            String userId, 
            StudySessionStats.StatsType type, 
            LocalDate statsDate
    );
}
