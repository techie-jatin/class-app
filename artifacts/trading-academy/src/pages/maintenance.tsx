import { AlertOctagon } from "lucide-react";

export default function Maintenance() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
            <AlertOctagon className="h-10 w-10 text-primary" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-foreground tracking-tight">System Update in Progress</h1>
        
        <p className="text-muted-foreground">
          Apex Academy is currently undergoing scheduled maintenance. 
          We are upgrading our terminal infrastructure to provide better execution and analytics.
        </p>
        
        <div className="pt-8 border-t border-border mt-8">
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">
            Estimated Return: Shortly
          </p>
        </div>
      </div>
    </div>
  );
}
