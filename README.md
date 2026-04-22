# Waiting Service Project

식당·매장 환경에서 사용할 수 있는 **웨이팅 관리 서비스**입니다.  
손님은 전화번호와 인원 수를 입력해 웨이팅을 등록하고, 자신의 대기 상태와 예상 대기시간을 확인할 수 있습니다. 관리자는 호출·입장·노쇼·취소를 처리하고, 전광판 화면에서는 최근 호출 번호와 QR 등록 화면을 함께 노출할 수 있습니다.

---

## 프로젝트 소개

이 프로젝트는 **손님용 등록 페이지**, **내 웨이팅 확인 페이지**, **관리자 대시보드**, **전광판 화면**으로 구성되어 있습니다.

핵심 목표는 다음과 같습니다.

- 손님이 현장에서 빠르게 웨이팅 등록하기
- 현재 대기열 기반으로 예상 대기시간 제공하기
- 관리자가 번호 호출과 상태 변경을 쉽게 처리하기
- 전광판으로 최근 호출 번호를 한눈에 보여주기
- 같은 날짜에 중복 웨이팅이 등록되지 않도록 관리하기

---

## 주요 기능

### 1. 손님 웨이팅 등록
- 전화번호와 인원 수를 입력해 웨이팅 등록
- 등록 시 당일 기준 대기번호 자동 발급
- 등록 후 티켓 페이지로 이동
- 마지막으로 조회한 티켓 ID를 `localStorage`에 저장

```text
화면 추천 이미지 위치
- 메인 웨이팅 등록 화면
- 등록 완료 후 티켓 이동 화면
```

### 2. 실시간 대기 현황 및 예상 시간 제공
- 메인 화면에서 현재 대기팀 수 확인
- `WAITING + CALLED` 팀 수를 기준으로 예상 대기시간 계산
- 평균 처리시간(기본 7분/팀)을 반영해 손님에게 안내
- 메인 화면은 3초마다 자동 갱신

```text
화면 추천 이미지 위치
- 현재 대기열 카드
- 예상 대기시간 표시 화면
```

### 3. 내 웨이팅 티켓 조회
- 대기번호, 상태, 내 앞 대기팀 수, 예상 대기시간 표시
- 상태값: `WAITING`, `CALLED`, `SEATED`, `CANCELLED`, `NO_SHOW`
- 호출 직전(앞에 1팀 남았을 때) 토스트 알림 제공
- 호출 시 브라우저 알림 + 소리 알림 제공
- `WAITING`, `CALLED` 상태에서는 손님이 직접 취소 가능
- 티켓 화면은 3초마다 자동 갱신

```text
화면 추천 이미지 위치
- 내 웨이팅 티켓 화면
- 호출 알림 또는 상태 변경 화면
```

### 4. 관리자 대시보드
- 날짜별 웨이팅 목록 조회
- 상태별 탭(`WAITING`, `CALLED`, `SEATED`, `CANCELLED`, `NO_SHOW`) 제공
- 검색 기능(번호 / 이름 / 전화번호)
- 자동 새로고침 on/off
- `Call Next` 버튼으로 가장 빠른 대기팀 호출
- 개별 항목에 대해 호출 / 입장 / 노쇼 / 취소 처리 가능
- 날짜별 평균 처리시간(분/팀) 저장 가능

```text
화면 추천 이미지 위치
- 관리자 전체 대시보드
- 상태별 탭 화면
- 평균 처리시간 저장 화면
```

### 5. 전광판 화면
- 최근 호출 TOP 3 표시
- 가장 최근 호출 번호를 강조 표시
- QR 코드 스캔으로 손님 등록 화면 연결
- 2초마다 최근 호출 목록 자동 갱신

```text
화면 추천 이미지 위치
- 전광판 전체 화면
- QR 코드 + 최근 호출 번호 화면
```

---

## 기술 스택

### Backend
- Java 22
- Spring Boot 3.5.1
- Spring Web
- Spring Data JPA
- Spring Security
- Spring Validation
- QueryDSL 5.0.0
- ModelMapper
- Thymeleaf
- Thymeleaf Layout Dialect
- MariaDB

### Frontend
- React 19
- Vite 7
- React Router DOM 7
- Axios
- react-qr-code

### Tools
- Gradle
- IntelliJ IDEA
- npm

---

## 시스템 구조

```text
[React + Vite]
   ├─ 손님 등록 화면
   ├─ 티켓 조회 화면
   ├─ 관리자 대시보드
   └─ 전광판 화면
          ↓ /api 호출
[Spring Boot API]
   ├─ 웨이팅 등록/조회/취소
   ├─ 관리자 상태 변경
   ├─ 평균 대기시간 설정
   └─ 보안(Basic Auth)
          ↓
[MariaDB]
   ├─ waitlists
   ├─ waitlist_sequences
   └─ wait_settings
```

---

## 핵심 비즈니스 로직

### 1. 같은 날짜 중복 웨이팅 방지
같은 전화번호로 같은 날짜에 `WAITING` 또는 `CALLED` 상태가 이미 존재하면 새 등록을 막습니다.

