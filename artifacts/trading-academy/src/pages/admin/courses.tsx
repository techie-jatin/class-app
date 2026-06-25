import { useState } from "react";
import { useListCourses, useCreateCourse, useUpdateCourse, useListUsers, getListCoursesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { TablePagination } from "@/components/table-pagination";

const PAGE_LIMIT = 20;

interface EditForm {
  name: string;
  description: string;
  facultyId: string;
  status: string;
}

export default function AdminCourses() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", facultyId: "", status: "active" });

  const [editCourseId, setEditCourseId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ name: "", description: "", facultyId: "", status: "active" });
  const [saving, setSaving] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useListCourses({ search: search || undefined, page, limit: PAGE_LIMIT });
  const { data: facultyList } = useListUsers({ role: "faculty", status: "active" });
  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description) {
      toast({ title: "Name and description are required", variant: "destructive" }); return;
    }
    setSubmitting(true);
    try {
      await createCourseMutation.mutateAsync({
        data: {
          name: form.name,
          description: form.description,
          facultyId: form.facultyId ? parseInt(form.facultyId) : null,
          status: form.status,
        }
      });
      queryClient.invalidateQueries({ queryKey: getListCoursesQueryKey() });
      toast({ title: "Course created successfully" });
      setOpen(false);
      setForm({ name: "", description: "", facultyId: "", status: "active" });
    } catch (error: any) {
      toast({ title: "Failed to create course", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (course: { id: number; name: string; description: string; facultyId?: number | null; status: string }) => {
    setEditCourseId(course.id);
    setEditForm({
      name: course.name,
      description: course.description ?? "",
      facultyId: course.facultyId ? String(course.facultyId) : "",
      status: course.status,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCourseId || !editForm.name) {
      toast({ title: "Course name is required", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      await updateCourseMutation.mutateAsync({
        id: editCourseId,
        data: {
          name: editForm.name,
          description: editForm.description || undefined,
          facultyId: editForm.facultyId ? parseInt(editForm.facultyId) : null,
          status: editForm.status,
        },
      });
      queryClient.invalidateQueries({ queryKey: getListCoursesQueryKey() });
      toast({ title: "Course updated successfully" });
      setEditCourseId(null);
    } catch (error: any) {
      toast({ title: "Failed to update course", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Courses</h2>
          <p className="text-muted-foreground">Manage active courses and assign instructors.</p>
        </div>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Add Course
        </Button>
      </div>

      <Card>
        <CardHeader className="py-4">
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="max-w-sm"
          />
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border mx-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : (data?.courses.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No courses found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.name}</TableCell>
                      <TableCell className="text-muted-foreground">{course.facultyName || <span className="text-muted-foreground/50 text-sm italic">Unassigned</span>}</TableCell>
                      <TableCell>{course.studentCount ?? 0}</TableCell>
                      <TableCell>
                        <Badge variant={course.status === "active" ? "default" : "secondary"}>
                          {course.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => openEdit(course)}>
                          <Pencil className="h-3 w-3" /> Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <TablePagination
            page={page}
            total={data?.total ?? 0}
            limit={PAGE_LIMIT}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      {/* Create Course Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Course Name *</Label>
              <Input id="name" placeholder="e.g. Technical Analysis Mastery" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" placeholder="Brief course description" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} required />
            </div>
            <div className="space-y-2">
              <Label>Assign Instructor</Label>
              <Select value={form.facultyId} onValueChange={v => setForm(f => ({ ...f, facultyId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select faculty (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {facultyList?.users?.map(fac => (
                    <SelectItem key={fac.id} value={String(fac.id)}>{fac.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Creating…" : "Create Course"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Course Sheet */}
      <Sheet open={editCourseId !== null} onOpenChange={(open) => { if (!open) setEditCourseId(null); }}>
        <SheetContent className="w-full sm:max-w-[480px] flex flex-col">
          <SheetHeader>
            <SheetTitle>Edit Course</SheetTitle>
            <SheetDescription>Update course details. Changes are saved immediately.</SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSave} className="flex flex-col flex-1 mt-6 space-y-5 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Course Name *</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Technical Analysis Mastery"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                value={editForm.description}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this course..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Instructor</Label>
              <Select value={editForm.facultyId} onValueChange={v => setEditForm(f => ({ ...f, facultyId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select instructor (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {facultyList?.users?.map(fac => (
                    <SelectItem key={fac.id} value={String(fac.id)}>{fac.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <SheetFooter className="mt-auto pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setEditCourseId(null)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
