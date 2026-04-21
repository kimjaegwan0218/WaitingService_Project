import { api } from "./client";

export async function createWaitlist({name, phone, partySize}) {
    const {data} = await api.post("/api/waitlists", {name , phone, partySize});
    return data; // {waitlistId, visitDate, queueNumber, status}
}

export async function getWaitlistDetail(id) {
    const {data} = await api.get(`/api/waitlists/${id}`);
    return data; // WaitlistDetail record
}

export async function cancelWaitlist(id) {
    await api.delete(`/api/waitlists/${id}/cancel`);
}

// ✅ 추가: 메인 요약
export async function getWaitlistSummary(date) {
  const { data } = await api.get("/api/waitlists/summary", { params: { date } });
  return data; // { date, waitingCount, calledCount, avgMinPerTeam }
}