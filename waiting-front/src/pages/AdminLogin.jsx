import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin=() =>{
  const nav = useNavigate();
  const [id, setId] = useState("admin");
  const [pw, setPw] = useState("1234");

  const login = (e) => {
    e.preventDefault();
    const token = "Basic " + btoa(`${id}:${pw}`);
    localStorage.setItem("adminBasicToken", token);
    nav("/admin");
  };

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <h1 className="h1">🔒 관리자 로그인(BasicAuth)</h1>

      <div className="card">
        <form onSubmit={login} className="form">
          <input
            className="input"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="ID"
          />
          <input
            className="input"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="PW"
            type="password"
          />
          <button className="btn btn-primary" type="submit">
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
export default AdminLogin;