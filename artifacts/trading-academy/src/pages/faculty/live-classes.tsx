import { useState } from "react";
import { useListLiveClasses, useCreateLiveClass, useListCourses, getListLiveClassesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MonitorPlay, Clock, ExternalLink, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function FacultyLiveClasses() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", courseId: "", scheduledAt: "", youtubeUrl: ""
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useListLiveClasses({});
  const { data: coursesData } = useListCourses({});
  const createMutation = useCreateLiveClass();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.courseId || !form.scheduledAt || !form.youtubeUrl) {
      toast({ title: "Please fill in all required fields", variant: "destructive" }); return;
    }
    setSubmitting(true);
    try {
      await createMutation.mutateAsync({
        data: {
          title: form.title,
          description: form.description,
          courseId: parseInt(form.courseId),
          scheduledAt: new Date(form.scheduledAt).toISOString(),
          youtubeUrl: form.youtubeUrl,
        }
      });
      queryClient.invalidateQueries({ queryKey: getListLiveClassesQueryKey() });
      toast({ title: "Live class scheduled successfully" });
      setOpen(false);
      setForm({ title: "", description: "", courseId: "", scheduledAt: "", youtubeUrl: "" });
    } catch (error: any) {
      toast({ title: "Failed to schedule class", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Live Classes</h2>
          <p className="text-muted-foreground">Manage your scheduled live sessions.</p>
        </div>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Schedule Class
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))
        ) : data?.length ? (
          data.map((cls) => (
            <Card key={cls.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs font-semibold text-primary">{cls.courseName}</div>
                  <div className="flex items-center gap-1 text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
                    <Clock className="h-3 w-3" />
                    {new Date(cls.scheduledAt).toLocaleString()}
                  </div>
                </div>
                <CardTitle className="text-lg">{cls.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-2">{cls.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-4 border-t border-border flex gap-2">
                <Button asChild className="w-full gap-2">
                  <a href={cls.youtubeUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" /> Join Session
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-muted/20 rounded-xl border border-dashed border-border">
            <MonitorPlay className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground">No Scheduled Classes</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-6">
              Click the button above to schedule your first live class.
            </p>
            <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Schedule Class
            </Button>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Schedule Live Class</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Session Title *</Label>
              <Input id="title" placeholder="e.g. Options Trading — Live Q&A" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Input id="desc" placeholder="What will be covered in this session?" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Course *</Label>
              <Select value={form.courseId} onValueChange={v => setForm(f => ({ ...f, courseId: v }))} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {coursesData?.courses?.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Date & Time *</Label>
              <Input id="scheduledAt" type="datetime-local" value={form.scheduledAt}
                onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtubeUrl">Meet / YouTube Live Link *</Label>
              <Input id="youtubeUrl" placeholder="https://meet.google.com/..." value={form.youtubeUrl}
                onChange={e => setForm(f => ({ ...f, youtubeUrl: e.target.value }))} required />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Scheduling..." : "Schedule Class"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
