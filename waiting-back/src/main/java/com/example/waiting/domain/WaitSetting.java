package com.example.waiting.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "wait_settings")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class WaitSetting {

    @Id
    @Column(name = "visit_date", nullable = false)
    private LocalDate visitDate;

    @Column(name = "avg_min_per_team", nullable = false)
    private Integer avgMinPerTeam;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}