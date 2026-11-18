import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

const CATEGORIES = ["General", "Social", "Shopping", "Work", "Study", "Entertainment"];

function Dashboard() {
  const [links, setLinks] = useState([]);
  const [title, setTitle] = useState("");
  const [platforms, setPlatforms] = useState([]);
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("General");
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    loadLinks();
    loadPlatforms();
  }, []);

  const loadLinks = async () => {
    try {
      const res = await API.get("/links");
      setLinks(res.data);
    } catch (err) {
      localStorage.clear();
      navigate("/login");
    }
  };
  const loadPlatforms = async () => {
    try {
      const res = await API.get("/platforms");
      setPlatforms(res.data);
    } catch (err) { }
  };

  const addFromPlatform = async (p) => {
    try {
      await API.post("/links", {
        title: p.title,
        url: p.url,
        category: p.category,
        iconUrl: p.iconUrl,
      });
      loadLinks();
    } catch (err) {
      setError(err.response?.data?.message || "Add nahi hua");
    }
  };

  const addLink = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await API.post("/links", { title, url, category });
      setTitle("");
      setUrl("");
      loadLinks();
    } catch (err) {
      setError(err.response?.data?.message || "Link add nahi hua");
    }
  };

  const deleteLink = async (id) => {
    if (!window.confirm("Ye link delete karna hai?")) return;
    await API.delete(`/links/${id}`);
    loadLinks();
  };
  const countClick = async (id) => {
    try {
      await API.post(`/links/${id}/click`);
      loadLinks();
    } catch (err) { }
  };
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Filter: pehle category, fir search
  const shown = links.filter(
    (l) =>
      (activeCat === "All" || l.category === activeCat) &&
      l.title.toLowerCase().includes(search.toLowerCase())
  );

  const usedCats = ["All", ...new Set(links.map((l) => l.category))];

  return (
    <div>
      <div className="topbar">
        <div className="topbar">
        <span className="logo">LINK HUB</span>

        <span className="who">
          {user?.name} ({user?.role})
        </span>

        <span className="nav-right">
          {user?.role === "admin" && <Link to="/admin">Admin Panel</Link>}
          <button
            className="icon-btn"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <button className="pill-btn" onClick={logout}>Logout</button>
        </span>
      </div>
      </div>

      <div className="container">
        <form className="add-form" onSubmit={addLink}>
          <input
            placeholder="Title (jaise YouTube)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            placeholder="https://www.youtube.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <button type="submit">Add</button>
        </form>
        {error && <div className="error">{error}</div>}

        <input
          className="search"
          placeholder="🔍 Search karo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {platforms.length > 0 && (
          <>
            <h3>Discover Platforms</h3>
            <p className="sub">Ek click me apne dashboard me jodo</p>
            <div className="grid platforms-grid" style={{ marginBottom: 32 }}>
              {platforms.map((p) => (
                <div className="card" key={p._id}>
                  <img src={p.iconUrl} alt={p.title} />
                  <div>{p.title}</div>
                  <button
                    className="chip"
                    style={{ marginTop: 8 }}
                    onClick={() => addFromPlatform(p)}
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
            <h3>Mere Links</h3>
          </>
        )}

        <div className="chips">
          {usedCats.map((c) => (
            <button
              key={c}
              className={c === activeCat ? "chip active" : "chip"}
              onClick={() => setActiveCat(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid">
          {shown.map((link) => (
            <div className="card" key={link._id}>
              <button className="del" onClick={() => deleteLink(link._id)}>
                ✕
              </button>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => countClick(link._id)}
              >
                <img src={link.iconUrl} alt={link.title} />
                <div>{link.title}</div>
                <div className="owner">{link.clicks} clicks</div>
              </a>
              {user?.role === "admin" && link.owner && (
                <div className="owner">{link.owner.name}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;