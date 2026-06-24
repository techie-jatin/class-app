import { useListUsers, useUpdateUserStatus, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentManagement() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data, isLoading } = useListUsers({
    search: search || undefined,
    role: "student"
  });

  const updateStatusMutation = useUpdateUserStatus();

  const handleStatusChange = async (userId: number, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: userId,
        data: { status }
      });
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      toast({ title: "Status updated successfully" });
    } catch (error: any) {
      toast({ title: "Error updating status", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">Manage student accounts and approvals.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4">
          <Input 
            placeholder="Search students..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : data?.users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No students found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.users.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.fullName}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        <Badge variant={student.status === 'active' ? 'default' : student.status === 'pending' ? 'secondary' : 'destructive'}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(student.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {student.status === 'pending' && (
                            <>
                              <Button size="sm" variant="default" onClick={() => handleStatusChange(student.id, 'active')}>Approve</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleStatusChange(student.id, 'rejected')}>Reject</Button>
                            </>
                          )}
                          {student.status === 'active' && (
                            <Button size="sm" variant="destructive" onClick={() => handleStatusChange(student.id, 'blocked')}>Block</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
