/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { dataAPI, filesAPI } from '../services/api';
import DataTable from '../components/DataTable';
import Charts from '../components/Charts';
// AskAI removed

export default function Dashboard() {
  const { fileId } = useParams();
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  // Ask AI removed

  useEffect(() => {
    loadFileInfo();
    loadColumns();
  }, [fileId]);

  useEffect(() => {
    loadRows();
  }, [fileId, page, pageSize, sortBy, sortDir, search, filters]);

  useEffect(() => {
    if (columns.length > 0) {
      loadChartData();
    }
  }, [columns, filters, search]);

  const loadFileInfo = async () => {
    try {
      const response = await filesAPI.getFile(fileId);
      setFile(response.data);
    } catch (err) {
      console.error('Failed to load file info:', err);
    }
  };

  const loadColumns = async () => {
    try {
      const response = await dataAPI.getColumns(fileId);
      setColumns(response.data);
    } catch (err) {
      console.error('Failed to load columns:', err);
    }
  };

  const loadRows = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize,
        sort_by: sortBy,
        sort_dir: sortDir,
        search: search || undefined,
        filters: Object.keys(filters).length > 0 ? JSON.stringify(filters) : undefined
      };

      const response = await dataAPI.getRows(fileId, params);
      setRows(response.data.rows);
      setTotal(response.data.total);
    } catch (err) {
      console.error('Failed to load rows:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadChartData = async () => {
    try {
      const numericCol = columns.find(c => c.type === 'number');
      // Prefer a string column; fall back to date; finally any column name
      const dimCol = (columns.find(c => c.type === 'string') || columns.find(c => c.type === 'date') || columns[0]);
      if (!dimCol) return;

      let metrics;
      let valueKey;
      let datasetLabel;
      if (numericCol) {
        metrics = [{ col: numericCol.name, agg: 'sum' }];
        valueKey = `${numericCol.name}_sum`;
        datasetLabel = `Sum of ${numericCol.name}`;
      } else {
        // No numeric column detected: use count aggregate
        metrics = [{ col: dimCol.name, agg: 'count' }];
        valueKey = `${dimCol.name}_count`;
        datasetLabel = `Count by ${dimCol.name}`;
      }

      const response = await dataAPI.aggregate(fileId, {
        group_by: [dimCol.name],
        metrics,
        filters,
        search: search || undefined
      });

      setChartData({
        labels: response.data.data.map(d => d[dimCol.name]),
        values: response.data.data.map(d => d[valueKey] ?? 0),
        numericCol: numericCol?.name || null,
        stringCol: dimCol.name,
        datasetLabel,
      });
    } catch (err) {
      console.error('Failed to load chart data:', err);
    }
  };

  const handleExport = async () => {
    try {
      const params = {
        search: search || undefined,
        filters: Object.keys(filters).length > 0 ? JSON.stringify(filters) : undefined,
      };
      const res = await dataAPI.exportCSV(fileId, params);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_${fileId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const handleFilter = (column, value) => {
    setFilters(prev => {
      if (!value) {
        const newFilters = { ...prev };
        delete newFilters[column];
        return newFilters;
      }
      return { ...prev, [column]: value };
    });
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* AI status banner removed */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {file?.filename}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Total rows: {total}
        </p>
      </div>

      <div className="mb-6 flex gap-3 items-center">
        <input
          type="text"
          placeholder="Search across all columns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        <button
          onClick={handleExport}
          className="whitespace-nowrap bg-gray-200 dark:bg-gray-700 dark:text-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Export CSV
        </button>
        {/* Ask AI button removed */}
      </div>

      {chartData && (
        <div className="mb-8">
          <Charts data={chartData} />
        </div>
      )}

      <div className="flex justify-end items-center mb-3">
        <label className="text-sm text-gray-700 dark:text-gray-300 mr-2">Rows per page</label>
        <select
          value={pageSize}
          onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)); }}
          className="px-2 py-1 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
        >
          {[10,25,50,100,200].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onSort={handleSort}
        onFilter={handleFilter}
        sortBy={sortBy}
        sortDir={sortDir}
        filters={filters}
        loading={loading}
      />

      {/* AskAI modal removed */}
    </div>
  );
}
