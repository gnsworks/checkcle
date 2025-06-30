
import { TableCell, TableRow } from "@/components/ui/table";

interface DockerEmptyStateProps {
  searchTerm: string;
}

export const DockerEmptyState = ({ searchTerm }: DockerEmptyStateProps) => {
  return (
    <TableRow>
      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <div className="text-lg font-medium">
            {searchTerm ? "No containers found" : "No containers running"}
          </div>
          <div className="text-sm">
            {searchTerm ? "Try adjusting your search terms." : "Start some containers to see them here."}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};