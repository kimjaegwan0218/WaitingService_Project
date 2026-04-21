// src/api/admin.js
import { adminApi } from "./client";

export async function adminList({ date, status }) {
  const params = new URLSearchParams();
  params.set("date", date);
  if (status) params.set("status", status);
  const { data } = await adminApi.get(`/api/admin/waitlists?${params.toString()}`);
  return data;
}

export async function adminCallNext(date) {
  const { data } = await adminApi.post(`/api/admin/waitlists/call-next?date=${date}`);
  return data;
}

export async function adminCall(id) {
  const { data } = await adminApi.post(`/api/admin/waitlists/${id}/call`);
  return data;
}

export async function adminSeat(id) {
  const { data } = await adminApi.post(`/api/admin/waitlists/${id}/seat`);
  return data;
}

export async function adminNoShow(id) {
  const { data } = await adminApi.post(`/api/admin/waitlists/${id}/no-show`);
  return data;
}

export async function adminCancel(id) {
  const { data } = await adminApi.post(`/api/admin/waitlists/${id}/cancel`);
  return data;
}

export async function adminLatestCalled({ date }) {
  const res = await adminApi.get("/api/admin/waitlists/latest-called", { params: { date } });
  return res.data; // null 가능
}

export async function adminRecentCalls({ date, limit = 3 }) {
  const res = await adminApi.get("/api/admin/waitlists/recent-calls", {
    params: { date, limit },
  });
  return res.data; // 배열
}

/** ✅ 평균 대기시간 설정(관리자) */
export async function adminGetWaitTime({ date }) {
  // ✅ 백엔드: /api/admin/settings/wait-time
  const res = await adminApi.get("/api/admin/settings/wait-time", { params: { date } });
  return res.data; // { date, avgMinPerTeam }
}

export async function adminSaveWaitTime({ date, avgMinPerTeam }) {
  // ✅ 백엔드: /api/admin/settings/wait-time
  const res = await adminApi.put(
    "/api/admin/settings/wait-time",
    { avgMinPerTeam },
    { params: { date } }
  );
  return res.data;
}