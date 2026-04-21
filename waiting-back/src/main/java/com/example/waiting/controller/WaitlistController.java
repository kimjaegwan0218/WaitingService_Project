package com.example.waiting.controller;

import com.example.waiting.domain.WaitList;
import com.example.waiting.dto.WaitlistSummaryResponse;
import com.example.waiting.service.WaitListService;
import com.example.waiting.service.WaitSettingService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/waitlists")
public class WaitlistController {

    private final WaitListService waitListService;
    private final WaitSettingService settingService;


    public record CreateReq(
            @NotBlank String name,
            @NotBlank String phone,
            @Min(1) @Max(20) int partySize
    ){}

    public record CreateResp(Long waitlistId, String visitDate, Integer queueNumber, String status){}

    @PostMapping
    public CreateResp create(@RequestBody CreateReq req){
        WaitList w = waitListService.create(req.name(), req.phone(), req.partySize());
        return new CreateResp(w.getId(), w.getVisitDate().toString(), w.getQueueNumber(), w.getStatus().name());
    }

    @GetMapping("/{id}")
    public WaitListService.WaitlistDetail detail(@PathVariable long id){
        return waitListService.getDetail(id);
    }

    @DeleteMapping("/{id}/cancel")
    public void cancel(@PathVariable long id){
        waitListService.cancelByCustomer(id);
    }

    @GetMapping("/summary")
    public WaitlistSummaryResponse summary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ){
        return settingService.getSummary(date);
    }
}
