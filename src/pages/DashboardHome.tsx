import React from 'react';
import DashboardNav from '@/components/DashboardNav';
import { Link } from 'react-router-dom';
import {
  IdentificationIcon,
  CalculatorIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  TableCellsIcon,
  ArrowRightIcon,
  RectangleGroupIcon // Generic icon for module preview
} from '@heroicons/react/24/outline';

interface DashboardModule {
  id: string;
  title: string;
  description: string;
  link: string;
  icon: React.ElementType;
}

const modules: DashboardModule[] = [
  {
    id: 'media-kit',
    title: 'Media Kit Editor',
    description: 'Craft and customize your professional media kit.',
    link: '/media-kit',
    icon: IdentificationIcon,
  },
  {
    id: 'rate-calculator',
    title: 'Rate Calculator',
    description: 'Determine ideal rates for collaborations.',
    link: '/rate-calculator',
    icon: CalculatorIcon,
  },
  {
    id: 'analytics',
    title: 'Performance Analytics',
    description: 'Track your growth and engagement.',
    link: '/analytics',
    icon: ChartBarIcon,
  },
  {
    id: 'brand-discovery',
    title: 'Brand Discovery',
    description: 'Search and find brands that align with you.',
    link: '/search-results',
    icon: MagnifyingGlassIcon,
  },
  {
    id: 'ai-agent',
    title: 'AI Pitch Assistant',
    description: 'Leverage AI for personalized pitches.',
    link: '/agent',
    icon: SparklesIcon,
  },
  {
    id: 'outreach-tracker',
    title: 'Outreach Tracker',
    description: 'Manage brand communication and follow-ups.',
    link: '/outreach-tracker',
    icon: TableCellsIcon,
  },
];

export default function DashboardHome() {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav />
      <main className="p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-display font-medium text-slate-800 mb-2">
              Dashboard
            </h1>
            <p className="text-lg text-slate-600">
              Access your creator tools and manage your workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {modules.map((module) => (
              <Link 
                to={module.link} 
                key={module.id} 
                className="group bg-white rounded-xl shadow-sm hover:shadow-xl border border-slate-200/80 hover:border-purple-300 transition-all duration-300 ease-in-out flex flex-col overflow-hidden"
              >
                {/* Placeholder for "Actual Page Show" */}
                <div className="w-full h-40 bg-slate-100 group-hover:bg-purple-50 transition-colors duration-300 flex items-center justify-center border-b border-slate-200/80 group-hover:border-purple-200">
                  <RectangleGroupIcon className="h-16 w-16 text-slate-300 group-hover:text-purple-300 transition-colors duration-300" />
                  {/* <span className="text-slate-400 group-hover:text-purple-400">Module Preview</span> */}
                </div>
                
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex items-start mb-3">
                    <div className="p-2 bg-purple-100/80 rounded-lg mr-3 group-hover:bg-purple-100">
                        <module.icon className="h-6 w-6 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-700 group-hover:text-purple-700 transition-colors duration-300">{module.title}</h2>
                        <p className="text-sm text-slate-500 group-hover:text-slate-600 transition-colors duration-300 line-clamp-2">{module.description}</p>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-3 border-t border-slate-100/0 group-hover:border-slate-200/80 transition-colors duration-300">
                    <span className="inline-flex items-center text-sm font-medium text-purple-600 group-hover:text-purple-700 group-hover:underline">
                        Open {module.title.split(' ')[0]}
                        <ArrowRightIcon className="ml-1.5 h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 