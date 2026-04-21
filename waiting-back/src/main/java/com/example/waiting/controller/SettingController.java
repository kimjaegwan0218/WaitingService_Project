package com.example.waiting.controller;

import com.example.waiting.dto.WaitTimeSettingResponse;
import com.example.waiting.service.WaitSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/settings")
public class SettingController {

    private final WaitSettingService service;

    @GetMapping("/wait-time")
    public WaitTimeSettingResponse getWaitTime(@RequestParam LocalDate date){
        return new WaitTimeSettingResponse(date, service.getAvgMin(date));
    }
}
