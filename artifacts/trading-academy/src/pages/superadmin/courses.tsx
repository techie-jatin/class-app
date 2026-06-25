import { useListCourses, useUpdateCourse, useListUsers, getListCoursesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil } from "lucide-react";
import { TablePagination } from "@/components/table-pagination";
import { useToast } from "@/hooks/use-toast";

const PAGE_LIMIT = 20;

interface EditForm {
  name: string;
  description: string;
  facultyId: string;
  status: string;
}

export default function CoursesManagement() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editCourseId, setEditCourseId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ name: "", description: "", facultyId: "", status: "active" });
  const [saving, setSaving] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useListCourses({
    search: search || undefined,
    page,
    limit: PAGE_LIMIT,
  });

  const { data: facultyList } = useListUsers({ role: "faculty", status: "active" });
  const updateCourseMutation = useUpdateCourse();

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
          <h2 className="text-2xl font-bold tracking-tight">Course Management</h2>
          <p className="text-muted-foreground">Manage platform courses and their content.</p>
        </div>
        <Button className="gap-2">
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
                  <TableHead>Lectures</TableHead>
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
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : (data?.courses.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No courses found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.name}</TableCell>
                      <TableCell className="text-muted-foreground">{course.facultyName || "Unassigned"}</TableCell>
                      <TableCell>{course.studentCount || 0}</TableCell>
                      <TableCell>{course.lectureCount || 0}</TableCell>
                      <TableCell>
                        <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
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
