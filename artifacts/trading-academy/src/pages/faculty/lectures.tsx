import { useState } from "react";
import { useListLectures, useCreateLecture, useListCourses, getListLecturesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Plus, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

function extractYoutubeId(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : url.trim();
}

export default function FacultyLectures() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", courseId: "", youtubeUrl: "" });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useListLectures({});
  const { data: coursesData } = useListCourses({});
  const createMutation = useCreateLecture();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.courseId || !form.youtubeUrl) {
      toast({ title: "Title, course, and YouTube URL are required", variant: "destructive" }); return;
    }
    setSubmitting(true);
    try {
      const youtubeVideoId = extractYoutubeId(form.youtubeUrl);
      await createMutation.mutateAsync({
        data: {
          title: form.title,
          description: form.description,
          courseId: parseInt(form.courseId),
          youtubeVideoId,
        }
      });
      queryClient.invalidateQueries({ queryKey: getListLecturesQueryKey() });
      toast({ title: "Lecture uploaded successfully" });
      setOpen(false);
      setForm({ title: "", description: "", courseId: "", youtubeUrl: "" });
    } catch (error: any) {
      toast({ title: "Failed to upload lecture", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Lectures</h2>
          <p className="text-muted-foreground">Manage your uploaded video content.</p>
        </div>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Upload Lecture
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="flex flex-col">
              <Skeleton className="h-40 w-full rounded-t-xl" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
            </Card>
          ))
        ) : data?.length ? (
          data.map((lecture) => (
            <Card key={lecture.id} className="flex flex-col overflow-hidden group">
              <div className="aspect-video w-full bg-black relative">
                {lecture.youtubeVideoId ? (
                  <img
                    src={`https://img.youtube.com/vi/${lecture.youtubeVideoId}/mqdefault.jpg`}
                    alt={lecture.title}
                    className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-black/90">
                    <Video className="h-10 w-10 text-white/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {lecture.youtubeVideoId && (
                    <Button variant="secondary" size="sm" asChild>
                      <a href={`https://www.youtube.com/watch?v=${lecture.youtubeVideoId}`} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" /> Watch on YouTube
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              <CardHeader className="py-4">
                <div className="text-xs font-semibold text-primary mb-1">{lecture.courseName}</div>
                <CardTitle className="text-lg line-clamp-1">{lecture.title}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{lecture.description}</p>
              </CardHeader>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-muted/20 rounded-xl border border-dashed border-border">
            <Video className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground">No Lectures Uploaded</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-6">
              Click the button above to add your first lecture.
            </p>
            <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Upload Lecture
            </Button>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Upload New Lecture</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="ltitle">Lecture Title *</Label>
              <Input id="ltitle" placeholder="e.g. Introduction to Candlestick Patterns" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ldesc">Description</Label>
              <Input id="ldesc" placeholder="Brief description of what's covered" value={form.description}
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
              <Label htmlFor="yturl">YouTube Video URL or ID *</Label>
              <Input id="yturl" placeholder="https://www.youtube.com/watch?v=... or video ID" value={form.youtubeUrl}
                onChange={e => setForm(f => ({ ...f, youtubeUrl: e.target.value }))} required />
              <p className="text-xs text-muted-foreground">Paste the full YouTube URL or just the video ID (11 characters)</p>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Uploading..." : "Upload Lecture"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
