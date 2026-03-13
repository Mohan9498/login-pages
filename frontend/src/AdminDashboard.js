import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

function AdminDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [reports, setReports] = useState([]);
  const [reportText, setReportText] = useState("");

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const [newStudent, setNewStudent] = useState({
    username: "",
    course: "",
    completed: 0,
    pending: 0,
    performance: 0,
  });

  const [editingStudent, setEditingStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const studentsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const profileRes = await API.get("profile/");
      setProfile(profileRes.data);

      const res = await API.get("students/");
      const normalizedStudents = Array.isArray(res.data)
        ? res.data.map((student, index) => ({
            id: student.id ?? index + 1,
            username: student.username ?? "",
            course: student.course ?? student.courses ?? "General",
            completed: Number(student.completed ?? 0),
            pending: Number(student.pending ?? 0),
            performance: Number(student.performance ?? 0),
          }))
        : [];

      setStudents(normalizedStudents);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const addReport = () => {
    if (!reportText.trim()) return;

    setReports((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: reportText,
      },
    ]);

    setReportText("");
  };

  const generateOTP = async () => {
    try {
      const res = await API.post("forgot-password/", {
        username: profile.username,
      });

      alert("OTP: " + res.data.otp);
    } catch (err) {
      console.log(err);
      alert("OTP failed");
    }
  };

  const resetPassword = async () => {
    try {
      const res = await API.post("reset-password/", {
        username: profile.username,
        otp: otp,
        password: password,
      });

      alert(res.data.message);
      setOtp("");
      setPassword("");
    } catch (err) {
      console.log(err);
      alert("Password reset failed");
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((student) =>
      student.username.toLowerCase().includes(search.toLowerCase())
    );
  }, [students, search]);

  const addStudent = async () => {
    if (!newStudent.username.trim() || !newStudent.course.trim()) return;

    try {
      const payload = {
        username: newStudent.username,
        course: newStudent.course,
        completed: Number(newStudent.completed),
        pending: Number(newStudent.pending),
        performance: Number(newStudent.performance),
      };

      const res = await API.post("students/", payload);

      const createdStudent = {
        id: res?.data?.id ?? Date.now(),
        username: res?.data?.username ?? payload.username,
        course: res?.data?.course ?? payload.course,
        completed: Number(res?.data?.completed ?? payload.completed),
        pending: Number(res?.data?.pending ?? payload.pending),
        performance: Number(res?.data?.performance ?? payload.performance),
      };

      setStudents((prev) => [...prev, createdStudent]);
      setNewStudent({
        username: "",
        course: "",
        completed: 0,
        pending: 0,
        performance: 0,
      });
    } catch (err) {
      console.log(err);
      alert("Failed to add student");
    }
  };

  const startEditStudent = (student) => {
    setEditingStudent({ ...student });
  };

  const updateStudent = async () => {
    if (!editingStudent?.username?.trim() || !editingStudent?.course?.trim()) {
      return;
    }

    try {
      const payload = {
        username: editingStudent.username,
        course: editingStudent.course,
        completed: Number(editingStudent.completed),
        pending: Number(editingStudent.pending),
        performance: Number(editingStudent.performance),
      };

      await API.put(`students/${editingStudent.id}/`, payload);

      setStudents((prev) =>
        prev.map((student) =>
          student.id === editingStudent.id
            ? {
                ...student,
                ...payload,
              }
            : student
        )
      );

      setEditingStudent(null);
    } catch (err) {
      console.log(err);
      alert("Failed to update student");
    }
  };

  const deleteStudent = async (id) => {
    try {
      await API.delete(`students/${id}/`);
      setStudents((prev) => prev.filter((student) => student.id !== id));
    } catch (err) {
      console.log(err);
      alert("Failed to delete student");
    }
  };

  const totalStudents = students.length;
  const totalAdmins = 1;
  const totalCompleted = students.reduce(
    (sum, student) => sum + Number(student.completed || 0),
    0
  );
  const totalPending = students.reduce(
    (sum, student) => sum + Number(student.pending || 0),
    0
  );
  const avgPerformance =
    totalStudents > 0
      ? Math.round(
          students.reduce(
            (sum, student) => sum + Number(student.performance || 0),
            0
          ) / totalStudents
        )
      : 0;

  const stats = [
    { title: "Students", value: totalStudents, icon: "🎓" },
    { title: "Admins", value: totalAdmins, icon: "🛡️" },
    { title: "Completed", value: totalCompleted, icon: "✅" },
    { title: "Avg Performance", value: `${avgPerformance}%`, icon: "📈" },
  ];

  const menuItems = [
    { name: "Dashboard", icon: "📊", page: "dashboard" },
    { name: "Students", icon: "🎓", page: "students" },
    { name: "Reports", icon: "📄", page: "reports" },
    { name: "Change Password", icon: "🔐", page: "password" },
    { name: "Settings", icon: "⚙️", page: "settings" },
  ];

  const indexOfLast = currentPage * studentsPerPage;
  const indexOfFirst = indexOfLast - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / studentsPerPage)
  );

  const performanceChartData = {
    labels: students.map((student) => student.username),
    datasets: [
      {
        label: "Performance %",
        data: students.map((student) => Number(student.performance || 0)),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  const courseProgressChartData = {
    labels: ["Completed", "Pending"],
    datasets: [
      {
        label: "Course Progress",
        data: [totalCompleted, totalPending],
        backgroundColor: ["#22c55e", "#f59e0b"],
      },
    ],
  };

  const overviewLineData = {
    labels: students.map((student) => student.username),
    datasets: [
      {
        label: "Completed",
        data: students.map((student) => Number(student.completed || 0)),
        borderColor: "#22c55e",
        backgroundColor: "#22c55e",
        tension: 0.3,
      },
      {
        label: "Pending",
        data: students.map((student) => Number(student.pending || 0)),
        borderColor: "#ef4444",
        backgroundColor: "#ef4444",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="min-h-[90vh] bg-gray-100 flex">
      <aside className="w-64 bg-blue-900 text-white flex flex-col justify-between min-h-[90vh]">

<div className="p-6 text-2xl font-bold border-b border-blue-700">
Admin Panel
</div>

<nav className="flex-1 p-4 space-y-2 overflow-y-auto">

{menuItems.map(item=>(
<button
key={item.name}
onClick={()=>setActiveSection(item.page)}
className={`w-full text-left px-4 py-2 rounded
${activeSection===item.page?"bg-blue-600":"hover:bg-blue-700"}`}
>
{item.icon} {item.name}
</button>
))}

</nav>

<div className="p-4 border-t border-blue-700">

<p className="text-sm mb-2">
{profile?`Welcome ${profile.username}`:"Loading..."}
</p>

<button
onClick={logout}
className="w-full bg-red-500 py-2 rounded"
>
Logout
</button>

</div>

</aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>

          <div className="flex items-center gap-2">
            <span>{profile?.username}</span>

            <div className="w-9 h-9 bg-blue-600 text-white flex items-center justify-center rounded-full">
              {profile?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6 flex-1 overflow-auto">
          {activeSection === "dashboard" && (
            <>
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {stats.map((stat) => (
                  <div
                    key={stat.title}
                    className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
                  >
                    <div className="flex justify-between">
                      <p className="text-gray-500">{stat.title}</p>
                      <span>{stat.icon}</span>
                    </div>

                    <h3 className="text-3xl font-bold mt-3">{stat.value}</h3>
                  </div>
                ))}
              </section>

              <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow">
                  <h2 className="text-xl font-bold mb-4">
                    Student Performance Chart
                  </h2>
                  <Bar data={performanceChartData} />
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                  <h2 className="text-xl font-bold mb-4">
                    Course Progress Dashboard
                  </h2>
                  <Doughnut data={courseProgressChartData} />
                </div>
              </section>

              <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-bold mb-4">Completed vs Pending</h2>
                <Line data={overviewLineData} />
              </div>
            </>
          )}

          {activeSection === "students" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-2xl font-bold mb-4">Add Student</h2>

<div className="grid grid-cols-1 md:grid-cols-5 gap-3">

<input
type="text"
placeholder="Username"
value={newStudent.username}
onChange={(e)=>
setNewStudent({...newStudent,username:e.target.value})
}
className="border p-2 rounded"
/>

<select
value={newStudent.course}
onChange={(e)=>
setNewStudent({...newStudent,course:e.target.value})
}
className="border p-2 rounded bg-white"
>
<option value="">Select Course</option>
<option value="Speech Cognitive Program">
Speech Cognitive Program
</option>
<option value="Day Care">
Day Care
</option>
</select>

<input
type="number"
placeholder="Completed"
value={newStudent.completed}
onChange={(e)=>
setNewStudent({...newStudent,completed:e.target.value})
}
className="border p-2 rounded"
/>

<input
type="number"
placeholder="Pending"
value={newStudent.pending}
onChange={(e)=>
setNewStudent({...newStudent,pending:e.target.value})
}
className="border p-2 rounded"
/>

<input
type="number"
placeholder="Performance %"
value={newStudent.performance}
onChange={(e)=>
setNewStudent({...newStudent,performance:e.target.value})
}
className="border p-2 rounded"
/>

</div>

                <button
                  onClick={addStudent}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                  Add Student
                </button>
              </div>

              {editingStudent && (
                <div className="bg-white p-6 rounded-xl shadow">
                  <h2 className="text-2xl font-bold mb-4">Edit Student</h2>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <input
                      type="text"
                      placeholder="Username"
                      value={editingStudent.username}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          username: e.target.value,
                        })
                      }
                      className="border p-2 rounded"
                    />

                    <input
                      type="text"
                      placeholder="Course"
                      value={editingStudent.course}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          course: e.target.value,
                        })
                      }
                      className="border p-2 rounded"
                    />

                    <input
                      type="number"
                      placeholder="Completed"
                      value={editingStudent.completed}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          completed: e.target.value,
                        })
                      }
                      className="border p-2 rounded"
                    />

                    <input
                      type="number"
                      placeholder="Pending"
                      value={editingStudent.pending}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          pending: e.target.value,
                        })
                      }
                      className="border p-2 rounded"
                    />

                    <input
                      type="number"
                      placeholder="Performance %"
                      value={editingStudent.performance}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          performance: e.target.value,
                        })
                      }
                      className="border p-2 rounded"
                    />
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={updateStudent}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                    >
                      Save Changes
                    </button>

                    <button
                      onClick={() => setEditingStudent(null)}
                      className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <h2 className="text-2xl font-bold">Students</h2>

                  <input
                    placeholder="Search student"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="border p-2 rounded w-full md:w-80"
                  />
                </div>

                {loading ? (
                  <p>Loading students...</p>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left min-w-[800px]">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2">Username</th>
                            <th>Course</th>
                            <th>Completed</th>
                            <th>Pending</th>
                            <th>Performance</th>
                            <th>Actions</th>
                          </tr>
                        </thead>

                        <tbody>
                          {currentStudents.map((student) => (
                            <tr key={student.id} className="border-b">
                              <td className="py-2">{student.username}</td>
                              <td>{student.course}</td>
                              <td>{student.completed}</td>
                              <td>{student.pending}</td>
                              <td>{student.performance}%</td>
                              <td>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => startEditStudent(student)}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                                  >
                                    Edit
                                  </button>

                                  <button
                                    onClick={() => deleteStudent(student.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}

                          {currentStudents.length === 0 && (
                            <tr>
                              <td
                                colSpan="6"
                                className="py-4 text-center text-gray-500"
                              >
                                No students found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex gap-2 mt-4 items-center">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                      >
                        Prev
                      </button>

                      <span>
                        {currentPage} / {totalPages}
                      </span>

                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeSection === "reports" && (
            <div className="bg-white p-6 rounded-xl shadow space-y-4">
              <h2 className="text-2xl font-bold">Reports</h2>

              <div className="flex gap-2">
                <input
                  placeholder="Write report paragraph"
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  className="border p-2 rounded w-full"
                />

                <button
                  onClick={addReport}
                  className="bg-blue-500 text-white px-4 rounded"
                >
                  Add
                </button>
              </div>

              {reports.map((r) => (
                <p key={r.id} className="bg-gray-100 p-3 rounded">
                  {r.text}
                </p>
              ))}
            </div>
          )}

          {activeSection === "password" && (
            <div className="flex justify-center items-center py-10">
              <div className="bg-white p-8 rounded-xl shadow-lg space-y-5 w-full max-w-md">
                <h2 className="text-2xl font-bold text-center">
                  Change Password
                </h2>

                <button
                  onClick={generateOTP}
                  className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 transition"
                >
                  Generate OTP
                </button>

                <input
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="border p-2 rounded w-full"
                />

                <input
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border p-2 rounded w-full"
                />

                <button
                  onClick={resetPassword}
                  className="bg-green-500 text-white px-4 py-2 rounded w-full hover:bg-green-600 transition"
                >
                  Reset Password
                </button>
              </div>
            </div>
          )}

          {activeSection === "settings" && (
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-2xl font-bold">Settings</h2>
              <p>Admin settings panel.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;