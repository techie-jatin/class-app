import { Link, Route, Switch } from "wouter";
import { LayoutDashboard, BookOpen, MonitorPlay, FileText, Award, Bell, User, LogOut, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notification-bell";

export function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  const NavLinks = () => (
    <>
      <Link href="/student/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <LayoutDashboard className="h-4 w-4" /> Dashboard
      </Link>
      <Link href="/student/courses" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <BookOpen className="h-4 w-4" /> My Courses
      </Link>
      <Link href="/student/live-classes" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <MonitorPlay className="h-4 w-4" /> Live Classes
      </Link>
      <Link href="/student/notes" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <FileText className="h-4 w-4" /> Notes
      </Link>
      <Link href="/student/certificates" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <Award className="h-4 w-4" /> Certificates
      </Link>
      <Link href="/student/notifications" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <Bell className="h-4 w-4" /> Notifications
      </Link>
      <Link href="/student/profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <User className="h-4 w-4" /> Profile
      </Link>
    </>
  );

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 flex-col bg-sidebar border-r border-sidebar-border hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border shrink-0">
          <span className="text-lg font-bold text-sidebar-foreground tracking-tight">APEX <span className="text-primary">ACADEMY</span></span>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            <NavLinks />
          </nav>
        </div>
        <div className="p-4 border-t border-sidebar-border shrink-0 flex flex-col gap-2">
           <div className="flex items-center gap-2 px-2 py-2">
             <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
               {user?.fullName?.substring(0, 2).toUpperCase()}
             </div>
             <div className="flex flex-col overflow-hidden">
               <span className="text-xs font-semibold text-sidebar-foreground truncate">{user?.fullName}</span>
               <span className="text-[10px] text-muted-foreground uppercase">{user?.role}</span>
             </div>
           </div>
           <button onClick={() => logout()} className="flex items-center gap-2 text-xs font-medium text-destructive hover:text-destructive/80 px-2 py-2 w-full text-left">
             <LogOut className="h-3 w-3" /> Sign Out
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-border bg-card shrink-0">
           <div className="flex items-center gap-4">
             <Sheet>
               <SheetTrigger asChild>
                 <Button variant="ghost" size="icon" className="md:hidden">
                   <Menu className="h-5 w-5" />
                 </Button>
               </SheetTrigger>
               <SheetContent side="left" className="w-64 p-0 flex flex-col">
                  <div className="h-16 flex items-center px-6 border-b border-sidebar-border shrink-0">
                    <span className="text-lg font-bold tracking-tight">APEX <span className="text-primary">ACADEMY</span></span>
                  </div>
                  <div className="flex-1 overflow-y-auto py-4">
                    <nav className="space-y-1 px-3">
                      <NavLinks />
                    </nav>
                  </div>
                  <div className="p-4 border-t border-sidebar-border shrink-0">
                    <button onClick={() => logout()} className="flex items-center gap-2 text-sm font-medium text-destructive hover:text-destructive/80 px-3 py-2 w-full text-left">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
               </SheetContent>
             </Sheet>
             <h1 className="font-semibold text-foreground hidden sm:block">Student Portal</h1>
             <span className="font-bold tracking-tight md:hidden">APEX <span className="text-primary">ACADEMY</span></span>
           </div>
           <div className="flex items-center gap-2">
             <NotificationBell />
             <ThemeToggle />
           </div>
        </header>
        <div className="flex-1 overflow-auto bg-background">
          {children}
        </div>
      </main>
    </div>
  );
}
