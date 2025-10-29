import React, { useState, useEffect, createContext, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
  Link,
  useLocation,
} from "react-router-dom";
import "./App.css";

// ================= AUTH CONTEXT =================
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ================= SIDEBAR COMPONENT =================
const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return null;

  const menuItems = [
    { path: "/dashboard", label: "Alumni List", icon: "👥" },
    { path: "/updated-alumni", label: "Updated Alumni", icon: "📝" },
    { path: "/profile", label: "My Profile", icon: "👤" },
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-green-700 text-white shadow-xl z-50 flex flex-col">
      {/* Logo & Title */}
      <div className="p-6 border-b border-green-600">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-green-700 font-bold text-lg">DIU</span>
          </div>
          <div>
            <h1 className="text-lg font-bold">Alumni Portal</h1>
            <p className="text-xs text-green-200">Dhaka International University</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${location.pathname === item.path
                  ? "bg-green-600 text-white shadow-md"
                  : "text-green-100 hover:bg-green-600 hover:text-white"
                  }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-green-600">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 font-medium"
        >
          <span>Logout</span>
          <span>Exit</span>
        </button>
      </div>
    </div>
  );
};

// ================= LAYOUT WITH SIDEBAR =================
const LayoutWithSidebar = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 min-h-screen bg-gray-50">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

// ================= LOGIN COMPONENT =================
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8081/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        login({ email });
        navigate("/dashboard");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-green-50 via-white to-green-100 px-4">
      <div className="flex flex-col items-center text-center mb-6 sm:mb-10">
        <img
          src="https://www.diu.ac/images/diu-logo.png"
          alt="DIU Logo"
          className="w-20 sm:w-24 mb-3"
        />
        <h1 className="text-2xl sm:text-3xl font-bold text-green-700">
          Dhaka International University
        </h1>
        <p className="text-gray-600 text-sm sm:text-base mt-1">
          Alumni Data Management Portal
        </p>
      </div>

      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-sm sm:max-w-md p-8">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Member Login
        </h2>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

// ================= PROTECTED ROUTE =================
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  return user ? children : null;
};