### 2. 대기번호 자동 발급
`waitlist_sequences` 테이블에서 날짜별 다음 번호를 관리해, 당일 대기번호를 순차 발급합니다.

### 3. 예상 대기시간 계산
- 기본 평균 처리시간: **7분 / 팀**
- 계산 기준: `현재 WAITING 팀 수 + CALLED 팀 수`
- 관리자 페이지에서 날짜별 평균 처리시간을 **1~60분** 범위로 수정 가능

### 4. 상태 변경 흐름
기본 흐름은 아래와 같습니다.

```text
WAITING → CALLED → SEATED
                 └→ NO_SHOW
WAITING / CALLED → CANCELLED
```

### 5. 손님 알림 UX
- 앞에 1팀 남으면 토스트 알림
- 호출되면 소리 알림 + 브라우저 시스템 알림
- 알림 중복 발생을 줄이기 위해 `localStorage` 사용

---

## 데이터베이스 구조

### 1. waitlists
웨이팅 핵심 정보 저장 테이블

- `waitlist_id` : PK
- `visit_date` : 방문 날짜
- `queue_number` : 대기번호
- `customer_name` : 고객명
- `phone` : 전화번호
- `party_size` : 인원 수
- `status` : 상태값
- `created_at` : 등록 시간
- `called_at` : 호출 시간
- `seated_at` : 입장 시간
- `cancelled_at` : 취소 시간
- `note` : 메모

특징
- `(visit_date, queue_number)` 유니크 제약
- 날짜/상태/번호, 날짜/전화번호 인덱스 구성

### 2. waitlist_sequences
날짜별 다음 대기번호를 관리하는 테이블

- `visit_date` : PK
- `next_number` : 다음 발급 번호

### 3. wait_settings
날짜별 평균 처리시간 설정 테이블

- `visit_date` : PK
- `avg_min_per_team` : 팀당 평균 처리 시간
- `updated_at` : 수정 시간

---

## API 요약

### 손님용 API

#### 웨이팅 등록
`POST /api/waitlists`

```json
{
  "name": "홍길동",
  "phone": "010-1234-5678",
  "partySize": 2
}
```

#### 웨이팅 상세 조회
`GET /api/waitlists/{id}`

#### 웨이팅 취소
`DELETE /api/waitlists/{id}/cancel`

#### 요약 정보 조회
`GET /api/waitlists/summary?date=2026-04-22`

#### 평균 처리시간 조회
`GET /api/settings/wait-time?date=2026-04-22`

---

### 관리자 API

> `/api/admin/**` 경로는 Basic Auth가 필요합니다.

#### 목록 조회
`GET /api/admin/waitlists?date=2026-04-22&status=WAITING`

#### 다음 팀 호출
`POST /api/admin/waitlists/call-next?date=2026-04-22`

#### 개별 호출
`POST /api/admin/waitlists/{id}/call`

#### 입장 처리
`POST /api/admin/waitlists/{id}/seat`

#### 노쇼 처리
`POST /api/admin/waitlists/{id}/no-show`

#### 관리자 취소
`POST /api/admin/waitlists/{id}/cancel`

#### 최근 호출 1건
`GET /api/admin/waitlists/latest-called?date=2026-04-22`

#### 최근 호출 목록
`GET /api/admin/waitlists/recent-calls?date=2026-04-22&limit=3`

#### 평균 처리시간 조회/수정
- `GET /api/admin/settings/wait-time?date=2026-04-22`
- `PUT /api/admin/settings/wait-time?date=2026-04-22`

---

## 디렉터리 구조

### Backend

```bash
waiting/
├─ build.gradle
├─ settings.gradle
├─ gradlew
├─ src/
│  └─ main/
│     ├─ java/com/example/waiting/
│     │  ├─ config/
│     │  │  └─ SecurityConfig.java
│     │  ├─ controller/
│     │  │  ├─ WaitlistController.java
│     │  │  ├─ AdminWaitlistController.java
│     │  │  ├─ SettingController.java
│     │  │  └─ AdminSettingController.java
│     │  ├─ domain/
│     │  │  ├─ WaitList.java
│     │  │  ├─ WaitListSequence.java
│     │  │  ├─ WaitSetting.java
│     │  │  └─ enums/WaitListStatus.java
│     │  ├─ dto/
│     │  │  ├─ WaitTimeSettingRequest.java
│     │  │  ├─ WaitTimeSettingResponse.java
│     │  │  └─ WaitlistSummaryResponse.java
│     │  ├─ repository/
│     │  │  ├─ WaitListRepository.java
│     │  │  ├─ WaitListSequenceRepository.java
│     │  │  └─ WaitSettingRepository.java
│     │  ├─ service/
│     │  │  ├─ WaitListService.java
│     │  │  └─ WaitSettingService.java
│     │  └─ WaitingApplication.java
│     └─ resources/
│        └─ application.properties
```

### Frontend

