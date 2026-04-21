package com.example.waiting.dto;

import java.time.LocalDate;

public record WaitTimeSettingResponse(LocalDate date, int avgMinPerTeam) {
}