// ================= ALUMNI LIST =================
const AlumniList = () => {
  const [alumni, setAlumni] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlumni();
  }, [page]);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8081/api/alumni?page=${page}`);
      const data = await res.json();
      setAlumni(data);
    } catch (err) {
      console.error("Error fetching alumni:", err);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-green-700">All Alumni List</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Photo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Reg. Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Batch</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Dept</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">LinkedIn</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Facebook</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alumni.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm">{a.id}</td>
                    <td className="px-4 py-3">
                      {a.image_url ? (
                        <img
                          loading="lazy"
                          src={a.image_url}
                          alt={a.name}
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{a.name}</td>
                    <td className="px-4 py-3 text-sm">{a.regcode}</td>
                    <td className="px-4 py-3 text-sm">{a.batch}</td>
                    <td className="px-4 py-3 text-sm">{a.department}</td>
                    <td className="px-4 py-3 text-sm">{a.EMAIL}</td>
                    <td className="px-4 py-3 text-sm">{a.PHONE_NO}</td>
                    <td className="px-4 py-3 text-sm truncate max-w-[100px]">{a.LinkedIn_Link}</td>
                    <td className="px-4 py-3 text-sm truncate max-w-[100px]">{a.Facebook_Link}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => navigate(`/alumni/${a.id}`)}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700 transition"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded font-medium">
              Page {page}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-white border rounded hover:bg-gray-100 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ================= UPDATED ALUMNI LIST =================
const UpdatedAlumniList = () => {
  const [alumni, setAlumni] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUpdatedAlumni();
  }, [page]);

  const fetchUpdatedAlumni = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8081/api/updated-alumni?page=${page}`);
      const data = await res.json();
      setAlumni(data);
    } catch (err) {
      console.error("Error fetching updated alumni:", err);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-green-700">Updated Alumni List</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Original ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Modified ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Updated At</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alumni.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{a.transcript_id}</td>
                    <td className="px-4 py-3 text-sm font-medium">{a.id}</td>
                    <td className="px-4 py-3 text-sm">{a.name}</td>
                    <td className="px-4 py-3 text-sm">{a.EMAIL}</td>
                    <td className="px-4 py-3 text-sm">{new Date(a.updated_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => navigate(`/updated-alumni/${a.id}`)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 px-4 py-3 flex justify-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded font-medium">
              Page {page}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-white border rounded hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ================= UPDATED ALUMNI DETAIL PAGE =================
const UpdatedAlumniDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ alumni: null, jobs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8081/api/updated-alumni/${id}`)
      .then(r => r.json())
      .then(d => setData({ alumni: d.alumni, jobs: d.jobs || [] }))
      .catch(() => alert("Failed to load details"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center">Loading...</p>;
  const a = data.alumni;
  if (!a) return <p className="text-center text-red-600">Not found</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-green-700">
        Updated Alumni Details (ID: {a.id})
      </h2>

      {/* ==== BASIC INFO ==== */}
      <div className="bg-white p-5 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {[
            { l: "Name", v: a.name },
            { l: "Reg Code", v: a.regcode },
            { l: "Batch", v: a.batch },
            { l: "Passing Year", v: a.passing_year },
            { l: "Department", v: a.department },
            { l: "Email", v: a.EMAIL },
            { l: "Phone", v: a.PHONE_NO },
            { l: "DOB", v: a.DOB },
            { l: "Mailing Address", v: a.MAILING_ADD },
            { l: "Permanent Address", v: a.PARMANENT_ADD },
            { l: "LinkedIn", v: a.LinkedIn_Link },
            { l: "Facebook", v: a.Facebook_Link },
            { l: "Instagram", v: a.instagram_link },
            { l: "Twitter", v: a.twitter_link },
            { l: "Higher Studies", v: a.higher_studies },
            { l: "Remarks", v: a.remarks },
            { l: "Helping Alumni", v: a.helping_alumni },
            { l: "Job Seeker", v: a.job_seeker },
            { l: "Reunion Interest", v: a.interested_to_join_reunion },
            { l: "Club Interest", v: a.interested_to_form_club },
            { l: "Updated At", v: new Date(a.updated_at).toLocaleString() },
          ].map((f, i) => (
            <div key={i}>
              <span className="font-medium text-gray-700">{f.l}:</span>{" "}
              <span className="text-gray-900">{f.v || "-"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ==== FILE PREVIEWS ==== */}
      <div className="bg-white p-5 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Files & Media</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: "image_url", label: "Photo", type: "img" },
            { key: "cv_or_resume", label: "CV/Resume", type: "pdf" },
            { key: "memories_at_diu", label: "Memories", type: "img" },
            { key: "short_interview_video", label: "Interview Video", type: "video" },
          ].map(m => {
            const url = a[m.key] ? `http://localhost:8081${a[m.key]}` : null;
            return (
              <div key={m.key} className="border rounded p-2 text-center">
                <p className="text-xs font-medium text-gray-700 mb-1">{m.label}</p>
                {url ? (
                  m.type === "img" ? (
                    <img src={url} alt={m.label} className="w-full h-32 object-cover rounded" />
                  ) : m.type === "pdf" ? (
                    <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 underline text-xs">
                      View PDF
                    </a>
                  ) : m.type === "video" ? (
                    <video src={url} controls className="w-full h-32 rounded" />
                  ) : (
                    url.match(/\.(mp4|mov)$/i) ? (
                      <video src={url} controls className="w-full h-32 rounded" />
                    ) : (
                      <img src={url} alt={m.label} className="w-full h-32 object-cover rounded" />
                    )
                  )
                ) : (
                  <span className="text-gray-400 text-xs">—</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ==== JOB HISTORY ==== */}
      <div className="bg-white p-5 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Job History</h3>
        {data.jobs.length === 0 ? (
          <p className="text-gray-500 italic">No job records.</p>
        ) : (
          <div className="space-y-4">
            {data.jobs.map((job, idx) => (
              <div key={idx} className="border rounded p-4 bg-gray-50 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div><strong>Company:</strong> {job.company_name || "-"}</div>
                  <div><strong>Address:</strong> {job.company_address || "-"}</div>
                  <div><strong>Position:</strong> {job.job_position || "-"}</div>
                  <div><strong>Department:</strong> {job.department || "-"}</div>
                  <div><strong>Start:</strong> {job.start_date || "-"}</div>
                  <div><strong>End:</strong> {job.end_date || "-"}</div>
                  <div className="md:col-span-2">
                    <strong>Responsibility:</strong> {job.responsibility || "-"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==== BACK BUTTON ==== */}
      <div className="mt-6">
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
        >
          Back
        </button>
      </div>
    </div>
  );
};
// ================= PROFILE COMPONENT =================
const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/profile");
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-green-700">My Profile</h2>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
            <p className="p-3 bg-gray-50 rounded-lg border">{user?.name || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <p className="p-3 bg-gray-50 rounded-lg border">{user?.email || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
            <p className="p-3 bg-gray-50 rounded-lg border">{user?.role || 'Admin'}</p>
          </div>
          {user?.last_login && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Last Login</label>
              <p className="p-3 bg-gray-50 rounded-lg border">
                {new Date(user.last_login).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ================= ALUMNI EDIT PAGE =================
const AlumniEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState({
    short_interview_video: null,
    image_url: null,
    cv_or_resume: null,
    memories_at_diu: null,
  });

  useEffect(() => {
    fetchAlumni();
    fetchAlumniJobs();
  }, []);

  const fetchAlumni = async () => {
    try {
      const res = await fetch(`http://localhost:8081/api/alumni/${id}`);
      const data = await res.json();
      setForm(data);
    } catch (err) {
      console.error("Error fetching alumni:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlumniJobs = async () => {
    try {
      const res = await fetch(`http://localhost:8081/api/alumni/${id}/jobs`);
      const data = await res.json();
      setJobs(data.length > 0 ? data : []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setJobs([]);
    }
  };

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const handleFileChange = (field, file) => setFiles((prev) => ({ ...prev, [field]: file }));
  const handleJobChange = (index, field, value) => {
    const copy = [...jobs];
    copy[index][field] = value;
    setJobs(copy);
  };
  const addJob = () => {
    if (jobs.length >= 6) return alert("Maximum 6 jobs allowed");
    setJobs([...jobs, {
      company_name: "", company_address: "", job_position: "", start_date: "", end_date: "", department: "", responsibility: ""
    }]);
  };
  const removeJob = (index) => setJobs(jobs.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (!["image_url", "cv_or_resume", "memories_at_diu", "short_interview_video"].includes(key))
          formData.append(key, form[key] || "");
      });
      if (files.image_url) formData.append("image_url", files.image_url);
      if (files.cv_or_resume) formData.append("cv_or_resume", files.cv_or_resume);
      if (files.memories_at_diu) formData.append("memories_at_diu", files.memories_at_diu);
      if (files.short_interview_video) formData.append("short_interview_video", files.short_interview_video);
      if (!files.image_url && form.image_url) formData.append("image_url", form.image_url);
      if (!files.cv_or_resume && form.cv_or_resume) formData.append("cv_or_resume", form.cv_or_resume);
      if (!files.memories_at_diu && form.memories_at_diu) formData.append("memories_at_diu", form.memories_at_diu);
      if (!files.short_interview_video && form.short_interview_video) formData.append("short_interview_video", form.short_interview_video);
      formData.append("jobs", JSON.stringify(jobs));

      const res = await fetch(`http://localhost:8081/api/alumni/update/${id}`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        alert("Alumni update saved successfully!");
        navigate("/dashboard");
      } else alert("Failed to save update: " + (data.error || "Unknown error"));
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving update: " + err.message);
    }
    setSaving(false);
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-green-700">Edit Alumni Information (ID: {id})</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-4" encType="multipart/form-data">
        {["name", "regcode", "batch", "passing_year", "department", "EMAIL", "PHONE_NO", "DOB", "MAILING_ADD", "PARMANENT_ADD", "LinkedIn_Link", "Facebook_Link", "instagram_link", "twitter_link", "higher_studies", "remarks"].map((field) => (
          <div key={field}>
            <label className="block text-sm font-semibold text-gray-700 capitalize">{field.replace(/_/g, " ")}</label>
            <input
              type={["DOB"].includes(field) ? "date" : "text"}
              value={form[field] || ""}
              onChange={(e) => handleChange(field, e.target.value)}
              className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-green-500"
            />
          </div>
        ))}

        {[
          { key: "image_url", label: "Profile Image", accept: "image/jpeg,image/png" },
          { key: "cv_or_resume", label: "CV/Resume (PDF)", accept: "application/pdf" },
          { key: "memories_at_diu", label: "Memories at DIU", accept: "image/jpeg,image/png" },
          { key: "short_interview_video", label: "Short Interview Video", accept: "video/mp4,video/quicktime" }
        ].map(({ key, label, accept }) => (
          <div key={key}>
            <label className="block text-sm font-semibold text-gray-700">{label}</label>
            {form[key] && (
              <div className="mb-2">
                {key.includes("video") || (key === "memories_at_diu" && form[key].match(/\.(mp4|mov)$/i)) ? (
                  <video src={`http://localhost:8081${form[key]}`} controls className="w-24 h-24 object-cover rounded border" />
                ) : (
                  <img src={`http://localhost:8081${form[key]}`} alt={key} className="w-24 h-24 object-cover rounded border" />
                )}
                <p className="text-xs text-gray-500 mt-1">Current: {form[key]}</p>
              </div>
            )}
            <input
              type="file"
              accept={accept}
              onChange={(e) => handleFileChange(key, e.target.files[0])}
              className="w-full p-2 border rounded mt-1"
            />
          </div>
        ))}

        {[{ key: "helping_alumni", label: "Helping Alumni" }, { key: "job_seeker", label: "Job Seeker" }, { key: "interested_to_join_reunion", label: "Interested to Join Reunion" }, { key: "interested_to_form_club", label: "Interested to Form Club" }].map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm font-semibold text-gray-700">{label}</label>
            <select
              value={form[key] || "No"}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full p-2 border rounded mt-1"
            >
              <option>No</option>
              <option>Yes</option>
            </select>
          </div>
        ))}

        <div className="col-span-2">
          <h3 className="text-lg font-semibold mt-6 mb-3 text-green-700">Job Details</h3>
          {jobs.map((job, idx) => (
            <div key={idx} className="border p-4 rounded-lg mb-3 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input placeholder="Company Name" value={job.company_name} onChange={(e) => handleJobChange(idx, "company_name", e.target.value)} className="p-2 border rounded" />
                <input placeholder="Company Address" value={job.company_address} onChange={(e) => handleJobChange(idx, "company_address", e.target.value)} className="p-2 border rounded" />
                <input placeholder="Job Position" value={job.job_position} onChange={(e) => handleJobChange(idx, "job_position", e.target.value)} className="p-2 border rounded" />
                <input type="date" placeholder="Start Date" value={job.start_date} onChange={(e) => handleJobChange(idx, "start_date", e.target.value)} className="p-2 border rounded" />
                <input type="date" placeholder="End Date" value={job.end_date} onChange={(e) => handleJobChange(idx, "end_date", e.target.value)} className="p-2 border rounded" />
                <input placeholder="Department" value={job.department} onChange={(e) => handleJobChange(idx, "department", e.target.value)} className="p-2 border rounded" />
                <textarea placeholder="Responsibility" value={job.responsibility} onChange={(e) => handleJobChange(idx, "responsibility", e.target.value)} className="p-2 border rounded col-span-2" rows="2" />
                <button type="button" onClick={() => removeJob(idx)} className="bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600 col-span-2">Remove Job</button>
              </div>
            </div>
          ))}
          {jobs.length < 6 && (
            <button type="button" onClick={addJob} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Add Job
            </button>
          )}
        </div>

        <div className="col-span-2 flex justify-end space-x-3 mt-6">
          <button type="button" onClick={() => navigate("/dashboard")} className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-70">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

// ================= DASHBOARD PAGES WITH LAYOUT =================
const Dashboard = () => (
  <LayoutWithSidebar>
    <AlumniList />
  </LayoutWithSidebar>
);

const UpdatedAlumni = () => (
  <LayoutWithSidebar>
    <UpdatedAlumniList />
  </LayoutWithSidebar>
);

const UserProfile = () => (
  <LayoutWithSidebar>
    <Profile />
  </LayoutWithSidebar>
);

const EditAlumniPage = () => (
  <LayoutWithSidebar>
    <AlumniEdit />
  </LayoutWithSidebar>
);

// ================= APP =================
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/updated-alumni"
            element={
              <ProtectedRoute>
                <UpdatedAlumni />
              </ProtectedRoute>
            }
          />
          <Route
            path="/updated-alumni/:id"
            element={
              <ProtectedRoute>
                <LayoutWithSidebar>
                  <UpdatedAlumniDetail />
                </LayoutWithSidebar>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alumni/:id"
            element={
              <ProtectedRoute>
                <EditAlumniPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;