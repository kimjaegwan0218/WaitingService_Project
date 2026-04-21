// src/pages/Home.jsx
import { useEffect, useMemo, useState } from "react";
import { createWaitlist, getWaitlistSummary } from "../api/waitlist";
import { useNavigate } from "react-router-dom";
import "./home.css";

function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function formatEtaMinutes(min) {
  const m = Math.max(0, Math.floor(min));
  if (m <= 1) return "지금 바로 입장해주세요!";
  if (m < 60) return `약 ${m}분`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r === 0 ? `약 ${h}시간` : `약 ${h}시간 ${r}분`;
}

export default function Home() {
  const nav = useNavigate();

  const [form, setForm] = useState({ name: "", phone: "", partySize: 2 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [summary, setSummary] = useState(null);
  const [sumErr, setSumErr] = useState("");

  const date = useMemo(() => todayISO(), []);

  const loadSummary = async () => {
    try {
      setSumErr("");
      const s = await getWaitlistSummary(date);
      setSummary(s);
    } catch (e) {
      setSumErr(e?.response?.data?.message ?? "대기현황 조회 실패");
      setSummary(null);
    }
  };

  useEffect(() => {
    loadSummary();
    const t = setInterval(loadSummary, 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const waitingCount = Number(summary?.waitingCount ?? 0);
  const calledCount = Number(summary?.calledCount ?? 0);
  const avgMinPerTeam = Number(summary?.avgMinPerTeam ?? 7);

  const totalQueueTeams = waitingCount + calledCount;

  const etaText = useMemo(() => {
    return formatEtaMinutes(totalQueueTeams * avgMinPerTeam);
  }, [totalQueueTeams, avgMinPerTeam]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]: name === "partySize" ? Number(value) : value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await createWaitlist(form);
      localStorage.setItem("lastWaitlistId", String(res.waitlistId));
      nav(`/ticket/${res.waitlistId}`);
      await loadSummary();
    } catch (e2) {
      setErr(e2?.response?.data?.message ?? "등록 실패");
    } finally {
      setLoading(false);
    }
  };

  const goLast = () => {
    const id = localStorage.getItem("lastWaitlistId");
    if (id) nav(`/ticket/${id}`);
    else setErr("저장된 티켓이 없습니다.");
  };

  return (
    <div className="container home-container">
      {/* ✅ 로고를 h1 위로 */}
      <div className="home-logo" aria-label="logo">
        <div className="home-logo-badge">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="10" cy="12" r="6" stroke="currentColor" strokeWidth="1.7" opacity="0.9" />
            <circle cx="10" cy="12" r="2.3" stroke="currentColor" strokeWidth="1.7" opacity="0.9" />
            <path
              d="M14.2 9.2h5.1a1.2 1.2 0 0 1 1.2 1.2v1.0a1.1 1.1 0 0 0 0 2.2v1.0a1.2 1.2 0 0 1-1.2 1.2h-5.1a1.2 1.2 0 0 1-1.2-1.2v-5.4a1.2 1.2 0 0 1 1.2-1.2Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <path
              d="M16 10.6v4.8"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeDasharray="1.5 2.2"
              opacity="0.7"
            />
          </svg>
        </div>

        <div className="home-logo-text">
          <div className="home-logo-title">WAITING</div>
          <div className="home-logo-sub muted">Register · Track</div>
        </div>
      </div>

      <h1 className="h1 home-title">🍽️ 웨이팅 등록</h1>

      {/* ✅ 전체 대기현황 카드 */}
      <div className="card home-summary-card">
        <div className="row-between">
          <div className="muted">현재 대기열</div>
          <b className="home-summary-big">{totalQueueTeams}팀</b>
        </div>

        {summary && (
          <div className="row-between home-summary-row">
            <span className="muted">예상 대기시간</span>
            <b>{etaText}</b>
          </div>
        )}

        {sumErr && <p className="error home-summary-err">{sumErr}</p>}
      </div>

      {/* 등록 폼 */}
      <div className="card">
        <form onSubmit={submit} className="form">
          <input
            className="input"
            name="phone"
            placeholder="전화번호"
            value={form.phone}
            onChange={onChange}
            required
          />

          <div className="ee">인원 수</div>
          <input
            className="input"
            name="partySize"
            type="number"
            min={1}
            max={20}
            value={form.partySize}
            onChange={onChange}
            required
          />

          <button className="btn btn-primary" disabled={loading} type="submit">
            {loading ? "등록중..." : "웨이팅 등록"}
          </button>
        </form>

        <button className="btn" onClick={goLast} style={{ marginTop: 12 }}>
          내 웨이팅 보기(마지막)
        </button>

        {err && <p className="error">{err}</p>}
      </div>
    </div>
  );
}
