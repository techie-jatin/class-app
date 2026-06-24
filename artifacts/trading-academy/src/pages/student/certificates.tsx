import { useListCertificates } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Award, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function StudentCertificates() {
  const { data, isLoading } = useListCertificates({});

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Certificates</h2>
        <p className="text-muted-foreground">Your verified achievements and completions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : data?.length ? (
          data.map((cert) => (
            <Card key={cert.id} className="relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Award className="h-32 w-32" />
              </div>
              <CardContent className="p-6 relative z-10">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="bg-amber-500/10 p-4 rounded-full text-amber-500 shrink-0">
                    <Award className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{cert.courseName}</h3>
                    <div className="text-sm text-muted-foreground space-y-1 mb-4">
                      <p>Certificate ID: <span className="font-mono text-foreground">{cert.certificateNumber}</span></p>
                      <p>Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>
                    </div>
                    {cert.driveViewUrl && (
                      <Button size="sm" variant="outline" className="gap-2" asChild>
                        <a href={cert.driveViewUrl} target="_blank" rel="noreferrer">
                          <Download className="h-4 w-4" /> Download PDF
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-muted/20 rounded-xl border border-dashed border-border">
            <Award className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground">No Certificates Yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              Complete your enrolled courses and assignments to earn verified certificates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
