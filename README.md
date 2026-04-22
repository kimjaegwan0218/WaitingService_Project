# Waiting Service Project

## 프로젝트 소개
매장 방문 고객의 현장 대기 등록부터 호출, 착석 처리, 전광판 표시까지 관리할 수 있는 **실시간 웨이팅 서비스**입니다.  
사용자는 이름, 연락처, 인원 수를 입력해 웨이팅을 등록할 수 있고, 관리자는 대기열을 확인하며 다음 순번을 호출하거나 착석/취소/노쇼 처리를 할 수 있습니다.  
또한 전광판 화면을 통해 현재 호출된 번호를 직관적으로 보여줄 수 있도록 구성했습니다.

---

## 개발 배경
매장 현장 웨이팅은 보통 수기로 작성하거나 단순 호출에 의존하는 경우가 많아,
- 현재 대기 인원 파악이 어렵고
- 고객에게 예상 대기 시간을 안내하기 어렵고
- 관리자가 여러 상태를 일관되게 관리하기 어렵다는 문제가 있습니다.

이 프로젝트는 이러한 문제를 해결하기 위해,
**대기 등록 → 대기열 관리 → 호출 → 착석 완료**의 흐름을 웹 서비스로 구현한 프로젝트입니다.

---

## 개발 기간
- 프로젝트 기간: 직접 입력

---

## 기술 스택
### Backend
- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- MariaDB
- Lombok
- Validation

### Frontend
- React
- JavaScript
- CSS
- Vite

### Tools
- IntelliJ IDEA / VS Code
- Git / GitHub
- Postman

---

## 주요 기능

### 1. 대기 등록
- 사용자 이름, 전화번호, 인원 수를 입력하여 대기 등록 가능
- 등록 시 방문 날짜 기준으로 **순번(queue number)** 자동 발급
- 동일 전화번호로 같은 날짜에 중복 대기 등록이 되지 않도록 제한

### 2. 예상 대기 시간 안내
- 해당 날짜의 현재 대기 팀 수를 기반으로 예상 대기 시간을 계산
- 기본 평균 소요 시간(`avgMinPerTeam`)을 바탕으로 간단한 ETA 제공
- 관리자가 날짜별 평균 소요 시간을 조정할 수 있도록 설계

### 3. 관리자 대기열 관리
- 날짜별 웨이팅 목록 조회
- 상태별 필터링 지원
- 다음 순번 호출 기능
- 호출 이후 착석, 취소, 노쇼 상태 변경 가능

### 4. 호출 전광판 화면
- 최근 호출된 번호를 별도 화면에 표시
- 매장 내부 디스플레이 또는 모니터에서 사용할 수 있도록 구성
- 호출 목록을 주기적으로 갱신하여 실시간에 가까운 표시 제공

### 5. 요약 정보 제공
- 특정 날짜 기준
  - 대기 중 팀 수
  - 호출 완료 팀 수
  - 평균 대기 시간 기준값
  등을 요약해서 보여주는 대시보드 형태의 정보 제공

---

## 사용자 흐름
1. 사용자가 이름, 전화번호, 인원 수를 입력한다.
2. 시스템이 해당 날짜의 다음 대기 번호를 발급한다.
3. 관리자가 관리자 화면에서 대기 목록을 확인한다.
4. 다음 팀을 호출한다.
5. 호출된 팀을 착석 처리하거나, 상황에 따라 취소/노쇼 처리한다.
6. 호출된 번호는 전광판 화면에 표시된다.

---

## 관리자 기능
- 날짜 기준 웨이팅 목록 조회
- 상태별 필터링 (`WAITING`, `CALLED`, `SEATED`, `CANCELLED`, `NO_SHOW`)
- 다음 순번 자동 호출
- 특정 대기건 수동 상태 변경
- 평균 소요 시간 설정값 관리

---

## 핵심 비즈니스 로직

### 1. 날짜별 순번 발급
웨이팅 번호는 전체 누적 번호가 아니라 **방문 날짜 기준으로 독립적으로 증가**하도록 설계했습니다.
이를 위해 날짜별 순번 관리를 위한 별도 시퀀스 개념을 두었습니다.

### 2. 중복 대기 방지
같은 날짜에 같은 전화번호로 이미 `WAITING` 또는 `CALLED` 상태의 대기가 존재하면,
새로운 등록을 제한하도록 처리했습니다.

### 3. 예상 대기 시간 계산
예상 대기 시간은 단순한 고정값이 아니라,
현재 날짜 기준 대기 팀 수와 평균 팀당 소요 시간을 기반으로 계산하도록 설계했습니다.

### 4. 상태 전이 관리
대기 상태는 아래 흐름을 중심으로 관리됩니다.

- `WAITING` : 대기 등록 완료
- `CALLED` : 호출 완료
- `SEATED` : 입장 완료
- `CANCELLED` : 고객 취소
- `NO_SHOW` : 호출 후 미입장

---

## API 예시
### 사용자 API
- `POST /api/waitlists` : 웨이팅 등록
- `GET /api/waitlists/summary?date=YYYY-MM-DD` : 날짜별 요약 정보 조회
- `DELETE /api/waitlists/{id}/cancel` 또는 프로젝트 구현 방식에 맞는 취소 API

### 관리자 API
- `GET /api/admin/waitlists?date=YYYY-MM-DD&status=...` : 관리자용 목록 조회
- `POST /api/admin/waitlists/call-next?date=YYYY-MM-DD` : 다음 순번 호출
- `POST /api/admin/waitlists/{id}/call` : 특정 순번 호출
- `POST /api/admin/waitlists/{id}/seat` : 착석 처리
- `POST /api/admin/waitlists/{id}/cancel` : 취소 처리
- `POST /api/admin/waitlists/{id}/no-show` : 노쇼 처리

