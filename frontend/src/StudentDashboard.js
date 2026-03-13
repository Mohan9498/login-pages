import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";

function StudentDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    API.get("profile/")
      .then((res) => {
        setProfile(res.data);
      })
      .catch(() => {
        navigate("/login");
      });
  }, [navigate]);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", icon: "🏠" },
    { name: "Skills", icon: "🧠" },
    { name: "Pending Skills", icon: "⏳" },
    { name: "Profile", icon: "👤" },
  ];

  const stats = [
    { title: "Completed Skills", value: "18", color: "text-green-600", icon: "✅" },
    { title: "Pending Skills", value: "6", color: "text-red-500", icon: "📌" },
    { title: "Courses", value: "4", color: "text-blue-600", icon: "📚" },
    { title: "Attendance", value: "92%", color: "text-purple-600", icon: "📈" },
  ];

  return (
    <div className="min-h-screen bg-emerald-50 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-emerald-900 text-white transform transition-transform duration-300 md:static md:translate-x-0 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-5 border-b border-emerald-700">
          <h2 className="text-2xl font-bold tracking-wide">Student Panel</h2>
          <p className="text-sm text-emerald-200 mt-1">Learning Dashboard</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={item.name}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition duration-200 ${
                index === 0
                  ? "bg-emerald-600 shadow-lg"
                  : "hover:bg-emerald-800 text-emerald-100"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-emerald-700">
          <div className="bg-emerald-800 rounded-2xl p-4 mb-4">
            <p className="text-sm text-emerald-200">Logged in as</p>
            <p className="font-semibold mt-1">
              {profile ? profile.username : "Loading..."}
            </p>
          </div>

          <button
            onClick={logout}
            className="w-full bg-red-500 hover:bg-red-600 py-3 rounded-xl font-semibold transition"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-emerald-100 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-2xl bg-emerald-100 w-10 h-10 rounded-lg"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                Student Dashboard
              </h1>
              <p className="text-sm text-slate-500">
                Keep learning, {profile?.username || "Student"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-700">
                {profile?.username}
              </p>
              <p className="text-xs text-slate-500">Student</p>
            </div>
            <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow">
              {profile?.username?.charAt(0).toUpperCase() || "S"}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 space-y-6">
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition duration-300 border border-emerald-100"
              >
                <div className="flex items-center justify-between">
                  <p className="text-slate-500 font-medium">{stat.title}</p>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <h3 className={`text-3xl font-bold mt-4 ${stat.color}`}>
                  {stat.value}
                </h3>
                <p className="text-sm text-slate-400 mt-2">Updated today</p>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800">Skill Progress</h2>
                <span className="text-sm text-slate-500">This week</span>
              </div>

              <div className="space-y-5">
                {[
                  { skill: "React", value: "80%" },
                  { skill: "Django", value: "68%" },
                  { skill: "Tailwind CSS", value: "74%" },
                  { skill: "PostgreSQL", value: "60%" },
                ].map((item) => (
                  <div key={item.skill}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">
                        {item.skill}
                      </span>
                      <span className="text-sm text-slate-500">{item.value}</span>
                    </div>
                    <div className="w-full h-3 bg-emerald-100 rounded-full overflow-hidden">
                      <div
                        className="h-3 bg-emerald-500 rounded-full"
                        style={{ width: item.value }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
              <h2 className="text-lg font-bold text-slate-800 mb-5">
                Upcoming Tasks
              </h2>

              <div className="space-y-4">
                {[
                  "Finish React assignment",
                  "Submit Django mini project",
                  "Practice PostgreSQL queries",
                  "Complete Tailwind exercise",
                ].map((task, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 pb-4 border-b last:border-b-0"
                  >
                    <div className="w-5 h-5 rounded-md border-2 border-emerald-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{task}</p>
                      <p className="text-xs text-slate-400">Pending</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Learning Activity</h2>
              <button className="text-sm text-emerald-600 font-medium hover:underline">
                View Details
              </button>
            </div>

            <div className="h-64 flex items-end gap-4">
              {[45, 62, 58, 75, 68, 88, 72].map((height, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-xl bg-emerald-500 hover:bg-emerald-600 transition"
                    style={{ height: `${height * 2}px` }}
                  />
                  <span className="text-xs text-slate-500">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default StudentDashboard;