import { Link, Route, Switch } from "wouter";
import { LayoutDashboard, BookOpen, Video, MonitorPlay, FileText, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";

export function FacultyLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <aside className="w-64 flex flex-col bg-sidebar border-r border-sidebar-border hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border shrink-0">
          <span className="text-lg font-bold text-sidebar-foreground tracking-tight">APEX <span className="text-primary">FACULTY</span></span>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            <Link href="/faculty/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
            <Link href="/faculty/courses" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <BookOpen className="h-4 w-4" /> My Courses
            </Link>
            <Link href="/faculty/lectures" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <Video className="h-4 w-4" /> Lectures
            </Link>
            <Link href="/faculty/live-classes" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <MonitorPlay className="h-4 w-4" /> Live Classes
            </Link>
            <Link href="/faculty/notes" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <FileText className="h-4 w-4" /> Notes
            </Link>
          </nav>
        </div>
        <div className="p-4 border-t border-sidebar-border shrink-0 flex flex-col gap-2">
           <div className="flex items-center gap-2 px-2 py-2">
             <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
               {user?.fullName?.substring(0, 2).toUpperCase()}
             </div>
             <div className="flex flex-col">
               <span className="text-xs font-semibold text-sidebar-foreground truncate max-w-[120px]">{user?.fullName}</span>
               <span className="text-[10px] text-muted-foreground uppercase">{user?.role}</span>
             </div>
           </div>
           <button onClick={() => logout()} className="flex items-center gap-2 text-xs font-medium text-destructive hover:text-destructive/80 px-2 py-2">
             <LogOut className="h-3 w-3" /> Sign Out
           </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card shrink-0">
           <h1 className="font-semibold text-foreground">Faculty Portal</h1>
           <ThemeToggle />
        </header>
        <div className="flex-1 overflow-auto p-6 bg-background">
          {children}
        </div>
      </main>
    </div>
  );
}
