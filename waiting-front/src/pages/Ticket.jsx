import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { cancelWaitlist, getWaitlistDetail } from "../api/waitlist";
import { playBeep } from "../utils/beep";
import { getWaitTimeSetting } from "../api/setting";

const statusLabel = {
  WAITING: "대기중",
  CALLED: "호출됨",
  SEATED: "입장완료",
  CANCELLED: "취소",
  NO_SHOW: "노쇼",
};

const DEFAULT_AVG_MIN = 7;

function formatEtaMinutes(min) {
  if (min <= 1) return "곧 입장";
  if (min < 60) return `약 ${min}분`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `약 ${h}시간` : `약 ${h}시간 ${m}분`;
}

// (선택) 시스템 알림: 로컬호스트/https에서 동작
async function notifySystem(title, body) {
  try {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  } catch {
    // 무시
  }
}

export default function Ticket() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [avgMin, setAvgMin] = useState(DEFAULT_AVG_MIN);

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔔 소리 on/off
  const [soundOn, setSoundOn] = useState(() => {
    const v = localStorage.getItem("soundOn");
    return v === null ? true : v === "true";
  });

  // ✅ 토스트
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const showToast = (title, desc, type = "info") => {
    setToast({ title, desc, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  };

  // ✅ 알림 중복 방지(새로고침해도 1번만)
  const preKey = `preNotified:${id}`;
  const callKey = `calledNotified:${id}`;

  // ✅ 평균시간: 같은 날짜면 재호출 방지
  const lastDateRef = useRef(null);

  const load = async () => {
    try {
      setErr("");

      // 1) 상세 조회
      const d = await getWaitlistDetail(id);

      // 정규화
      const st = String(d.status ?? "").trim().toUpperCase();
      const ahead = Number(d.aheadCount ?? 0);

      // 2) visitDate 기준 평균시간 불러오기(한 번만)
      const vd = d?.visitDate; // "YYYY-MM-DD"
      if (vd && lastDateRef.current !== vd) {
        lastDateRef.current = vd;
        try {
          const s = await getWaitTimeSetting(vd);
          setAvgMin(Number(s?.avgMinPerTeam ?? DEFAULT_AVG_MIN));
        } catch {
          setAvgMin(DEFAULT_AVG_MIN);
        }
      }

      // ✅ 1) 앞에 1팀 남았을 때(= WAITING이고 aheadCount === 1)
      if (st === "WAITING" && ahead === 1 && localStorage.getItem(preKey) !== "1") {
        localStorage.setItem(preKey, "1");
        showToast("곧 호출됩니다", "앞에 1팀 남았어요. 주변에서 대기해주세요.", "warn");
        if (soundOn) playBeep({ freq: 660, durationMs: 120, volume: 0.05 });
      }

      // ✅ 2) 호출(CALLED) 되었을 때
      if (st === "CALLED" && localStorage.getItem(callKey) !== "1") {
        localStorage.setItem(callKey, "1");
        showToast("지금 입장해주세요", "호출되었습니다. 카운터로 와주세요!", "success");
        if (soundOn) playBeep({ freq: 880, durationMs: 160, volume: 0.06 });
        await notifySystem("웨이팅 호출", `${d.queueNumber}번 고객님, 지금 입장해주세요!`);
      }

      setData({ ...d, status: st, aheadCount: ahead });
      setLoading(false);
    } catch (e) {
      setErr(e?.response?.data?.message ?? "조회 실패");
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, soundOn]);

  const onCancel = async () => {
    if (!window.confirm("취소할까요?")) return;
    try {
      await cancelWaitlist(id);
      localStorage.removeItem(preKey);
      localStorage.removeItem(callKey);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message ?? "취소 실패");
    }
  };

  const toggleSound = async () => {
    const next = !soundOn;
    setSoundOn(next);
    localStorage.setItem("soundOn", String(next));
    if (next) await playBeep({ freq: 520, durationMs: 70, volume: 0.04 }); // 예열
  };

  if (loading) return <div className="container">로딩중...</div>;
  if (err) return <div className="container error">{err}</div>;
  if (!data) return null;

  const canCancel = data.status === "WAITING" || data.status === "CALLED";

  // ✅ 호출되었으면 ETA는 0(곧 입장)으로 고정
  const etaMin =
    data.status === "CALLED"
      ? 0
      : Math.max(0, Number(data.aheadCount ?? 0) * Number(avgMin ?? DEFAULT_AVG_MIN));

  return (
    <div className="container">
      <div className="row-between">
        <h1 className="h1">🎟️ 내 웨이팅</h1>
        <button className="btn" onClick={toggleSound}>
          {soundOn ? "🔔 소리 ON" : "🔕 소리 OFF"}
        </button>
      </div>

      <div className="card">
        <div className="row-between">
          <span className="muted">상태</span>
          <span className={`badge badge-${data.status}`}>
            {statusLabel[data.status] ?? data.status}
          </span>
        </div>

        <div className="row-between" style={{ marginTop: 12 }}>
          <span className="muted">대기번호</span>
          <span className="big-no">{data.queueNumber}</span>
        </div>

        <div className="row-between" style={{ marginTop: 10 }}>
          <span className="muted">내 앞 대기팀</span>
          <b>{data.aheadCount}</b>
        </div>

        {/* ✅ 지금 적용중인 평균값도 같이 보여주면 디버깅에 좋음
        <div className="row-between" style={{ marginTop: 10 }}>
          <span className="muted">평균(분/팀)</span>
          <b>{avgMin}</b>
        </div> */}

        <div className="row-between" style={{ marginTop: 10 }}>
          <span className="muted">예상 대기시간</span>
          <b>{formatEtaMinutes(etaMin)}</b>
        </div>

        <div className="muted" style={{ marginTop: 12, fontSize: 12 }}>
          <div>등록: {data.createdAt}</div>
          {data.calledAt ? <div>호출: {data.calledAt}</div> : null}
        </div>

        <div style={{ marginTop: 12 }}>
          <button
            className={`btn ${canCancel ? "btn-danger" : ""}`}
            disabled={!canCancel}
            onClick={onCancel}
          >
            웨이팅 취소
          </button>
        </div>
      </div>

      {/* ✅ 토스트 렌더 */}
      <div className="toast-wrap">
        {toast && (
          <div className={`toast toast-${toast.type}`}>
            <div className="toast-title">{toast.title}</div>
            <div className="toast-desc">{toast.desc}</div>
          </div>
        )}
      </div>
    </div>
  );
}