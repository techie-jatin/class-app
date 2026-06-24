import { useListAdmins, useCreateAdmin, getListAdminsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";

export default function AdminsManagement() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useListAdmins({ search: search || undefined });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Management</h2>
          <p className="text-muted-foreground">Manage platform administrators and their access.</p>
        </div>
        <Button className="gap-2">
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
                ) : data?.length === 0 ? (
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
                        <Badge variant={admin.status === 'active' ? 'default' : 'secondary'}>
                          {admin.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">Edit</Button>
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
