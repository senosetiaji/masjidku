import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Skeleton,
} from "@mui/material";

function TableDashboard({ columns = [], data = [], isLoading = false }) {
  const rowsToRender = isLoading ? Array.from({ length: 5 }) : data;

  return (
    <TableContainer component={Paper} elevation={1}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.id || col.field}
                align={col.align || "left"}
                sx={{ fontWeight: 600, ...(col.sx || {}) }}
              >
                {col.label || col.headerName || col.field}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rowsToRender.length === 0 && !isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <Typography variant="body2" color="text.secondary">
                  Tidak ada data
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            rowsToRender.map((row, rowIndex) => (
              <TableRow key={row?.id || rowIndex} hover>
                {columns.map((col) => {
                  const value = col.render ? col.render(row, rowIndex) : row?.[col.id || col.field];
                  return (
                    <TableCell key={col.id || col.field} align={col.align || "left"} sx={col.sx || {}}>
                      {isLoading ? <Skeleton width="80%" /> : value ?? "-"}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default TableDashboard;