package com.example.waiting.controller;

import com.example.waiting.domain.WaitList;
import com.example.waiting.domain.enums.WaitListStatus;
import com.example.waiting.repository.WaitListRepository;
import com.example.waiting.service.WaitListService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/waitlists")
public class AdminWaitlistController {

    private final WaitListService waitListService;
    private final WaitListRepository waitListRepository;

    @GetMapping
    public List<WaitList> list(@RequestParam LocalDate date,
                               @RequestParam(required = false)WaitListStatus status){
        if(status==null) status = WaitListStatus.WAITING;

        return waitListRepository.findByVisitDateAndStatusOrderByQueueNumberAsc(date, status);
    }

    @PostMapping("/call-next")
    public WaitList callNext(@RequestParam LocalDate date){
        return waitListService.callNext(date);
    }

    @PostMapping("/{id}/call")
    public WaitList call(@PathVariable long id){
        return waitListService.call(id);
    }

    @PostMapping("/{id}/seat")
    public WaitList seat(@PathVariable long id){
        return waitListService.seat(id);
    }

    @PostMapping("/{id}/no-show")
    public WaitList noShow(@PathVariable long id){
        return waitListService.noShow(id);
    }

    @PostMapping("/{id}/cancel")
    public void cancelByCustomer(@PathVariable long id){
        waitListService.cancelByCustomer(id);
    }

    @GetMapping("/latest-called")
    public WaitListService.WaitlistDetail latestCalled(@RequestParam LocalDate date) {
        return waitListService.latestCalled(date);
    }

    @GetMapping("/recent-calls")
    public List<WaitListService.WaitlistDetail> recentCalls(
            @RequestParam LocalDate date,
            @RequestParam(defaultValue = "3") int limit
    ) {
        return waitListService.recentCalls(date, limit);
    }
}
