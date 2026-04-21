import { useEffect, useMemo, useState } from "react";
import {
  adminCall,
  adminCallNext,
  adminCancel,
  adminList,
  adminNoShow,
  adminSeat,
} from "../api/admin";
import { adminGetWaitTime,adminSaveWaitTime } from "../api/admin";



function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

const statusLabel = {
  WAITING: "대기중",
  CALLED: "호출됨",
  SEATED: "입장완료",
  CANCELLED: "취소",
  NO_SHOW: "노쇼",
};

const STATUSES = ["WAITING", "CALLED", "SEATED", "CANCELLED", "NO_SHOW"];

export default function AdminDashboard() {
  const [date, setDate] = useState(todayISO());
  const [status, setStatus] = useState("WAITING");
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [avgMin,setAvgMin]=useState(7);
  const [savingAvg, setSavingAvg]= useState(false);

  const [q, setQ] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(() => {
    const v = localStorage.getItem("adminAutoRefresh");
    return v === null ? true : v === "true";
  });

  // ✅ 탭별 건수
  const [counts, setCounts] = useState(() =>
    Object.fromEntries(STATUSES.map((s) => [s, 0]))
  );

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await adminList({ date, status });
      setItems(data);
    } catch (e) {
      setErr(e?.response?.data?.message ?? "관리자 조회 실패 (로그인/권한 확인)");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 탭별 카운트는 상태별로 병렬 호출(정확)
  const loadCounts = async () => {
    try {
      const results = await Promise.all(
        STATUSES.map((s) => adminList({ date, status: s }))
      );
      const next = {};
      STATUSES.forEach((s, idx) => {
        next[s] = results[idx]?.length ?? 0;
      });
      setCounts(next);
    } catch {
      // 카운트는 실패해도 화면 유지
    }
  };

  useEffect(() => {
    load();
    loadCounts();
    (async () =>{
      try{
        const s = await adminGetWaitTime({date});
        setAvgMin(s.avgMinPerTeam ?? 7);
      }catch{
        // 불러오지 못해도 기본값 유지
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, status]);

  // ✅ 자동 새로고침: 목록 + 카운트 같이
  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(() => {
      load();
      loadCounts();
    }, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, date, status]);

  const callNext = async () => {
    setErr("");
    try {
      await adminCallNext(date);
      await load();
      await loadCounts();
    } catch (e) {
      setErr(e?.response?.data?.message ?? "call-next 실패");
    }
  };

  const act = async (fn) => {
    setErr("");
    try {
      await fn();
      await load();
      await loadCounts();
    } catch (e) {
      setErr(e?.response?.data?.message ?? "처리 실패");
    }
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((w) => {
      const no = String(w.queueNumber ?? "");
      const name = String(w.customerName ?? "").toLowerCase();
      const phone = String(w.phone ?? "").toLowerCase();
      return no.includes(s) || name.includes(s) || phone.includes(s);
    });
  }, [items, q]);

  const toggleAuto = () => {
    const next = !autoRefresh;
    setAutoRefresh(next);
    localStorage.setItem("adminAutoRefresh", String(next));
  };

  return (
    <div className="container" style={{ maxWidth: 1100 }}>
      <div className="header-card">
        <div className="page-head">
          <div className="page-title">
            <h1 className="h1">🧑‍🍳 관리자 웨이팅</h1>
            <div className="subtitle">상태별 탭 · 검색 · 자동 새로고침</div>
          </div>

          <div className="head-actions">
            <input
              className="input"
              style={{ maxWidth: 180 }}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <div className="btn-group">
              <button className="btn btn-primary big" onClick={callNext}>
                Call Next
              </button>
              <button className="btn" onClick={() => { load(); loadCounts(); }} disabled={loading}>
                {loading ? "로딩..." : "새로고침"}
              </button>
              <button className="btn" onClick={() => window.open("/admin/display", "_blank")}>
                전광판
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
  <div className="muted">평균 처리시간(분/팀)</div>
  <input
    className="input"
    type="number"
    min={1}
    max={60}
    value={avgMin}
    onChange={(e) => setAvgMin(Number(e.target.value))}
    style={{ width: 120 }}
  />
  <button
    className="btn"
    disabled={savingAvg}
    onClick={async () => {
      try {
        setSavingAvg(true);
        await adminSaveWaitTime({ date, avgMinPerTeam: avgMin });
      } catch (e) {
        console.log("saveWaitTime err:", e);
  console.log("status:", e?.response?.status);
  console.log("data:", e?.response?.data);
  setErr(e?.response?.data?.message ?? `저장 실패 (${e?.response?.status ?? "NETWORK"})`);
      } finally {
        setSavingAvg(false);
      }
    }}
  >
    {savingAvg ? "저장중..." : "저장"}
  </button>
</div>
        <div className="tabs-bar">
          <div className="tabs-left">
            {STATUSES.map((t) => (
              <button
                key={t}
                onClick={() => setStatus(t)}
                className={`tab ${status === t ? "active" : ""}`}
              >
                {t} <span className="muted">({counts[t] ?? 0})</span>
                
                
              </button>
              
              
            ))}
          </div>

          <div className="tabs-right">
            <div className="search">
              <input
                className="input"
                placeholder="검색: 번호/이름/전화"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <label className="switch">
              <input type="checkbox" checked={autoRefresh} onChange={toggleAuto} />
              자동 새로고침
            </label>

            <div className="pill">
              <span className="muted">표시</span>
              <b>{filtered.length}</b>
              <span className="muted">건</span>
            </div>
          </div>
        </div>

        {err && <p className="error">{err}</p>}
      </div>

      <div className="table">
        <div className="table-head">
          <div>번호</div>
          <div>상태</div>
          <div>고객</div>
          <div>등록시간</div>
          <div className="right">액션</div>
        </div>

        {filtered.map((w) => (
          <div key={w.id} className="table-row">
            <div className="cell-strong">#{w.queueNumber}</div>

            <div>
              <span className={`badge badge-${String(w.status ?? "").toUpperCase()}`}>
                {statusLabel[w.status] ?? w.status}
              </span>
            </div>

            <div>
              <div style={{ fontWeight: 800 }}>
                {w.customerName} ({w.partySize}명)
              </div>
              <div className="cell-muted">{w.phone}</div>
            </div>

            <div className="cell-muted">{w.createdAt}</div>

            <div className="cell-actions">
              {w.status === "WAITING" && (
                <button className="btn" onClick={() => act(() => adminCall(w.id))}>
                  호출
                </button>
              )}

              {w.status === "CALLED" && (
                <>
                  <button className="btn btn-primary" onClick={() => act(() => adminSeat(w.id))}>
                    입장
                  </button>
                  <button className="btn" onClick={() => act(() => adminNoShow(w.id))}>
                    노쇼
                  </button>
                </>
              )}

              {(w.status === "WAITING" || w.status === "CALLED") && (
                <button className="btn btn-danger" onClick={() => act(() => adminCancel(w.id))}>
                  취소
                </button>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ padding: 16 }} className="muted">
            표시할 항목이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
