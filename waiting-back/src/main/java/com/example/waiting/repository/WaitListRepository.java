package com.example.waiting.repository;

import com.example.waiting.domain.WaitList;
import com.example.waiting.domain.enums.WaitListStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface WaitListRepository extends JpaRepository<WaitList, Long> {

    Optional<WaitList> findFirstByVisitDateAndCalledAtIsNotNullOrderByCalledAtDesc(LocalDate visitDate);

    // ✅ calledAt 있는 것만, calledAt 내림차순, Pageable로 TOP N
    List<WaitList> findByVisitDateAndCalledAtIsNotNullOrderByCalledAtDesc(LocalDate visitDate, Pageable pageable);

    boolean existsByVisitDateAndPhoneAndStatusIn(LocalDate visitDate, String phone, List<WaitListStatus> statuses);

    List<WaitList> findByVisitDateAndStatusOrderByQueueNumberAsc(LocalDate visitDate, WaitListStatus status);

    Optional<WaitList> findFirstByVisitDateAndStatusOrderByQueueNumberAsc(LocalDate visitDate, WaitListStatus status);

    @Query("""
        select count(w) from WaitList w
        where w.visitDate = :date
            and w.status = :status
            and w.queueNumber < :myNo
    """)
    Long countAhead(@Param("date") LocalDate date,
                    @Param("status") WaitListStatus status,
                    @Param("myNo") int myNo);

    long countByVisitDateAndStatus(LocalDate visitDate, WaitListStatus status);

    boolean existsByVisitDateAndPhoneAndStatusIn(
            LocalDate visitDate,
            String phone,
            Collection<WaitListStatus> statuses
    );

}
