import { useListCertificates } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";

export default function AdminCertificates() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useListCertificates({});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Certificates</h2>
          <p className="text-muted-foreground">Issue and manage student certificates.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Issue Certificate
        </Button>
      </div>

      <Card>
        <CardHeader className="py-4">
          <Input 
            placeholder="Search certificates..." 
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
                  <TableHead>Certificate ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No certificates found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-mono text-xs">{cert.certificateNumber}</TableCell>
                      <TableCell className="font-medium">{cert.studentName}</TableCell>
                      <TableCell>{cert.courseName}</TableCell>
                      <TableCell>{new Date(cert.issueDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">View</Button>
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
