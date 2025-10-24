import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { dataAPI, filesAPI } from '../services/api';
import DataTable from '../components/DataTable';
import Charts from '../components/Charts';

export default function Dashboard() {
  const { fileId } = useParams();
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFileInfo();
    loadColumns();
  }, [fileId]);

  useEffect(() => {
    loadRows();
  }, [fileId, page, sortBy, sortDir, search, filters]);

  useEffect(() => {
    if (columns.length > 0) {
      loadChartData();
    }
  }, [columns, filters]);

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
      const stringCol = columns.find(c => c.type === 'string');

      if (!numericCol || !stringCol) return;

      const response = await dataAPI.aggregate(fileId, {
        group_by: [stringCol.name],
        metrics: [{ col: numericCol.name, agg: 'sum' }],
        filters
      });

      setChartData({
        labels: response.data.data.map(d => d[stringCol.name]),
        values: response.data.data.map(d => d[`${numericCol.name}_sum`]),
        numericCol: numericCol.name,
        stringCol: stringCol.name
      });
    } catch (err) {
      console.error('Failed to load chart data:', err);
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {file?.filename}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Total rows: {total}
        </p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search across all columns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
      </div>

      {chartData && (
        <div className="mb-8">
          <Charts data={chartData} />
        </div>
      )}

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
    </div>
  );
}
