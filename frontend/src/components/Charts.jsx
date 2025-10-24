import React, { useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Charts({ data }) {
  const [chartType, setChartType] = useState('bar');
  const chartRef = useRef(null);

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: data.datasetLabel || (data.numericCol ? `Sum of ${data.numericCol}` : 'Count'),
        data: data.values,
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: data.numericCol ? `${data.stringCol} vs ${data.numericCol}` : `${data.stringCol} (Count)`,
      },
    },
  };

  const handleDownload = () => {
    const chart = chartRef.current;
    if (!chart) return;
    try {
      const url = chart.toBase64Image();
      const a = document.createElement('a');
      a.href = url;
      const name = `${(data.datasetLabel || data.numericCol || 'count')}-${data.stringCol || 'chart'}`.replace(/\s+/g, '-');
      a.download = `${name}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (_e) {
      void _e; // ignore
    }
  };

  const handleDownloadPDF = async () => {
    const chart = chartRef.current;
    if (!chart) return;
    // Dynamically import to avoid increasing main bundle size
    const { jsPDF } = await import('jspdf');
    try {
      const url = chart.toBase64Image();
      // Create landscape PDF and fit the image
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      // Reserve some margin
      const margin = 24;
      const w = pageWidth - margin * 2;
      const h = pageHeight - margin * 2;
      pdf.addImage(url, 'PNG', margin, margin, w, h);
      const name = `${(data.datasetLabel || data.numericCol || 'count')}-${data.stringCol || 'chart'}`.replace(/\s+/g, '-');
      pdf.save(`${name}.pdf`);
    } catch (_e) {
      void _e; // ignore
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setChartType('bar')}
          className={`px-4 py-2 rounded ${
            chartType === 'bar'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Bar Chart
        </button>
        <button
          onClick={() => setChartType('line')}
          className={`px-4 py-2 rounded ${
            chartType === 'line'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Line Chart
        </button>
        <button
          onClick={() => setChartType('pie')}
          className={`px-4 py-2 rounded ${
            chartType === 'pie'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Pie Chart
        </button>
      </div>

      <div className="flex items-center justify-between mb-2 gap-2">
        <div />
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Download PNG
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-3 py-1.5 rounded bg-purple-600 text-white hover:bg-purple-700"
          >
            Download PDF
          </button>
        </div>
      </div>

      <div style={{ height: '400px' }}>
        {chartType === 'bar' && <Bar ref={chartRef} data={chartData} options={options} />}
        {chartType === 'line' && <Line ref={chartRef} data={chartData} options={options} />}
        {chartType === 'pie' && <Pie ref={chartRef} data={chartData} options={options} />}
      </div>
    </div>
  );
}
