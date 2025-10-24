import React, { useState } from 'react';
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

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: `Sum of ${data.numericCol}`,
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
        text: `${data.stringCol} vs ${data.numericCol}`,
      },
    },
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

      <div style={{ height: '400px' }}>
        {chartType === 'bar' && <Bar data={chartData} options={options} />}
        {chartType === 'line' && <Line data={chartData} options={options} />}
        {chartType === 'pie' && <Pie data={chartData} options={options} />}
      </div>
    </div>
  );
}
