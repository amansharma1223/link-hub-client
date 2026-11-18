import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

const CATEGORIES = ["General", "Social", "Shopping", "Work", "Study", "Entertainment"];

function Admin() {
  const [section, setSection] = useState("overview");
  const [users, setUsers] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [pTitle, setPTitle] = useState("");
  const [pUrl, setPUrl] = useState("");
  const [pCategory, setPCategory] = useState("General");
  const [pError, setPError] = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!localStorage.getItem("token") || user?.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    loadUsers();
    loadPlatforms();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      navigate("/dashboard");
    }
  };

  const loadPlatforms = async () => {
    const res = await API.get("/platforms");
    setPlatforms(res.data);
  };

  const addPlatform = async (e) => {
    e.preventDefault();
    setPError("");
    try {
      await API.post("/platforms", { title: pTitle, url: pUrl, category: pCategory });
      setPTitle("");
      setPUrl("");
      loadPlatforms();
    } catch (err) {
      setPError(err.response?.data?.message || "could not add platform");
    }
  };

  const deletePlatform = async (id) => {
    if (!window.confirm("Remove this platform?")) return;
    await API.delete(`/platforms/${id}`);
    loadPlatforms();
  };
  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user and all their links?")) return;
    try {
      await API.delete(`/admin/users/${id}`);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || "could not delete");
    }
  };

  const changeRole = async (id, role) => {
    try {
      await API.put(`/admin/users/${id}/role`, { role });
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || "could not change role");
    }
  };
  const logout = () => {
    localStorage.clear();
    navigate("/login");
    const deleteUser = async (id) => {
      if (!window.confirm("Is user aur uske sab links ko delete karna hai?")) return;
      try {
        await API.delete(`/admin/users/${id}`);
        loadUsers();
      } catch (err) {
        alert(err.response?.data?.message || "Delete nahi hua");
      }
    };

    const changeRole = async (id, role) => {
      try {
        await API.put(`/admin/users/${id}/role`, { role });
        loadUsers();
      } catch (err) {
        alert(err.response?.data?.message || "Role nahi badla");
      }
    };
  };

  const totalLinks = users.reduce((sum, u) => sum + u.linkCount, 0);

  const menu = [
    { key: "overview", label: "📊 Overview" },
    { key: "users", label: "👥 Users" },
    { key: "platforms", label: "🧩 Platforms" },
  ];

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <h3>Admin Panel</h3>
        {menu.map((m) => (
          <button
            key={m.key}
            className={section === m.key ? "side-item active" : "side-item"}
            onClick={() => setSection(m.key)}
          >
            {m.label}
          </button>
        ))}
        <div className="side-bottom">
          <Link to="/dashboard" className="side-item">← Dashboard</Link>
          <button className="side-item" onClick={logout}>🚪 Logout</button>
        </div>
      </aside>

      <main className="admin-main">
        {section === "overview" && (
          <>
            <h2>Overview</h2>
            <div className="stats">
              <div className="stat"><b>{users.length}</b>Total Users</div>
              <div className="stat"><b>{totalLinks}</b>Total Links</div>
              <div className="stat"><b>{platforms.length}</b>Platforms</div>
            </div>
          </>
        )}
        <table>
          <thead>
            <tr>
              <th>Naam</th>
              <th>Email</th>
              <th>Role</th>
              <th>Links</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.linkCount}</td>
                <td>
                  {u._id !== user?.id && (
                    <>
                      <button
                        className="chip"
                        onClick={() =>
                          changeRole(u._id, u.role === "admin" ? "user" : "admin")
                        }
                      >
                        {u.role === "admin" ? "Remove Admin" : "Make Admin"}
                      </button>{" "}
                      <button className="chip" onClick={() => deleteUser(u._id)}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {section === "platforms" && (
          <>
            <h2>Platform Catalog</h2>
            <form className="add-form" onSubmit={addPlatform}>
              <input
                placeholder="Platform ka naam"
                value={pTitle}
                onChange={(e) => setPTitle(e.target.value)}
              />
              <input
                placeholder="https://www.lenskart.com"
                value={pUrl}
                onChange={(e) => setPUrl(e.target.value)}
              />
              <select value={pCategory} onChange={(e) => setPCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <button type="submit">Add Platform</button>
            </form>
            {pError && <div className="error">{pError}</div>}

            <div className="grid">
              {platforms.map((p) => (
                <div className="card" key={p._id}>
                  <button className="del" onClick={() => deletePlatform(p._id)}>✕</button>
                  <img src={p.iconUrl} alt={p.title} />
                  <div>{p.title}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Admin;