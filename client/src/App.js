import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";

import Layout from "./components/layout/Layout";
import Profile from "./components/layout/Profile";


/* Student */
import StudentDashboard from "./components/Student/StudentDashboard";
import StudentAttendance from "./components/Student/StudentAttendance";
import WeeklyMenu from "./components/Student/WeeklyMenu";
import StudentFeedback from "./components/Student/StudentFeedback";
/* Admin */
import Dashboard from "./components/Admin/Dashboard";
import AdminAttendance from "./components/Admin/AdminAttendance";
import WeeklyMenuAdmin from "./components/Admin/WeeklyMenuAdmin";
import AdminStock from "./components/Admin/AdminStock";
import ManageWaste from "./components/Admin/ManageWaste";
import AdminFeedback from "./components/Admin/AdminFeedback";
import DemandAnalysis from "./components/Admin/DemandAnalysis";
import AdminMenuSuggestion from "./components/Admin/AdminMenuSuggestion";
import FloatingAnalysis from "./components/Admin/FloatingAnalysis";
// import Reports from "./components/Admin/Reports";

/* Organic */
import OrganicDashboard from "./components/OrganicTeam/OrganicDashboard";
import ReceivedWaste from "./components/OrganicTeam/ReceivedWaste";
import OrganicSegregation from "./components/OrganicTeam/OrganicSegregation";
import OrganicWasteStatus from "./components/OrganicTeam/OrganicWasteStatus"; 
import OrganicReports from "./components/OrganicTeam/OrganicReports";
import OrganicSuggestions from "./components/OrganicTeam/OrganicSuggestions";

function App() {
  return (
   <Router>
  <Routes>
    {/* PUBLIC */}
    <Route path="/" element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* ================= STUDENT ================= */}
    <Route element={<Layout role="student" />}>
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="/student-attendance" element={<StudentAttendance />} />
      <Route
        path="/student-menu"
        element={<WeeklyMenu userId={localStorage.getItem("userId")} />}
      />
      <Route path="/student-feedback" element={<StudentFeedback />} />
      <Route path="/profile/student" element={<Profile role="student" />} /> {/* ✅ Move here */}
    </Route>

    {/* ================= ADMIN ================= */}
    <Route element={<Layout role="admin" />}>
      <Route path="/admin" element={<Dashboard />} />
      <Route path="/admin/attendance" element={<AdminAttendance />} />
      <Route path="/admin/menu" element={<WeeklyMenuAdmin />} />
      <Route path="/admin/stock" element={<AdminStock />} />
      <Route path="/admin/waste" element={<ManageWaste />} />
      <Route path="/admin/reports" element={<AdminFeedback />} />
      <Route path="/admin/demand-analysis" element={<DemandAnalysis />} />
      <Route path="/profile/admin" element={<Profile role="admin" />} /> {/* ✅ Move here */}
      <Route path="/admin/menu-suggestion" element={<AdminMenuSuggestion />} />
      <Route path="/admin/floating" element={<FloatingAnalysis />} />
    </Route>

    {/* ================= ORGANIC================= */}
    <Route element={<Layout role="organic" />}>
      <Route path="/organic-dashboard" element={<OrganicDashboard />} />
      <Route path="/organic-received" element={<ReceivedWaste />} />
      <Route path="/organic/segregation" element={<OrganicSegregation />} />
      <Route path="/organic/status" element={<OrganicWasteStatus />} /> 
      <Route path="/organic/reports" element={<OrganicReports />} />
      <Route path="/organic/suggestions" element={<OrganicSuggestions />} />
      <Route path="/profile/organic" element={<Profile role="organic" />} /> {/* ✅ Move here */}
    </Route>
  </Routes>
</Router>
  );
}

export default App;
