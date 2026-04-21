package com.example.waiting.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "waitlist_sequences")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class WaitListSequence {

    @Id
    @Column(name = "visit_date", nullable = false)
    private LocalDate visitDate;

    @Column(name="next_number", nullable = false)
    private Integer nextNumber;
}
