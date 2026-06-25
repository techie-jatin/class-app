import { useState, useMemo } from "react";
import {
  useListNotifications,
  useSendNotification,
  useListCourses,
  useListUsers,
  getListNotificationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Bell, Send, Users, GraduationCap, BookOpen, User, Globe } from "lucide-react";

type TargetType = "all" | "students" | "faculty" | "course" | "user";

const TARGET_OPTIONS: { value: TargetType; label: string; description: string; icon: React.ComponentType<any>; color: string }[] = [
  { value: "all",      label: "All Users",        description: "Everyone on the platform",  icon: Globe,         color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  { value: "students", label: "All Students",     description: "Every active student",       icon: GraduationCap, color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  { value: "faculty",  label: "All Faculty",      description: "Every instructor",           icon: Users,         color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  { value: "course",   label: "Course Students",  description: "Students in one course",     icon: BookOpen,      color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  { value: "user",     label: "Individual User",  description: "One specific user",          icon: User,          color: "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300" },
];

function targetBadge(target: string, courseMap: Map<number, string>, userMap: Map<number, string>) {
  if (target === "all") return { label: "All Users", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" };
  if (target === "students") return { label: "All Students", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" };
  if (target === "faculty") return { label: "All Faculty", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" };
  if (target.startsWith("course:")) {
    const id = parseInt(target.split(":")[1]);
    const name = courseMap.get(id);
    return { label: name ? `${name}` : `Course #${id}`, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" };
  }
  if (target.startsWith("user:")) {
    const id = parseInt(target.split(":")[1]);
    const name = userMap.get(id);
    return { label: name ? name : `User #${id}`, color: "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300" };
  }
  return { label: target, color: "bg-secondary text-secondary-foreground" };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationsManagement() {
  const [targetType, setTargetType] = useState<TargetType>("all");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: notifData, isLoading: isLoadingNotifs } = useListNotifications({});
  const { data: coursesData } = useListCourses({ limit: 500 });
  const { data: usersData } = useListUsers({ limit: 500 });
  const sendMutation = useSendNotification();

  const courses = coursesData?.courses ?? [];
  const users = (usersData?.users ?? []) as any[];

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase();
    return users.filter((u: any) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, userSearch]);

  const courseMap = useMemo(() => new Map(courses.map((c: any) => [c.id, c.name])), [courses]);
  const userMap = useMemo(() => new Map(users.map((u: any) => [u.id, u.fullName])), [users]);

  const buildTarget = () => {
    if (targetType === "course") return `course:${selectedCourseId}`;
    if (targetType === "user") return `user:${selectedUserId}`;
    return targetType;
  };

  const selectedOption = TARGET_OPTIONS.find(o => o.value === targetType)!;

  const canSend =
    title.trim() &&
    message.trim() &&
    (targetType !== "course" || selectedCourseId) &&
    (targetType !== "user" || selectedUserId);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    setSending(true);
    try {
      await sendMutation.mutateAsync({
        data: { title: title.trim(), message: message.trim(), target: buildTarget(), imageUrl: null },
      });
      queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
      toast({ title: "Notification dispatched!" });
      setTitle("");
      setMessage("");
      setSelectedCourseId("");
      setSelectedUserId("");
      setUserSearch("");
    } catch (error: any) {
      toast({ title: "Failed to send notification", description: error.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const notifications = Array.isArray(notifData) ? notifData : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
        <p className="text-muted-foreground">Broadcast messages to users across the platform.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Compose Panel */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="h-4 w-4" /> Compose Broadcast
            </CardTitle>
            <CardDescription>Select an audience and write your message.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              {/* Target Type */}
              <div className="space-y-2">
                <Label>Audience</Label>
                <Select value={targetType} onValueChange={v => {
                  setTargetType(v as TargetType);
                  setSelectedCourseId("");
                  setSelectedUserId("");
                  setUserSearch("");
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className="flex flex-col">
                          <span>{opt.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{selectedOption.description}</p>
              </div>

              {/* Course sub-select */}
              {targetType === "course" && (
                <div className="space-y-2">
                  <Label>Select Course</Label>
                  <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a course…" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c: any) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* User sub-select */}
              {targetType === "user" && (
                <div className="space-y-2">
                  <Label>Select User</Label>
                  <Input
                    placeholder="Search by name or email…"
                    value={userSearch}
                    onChange={e => { setUserSearch(e.target.value); setSelectedUserId(""); }}
                    className="mb-1"
                  />
                  {userSearch.trim() && (
                    <div className="border rounded-md max-h-40 overflow-y-auto divide-y text-sm">
                      {filteredUsers.slice(0, 20).map((u: any) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => { setSelectedUserId(String(u.id)); setUserSearch(u.fullName); }}
                          className={`w-full text-left px-3 py-2 hover:bg-muted/60 transition-colors ${String(u.id) === selectedUserId ? "bg-muted font-medium" : ""}`}
                        >
                          <div className="font-medium truncate">{u.fullName}</div>
                          <div className="text-xs text-muted-foreground truncate">{u.email} · {u.role}</div>
                        </button>
                      ))}
                      {filteredUsers.length === 0 && (
                        <p className="px-3 py-4 text-center text-muted-foreground text-xs">No users found</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="notif-title">Title</Label>
                <Input
                  id="notif-title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Class rescheduled to Thursday"
                  maxLength={120}
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="notif-msg">Message</Label>
                <Textarea
                  id="notif-msg"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Enter the full notification text here…"
                  rows={5}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground text-right">{message.length}/1000</p>
              </div>

              {/* Preview pill */}
              {(title || message) && (
                <div className="rounded-lg border bg-muted/40 p-3 space-y-0.5">
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">Preview</p>
                  <p className="text-sm font-semibold">{title || <span className="text-muted-foreground italic">No title</span>}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{message || <span className="italic">No message</span>}</p>
                </div>
              )}

              <Button type="submit" className="w-full gap-2" disabled={sending || !canSend}>
                <Send className="h-4 w-4" />
                {sending ? "Sending…" : "Dispatch Notification"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* History Panel */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" /> Broadcast History
              </CardTitle>
              {notifications.length > 0 && (
                <span className="text-xs text-muted-foreground">{notifications.length} sent</span>
              )}
            </div>
            <CardDescription>Most recent notifications appear first.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[520px]">
              <div className="px-6 pb-4 space-y-3">
                {isLoadingNotifs ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                    <Bell className="h-10 w-10 opacity-30" />
                    <p className="text-sm">No notifications sent yet.</p>
                  </div>
                ) : (
                  notifications.map((notif: any) => {
                    const badge = targetBadge(notif.target, courseMap, userMap);
                    return (
                      <div key={notif.id} className="p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <h4 className="font-semibold text-sm leading-tight">{notif.title}</h4>
                          <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0 ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{notif.message}</p>
                        <p className="text-xs text-muted-foreground">{timeAgo(notif.createdAt)} · {new Date(notif.createdAt).toLocaleString()}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
