import React, { useState, useEffect } from 'react';
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
import { useAuth } from '@/lib/AuthContext';
import { getTotalMediaKitViews, getTotalMediaKitEngagements, getDailyMediaKitViews, getDailyMediaKitEngagements, DailyViewData, DailyEngagementData } from '@/lib/supabaseHelpers';
import { Button } from '@/components/ui/button';

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

const initialLineChartData: ChartData<'line'> = {
  labels: [],
  datasets: [
    {
      label: 'Portfolio Views',
      data: [],
      borderColor: '#7E69AB',
      backgroundColor: 'rgba(126, 105, 171, 0.1)',
      tension: 0.4,
      fill: true,
    },
    {
      label: 'Engagement Rate',
      data: [],
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

// Initial stats structure (will be updated by fetched data)
const initialStats = [
  {
    name: 'Total Kit Views',
    value: '0',
    icon: CursorArrowRaysIcon,
    change: '', // Will be dynamic if we track changes over periods later
    changeType: 'positive',
    period: 'All Time',
  },
  {
    name: 'Engagement Rate',
    value: '0%', // Initialize with 0%
    icon: HeartIcon,
    change: '',
    changeType: 'positive',
    period: 'All Time', // Changed period to All Time to match others
  },
  {
    name: 'Total Shares & Copies',
    value: '0',
    icon: ShareIcon,
    change: '',
    changeType: 'positive',
    period: 'All Time',
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
  const { user } = useAuth();
  const [analyticsStats, setAnalyticsStats] = useState(initialStats);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7days'); // '7days', '30days', 'allTime'
  const [lineChartData, setLineChartData] = useState<ChartData<'line'>>(initialLineChartData);
  const [isLoadingChartData, setIsLoadingChartData] = useState(true);

  // Fetch overall stats (Total Views, Total Engagements, Overall Engagement Rate)
  useEffect(() => {
    async function fetchOverallAnalyticsData() {
      if (!user || !user.id) {
        setLoadingAnalytics(false);
        return;
      }
      setLoadingAnalytics(true);
      try {
        const views = await getTotalMediaKitViews(user.id);
        const shareClicks = await getTotalMediaKitEngagements(user.id, 'share_click');
        const copyLinkClicks = await getTotalMediaKitEngagements(user.id, 'copy_link_click');
        const totalEngagements = shareClicks + copyLinkClicks;
        let engagementRate = 0;
        if (views > 0) {
          engagementRate = (totalEngagements / views) * 100;
        }
        setAnalyticsStats(prevStats => prevStats.map(stat => {
          if (stat.name === 'Total Kit Views') return { ...stat, value: views.toLocaleString() };
          if (stat.name === 'Total Shares & Copies') return { ...stat, value: totalEngagements.toLocaleString() };
          if (stat.name === 'Engagement Rate') return { ...stat, value: views > 0 || totalEngagements > 0 ? `${engagementRate.toFixed(1)}%` : '0%' };
          return stat;
        }));
      } catch (error) {
        console.error("Error fetching overall kit analytics:", error);
      } finally {
        setLoadingAnalytics(false);
      }
    }
    fetchOverallAnalyticsData();
  }, [user]);

  // Fetch and process data for the line chart based on selectedTimeRange
  useEffect(() => {
    async function fetchChartData() {
      if (!user || !user.id) {
        setIsLoadingChartData(false);
        setLineChartData(initialLineChartData); // Reset to empty chart if no user
        return;
      }
      setIsLoadingChartData(true);

      let startDate: string | undefined = undefined;
      const endDate = new Date().toISOString().split('T')[0]; // Today

      const today = new Date();
      if (selectedTimeRange === '7days') {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        startDate = sevenDaysAgo.toISOString().split('T')[0];
      } else if (selectedTimeRange === '30days') {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        startDate = thirtyDaysAgo.toISOString().split('T')[0];
      } // For 'allTime', startDate remains undefined

      try {
        const dailyViewsData: DailyViewData[] = await getDailyMediaKitViews(user.id, startDate, endDate);
        const dailyEngagementsData: DailyEngagementData[] = await getDailyMediaKitEngagements(user.id, startDate, endDate);

        // Create a map for quick lookup
        const viewsMap = new Map(dailyViewsData.map(item => [item.date, item.views]));
        const engagementsMap = new Map(dailyEngagementsData.map(item => [item.date, item.engagements]));

        const allDates = new Set([...dailyViewsData.map(d => d.date), ...dailyEngagementsData.map(d => d.date)]);
        
        // If range is 7 or 30 days, ensure all days in the range are present for labels
        let dateLabels: string[] = [];
        if (selectedTimeRange === '7days' || selectedTimeRange === '30days') {
          const range = selectedTimeRange === '7days' ? 7 : 30;
          for (let i = 0; i < range; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - (range - 1 - i)); // Start from oldest to newest
            dateLabels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            // Add to allDates set for data processing, in YYYY-MM-DD format
            allDates.add(date.toISOString().split('T')[0]);
          }
        } else { // allTime
          dateLabels = Array.from(allDates).sort((a,b) => new Date(a).getTime() - new Date(b).getTime())
                            .map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        
        const sortedDatesForProcessing = Array.from(allDates).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());

        const viewsDataset: number[] = [];
        const engagementRateDataset: number[] = [];

        sortedDatesForProcessing.forEach(dateStr => {
          const views = viewsMap.get(dateStr) || 0;
          const engagements = engagementsMap.get(dateStr) || 0;
          viewsDataset.push(views);
          const rate = views > 0 ? (engagements / views) * 100 : 0;
          engagementRateDataset.push(parseFloat(rate.toFixed(1)));
        });
        
        // If generating labels for fixed ranges (7/30 days), datasets must match this length
        if (selectedTimeRange === '7days' || selectedTimeRange === '30days'){
            const expectedLength = selectedTimeRange === '7days' ? 7: 30;
            // Align datasets with the fixed dateLabels for 7/30 day ranges
            const alignedViews: number[] = Array(expectedLength).fill(0);
            const alignedEngagementRates: number[] = Array(expectedLength).fill(0);

            dateLabels.forEach((label, index) => {
                // Find the corresponding YYYY-MM-DD date for this label
                const date = new Date(today);
                const range = selectedTimeRange === '7days' ? 7 : 30;
                date.setDate(today.getDate() - (range - 1 - index));
                const yyyyMmDd = date.toISOString().split('T')[0];

                const dataIndex = sortedDatesForProcessing.indexOf(yyyyMmDd);
                if(dataIndex !== -1){
                    alignedViews[index] = viewsDataset[dataIndex];
                    alignedEngagementRates[index] = engagementRateDataset[dataIndex];
                } // else it remains 0, which is correct for days with no data within the fixed range
            });
            setLineChartData({
              labels: dateLabels,
              datasets: [
                { ...initialLineChartData.datasets[0], data: alignedViews },
                { ...initialLineChartData.datasets[1], data: alignedEngagementRates },
              ],
            });
        } else { // All time - use dynamically generated labels and datasets
             setLineChartData({
              labels: dateLabels, // these are already sorted and formatted for allTime
              datasets: [
                { ...initialLineChartData.datasets[0], data: viewsDataset },
                { ...initialLineChartData.datasets[1], data: engagementRateDataset },
              ],
            });
        }

      } catch (error) {
        console.error("Error fetching chart data:", error);
        setLineChartData(initialLineChartData); // Reset to empty on error
      } finally {
        setIsLoadingChartData(false);
      }
    }

    fetchChartData();
  }, [user, selectedTimeRange]);

  return (
    <div className="min-h-screen bg-cream">
      <main className="p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex justify-between items-center">
            <div>
                <h1 className="text-3xl md:text-4xl font-display font-medium text-charcoal">Portfolio Analytics</h1>
                <p className="mt-1 text-taupe text-base md:text-lg">Track your media kit's performance and reach.</p>
            </div>
            <div className="flex gap-2">
                <Button variant={selectedTimeRange === '7days' ? "default" : "outline"} onClick={() => setSelectedTimeRange('7days')} className={selectedTimeRange === '7days' ? 'bg-rose text-white' : ''}>Past 7 Days</Button>
                <Button variant={selectedTimeRange === '30days' ? "default" : "outline"} onClick={() => setSelectedTimeRange('30days')} className={selectedTimeRange === '30days' ? 'bg-rose text-white' : ''}>Past 30 Days</Button>
                <Button variant={selectedTimeRange === 'allTime' ? "default" : "outline"} onClick={() => setSelectedTimeRange('allTime')} className={selectedTimeRange === 'allTime' ? 'bg-rose text-white' : ''}>All Time</Button>
            </div>
          </div>

          {/* Stats Grid - now responsive with more columns on larger screens */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mb-10">
            {analyticsStats.map((stat) => (
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
                  <p className="text-2xl font-bold text-charcoal font-display tracking-tight">
                    {loadingAnalytics && (stat.name === 'Total Kit Views' || stat.name === 'Total Shares & Copies' || stat.name === 'Engagement Rate') ? '...' : stat.value}
                  </p>
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
              {isLoadingChartData ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-taupe">Loading chart data...</p>
                </div>
              ) : (
                <Line options={chartOptions} data={lineChartData} />
              )}
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