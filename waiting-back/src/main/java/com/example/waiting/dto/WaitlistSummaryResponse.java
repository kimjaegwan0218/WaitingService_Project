package com.example.waiting.dto;

import java.time.LocalDate;

public record WaitlistSummaryResponse(
        LocalDate date,
        long waitingCount,     // WAITING 팀 수
        long calledCount,      // CALLED 팀 수(원하면 같이)
        int avgMinPerTeam       // 설정 없으면 기본값
) {
}
