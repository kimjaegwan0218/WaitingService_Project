package com.example.waiting.service;


import com.example.waiting.domain.WaitSetting;
import com.example.waiting.domain.enums.WaitListStatus;
import com.example.waiting.dto.WaitlistSummaryResponse;
import com.example.waiting.repository.WaitListRepository;
import com.example.waiting.repository.WaitSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class WaitSettingService {

    private final WaitSettingRepository repo;
    private final WaitListRepository waitListRepository;

    private static final int DEFAULT_AVG = 7;

    @Transactional(readOnly = true)
    public int getAvgMin(LocalDate date){
        return repo.findById(date)
                .map(WaitSetting::getAvgMinPerTeam)
                .orElse(DEFAULT_AVG);
    }

    @Transactional
    public WaitSetting upsert(LocalDate date, int avgMinPerTeam){
        if(avgMinPerTeam<1|| avgMinPerTeam>60){
            throw new IllegalArgumentException("평균 시간은 1~60분 사이로 입력하세요.");
        }

        WaitSetting s = repo.findById(date).orElseGet(()->
                WaitSetting.builder().visitDate(date).build());
        s.setAvgMinPerTeam(avgMinPerTeam);
        return repo.save(s);
    }

    @Transactional
    public WaitlistSummaryResponse getSummary(LocalDate date) {
        long waiting = waitListRepository.countByVisitDateAndStatus(date, WaitListStatus.WAITING);
        long called  = waitListRepository.countByVisitDateAndStatus(date, WaitListStatus.CALLED);

        Integer avg = getAvgMin(date); // 없으면 null 리턴하게
        int avgMinPerTeam = (avg == null ? DEFAULT_AVG : avg);

        return new WaitlistSummaryResponse(date, waiting, called, avgMinPerTeam);
    }
}
