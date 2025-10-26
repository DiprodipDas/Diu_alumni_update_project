import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";
import "./App.css";

// ================= LOGIN COMPONENT =================
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8081/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) navigate("/dashboard");
      else setError(data.message || "Invalid credentials");
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
    <div className="p-4 overflow-x-auto">
      <h2 className="text-2xl font-semibold mb-4 text-green-700">Alumni List</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg text-sm md:text-base">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Photo</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Reg. Code</th>
                <th className="p-3 text-left">Batch</th>
                <th className="p-3 text-left">Department</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">LinkedIn</th>
                <th className="p-3 text-left">Facebook</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {alumni.map((a) => (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{a.id}</td>
                  <td className="p-3">
                    {a.image_url ? (
                      <img
                        loading="lazy"
                        src={a.image_url}
                        alt={a.name}
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="p-3">{a.name}</td>
                  <td className="p-3">{a.regcode}</td>
                  <td className="p-3">{a.batch}</td>
                  <td className="p-3">{a.department}</td>
                  <td className="p-3">{a.EMAIL}</td>
                  <td className="p-3">{a.PHONE_NO}</td>
                  <td className="p-3 truncate max-w-[120px]">{a.LinkedIn_Link}</td>
                  <td className="p-3 truncate max-w-[120px]">{a.Facebook_Link}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => navigate(`/alumni/${a.id}`)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-3 py-2 bg-white border rounded">Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Next
        </button>
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
    setJobs([...jobs, { company_name:"", company_address:"", job_position:"", start_date:"", end_date:"", department:"", responsibility:"" }]);
  };
  const removeJob = (index) => setJobs(jobs.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (!["image_url","cv_or_resume","memories_at_diu","short_interview_video"].includes(key))
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

      const res = await fetch(`http://localhost:8081/api/alumni/update/${id}`, { method:"POST", body:formData });
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
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4 text-green-700">Edit Alumni Information (ID: {id})</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4" encType="multipart/form-data">

        {/* ---------------- Text Inputs ---------------- */}
        {["name","regcode","batch","passing_year","department","EMAIL","PHONE_NO","DOB","MAILING_ADD","PARMANENT_ADD","LinkedIn_Link","Facebook_Link","instagram_link","twitter_link","higher_studies","remarks"].map((field) => (
          <div key={field}>
            <label className="block text-sm font-semibold text-gray-700 capitalize">{field.replace(/_/g," ")}</label>
            <input type={["DOB"].includes(field) ? "date":"text"} value={form[field] || ""} onChange={(e)=>handleChange(field,e.target.value)} className="w-full p-2 border rounded"/>
          </div>
        ))}

        {/* ---------------- File Upload Fields ---------------- */}
        {[
          { key: "image_url", label: "Profile Image", accept: "image/jpeg,image/png" },
          { key: "cv_or_resume", label: "CV/Resume (PDF)", accept: "application/pdf" },
          { key: "memories_at_diu", label: "Memories at DIU", accept: "image/jpeg,image/png,video/mp4,video/quicktime" },
          { key: "short_interview_video", label: "Short Interview Video", accept: "video/mp4,video/quicktime" }
        ].map(({key,label,accept})=>(
          <div key={key}>
            <label className="block text-sm font-semibold text-gray-700">{label}</label>
            {form[key] && <div className="mb-2">{key.includes("video") || (key==="memories_at_diu" && form[key].match(/\.(mp4|mov)$/i)) ? <video src={form[key]} controls className="w-24 h-24 object-cover rounded"/> : <img src={form[key]} alt={key} className="w-24 h-24 object-cover rounded"/>}<p className="text-sm text-gray-500">Current: {form[key]}</p></div>}
            <input type="file" accept={accept} onChange={(e)=>handleFileChange(key,e.target.files[0])} className="w-full p-2 border rounded"/>
          </div>
        ))}

        {/* ---------------- Yes/No Dropdowns ---------------- */}
        {[{key:"helping_alumni",label:"Helping Alumni"},{key:"job_seeker",label:"Job Seeker"},{key:"interested_to_join_reunion",label:"Interested to Join Reunion"},{key:"interested_to_form_club",label:"Interested to Form Club"}].map(({key,label})=>(
          <div key={key}>
            <label className="block text-sm font-semibold text-gray-700">{label}</label>
            <select value={form[key] || "No"} onChange={(e)=>handleChange(key,e.target.value)} className="w-full p-2 border rounded">
              <option>No</option>
              <option>Yes</option>
            </select>
          </div>
        ))}

        {/* ---------------- Job Details ---------------- */}
        <div className="col-span-2">
          <h3 className="text-lg font-semibold mt-4">Job Details</h3>
          {jobs.map((job, idx)=>(
            <div key={idx} className="border p-3 rounded mb-2 grid grid-cols-1 md:grid-cols-2 gap-2">
              <input placeholder="Company Name" value={job.company_name} onChange={(e)=>handleJobChange(idx,"company_name",e.target.value)} className="p-2 border rounded"/>
              <input placeholder="Company Address" value={job.company_address} onChange={(e)=>handleJobChange(idx,"company_address",e.target.value)} className="p-2 border rounded"/>
              <input placeholder="Job Position" value={job.job_position} onChange={(e)=>handleJobChange(idx,"job_position",e.target.value)} className="p-2 border rounded"/>
              <input type="date" placeholder="Start Date" value={job.start_date} onChange={(e)=>handleJobChange(idx,"start_date",e.target.value)} className="p-2 border rounded"/>
              <input type="date" placeholder="End Date" value={job.end_date} onChange={(e)=>handleJobChange(idx,"end_date",e.target.value)} className="p-2 border rounded"/>
              <input placeholder="Department" value={job.department} onChange={(e)=>handleJobChange(idx,"department",e.target.value)} className="p-2 border rounded"/>
              <textarea placeholder="Responsibility" value={job.responsibility} onChange={(e)=>handleJobChange(idx,"responsibility",e.target.value)} className="p-2 border rounded col-span-2"/>
              <button type="button" onClick={()=>removeJob(idx)} className="bg-red-500 text-white px-2 py-1 rounded col-span-2">Remove</button>
            </div>
          ))}
          {jobs.length < 6 && <button type="button" onClick={addJob} className="bg-blue-600 text-white px-4 py-2 rounded mt-2">Add Job</button>}
        </div>

        {/* ---------------- Form Buttons ---------------- */}
        <div className="col-span-2 flex justify-between mt-4">
          <button type="button" onClick={()=>navigate("/dashboard")} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
          <button type="submit" disabled={saving} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">{saving ? "Saving..." : "Save Changes"}</button>
        </div>
      </form>
    </div>
  );
};

// ================= DASHBOARD WRAPPER =================
const Dashboard = () => (
  <div>
    <AlumniList />
  </div>
);

// ================= APP =================
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/alumni/:id" element={<AlumniEdit />} />
      </Routes>
    </Router>
  );
}

export default App;
