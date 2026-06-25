import { useState } from "react";
import { useListAdmins, useCreateAdmin, useUpdateUserStatus, getListAdminsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function AdminsManagement() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", mobileNumber: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useListAdmins({ search: search || undefined });
  const createAdminMutation = useCreateAdmin();
  const updateStatusMutation = useUpdateUserStatus();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) {
      toast({ title: "Required fields missing", variant: "destructive" }); return;
    }
    setSubmitting(true);
    try {
      await createAdminMutation.mutateAsync({ data: form });
      queryClient.invalidateQueries({ queryKey: getListAdminsQueryKey() });
      toast({ title: "Admin created successfully" });
      setOpen(false);
      setForm({ fullName: "", email: "", mobileNumber: "", password: "" });
    } catch (error: any) {
      toast({ title: "Failed to create admin", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (userId: number, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: userId, data: { status } });
      queryClient.invalidateQueries({ queryKey: getListAdminsQueryKey() });
      toast({ title: "Status updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Management</h2>
          <p className="text-muted-foreground">Manage platform administrators and their access.</p>
        </div>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Add Admin
        </Button>
      </div>

      <Card>
        <CardHeader className="py-4">
          <Input
            placeholder="Search admins..."
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
                  <TableHead>Mobile</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : (data?.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No admins found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.fullName}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>{admin.mobileNumber || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={admin.status === "active" ? "default" : "secondary"}>
                          {admin.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {admin.status === "active" && (
                            <Button size="sm" variant="destructive" onClick={() => handleStatusChange(admin.id, "blocked")}>
                              Block
                            </Button>
                          )}
                          {admin.status === "blocked" && (
                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(admin.id, "active")}>
                              Unblock
                            </Button>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Create New Admin</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" placeholder="Jane Smith" value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" placeholder="jane@tradingacademy.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input id="mobile" placeholder="+91-9000000000" value={form.mobileNumber}
                onChange={e => setForm(f => ({ ...f, mobileNumber: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password *</Label>
              <Input id="password" type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create Admin"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
