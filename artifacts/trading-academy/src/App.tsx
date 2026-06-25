import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import Maintenance from "@/pages/maintenance";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { SuperAdminLayout } from "@/components/layout/SuperAdminLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { FacultyLayout } from "@/components/layout/FacultyLayout";
import { StudentLayout } from "@/components/layout/StudentLayout";

// Dashboards
import SuperAdminDashboard from "@/pages/superadmin/dashboard";
import AdminDashboard from "@/pages/admin/dashboard";
import FacultyDashboard from "@/pages/faculty/dashboard";
import StudentDashboard from "@/pages/student/dashboard";

// Pages
import AdminsManagement from "@/pages/superadmin/admins";
import UsersManagement from "@/pages/superadmin/users";
import CoursesManagement from "@/pages/superadmin/courses";
import BatchesManagement from "@/pages/superadmin/batches";
import DeviceManagement from "@/pages/superadmin/device-management";
import SecurityCenter from "@/pages/superadmin/security";
import ActivityLogs from "@/pages/superadmin/activity-logs";
import NotificationsManagement from "@/pages/superadmin/notifications";
import SystemSettings from "@/pages/superadmin/settings";

import StudentManagement from "@/pages/admin/students";
import FacultyManagement from "@/pages/admin/faculty";
import AdminCourses from "@/pages/admin/courses";
import AdminBatches from "@/pages/admin/batches";
import AdminCertificates from "@/pages/admin/certificates";
import AdminNotifications from "@/pages/admin/notifications";
import AdminActivityLogs from "@/pages/admin/activity-logs";

import FacultyCourses from "@/pages/faculty/courses";
import FacultyLectures from "@/pages/faculty/lectures";
import FacultyLiveClasses from "@/pages/faculty/live-classes";
import FacultyNotes from "@/pages/faculty/notes";

import StudentCourses from "@/pages/student/courses";
import BrowseCourses from "@/pages/student/browse-courses";
import CourseDetail from "@/pages/student/course-detail";
import StudentLiveClasses from "@/pages/student/live-classes";
import StudentNotes from "@/pages/student/notes";
import StudentCertificates from "@/pages/student/certificates";
import StudentProfile from "@/pages/student/profile";
import StudentNotifications from "@/pages/student/notifications";

const queryClient = new QueryClient();

function SuperAdminRoutes() {
  return (
    <ProtectedRoute allowedRoles={["superadmin"]}>
      <SuperAdminLayout>
        <Switch>
          <Route path="/superadmin/dashboard" component={SuperAdminDashboard} />
          <Route path="/superadmin/admins" component={AdminsManagement} />
          <Route path="/superadmin/users" component={UsersManagement} />
          <Route path="/superadmin/courses" component={CoursesManagement} />
          <Route path="/superadmin/batches" component={BatchesManagement} />
          <Route path="/superadmin/device-management" component={DeviceManagement} />
          <Route path="/superadmin/security" component={SecurityCenter} />
          <Route path="/superadmin/activity-logs" component={ActivityLogs} />
          <Route path="/superadmin/notifications" component={NotificationsManagement} />
          <Route path="/superadmin/settings" component={SystemSettings} />
          <Route component={NotFound} />
        </Switch>
      </SuperAdminLayout>
    </ProtectedRoute>
  );
}

function AdminRoutes() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminLayout>
        <Switch>
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/admin/students" component={StudentManagement} />
          <Route path="/admin/faculty" component={FacultyManagement} />
          <Route path="/admin/courses" component={AdminCourses} />
          <Route path="/admin/batches" component={AdminBatches} />
          <Route path="/admin/certificates" component={AdminCertificates} />
          <Route path="/admin/notifications" component={AdminNotifications} />
          <Route path="/admin/activity-logs" component={AdminActivityLogs} />
          <Route component={NotFound} />
        </Switch>
      </AdminLayout>
    </ProtectedRoute>
  );
}

function FacultyRoutes() {
  return (
    <ProtectedRoute allowedRoles={["faculty"]}>
      <FacultyLayout>
        <Switch>
          <Route path="/faculty/dashboard" component={FacultyDashboard} />
          <Route path="/faculty/courses" component={FacultyCourses} />
          <Route path="/faculty/lectures" component={FacultyLectures} />
          <Route path="/faculty/live-classes" component={FacultyLiveClasses} />
          <Route path="/faculty/notes" component={FacultyNotes} />
          <Route component={NotFound} />
        </Switch>
      </FacultyLayout>
    </ProtectedRoute>
  );
}

function StudentRoutes() {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentLayout>
        <Switch>
          <Route path="/student/dashboard" component={StudentDashboard} />
          <Route path="/student/courses" component={StudentCourses} />
          <Route path="/student/browse" component={BrowseCourses} />
          <Route path="/student/courses/:id" component={CourseDetail} />
          <Route path="/student/live-classes" component={StudentLiveClasses} />
          <Route path="/student/notes" component={StudentNotes} />
          <Route path="/student/certificates" component={StudentCertificates} />
          <Route path="/student/profile" component={StudentProfile} />
          <Route path="/student/notifications" component={StudentNotifications} />
          <Route component={NotFound} />
        </Switch>
      </StudentLayout>
    </ProtectedRoute>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/maintenance" component={Maintenance} />
      <Route path="/superadmin/*" component={SuperAdminRoutes} />
      <Route path="/admin/*" component={AdminRoutes} />
      <Route path="/faculty/*" component={FacultyRoutes} />
      <Route path="/student/*" component={StudentRoutes} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
