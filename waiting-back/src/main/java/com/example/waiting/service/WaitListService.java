package com.example.waiting.service;

import com.example.waiting.domain.WaitList;
import com.example.waiting.domain.WaitListSequence;
import com.example.waiting.domain.enums.WaitListStatus;
import com.example.waiting.repository.WaitListRepository;
import com.example.waiting.repository.WaitListSequenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.http.HttpStatus.*;

@Service
@RequiredArgsConstructor
public class WaitListService {

    private final WaitListRepository waitlistRepository;
    private final WaitListSequenceRepository sequenceRepository;
    private static final List<WaitListStatus> ACTIVE_STATUSES = List.of(WaitListStatus.WAITING, WaitListStatus.CALLED);

    @Transactional
    public WaitList create(String name, String phone, int partySize){
        LocalDate today = LocalDate.now();

        // 같은 날 활성 대기(WAITING/CALLED) 중복 등록 방지
        boolean dup = waitlistRepository.existsByVisitDateAndPhoneAndStatusIn(
                today,phone, List.of(WaitListStatus.WAITING, WaitListStatus.CALLED)
        );
        if(dup) throw new ResponseStatusException(CONFLICT, "이미 웨이팅이 등록되어 있습니다.");

        // 대기번호 발급 (FOR UPDATE)
        int issuedNo = issueQueueNumber(today);

        WaitList w = WaitList.builder()
                .visitDate(today)
                .queueNumber(issuedNo)
                .customerName(name)
                .phone(phone)
                .partySize(partySize)
                .status(WaitListStatus.WAITING)
                .createdAt(LocalDateTime.now())
                .build();
        return waitlistRepository.save(w);
    }

    @Transactional(readOnly = true)
    public WaitlistDetail getDetail(long id){
        WaitList w = waitlistRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(NOT_FOUND, "웨이팅을 찾을 수 없습니다."));

        long ahead = waitlistRepository.countAhead(w.getVisitDate(), WaitListStatus.WAITING, w.getQueueNumber());

        return new WaitlistDetail(
                w.getId(), w.getVisitDate(), w.getQueueNumber(), w.getStatus(),
                ahead, w.getCreatedAt(), w.getCalledAt(), w.getSeatedAt(), w.getCancelledAt()
        );
    }

    @Transactional
    public void cancelByCustomer(long id){
        WaitList w = getForUpdate(id);
        if(w.getStatus() == WaitListStatus.SEATED || w.getStatus() == WaitListStatus.NO_SHOW)
            throw new ResponseStatusException(BAD_REQUEST, "이미 종료된 웨이팅입니다.");

        // 정책 : WAITING/CALLED 모두 취소 가능
        if(w.getStatus() == WaitListStatus.CANCELLED) return;

        w.setStatus(WaitListStatus.CANCELLED);
        w.setCancelledAt(LocalDateTime.now());
    }

    //-----------------Admin actions---------------

    @Transactional
    public WaitList callNext(LocalDate date){
        WaitList w = waitlistRepository.findFirstByVisitDateAndStatusOrderByQueueNumberAsc(date, WaitListStatus.WAITING)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "대기중인 팀이 없습니다."));

        // 호출
        w.setStatus(WaitListStatus.CALLED);
        w.setCalledAt(LocalDateTime.now());
        return w;
    }

    @Transactional
    public WaitList call(long id){
        WaitList w = getForUpdate(id);
        if(w.getStatus() != WaitListStatus.WAITING)
            throw new ResponseStatusException(BAD_REQUEST, "WAITING 상태만 호출할 수 있습니다.");

        w.setStatus(WaitListStatus.CALLED);
        w.setCalledAt(LocalDateTime.now());
        return w;
    }

    @Transactional
    public WaitList seat(long id){
        WaitList w = getForUpdate(id);
        if(w.getStatus() != WaitListStatus.CALLED)
            throw new ResponseStatusException(BAD_REQUEST,"CALLED 상태만 입장처리할 수 있습니다.");

        w.setStatus(WaitListStatus.SEATED);
        w.setSeatedAt(LocalDateTime.now());
        return w;
    }

    @Transactional
    public WaitList noShow(long id){
        WaitList w = getForUpdate(id);
        if(w.getStatus() != WaitListStatus.CALLED)
            throw new ResponseStatusException(BAD_REQUEST,"CALLED 상태만 노쇼처리할 수 있습니다.");

        w.setStatus(WaitListStatus.NO_SHOW);
        return w;
    }

    @Transactional(readOnly = true)
    public WaitlistDetail latestCalled(LocalDate date) {
        WaitList w = waitlistRepository
                .findFirstByVisitDateAndCalledAtIsNotNullOrderByCalledAtDesc(date)
                .orElse(null);

        if (w == null) return null;

        return new WaitlistDetail(
                w.getId(),
                w.getVisitDate(),
                w.getQueueNumber(),
                w.getStatus(),
                /* aheadCount는 전광판에 의미 없으면 0으로 */
                0L,
                w.getCreatedAt(),
                w.getCalledAt(),
                w.getSeatedAt(),
                w.getCancelledAt()
        );
    }

    @Transactional(readOnly = true)
    public List<WaitlistDetail> recentCalls(LocalDate date, int limit) {
        int size = Math.max(1, Math.min(limit, 10)); // 1~10으로 제한
        List<WaitList> list = waitlistRepository
                .findByVisitDateAndCalledAtIsNotNullOrderByCalledAtDesc(date, PageRequest.of(0, size));

        return list.stream()
                .map(w -> new WaitlistDetail(
                        w.getId(),
                        w.getVisitDate(),
                        w.getQueueNumber(),
                        w.getStatus(),
                        0L, // 전광판은 aheadCount 의미없으면 0
                        w.getCreatedAt(),
                        w.getCalledAt(),
                        w.getSeatedAt(),
                        w.getCancelledAt()
                ))
                .toList();
    }

    // -----------내부 유틸------------
    private WaitList getForUpdate(long id) {
        // 단순 조회도 트랜잭션 안이면 충분하지만,
        // 더 강하게 하고 싶으면 @Lock 쿼리 추가해도 됨.
        return waitlistRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "웨이팅을 찾을 수 없습니다."));
    }

    private int issueQueueNumber(LocalDate date) {
        WaitListSequence seq = sequenceRepository.findByDateForUpdate(date)
                .orElseGet(() -> sequenceRepository.save(
                        WaitListSequence.builder().visitDate(date).nextNumber(1).build()
                ));

        int issued = seq.getNextNumber();
        seq.setNextNumber(issued + 1);
        return issued;
    }

    //DTO
    public record WaitlistDetail(
            long id, LocalDate visitDate, int queueNumber, WaitListStatus status,
            long aheadCount,
            LocalDateTime createdAt, LocalDateTime calledAt, LocalDateTime seatedAt, LocalDateTime cancelledAt
    ){}
}
