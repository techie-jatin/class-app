import { useListDeviceSessions, useRemoveDeviceSession, getListDeviceSessionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { MonitorX } from "lucide-react";

export default function DeviceManagement() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data, isLoading } = useListDeviceSessions({ search: search || undefined });
  const removeSessionMutation = useRemoveDeviceSession();

  const handleRemoveSession = async (sessionId: number) => {
    try {
      await removeSessionMutation.mutateAsync({ id: sessionId });
      queryClient.invalidateQueries({ queryKey: getListDeviceSessionsQueryKey() });
      toast({ title: "Device session removed" });
    } catch (error: any) {
      toast({ title: "Failed to remove session", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Device Management</h2>
          <p className="text-muted-foreground">Monitor and manage active user sessions.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4">
          <Input 
            placeholder="Search by user or email..." 
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
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Device Fingerprint</TableHead>
                  <TableHead>Last Login</TableHead>
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
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No active sessions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.userName}</TableCell>
                      <TableCell>{session.userEmail}</TableCell>
                      <TableCell className="uppercase text-xs font-semibold">{session.userRole}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{session.deviceFingerprint}</TableCell>
                      <TableCell>{new Date(session.lastLoginAt).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="gap-2"
                          onClick={() => handleRemoveSession(session.id)}
                          disabled={removeSessionMutation.isPending}
                        >
                          <MonitorX className="h-3 w-3" /> Terminate
                        </Button>
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