> 실제 엔드포인트는 최종 구현 코드에 맞춰 한 번 더 맞추는 것을 권장합니다.

---

## 데이터베이스 설계
### waitlists
대기 등록의 핵심 정보를 저장하는 테이블
- waitlist_id
- visit_date
- queue_number
- customer_name
- phone
- party_size
- status
- created_at
- called_at
- seated_at
- cancelled_at

### waitlist_sequences
날짜별 다음 대기 번호를 관리하기 위한 테이블
- visit_date
- next_queue_number

### wait_settings
날짜별 평균 팀당 소요 시간 관리용 테이블
- date
- avg_min_per_team

---

## 프로젝트 구조 예시
```bash
src/
├─ main/
│  ├─ java/
│  │  └─ com/example/waiting/
│  │     ├─ controller/
│  │     ├─ service/
│  │     ├─ domain/
│  │     ├─ repository/
│  │     └─ dto/
│  └─ resources/
│     └─ application.yml
└─ frontend/
   ├─ src/
   │  ├─ component/
   │  ├─ pages/
   │  ├─ api/
   │  └─ App.jsx
   └─ vite.config.js
```

---

## 실행 방법

### Backend 실행
```bash
./gradlew bootRun
```

### Frontend 실행
```bash
npm install
npm run dev
```

### DB 설정 예시
`application.yml` 또는 `application.properties`에 MariaDB 연결 정보를 입력합니다.

```properties
spring.datasource.url=jdbc:mariadb://localhost:3306/DB명
spring.datasource.username=사용자명
spring.datasource.password=비밀번호
spring.jpa.hibernate.ddl-auto=update
```

---

## 주요 화면 구성 제안
README에 실행 화면을 넣는다면 아래 순서가 가장 자연스럽습니다.

1. 메인/대기 등록 화면  
2. 등록 완료 화면 또는 대기 정보 확인 화면  
3. 관리자 대기열 목록 화면  
4. 호출 처리 화면  
5. 전광판 화면  
6. 요약 대시보드 화면  

예시:

```md
## 실행 화면

### 대기 등록 화면
![대기 등록 화면](images/waiting-create.png)

### 관리자 화면
![관리자 화면](images/admin-waitlist.png)

### 전광판 화면
![전광판 화면](images/display-board.png)
```

---

## 트러블슈팅

### 1. 중복 대기 등록 방지
- **문제**: 같은 고객이 같은 날짜에 여러 번 등록될 수 있는 문제가 발생할 수 있었습니다.
- **원인**: 전화번호 기준 중복 체크가 없거나, 상태값을 고려하지 않은 단순 저장 구조 때문입니다.
- **해결**: 같은 날짜에 `WAITING`, `CALLED` 상태의 대기가 존재하는지 먼저 확인한 뒤 등록하도록 처리했습니다.

### 2. 날짜별 순번 관리
- **문제**: 대기 번호를 단순 auto increment로 두면 날짜가 바뀌어도 번호가 계속 증가해 사용자 경험이 좋지 않았습니다.
- **해결**: 날짜별 시퀀스를 따로 관리하여 매일 독립적인 순번 체계를 만들었습니다.

### 3. 관리자/전광판 실시간 반영
- **문제**: 호출 상태가 바뀌었을 때 화면 반영이 늦거나 불일치가 발생할 수 있었습니다.
- **해결**: 일정 주기로 목록을 다시 조회하는 방식으로 최신 호출 상태를 반영하도록 구성했습니다.

### 4. 프론트엔드-백엔드 API 연결 문제
- **문제**: React 개발 서버와 Spring Boot 서버를 함께 사용할 때 API 경로 및 프록시 설정 문제로 404/405 에러가 발생할 수 있었습니다.
- **해결**: Vite 프록시 설정과 API 메서드(POST/DELETE 등)를 백엔드 엔드포인트와 일치시키도록 수정했습니다.

---

## 담당 역할 예시
아래는 포트폴리오용으로 정리할 때 사용할 수 있는 문장입니다.

- Spring Boot 기반 웨이팅 등록 및 상태 관리 API 구현
- MariaDB 기반 대기열 데이터 모델 설계
- 날짜별 순번 발급 로직 및 중복 대기 방지 로직 구현
- React 기반 사용자/관리자 화면 연동
- 전광판 호출 화면 구성 및 주기적 갱신 처리

> 네 실제 담당 범위에 맞게 수정해서 사용하는 것을 추천합니다.

---

## 회고
이 프로젝트를 통해 단순 CRUD를 넘어서,
실제 서비스 흐름에서 중요한 **상태 관리**, **중복 방지**, **순번 발급 로직**, **운영자 화면 설계**를 함께 고민할 수 있었습니다.  
특히 사용자 화면, 관리자 화면, 전광판 화면처럼 역할이 다른 UI를 하나의 서비스 흐름 안에서 연결해보며,
프론트엔드와 백엔드가 함께 맞물리는 구조를 경험할 수 있었습니다.

---

## 향후 개선 사항
- 카카오톡/SMS 알림 기능 추가
- WebSocket 기반 실시간 호출 반영
- 매장별 멀티 브랜치 지원
- 고객용 대기 현황 조회 페이지 추가
- 관리자 권한 분리 및 통계 기능 고도화

