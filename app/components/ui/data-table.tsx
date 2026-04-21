import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "./table";
import { Input } from "./input";
import { Button } from "./button";
import { FaSortUp, FaSortDown, FaSort } from "react-icons/fa";
import { Card, CardContent } from "./card";

interface DataTableProps<TData> {
  columns: any[];
  data: TData[];
  noResultsMessage?: string;
}

export function DataTable<TData>({
  columns,
  data,
  noResultsMessage = "Filtrenize uygun sonuç bulunamadı.",
}: DataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = React.useState('');

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="space-y-4">
      {/* Search and Page Size Controls - Responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Input
          placeholder="Ara..."
          value={globalFilter || ""}
          onChange={e => setGlobalFilter(e.target.value)}
          className="w-full sm:max-w-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="flex flex-row sm:flex-col lg:flex-row items-stretch sm:items-start lg:items-center gap-2 w-full sm:w-auto">
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className="border rounded p-2 flex-1 sm:w-full lg:w-36 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {[10, 25, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {pageSize} kayıt
              </option>
            ))}
          </select>
          <select
            className="lg:hidden border rounded p-2 flex-1 sm:w-full lg:w-36 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            defaultValue=""
          >
            <option value="">Sırala</option>
            <option value="newest">Yeni → Eski</option>
            <option value="oldest">Eski → Yeni</option>
            <option value="title-asc">A → Z</option>
            <option value="title-desc">Z → A</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                    style={{
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <span style={{ marginLeft: 4, fontSize: 12, display: 'inline-flex', alignItems: 'center' }}>
                          {header.column.getIsSorted() === 'asc' ? (
                            <FaSortUp />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <FaSortDown />
                          ) : (
                            <FaSort style={{ opacity: 0.4 }} />
                          )}
                        </span>
                      )}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="group">
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {noResultsMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {table.getRowModel().rows.length > 0 ? (
          table.getRowModel().rows.map(row => (
            <Card key={row.id} className="p-4">
              <CardContent className="p-0 space-y-3">
                {row.getVisibleCells().map(cell => {
                  const header = cell.column.columnDef.header;
                  const headerText = typeof header === 'string' ? header : 
                    typeof header === 'function' ? 'Field' : 'Field';
                  
                  // Skip rendering if it's an actions column with no header text
                  if (headerText === 'İşlemler' || cell.column.id === 'actions') {
                    return (
                      <div key={cell.id} className="flex justify-end pt-2 border-t">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    );
                  }
                  
                  return (
                    <div key={cell.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="text-sm font-medium text-muted-foreground min-w-0 sm:min-w-[120px]">
                        {headerText}:
                      </span>
                      <div className="text-sm font-medium break-words flex-1 sm:text-right">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="p-8">
            <CardContent className="p-0 text-center text-muted-foreground">
              {noResultsMessage}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination - Responsive */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Sayfa {table.getState().pagination.pageIndex + 1} / {table.getPageCount()} 
          ({table.getFilteredRowModel().rows.length} kayıt)
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Önceki
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Sonraki
          </Button>
        </div>
      </div>
    </div>
  );
}