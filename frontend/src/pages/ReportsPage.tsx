import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives";
import { apiUrl, sessionStore } from "@/lib/api";

const reports = [
  { id: "fuel-efficiency", title: "Fuel Efficiency", body: "Average efficiency, distance, liters, and cost by vehicle." },
  { id: "operational-cost", title: "Operational Cost", body: "Expense totals grouped by cost category." },
  { id: "fleet-utilization", title: "Fleet Utilization", body: "Trip counts, completed trips, and distance by vehicle." },
  { id: "driver-performance", title: "Driver Performance", body: "Safety scores and trip completion by driver." },
  { id: "maintenance-cost", title: "Maintenance Cost", body: "Maintenance spend and status by vehicle." },
  { id: "vehicle-roi", title: "Vehicle ROI", body: "Estimated revenue, acquisition cost, total cost, and ROI." }
];

export function ReportsPage() {
  const token = sessionStore.get()?.accessToken;
  const download = async (id: string, format: "csv" | "pdf") => {
    const response = await fetch(`${apiUrl}/reports/${id}?format=${format}`, { headers: { Authorization: `Bearer ${token}` } });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${id}.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-muted-foreground">Export operational, financial, safety, and asset reports.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-primary/15 p-2 text-primary"><FileText className="h-5 w-5" /></div>
                <CardTitle>{report.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="min-h-10 text-sm text-muted-foreground">{report.body}</p>
              <div className="mt-5 flex gap-2">
                <Button variant="outline" onClick={() => download(report.id, "csv")}><Download className="h-4 w-4" /> CSV</Button>
                <Button variant="outline" onClick={() => download(report.id, "pdf")}><Download className="h-4 w-4" /> PDF</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
