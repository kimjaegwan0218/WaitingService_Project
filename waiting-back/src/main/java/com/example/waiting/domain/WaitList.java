package com.example.waiting.domain;


import com.example.waiting.domain.enums.WaitListStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "waitlists",
        uniqueConstraints = @UniqueConstraint(name="uk_waitlist_day_no", columnNames = {"visit_date", "queue_number"}),
        indexes ={
            @Index(name="idx_waitlist_day_status_no", columnList="visit_date, status, queue_number"),
            @Index(name="idx_waitlist_day_phone", columnList = "visit_date, phone")
        })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class WaitList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="waitlist_id")
    private Long id;

    @Column(name="visit_date", nullable = false)
    private LocalDate visitDate;

    @Column(name="queue_number", nullable = false)
    private Integer queueNumber;

    @Column(name="customer_name", nullable = false, length = 50)
    private String customerName;

    @Column(name="phone",  nullable = false, length = 30)
    private String phone;

    @Column(name="party_size",nullable = false)
    private Integer partySize;

    @Enumerated(EnumType.STRING)
    @Column(name="status", nullable = false, length = 20)
    private WaitListStatus status;

    @Column(name="created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name="called_at")
    private LocalDateTime calledAt;

    @Column(name="seated_at")
    private LocalDateTime seatedAt;

    @Column(name="cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name="note", length = 255)
    private String note;

    @PrePersist
    public void prePersist(){
        if(createdAt == null) createdAt = LocalDateTime.now();
        if(status == null) status = WaitListStatus.WAITING;
    }
}
