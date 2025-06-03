import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

interface TableSkeletonProps {
  columns: Array<{ key: string; label: string; className?: string }>;
  rows?: number;
  cellWidths?: string[];
}

export default function TableSkeleton({ columns, rows = 6, cellWidths }: TableSkeletonProps) {
  return (
    <div className="overflow-hidden">
      <Table aria-label="Loading table">
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(rows)].map((_, i) => (
            <TableRow key={i}>
              {columns.map((col, j) => (
                <TableCell key={col.key} className={col.className}>
                  <div
                    className={`h-4 rounded animate-pulse bg-muted/50 ${
                      cellWidths && cellWidths[j] ? cellWidths[j] : 'w-24'
                    }`}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
