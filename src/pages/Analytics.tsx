import React from 'react';
import { ChartData } from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { 
  UserIcon, 
  CursorArrowRaysIcon, 
  DocumentTextIcon 
} from '@heroicons/react/24/outline';
import { withPreview } from '@/lib/withPreview';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Mock data for the chart
const chartData: ChartData<'line'> = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Portfolio Views',
      data: [65, 78, 90, 85, 99, 105],
      borderColor: '#7E69AB',
      backgroundColor: 'rgba(126, 105, 171, 0.1)',
      tension: 0.4,
      fill: true,
    },
  ],
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Portfolio Performance',
      font: {
        family: "'Playfair Display', serif",
        size: 16,
      },
      color: '#1A1F2C',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        font: {
          family: "'Inter', sans-serif",
        },
        color: '#8E9196',
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          family: "'Inter', sans-serif",
        },
        color: '#8E9196',
      },
    },
  },
};

const stats = [
  {
    name: 'Total Views',
    value: '1,024',
    icon: CursorArrowRaysIcon,
    change: '+12%',
    changeType: 'positive',
  },
  {
    name: 'Projects',
    value: '12',
    icon: DocumentTextIcon,
    change: '+3',
    changeType: 'positive',
  },
  {
    name: 'Profile Visits',
    value: '245',
    icon: UserIcon,
    change: '+18%',
    changeType: 'positive',
  },
];

const AnalyticsDashboardComponent = ({ isPreview = false }: { isPreview?: boolean }) => {
  return (
    <div className="min-h-screen bg-background">
      <main className="p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-medium text-charcoal">Welcome back!</h1>
            <p className="mt-2 text-taupe">Here's what's happening with your portfolio</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="bg-white p-6 rounded-lg shadow-sm border border-blush/20 hover:border-rose/20 transition-colors"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className="h-6 w-6 text-rose" aria-hidden="true" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-taupe">{stat.name}</p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-semibold text-charcoal font-display">{stat.value}</p>
                      <p className={`ml-2 text-sm ${
                        stat.changeType === 'positive' ? 'text-rose' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-blush/20">
            <Line options={chartOptions} data={chartData} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default withPreview(AnalyticsDashboardComponent); 