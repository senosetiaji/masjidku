import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableFooter, TablePagination, FormControl, InputLabel, Select, MenuItem, TextField, Pagination } from '@mui/material'
import React from 'react'
import SkeletonTable from '../skeletons/SkeletonTable'
import { ellipsisSx } from '@/styles/utilities/ellipsis'

function TableNormal(
  { 
    columns = [], 
    data = [], 
    params = {},
    setParams = () => {},
    totalData = 0,
    pageCount = 0,
    limit = 10,
    isLoading = false,
  }
) {
  // Visibility helpers
  const isHidden = (col) => !!col?.hide
  const getVisibleChildren = (col) => (Array.isArray(col?.children) ? col.children.filter((c) => !isHidden(c)) : [])

  // Top-level visible columns
  const visibleColumns = columns.filter((col) => !isHidden(col))

  // Recursive helpers for dynamic multi-level headers
  const getLeafCount = (col) => {
    const children = getVisibleChildren(col)
    if (children.length === 0) return 1
    return children.reduce((sum, child) => sum + getLeafCount(child), 0)
  }

  const getDepth = (col) => {
    const children = getVisibleChildren(col)
    if (children.length === 0) return 1
    return 1 + Math.max(...children.map(getDepth))
  }

  const maxDepth = visibleColumns.length > 0 ? Math.max(...visibleColumns.map(getDepth)) : 1

  // Build header rows structure with proper colSpan/rowSpan
  const headerRows = Array.from({ length: maxDepth }, () => [])
  const buildHeader = (col, depth) => {
    const children = getVisibleChildren(col)
    if (children.length > 0) {
      headerRows[depth - 1].push({
        node: col,
        colSpan: children.reduce((sum, child) => sum + getLeafCount(child), 0),
        rowSpan: 1,
      })
      children.forEach((child) => buildHeader(child, depth + 1))
    } else {
      headerRows[depth - 1].push({
        node: col,
        colSpan: 1,
        rowSpan: maxDepth - depth + 1,
      })
    }
  }
  visibleColumns.forEach((col) => buildHeader(col, 1))

  // Collect leaf columns for body rendering
  const leafColumns = []
  const collectLeaves = (col) => {
    const children = getVisibleChildren(col)
    if (children.length === 0) {
      leafColumns.push(col)
    } else {
      children.forEach(collectLeaves)
    }
  }
  visibleColumns.forEach(collectLeaves)

  const totalLeafCount = leafColumns.length
  const effectiveLeafCount = Math.max(1, totalLeafCount)

  const getAlignValue = (align) => (align === 'center' ? 'center' : align === 'right' ? 'right' : 'left')

  // Helper: sum numeric values for a column if footerAccessor provided
  const computeFooterValue = (col) => {
    if (!col?.footerSum) return null

    const accessor = col?.footerAccessor
    if (typeof accessor === 'string') {
      const sum = data.reduce((acc, row) => {
        const val = row?.[accessor]
        const num = typeof val === 'number' ? val : parseFloat(val)
        return acc + (isNaN(num) ? 0 : num)
      }, 0)
      return sum
    }
    if (typeof accessor === 'function') {
      const sum = data.reduce((acc, row, idx) => {
        const val = accessor(row, idx)
        const num = typeof val === 'number' ? val : parseFloat(val)
        return acc + (isNaN(num) ? 0 : num)
      }, 0)
      return sum
    }

    // If no accessor, return footerValue if present, else empty
    return col?.footerValue ?? null
  }

  const renderPagination = () => {
    // Pagination rendering logic can be added here if needed
    const perPage = Number(limit)
    // Treat incoming params.page as 1-based; convert to 0-based index
    const currentPage = Math.min(
      Math.max(Number((params?.page ?? 1)) - 1, 0),
      Math.max(pageCount - 1, 0)
    )
    const start = totalData > 0 ? currentPage * perPage + 1 : 0
    const end = totalData > 0 ? Math.min(totalData, (currentPage + 1) * perPage) : 0
    const siblingCount = 1
    const boundaryCount = 1

    return (
      <>
        <span className="text-[13px] text-gray-600">
          {totalData > 0 ? `Menampilkan ${start}-${end} dari ${totalData}` : 'Tidak ada data'}
        </span>
        <Pagination
          count={Math.max(Number(pageCount ?? 0), 1)}
          page={currentPage + 1}
          onChange={(_, value) => setParams({ ...params, page: value })}
          siblingCount={siblingCount}
          boundaryCount={boundaryCount}
          size="small"
          shape="rounded"
          showFirstButton
          showLastButton
          color='primary'
        />
      </>
    )
  }

  // Local state for debounced search input
  const [searchValue, setSearchValue] = React.useState(params?.search ?? '')
  const searchDebounceRef = React.useRef(null)

  // Keep local input in sync if parent updates params.search externally
  React.useEffect(() => {
    setSearchValue(params?.search ?? '')
  }, [params?.search])

  // Clear timer on unmount
  React.useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }
    }
  }, [])

  const handleSearch = (value) => {
    setSearchValue(value)
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      // Use functional update to avoid stale params
      setParams((prev) => ({ ...prev, search: value, page: 1 }))
    }, 500)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        {/* select data per-page & search */}
        <div className="flex items-center gap-3">
          <FormControl size="small" className="w-28">
            <InputLabel id="per-page-label">Per Page</InputLabel>
            <Select
              labelId="per-page-label"
              id="per-page"
              label="Per Page"
              value={Number(limit)}
              onChange={(e) => setParams({ ...params, limit: Number(e.target.value), page: 1 })}
            >
              {[10, 20, 50, 100].map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <TextField
          size="small"
          className="w-64"
          placeholder="Cari..."
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      {isLoading ? <SkeletonTable rows={10} /> : (
        <div className="">
          <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
            <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
              <TableHead className='bg-gray-100!'>
                {headerRows.map((row, rowIdx) => (
                  <TableRow className='bg-gray-100!'  key={`hr-${rowIdx}`}>
                    {row.map((cell, cellIdx) => (
                      <TableCell
                        className='p-2! text-[13px]!'
                        key={`hc-${rowIdx}-${cellIdx}`}
                        colSpan={cell.colSpan}
                        rowSpan={cell.rowSpan}
                        align={getAlignValue(cell.node.align)}
                        sx={{ minWidth: cell.node.sx?.minWidth, textAlign: cell.node.sx?.textAlign, ...cell.node.sx, ...(cell.node.ellipsis ? ellipsisSx : {}) }}
                      >
                        <div className="font-semibold">
                          {typeof cell.node.label === 'function' ? cell.node.label() : cell.node.label}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      className='p-2! text-[13px]!' colSpan={effectiveLeafCount} align="center">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : data.length > 0 ? (
                  data.map((row, rowIndex) => (
                    <TableRow
                      key={`r-${rowIndex}`}
                      sx={{
                        backgroundColor: rowIndex % 2 === 0 ? 'background.paper' : 'grey.50',
                      }}
                    >
                      {leafColumns.map((col, colIndex) => (
                        <TableCell
                          className='p-2! text-[13px]!'
                          key={`c-${rowIndex}-${colIndex}`}
                          align={getAlignValue(col.align)}
                          sx={{ verticalAlign: 'top', textAlign: col.sx?.textAlign, ...col.sx, ...(col.ellipsis ? ellipsisSx : {}) }}
                        >
                          {typeof col.render === 'function' ? col.render(row, rowIndex) : null}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      className='p-2! text-[13px]!' colSpan={effectiveLeafCount} align="center">
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {/* pagination here */}
          <div className="mt-4 flex items-center justify-between">
            {renderPagination()}
          </div>
        </div>
      )}
    </>
  )
}

export default TableNormal
