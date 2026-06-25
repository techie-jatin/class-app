import { useState, useEffect, useMemo } from "react";
import {
  useGetCourseStudents,
  useListUsers,
  useAssignStudentsToCourse,
  getGetCourseStudentsQueryKey,
  getListCoursesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Users, Search } from "lucide-react";

interface EnrollStudentsSheetProps {
  courseId: number | null;
  courseName: string;
  onClose: () => void;
}

export function EnrollStudentsSheet({ courseId, courseName, onClose }: EnrollStudentsSheetProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: enrolledStudents, isLoading: isLoadingEnrolled } = useGetCourseStudents(
    courseId ?? 0,
    { query: { enabled: courseId !== null } }
  );

  const { data: allStudentsData, isLoading: isLoadingAll } = useListUsers({
    role: "student",
    status: "active",
    limit: 500,
  });

  const assignMutation = useAssignStudentsToCourse();

  useEffect(() => {
    if (enrolledStudents) {
      setSelectedIds(new Set(enrolledStudents.map((s: any) => s.id)));
    }
  }, [enrolledStudents]);

  useEffect(() => {
    if (courseId === null) {
      setSearch("");
      setSelectedIds(new Set());
    }
  }, [courseId]);

  const allStudents = (allStudentsData?.users ?? []) as any[];

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return allStudents;
    const q = search.toLowerCase();
    return allStudents.filter((s: any) =>
      s.fullName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }, [allStudents, search]);

  const toggle = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    if (!courseId) return;
    setSaving(true);
    try {
      await assignMutation.mutateAsync({
        id: courseId,
        data: { studentIds: [...selectedIds] },
      });
      queryClient.invalidateQueries({ queryKey: getGetCourseStudentsQueryKey(courseId) });
      queryClient.invalidateQueries({ queryKey: getListCoursesQueryKey() });
      const n = selectedIds.size;
      toast({ title: `Enrollment updated — ${n} student${n !== 1 ? "s" : ""} enrolled` });
      onClose();
    } catch (error: any) {
      toast({ title: "Failed to update enrollment", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const isLoading = isLoadingEnrolled || isLoadingAll;
  const enrolledCount = selectedIds.size;
  const totalCount = allStudents.length;

  return (
    <Sheet open={courseId !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent className="w-full sm:max-w-[520px] flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Manage Enrollment
          </SheetTitle>
          <SheetDescription>
            <span className="font-medium text-foreground">{courseName}</span>
            {totalCount > 0 && (
              <span className="ml-1">
                — <span className="text-primary font-medium">{enrolledCount}</span> of {totalCount} students enrolled
              </span>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 py-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-3 py-2 space-y-0.5">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-3">
                  <Skeleton className="h-4 w-4 rounded" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))
            ) : filteredStudents.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground text-sm">
                {search
                  ? `No students match "${search}"`
                  : "No active students available."}
              </div>
            ) : (
              filteredStudents.map((student: any) => {
                const checked = selectedIds.has(student.id);
                return (
                  <label
                    key={student.id}
                    htmlFor={`student-${student.id}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer hover:bg-muted/60 transition-colors"
                  >
                    <Checkbox
                      id={`student-${student.id}`}
                      checked={checked}
                      onCheckedChange={() => toggle(student.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{student.fullName}</div>
                      <div className="text-xs text-muted-foreground truncate">{student.email}</div>
                    </div>
                    {checked && (
                      <Badge variant="secondary" className="text-[10px] shrink-0 px-1.5">
                        Enrolled
                      </Badge>
                    )}
                  </label>
                );
              })
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || isLoading} className="flex-1">
            {saving ? "Saving…" : `Save (${enrolledCount} enrolled)`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
