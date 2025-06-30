
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const DockerTableHeader = () => {
  return (
    <TableHeader>
      <TableRow className="border-border bg-muted/30">
        <TableHead className="min-w-[200px] font-semibold">Container</TableHead>
        <TableHead className="min-w-[100px] font-semibold">Status</TableHead>
        <TableHead className="min-w-[140px] font-semibold">CPU Usage</TableHead>
        <TableHead className="min-w-[160px] font-semibold">Memory</TableHead>
        <TableHead className="min-w-[160px] font-semibold">Disk</TableHead>
        <TableHead className="min-w-[100px] font-semibold">Uptime</TableHead>
        <TableHead className="min-w-[160px] font-semibold">Last Checked</TableHead>
        <TableHead className="min-w-[80px] text-center font-semibold">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};