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
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  Squares2X2Icon,
  Bars3BottomLeftIcon
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

// Helper component for abstract previews
const AbstractPreview: React.FC<{ moduleId: string }> = ({ moduleId }) => {
  const baseBoxStyle = "bg-slate-300/70 group-hover:bg-purple-200/60 rounded-sm transition-colors duration-300";
  const smallBoxStyle = "bg-slate-400/70 group-hover:bg-purple-300/60 rounded-xs transition-colors duration-300";

  switch (moduleId) {
    case 'media-kit':
      return (
        <div className="w-full h-full p-1.5 flex flex-col items-center justify-start bg-slate-100 group-hover:bg-purple-50/30 rounded-md overflow-hidden transition-colors duration-300">
          {/* Mini Media Kit Page */}
          <div className="w-full h-full bg-white group-hover:bg-purple-50/50 rounded-sm shadow-sm p-2 flex flex-col text-[5px]">
            {/* Mini Header Section (Avatar, Name, Tagline) */}
            <div className="flex items-center mb-1.5">
              <div className={`w-5 h-5 ${baseBoxStyle} rounded-full mr-1.5 flex-shrink-0`}></div>
              <div className="flex-grow space-y-0.5">
                <div className={`${baseBoxStyle} h-2 w-3/4`}></div>
                <div className={`${smallBoxStyle} h-1.5 w-full opacity-80`}></div>
              </div>
            </div>
            
            {/* Mini Stats Bar */}
            <div className="flex justify-around my-1 space-x-1">
              <div className={`${smallBoxStyle} h-2.5 w-1/3 rounded-xs flex items-center justify-center`}>10k</div>
              <div className={`${smallBoxStyle} h-2.5 w-1/3 rounded-xs flex items-center justify-center`}>3.5%</div>
              <div className={`${smallBoxStyle} h-2.5 w-1/3 rounded-xs flex items-center justify-center`}>1.2k</div>
            </div>

            {/* Mini Content Placeholder (e.g., Intro) */}
            <div className={`${baseBoxStyle} h-3.5 w-full mb-1`}></div>
            
            {/* Mini Portfolio/Image Grid */}
            <div className="grid grid-cols-3 gap-1 mb-1.5 flex-grow">
              <div className={`${baseBoxStyle} h-5 rounded-xs`}></div>
              <div className={`${baseBoxStyle} h-5 rounded-xs`}></div>
              <div className={`${baseBoxStyle} h-5 rounded-xs`}></div>
            </div>
            
            {/* Mini Action Buttons (e.g., Edit, View) - simplified */}
            <div className="flex space-x-1 mt-auto">
                <div className="h-3 w-1/2 bg-purple-400/80 group-hover:bg-purple-500/90 rounded-sm flex items-center justify-center text-white font-bold">EDIT</div>
                <div className={`${smallBoxStyle} h-3 w-1/2 rounded-sm flex items-center justify-center`}>VIEW</div>
            </div>
          </div>
        </div>
      );
    case 'rate-calculator':
      return (
        <div className="w-full h-full p-2 flex flex-col items-center justify-center bg-slate-100 group-hover:bg-purple-50/30 rounded-md overflow-hidden transition-colors duration-300">
          {/* Mini Calculator Card */}
          <div className="w-[90%] h-[90%] bg-white group-hover:bg-purple-50/50 rounded p-1.5 shadow-md flex flex-col justify-between text-[5px]">
            {/* Mini Title */}
            <div className={`${baseBoxStyle} h-2 w-3/5 mx-auto mb-1 opacity-80 group-hover:opacity-100 text-center text-slate-500 group-hover:text-purple-700 font-semibold`}>RateCalc</div>
            
            {/* Mini Inputs */}
            <div className="space-y-1">
              <div className={`${smallBoxStyle} h-2.5 w-full rounded-xs bg-slate-200/70 group-hover:bg-purple-100/70`}></div>
              <div className={`${smallBoxStyle} h-2.5 w-full rounded-xs bg-slate-200/70 group-hover:bg-purple-100/70`}></div>
            </div>
            
            {/* Mini Content Type Buttons */}
            <div className="grid grid-cols-4 gap-0.5 my-1">
              <div className={`${smallBoxStyle} h-3 rounded-xs flex items-center justify-center bg-purple-300/70 group-hover:bg-purple-400/80`}>P</div>
              <div className={`${smallBoxStyle} h-3 rounded-xs flex items-center justify-center`}>V</div>
              <div className={`${smallBoxStyle} h-3 rounded-xs flex items-center justify-center`}>S</div>
              <div className={`${smallBoxStyle} h-3 rounded-xs flex items-center justify-center`}>R</div>
            </div>
            
            {/* Mini Calculate Button */}
            <div className="h-3.5 w-full bg-purple-400/90 group-hover:bg-purple-500/90 rounded-sm flex items-center justify-center text-white font-bold">CALC</div>
            
            {/* Mini Result Display */}
            <div className="mt-1.5 pt-1 border-t border-slate-200/70 group-hover:border-purple-200/70">
              <div className={`${smallBoxStyle} h-1.5 w-2/5 mx-auto mb-0.5 opacity-70 group-hover:opacity-100`}></div>
              <div className="h-4 w-3/5 mx-auto bg-slate-200/90 group-hover:bg-purple-200/90 rounded-sm flex items-center justify-center text-purple-500/90 group-hover:text-purple-600/90 font-bold">$123</div>
            </div>
          </div>
        </div>
      );
    case 'analytics':
      return (
        <div className="w-full h-full p-2 flex flex-col justify-start items-center bg-slate-100 group-hover:bg-purple-50/30 rounded-md overflow-hidden transition-colors duration-300">
          {/* Mini Stats Grid */}
          <div className="w-full grid grid-cols-3 gap-1.5 p-1.5">
            {/* Stat Card 1 */}
            <div className="bg-white group-hover:bg-purple-100/30 p-1.5 rounded-sm shadow-sm transition-colors duration-300">
              <div className="flex items-center">
                <div className={`w-3 h-3 ${smallBoxStyle} bg-slate-400/70 group-hover:bg-purple-400/60 rounded-xs mr-1 flex items-center justify-center`}>
                  <svg className="w-2 h-2 text-white group-hover:text-purple-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div className={`${baseBoxStyle} w-full h-1 mb-0.5`}></div>
              </div>
              <div className={`${baseBoxStyle} w-3/4 h-1.5 my-0.5`}></div>
              <div className={`${smallBoxStyle} w-1/2 h-1 bg-slate-400/70 group-hover:bg-purple-300/80`}></div>
            </div>
            {/* Stat Card 2 */}
            <div className="bg-white group-hover:bg-purple-100/30 p-1.5 rounded-sm shadow-sm transition-colors duration-300">
              <div className="flex items-center">
                <div className={`w-3 h-3 ${smallBoxStyle} bg-slate-400/70 group-hover:bg-purple-400/60 rounded-xs mr-1 flex items-center justify-center`}>
                  <svg className="w-2 h-2 text-white group-hover:text-purple-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div className={`${baseBoxStyle} w-full h-1 mb-0.5`}></div>
              </div>
              <div className={`${baseBoxStyle} w-3/4 h-1.5 my-0.5`}></div>
              <div className={`${smallBoxStyle} w-1/2 h-1 bg-slate-400/70 group-hover:bg-purple-300/80`}></div>
            </div>
            {/* Stat Card 3 */}
            <div className="bg-white group-hover:bg-purple-100/30 p-1.5 rounded-sm shadow-sm transition-colors duration-300">
              <div className="flex items-center">
                <div className={`w-3 h-3 ${smallBoxStyle} bg-slate-400/70 group-hover:bg-purple-400/60 rounded-xs mr-1 flex items-center justify-center`}>
                  <svg className="w-2 h-2 text-white group-hover:text-purple-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div className={`${baseBoxStyle} w-full h-1 mb-0.5`}></div>
              </div>
              <div className={`${baseBoxStyle} w-3/4 h-1.5 my-0.5`}></div>
              <div className={`${smallBoxStyle} w-1/2 h-1 bg-slate-400/70 group-hover:bg-purple-300/80`}></div>
            </div>
          </div>
          {/* Mini Line Chart */}
          <div className="w-[90%] h-12 bg-white group-hover:bg-purple-100/30 p-2 rounded-sm shadow-sm mt-1.5 flex items-end transition-colors duration-300">
            <svg className="w-full h-full" viewBox="0 0 50 20" preserveAspectRatio="none">
              <path d="M 0 15 Q 5 5, 10 12 Q 15 2, 20 8 Q 25 18, 30 10 Q 35 0, 40 5 Q 45 15, 50 10" className="stroke-slate-400 group-hover:stroke-purple-500 transition-colors duration-300" fill="transparent" strokeWidth="1.5"/>
            </svg>
          </div>
        </div>
      );
    case 'brand-discovery':
      return (
        <div className="w-full h-full p-1.5 flex flex-col items-center justify-start bg-slate-100 group-hover:bg-purple-50/30 rounded-md overflow-hidden transition-colors duration-300 text-[5px]">
          {/* Mini Hero Text */}
          <div className={`${smallBoxStyle} h-2 w-3/4 mb-1 opacity-80 group-hover:opacity-100`}></div>
          <div className="flex items-center mb-1.5">
            <div className={`${baseBoxStyle} h-1.5 w-1/4 opacity-70 group-hover:opacity-90`}></div>
            <div className="w-2 h-2 mx-0.5 bg-purple-400/80 group-hover:bg-purple-500/90 rounded-xs flex items-center justify-center text-white font-bold">#</div>
            <div className={`${baseBoxStyle} h-1.5 w-1/4 opacity-70 group-hover:opacity-90`}></div>
          </div>
          
          {/* Mini Search Bar + Filter */}
          <div className="w-[90%] flex items-center space-x-1 mb-2">
            <div className={`${baseBoxStyle} h-3.5 flex-grow rounded-sm`}></div>
            <div className={`w-3.5 h-3.5 ${smallBoxStyle} rounded-sm flex items-center justify-center bg-slate-300/90 group-hover:bg-purple-300/90`}>
              <svg className="w-2 h-2 text-slate-600 group-hover:text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            </div>
          </div>

          {/* Mini Category Tiles */}
          <div className="w-[90%] grid grid-cols-3 gap-1 flex-grow mb-1">
            <div className={`${baseBoxStyle} aspect-square rounded flex items-center justify-center text-slate-500 group-hover:text-purple-600 group-hover:bg-purple-200/60 font-semibold`}>B</div>
            <div className={`${baseBoxStyle} aspect-square rounded flex items-center justify-center text-slate-500 group-hover:text-purple-600 group-hover:bg-purple-200/60 font-semibold`}>S</div>
            <div className={`${baseBoxStyle} aspect-square rounded flex items-center justify-center text-slate-500 group-hover:text-purple-600 group-hover:bg-purple-200/60 font-semibold`}>H</div>
            <div className={`${baseBoxStyle} aspect-square rounded flex items-center justify-center text-slate-500 group-hover:text-purple-600 group-hover:bg-purple-200/60 font-semibold`}>F</div>
            <div className={`${baseBoxStyle} aspect-square rounded flex items-center justify-center text-slate-500 group-hover:text-purple-600 group-hover:bg-purple-200/60 font-semibold`}>F&B</div>
            <div className={`${baseBoxStyle} aspect-square rounded flex items-center justify-center text-slate-500 group-hover:text-purple-600 group-hover:bg-purple-200/60 font-semibold`}>T</div>
          </div>

          {/* Mini Saved Searches/Favorites Hint */}
          <div className="w-[90%] flex justify-between space-x-1 mt-auto">
            <div className={`${smallBoxStyle} h-2.5 w-2/5 rounded-sm`}></div>
            <div className={`${smallBoxStyle} h-2.5 w-2/5 rounded-sm`}></div>
          </div>
        </div>
      );
    case 'ai-agent':
      return (
        <div className="w-full h-full p-1.5 flex space-x-1.5 bg-slate-100 group-hover:bg-purple-50/30 rounded-md overflow-hidden transition-colors duration-300">
          {/* Mini Sidebar (Chat History) */}
          <div className="w-1/3 h-full bg-slate-200/80 group-hover:bg-purple-100/40 rounded-sm p-1 space-y-1">
            <div className={`${baseBoxStyle} h-3 w-full opacity-80 group-hover:opacity-100`}></div>
            <div className={`${smallBoxStyle} h-2.5 w-4/5 opacity-60 group-hover:opacity-90`}></div>
            <div className={`${baseBoxStyle} h-3 w-full opacity-80 group-hover:opacity-100 mt-1`}></div>
            <div className={`${smallBoxStyle} h-2.5 w-3/5 opacity-60 group-hover:opacity-90`}></div>
            <div className={`${baseBoxStyle} h-3 w-full opacity-80 group-hover:opacity-100 mt-1`}></div>
            <div className={`${smallBoxStyle} h-2.5 w-4/5 opacity-60 group-hover:opacity-90`}></div>
          </div>
          {/* Mini Chat Area */}
          <div className="w-2/3 h-full flex flex-col bg-white group-hover:bg-purple-100/20 rounded-sm p-1.5">
            {/* Mini Header */}
            <div className="flex items-center mb-1.5">
              <div className={`w-3 h-3 ${smallBoxStyle} bg-slate-400/70 group-hover:bg-purple-400/80 rounded-full mr-1`}></div>
              <div className={`${baseBoxStyle} h-2 w-1/2`}></div>
            </div>
            {/* Mini Messages */}
            <div className="space-y-1.5 flex-grow">
              <div className={`flex justify-start`}><div className={`${baseBoxStyle} w-3/5 h-3.5 rounded-md`}></div></div>
              <div className={`flex justify-end`}><div className="bg-purple-400/80 group-hover:bg-purple-500/90 w-4/6 h-4 rounded-md text-white flex items-center justify-center text-[5px] font-bold">USER</div></div>
              <div className={`flex justify-start`}><div className={`${baseBoxStyle} w-1/2 h-3 rounded-md`}></div></div>
              <div className={`flex justify-end`}><div className="bg-purple-400/80 group-hover:bg-purple-500/90 w-3/5 h-3.5 rounded-md text-white flex items-center justify-center text-[5px] font-bold">USER</div></div>
            </div>
            {/* Mini Input Bar */}
            <div className={`${baseBoxStyle} h-3 w-full mt-1.5`}></div>
          </div>
        </div>
      );
    case 'outreach-tracker':
      return (
        <div className="w-full h-full p-1.5 flex flex-col bg-slate-100 group-hover:bg-purple-50/30 rounded-md overflow-hidden transition-colors duration-300">
          {/* Mini Table Header */}
          <div className="grid grid-cols-5 gap-1 p-1 bg-slate-200/70 group-hover:bg-purple-200/50 rounded-t-sm">
            <div className={`${smallBoxStyle} h-2 col-span-2 opacity-70 group-hover:opacity-100`}></div> {/* Brand */}
            <div className={`${smallBoxStyle} h-2 opacity-70 group-hover:opacity-100`}></div> {/* Email 1 */}
            <div className={`${smallBoxStyle} h-2 opacity-70 group-hover:opacity-100`}></div> {/* Followup 1 */}
            <div className={`${smallBoxStyle} h-2 opacity-70 group-hover:opacity-100`}></div> {/* Followup 2 */}
            {/* <div className={`${smallBoxStyle} h-2 opacity-70 group-hover:opacity-100`}></div> Actions - Implicit */}
          </div>
          {/* Mini Table Rows */}
          <div className="flex-grow space-y-1 p-1 bg-white group-hover:bg-purple-100/20 rounded-b-sm">
            {/* Row 1 */}
            <div className="grid grid-cols-5 gap-1 items-center">
              <div className="col-span-2 flex items-center space-x-1">
                <div className={`w-3 h-3 ${baseBoxStyle} rounded-full`}></div> {/* Logo */}
                <div className={`${baseBoxStyle} h-2 w-full`}></div> {/* Name/Email */}
              </div>
              <div className={`w-3 h-3 ${smallBoxStyle} rounded-sm flex items-center justify-center bg-purple-300/70 group-hover:bg-purple-400/70`}> <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> </div> {/* Sent */}
              <div className={`w-3 h-3 ${smallBoxStyle} rounded-sm flex items-center justify-center`}> <svg className="w-2 h-2 text-slate-500/70 group-hover:text-purple-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> </div> {/* Unsent */}
              <div className={`w-3 h-3 ${smallBoxStyle} rounded-sm flex items-center justify-center`}> <svg className="w-2 h-2 text-slate-500/70 group-hover:text-purple-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> </div> {/* Unsent */}
            </div>
            {/* Row 2 */}
            <div className="grid grid-cols-5 gap-1 items-center">
              <div className="col-span-2 flex items-center space-x-1">
                <div className={`w-3 h-3 ${baseBoxStyle} rounded-full`}></div>
                <div className={`${baseBoxStyle} h-2 w-full`}></div>
              </div>
              <div className={`w-3 h-3 ${smallBoxStyle} rounded-sm flex items-center justify-center`}> <svg className="w-2 h-2 text-slate-500/70 group-hover:text-purple-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> </div>
              <div className={`w-3 h-3 ${smallBoxStyle} rounded-sm flex items-center justify-center`}> <svg className="w-2 h-2 text-slate-500/70 group-hover:text-purple-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> </div>
              <div className={`w-3 h-3 ${smallBoxStyle} rounded-sm flex items-center justify-center bg-purple-300/70 group-hover:bg-purple-400/70`}> <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> </div>
            </div>
             {/* Row 3 (Simplified) */}
            <div className="grid grid-cols-5 gap-1 items-center pt-1">
              <div className="col-span-2 flex items-center space-x-1">
                <div className={`w-3 h-3 ${baseBoxStyle} rounded-full opacity-70`}></div>
                <div className={`${baseBoxStyle} h-2 w-full opacity-70`}></div>
              </div>
              <div className={`w-3 h-3 ${smallBoxStyle} rounded-sm opacity-70`}></div>
              <div className={`w-3 h-3 ${smallBoxStyle} rounded-sm opacity-70`}></div>
              <div className={`w-3 h-3 ${smallBoxStyle} rounded-sm opacity-70`}></div>
            </div>
          </div>
        </div>
      );
    default:
      return <DocumentTextIcon className="w-12 h-12 text-slate-300 group-hover:text-purple-300 transition-colors duration-300" />;
  }
};

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-100">
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
                className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out flex flex-col overflow-hidden border border-slate-200/75 hover:border-purple-300/75"
              >
                {/* Programmatic Abstract Preview Section */}
                <div className="w-full h-48 bg-slate-200/70 group-hover:bg-purple-50/50 transition-colors duration-300 flex items-center justify-center p-4 border-b border-slate-200/75 group-hover:border-purple-200/75">
                  <AbstractPreview moduleId={module.id} />
                </div>
                
                {/* Content Section */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex items-center mb-2">
                    <div className="p-2.5 bg-purple-100 rounded-lg mr-3 flex-shrink-0 group-hover:bg-purple-200/70 transition-colors duration-300">
                        <module.icon className="h-5 w-5 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-slate-700 group-hover:text-purple-700 transition-colors duration-300">{module.title}</h2>
                        <p className="text-xs text-slate-500 group-hover:text-slate-600 transition-colors duration-300 line-clamp-2">{module.description}</p>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4">
                    <span className="inline-flex items-center text-sm font-medium text-purple-600 group-hover:text-purple-700 group-hover:underline">
                        Open {module.title.split(' ')[0]}
                        <ArrowRightIcon className="ml-1.5 h-3.5 w-3.5" />
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