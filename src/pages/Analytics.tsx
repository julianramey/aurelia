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
  DocumentTextIcon, 
  ShareIcon,
  ArrowDownTrayIcon,
  HeartIcon
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
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'Portfolio Views',
      data: [65, 78, 90, 85, 99, 105, 120],
      borderColor: '#7E69AB',
      backgroundColor: 'rgba(126, 105, 171, 0.1)',
      tension: 0.4,
      fill: true,
    },
    {
      label: 'Engagement Rate',
      data: [2.5, 2.7, 3.0, 2.8, 3.2, 3.5, 3.3],
      borderColor: '#F472B6',
      backgroundColor: 'rgba(244, 114, 182, 0.1)',
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
      text: 'Portfolio Performance Over Time',
      font: {
        family: "'Playfair Display', serif",
        size: 18,
      },
      color: '#1A1F2C',
      padding: {
        bottom: 20
      }
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

// Updated stats array with more details
const stats = [
  {
    name: 'Total Kit Views',
    value: '1,024',
    icon: CursorArrowRaysIcon,
    change: '+12%',
    changeType: 'positive',
    period: 'last 30 days',
  },
  {
    name: 'Engagement Rate',
    value: '3.5%',
    icon: HeartIcon,
    change: '+0.5%',
    changeType: 'positive',
    period: 'last 30 days',
  },
  {
    name: 'Shares',
    value: '78',
    icon: ShareIcon,
    change: '+5',
    changeType: 'positive',
    period: 'last 30 days',
  },
];

// Mock data for brands who viewed the kit (inspired by OutreachTracker's mockBrandsFromSearchResults)
const viewedByBrands = [
  {
    id: 1,
    name: 'Glossier',
    logo: 'https://logo.clearbit.com/glossier.com',
    viewedDate: '2 days ago',
  },
  {
    id: 2,
    name: 'Fenty Beauty',
    logo: 'https://logo.clearbit.com/fentybeauty.com',
    viewedDate: '5 days ago',
  },
  {
    id: 4,
    name: 'Rare Beauty',
    logo: 'https://logo.clearbit.com/rarebeauty.com',
    viewedDate: '1 week ago',
  },
  {
    id: 5,
    name: 'Summer Fridays',
    logo: 'https://logo.clearbit.com/summerfridays.com',
    viewedDate: 'Yesterday',
  },
];

const AnalyticsDashboardComponent = ({ isPreview = false }: { isPreview?: boolean }) => {
  return (
    <div className="min-h-screen bg-cream">
      <main className="p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-display font-medium text-charcoal">Portfolio Analytics</h1>
            <p className="mt-2 text-taupe text-base md:text-lg">Track your media kit's performance and reach.</p>
          </div>

          {/* Stats Grid - now responsive with more columns on larger screens */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mb-10">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="bg-white p-5 rounded-xl shadow-lg border border-blush/20 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-shrink-0 p-3 bg-rose/10 rounded-lg">
                    <stat.icon className="h-7 w-7 text-rose" aria-hidden="true" />
                  </div>
                  <div className={`text-xs font-semibold px-2 py-1 rounded-full ${ 
                    stat.changeType === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-charcoal font-display tracking-tight">{stat.value}</p>
                  <p className="text-sm text-taupe truncate">{stat.name}</p>
                  <p className="text-xs text-charcoal/60 mt-1">{stat.period}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chart and Viewed By Brands - Flex layout for larger screens */}
          <div className="flex flex-col lg:flex-row gap-8 mb-10">
            {/* Chart - takes more space on larger screens */}
            <div className="lg:flex-grow lg:w-2/3 bg-white p-6 rounded-xl shadow-lg border border-blush/20">
              <Line options={chartOptions} data={chartData} />
            </div>

            {/* Brands Who Viewed Your Kit - takes less space */}
            <div className="lg:w-1/3 bg-white p-6 rounded-xl shadow-lg border border-blush/20">
              <h2 className="text-xl font-display font-medium text-charcoal mb-6">Recently Viewed By</h2>
              <div className="space-y-4">
                {viewedByBrands.map((brand) => (
                  <div key={brand.id} className="flex items-center p-3 bg-cream/50 rounded-lg hover:bg-blush/10 transition-colors">
                    <img src={brand.logo} alt={`${brand.name} logo`} className="h-10 w-10 rounded-full mr-4 border border-blush/20" />
                    <div>
                      <p className="font-medium text-charcoal text-sm">{brand.name}</p>
                      <p className="text-xs text-taupe">{brand.viewedDate}</p>
                    </div>
                  </div>
                ))}
                {viewedByBrands.length === 0 && (
                  <p className='text-sm text-taupe text-center py-4'>No recent brand views to show.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default withPreview(AnalyticsDashboardComponent);