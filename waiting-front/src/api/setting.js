import axios from "axios";

export async function getWaitTimeSetting(date) {
  const res = await axios.get("/api/settings/wait-time", { params: { date } });
  return res.data; // { date, avgMinPerTeam }
}