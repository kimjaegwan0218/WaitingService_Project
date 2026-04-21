package com.example.waiting.repository;

import com.example.waiting.domain.WaitListSequence;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;

public interface WaitListSequenceRepository extends JpaRepository<WaitListSequence, LocalDate> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from WaitListSequence s where s.visitDate = :date")
    Optional<WaitListSequence> findByDateForUpdate(@Param("date") LocalDate date);
}
