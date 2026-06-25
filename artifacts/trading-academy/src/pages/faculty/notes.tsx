import { useState } from "react";
import { useListNotes, useCreateNote, useDeleteNote, useListCourses, getListNotesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ExternalLink, Plus, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function FacultyNotes() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ fileName: "", courseId: "", driveFileId: "", driveViewUrl: "" });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useListNotes({});
  const { data: coursesData } = useListCourses({});
  const createMutation = useCreateNote();
  const deleteMutation = useDeleteNote();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fileName || !form.courseId || !form.driveViewUrl) {
      toast({ title: "File name, course, and view link are required", variant: "destructive" }); return;
    }
    setSubmitting(true);
    try {
      await createMutation.mutateAsync({
        data: {
          fileName: form.fileName,
          courseId: parseInt(form.courseId),
          driveFileId: form.driveFileId || form.driveViewUrl,
          driveViewUrl: form.driveViewUrl,
        }
      });
      queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
      toast({ title: "Note uploaded successfully" });
      setOpen(false);
      setForm({ fileName: "", courseId: "", driveFileId: "", driveViewUrl: "" });
    } catch (error: any) {
      toast({ title: "Failed to upload note", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this note?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
      toast({ title: "Note deleted" });
    } catch (error: any) {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notes & Materials</h2>
          <p className="text-muted-foreground">Manage study materials for your courses.</p>
        </div>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Upload Note
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-10 w-10 mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : data?.length ? (
          data.map((note) => (
            <Card key={note.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex flex-col h-full">
                <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm line-clamp-2 mb-1">{note.fileName}</h4>
                  <p className="text-xs text-muted-foreground">{note.courseName}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {new Date(note.uploadedAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-1">
                    {note.driveViewUrl && (
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                        <a href={note.driveViewUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(note.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-muted/20 rounded-xl border border-dashed border-border">
            <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground">No Materials Uploaded</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-6">
              Click the button above to share study materials with your students.
            </p>
            <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Upload Note
            </Button>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Upload Study Material</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="fname">File Name / Title *</Label>
              <Input id="fname" placeholder="e.g. Week 3 — Candlestick Patterns.pdf" value={form.fileName}
                onChange={e => setForm(f => ({ ...f, fileName: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Course *</Label>
              <Select value={form.courseId} onValueChange={v => setForm(f => ({ ...f, courseId: v }))} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {coursesData?.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="driveUrl">Google Drive / File View URL *</Label>
              <Input id="driveUrl" placeholder="https://drive.google.com/file/d/..." value={form.driveViewUrl}
                onChange={e => setForm(f => ({ ...f, driveViewUrl: e.target.value, driveFileId: e.target.value }))} required />
              <p className="text-xs text-muted-foreground">
                Share the Google Drive link with "Anyone with link can view" permission
              </p>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Uploading..." : "Upload Material"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