```bash
waiting-front/
├─ package.json
├─ vite.config.js
├─ src/
│  ├─ api/
│  │  ├─ client.js
│  │  ├─ waitlist.js
│  │  ├─ admin.js
│  │  └─ setting.js
│  ├─ pages/
│  │  ├─ Home.jsx
│  │  ├─ Ticket.jsx
│  │  ├─ AdminLogin.jsx
│  │  ├─ AdminDashboard.jsx
│  │  └─ AdminDisplay.jsx
│  ├─ utils/
│  │  └─ beep.js
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ styles.css
```

---

## 실행 방법

## 1. Backend 실행

### application.properties 예시
```properties
spring.application.name=waiting
server.port=8082
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
spring.datasource.url=jdbc:mariadb://localhost:3306/dbrw
spring.datasource.username=YOUR_DB_USER
spring.datasource.password=YOUR_DB_PASSWORD

spring.security.user.name=admin
spring.security.user.password=1234
spring.security.user.roles=ADMIN

spring.jpa.hibernate.ddl-auto=update
```

### 실행 명령어
```bash
cd waiting
./gradlew bootRun
```

Windows:
```bash
gradlew.bat bootRun
```

기본 실행 포트:
- Backend: `http://localhost:8082`

---

## 2. Frontend 실행

```bash
cd waiting-front
npm install
npm run dev
```

기본 실행 포트:
- Frontend: `http://localhost:5173`

Vite 개발 서버에서 `/api` 요청은 백엔드(`http://localhost:8082`)로 프록시됩니다.

---

## 3. 관리자 로그인

현재 프론트는 Basic Auth 토큰을 로컬 스토리지에 저장하는 방식으로 관리자 요청을 보냅니다.

예시 계정(현재 로컬 설정 기준):
- ID: `admin`
- PW: `1234`

> 운영 환경에서는 반드시 별도 계정 관리 및 보안 설정이 필요합니다.

---

## 화면 구성 추천

README에 실행 화면을 넣는다면 아래 순서가 가장 보기 좋습니다.

### 1. 프로젝트 소개 아래
- 대표 메인 화면 1장

```md
![메인 화면](images/home.png)
```

### 2. 손님 기능 섹션
- 웨이팅 등록 화면
- 내 웨이팅 티켓 화면
- 호출 알림 상태 화면

```md
## 손님 기능
![웨이팅 등록](images/waiting-register.png)
![티켓 조회](images/ticket.png)
```

### 3. 관리자 기능 섹션
- 관리자 대시보드
- 상태 탭별 목록
- Call Next 동작 화면

```md
## 관리자 기능
![관리자 대시보드](images/admin-dashboard.png)
```

### 4. 전광판 섹션
- QR 코드 + 최근 호출 TOP3 화면

```md
## 전광판
![전광판](images/admin-display.png)
```

이미지는 보통 프로젝트 루트에 `images/` 폴더를 만들어 관리하면 깔끔합니다.

```bash
waiting-project/
├─ README.md
└─ images/
   ├─ home.png
   ├─ ticket.png
   ├─ admin-dashboard.png
   └─ admin-display.png
```

---

## 트러블슈팅 포인트

### 1. 중복 웨이팅 등록 방지
같은 날짜, 같은 전화번호로 이미 활성 웨이팅이 있는 경우 중복 등록을 막아야 했습니다.  
이를 위해 `WAITING`, `CALLED` 상태를 활성 상태로 보고 중복 여부를 검사했습니다.

### 2. 날짜별 대기번호 발급
단순히 전체 최대 번호를 사용하는 대신, 날짜별 시퀀스 테이블을 분리해 당일 번호를 순차적으로 발급하도록 구성했습니다.

### 3. 예상 대기시간 정확도 개선
고정 시간 대신 관리자 페이지에서 날짜별 평균 처리시간을 직접 수정할 수 있게 해, 매장 상황에 따라 더 현실적인 ETA를 제공할 수 있도록 했습니다.

### 4. 실시간 UX 개선
티켓 화면과 메인 화면, 전광판 화면에 자동 새로고침을 적용해 상태 변화를 빠르게 반영하도록 했습니다.  
또한 호출 직전/호출 시 토스트, 사운드, 브라우저 알림을 적용해 사용자가 호출을 놓치지 않도록 보완했습니다.

---

## 개선 아이디어

- 카카오톡 / SMS 알림 연동
- 관리자 인증을 JWT 또는 세션 기반으로 고도화
- 웨이팅 이력 통계 대시보드 추가
- 예상 대기시간 계산 로직 고도화
- 매장별 멀티 브랜치 지원
- 손님명 입력 및 검증 UX 개선

---

## 회고

이 프로젝트는 단순한 CRUD를 넘어서 **실제 매장 운영 흐름**을 반영하려고 했다는 점에 의미가 있습니다.  
특히 다음과 같은 부분을 구현하며 서비스 관점의 설계를 경험할 수 있었습니다.

- 날짜별 대기번호 발급 구조 설계
- 상태 전이 기반 운영 흐름 구현
- 손님/관리자/전광판 역할 분리
- 자동 갱신과 알림을 통한 실시간 UX 구성
- 평균 대기시간 설정과 같은 운영 편의 기능 반영

---

## 작성자
- 김재관

