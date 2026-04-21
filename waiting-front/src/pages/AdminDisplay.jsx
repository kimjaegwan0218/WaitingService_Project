import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { adminRecentCalls } from "../api/admin";
import "./AdminDisplay.css";

function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export default function AdminDisplay() {
  const [date, setDate] = useState(todayISO());
  const [recent, setRecent] = useState([]);
  const [err, setErr] = useState("");

  const qrValue = `http://192.168.0.67:5173/`;
  // // ✅ 전광판 QR: 스캔하면 Home(웨이팅 등록)으로
  // const qrValue = useMemo(() => {
  //   // 원하면 "/waiting" 같은 전용 경로로 바꿔도 됨
  //   return `${window.location.origin}/`;
  // }, []);

  const load = async () => {
    try {
      setErr("");
      const list = await adminRecentCalls({ date, limit: 3 });
      setRecent(list ?? []);
    } catch (e) {
      setErr(e?.response?.data?.message ?? "디스플레이 조회 실패(로그인 확인)");
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  return (
    <div className="container admin-display" style={{ maxWidth: 1200 }}>
      <div className="row-between">
        <h1 className="h1">📣 최근 호출</h1>
        <input
          className="input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ maxWidth: 180 }}
        />
      </div>

      {err && <p className="error">{err}</p>}

      {/* ✅ QR + TOP3 레이아웃 */}
      <div className="display-layout">
        {/* 왼쪽: QR 크게 */}
        <div className="qr-card">
          <div className="qr-title">📱 QR 스캔해서 웨이팅 등록</div>

          <div className="qr-box">
            <QRCode value={qrValue} />
          </div>

          <div className="qr-sub muted">
            스캔 후 전화번호/인원 입력 → 티켓 발급
          </div>

          <div className="qr-link muted">{qrValue}</div>
        </div>

        {/* 오른쪽: 최근 호출 TOP3 (1등 크게, 2~3등 작게) */}
        <div className="calls-card">
          <div className="calls-title muted">최근 호출 TOP 3</div>

          <div className="display-list">
            {recent.length > 0 ? (
              recent.map((x, idx) => (
                <div key={x.id ?? `${x.queueNumber}-${idx}`} className={`display-card rank-${idx}`}>
                  <div className="muted" style={{ fontSize: 14 }}>
                    {idx === 0 ? (
                      <span className="rank-title">
                        <span className="bell">🔔</span> 가장 최근 호출
                      </span>
                    ) : (
                      `최근 호출 ${idx + 1}`
                    )}
                  </div>

                  <div className="display-no">{x.queueNumber}</div>

                  {x.customerName || x.partySize ? (
                    <div className="muted" style={{ marginTop: 6, fontSize: 12 }}>
                      {x.customerName ? `${x.customerName}` : ""}
                      {x.partySize ? ` · ${x.partySize}명` : ""}
                    </div>
                  ) : null}

                  {x.calledAt && (
                    <div className="muted" style={{ marginTop: 6, fontSize: 12 }}>
                      호출시간: {x.calledAt}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="display-card muted" style={{ textAlign: "left" }}>
                아직 호출된 팀이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
