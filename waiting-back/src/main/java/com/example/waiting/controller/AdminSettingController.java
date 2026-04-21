package com.example.waiting.controller;

import com.example.waiting.dto.WaitTimeSettingRequest;
import com.example.waiting.dto.WaitTimeSettingResponse;
import com.example.waiting.service.WaitSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/settings")
public class AdminSettingController {
    private final WaitSettingService service;

    @GetMapping("/wait-time")
    public WaitTimeSettingResponse get(@RequestParam LocalDate date){
        return new WaitTimeSettingResponse(date, service.getAvgMin(date));
    }

    @PutMapping("/wait-time")
    public WaitTimeSettingResponse save(@RequestParam LocalDate date,
                                        @RequestBody WaitTimeSettingRequest req){
        service.upsert(date, req.avgMinPerTeam());
        return new WaitTimeSettingResponse(date, service.getAvgMin(date));
    }
}
