import React, { useState, useEffect, useRef } from 'react';
import { Sidebar, AppHeader } from '@/components/layout';
import { MetricCard, Badge, Card } from '@/components/ui';
import { TicketTrendChart } from '@/components/dashboard/TicketTrendChart';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import type { TicketRequestItem } from '@/types/ticket';
import { initialLatestRequests } from '@/types/ticket';
import { helpdeskApi } from '@/services/api';

export type { TicketRequestItem, TicketResponseItem } from '@/types/ticket';
export { initialLatestRequests } from '@/types/ticket';

interface DashboardPageProps {
  currentUser?: {
    nik: string;
    name: string;
    department: string;
    role: 'user' | 'admin';
  };
  onLogout?: () => void;
  onCreateTicket?: () => void;
  onViewAllTickets?: () => void;
  onNavigateMasterCategory?: () => void;
  onNavigate?: (view: 'login' | 'dashboard' | 'create-ticket' | 'my-tickets' | 'ticket-detail' | 'master-category' | 'report') => void;
  onSelectTicket?: (ticket: TicketRequestItem) => void;
  onUpdateTicket?: (
    ticketId: string,
    newStatus: 'Solved' | 'In progress' | 'Return' | 'Reject',
    responseMessage: string,
    handlerName?: string
  ) => void;
  tickets?: TicketRequestItem[];
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentUser = {
    nik: '231270322',
    name: 'Karyawan',
    department: 'Software Development',
    role: 'user',
  },
  onLogout,
  onCreateTicket,
  onViewAllTickets,
  onNavigateMasterCategory,
  onNavigate,
  onSelectTicket,
  tickets = initialLatestRequests,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const metricsSliderRef = useRef<HTMLDivElement>(null);

  const scrollMetrics = (direction: 'left' | 'right') => {
    if (metricsSliderRef.current) {
      const scrollAmount = 220;
      metricsSliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Live Dashboard Statistics from MySQL Backend API
  const [dbStats, setDbStats] = useState<{
    metrics: {
      total: number;
      open: number;
      in_progress: number;
      return: number;
      solved: number;
      reject?: number;
    };
    latest_tickets: any[];
    chart_trend?: {
      labels: string[];
      incoming: number[];
      resolved: number[];
    };
    department_distribution?: any[];
  } | null>(null);

  // Ambil data agregat riil dari MySQL db_helpdesk via Laravel API
  useEffect(() => {
    let isMounted = true;
    const targetNik = currentUser.role === 'user' ? currentUser.nik : undefined;

    helpdeskApi
      .getDashboardStats(targetNik)
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setDbStats(res.data);
        }
      })
      .catch((err) => {
        console.warn('API getDashboardStats error, fallback ke data lokal:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser.nik, currentUser.role, tickets]);

  // RBAC Filter lokal (sebagai data fallback)
  const currentRequests = currentUser.role === 'user'
    ? tickets.filter((t) => t.nik === currentUser.nik || t.requester === currentUser.name)
    : tickets;

  // Hitung metrik: Utamakan agregat database (884 tiket) jika tersedia
  const totalCount = dbStats?.metrics ? dbStats.metrics.total : currentRequests.length;
  const openCount = dbStats?.metrics ? dbStats.metrics.open : currentRequests.filter((r) => r.status === 'Open').length;
  const returnCount = dbStats?.metrics ? dbStats.metrics.return : currentRequests.filter((r) => r.status === 'Return' || r.status === 'Waiting').length;
  const inProgressCount = dbStats?.metrics ? dbStats.metrics.in_progress : currentRequests.filter((r) => r.status === 'In progress').length;
  const solvedCount = dbStats?.metrics ? dbStats.metrics.solved : currentRequests.filter((r) => r.status === 'Solved').length;

  // 5 Tiket Terbaru: gunakan dari API agregat database jika ada, atau fallback lokal
  const latestFiveRequests = (dbStats?.latest_tickets && dbStats.latest_tickets.length > 0)
    ? dbStats.latest_tickets
    : currentRequests.slice(0, 5);

  return (
    <div className="w-full h-screen min-h-screen flex overflow-hidden bg-[#ECF1F7] select-none">

      {/* ================= LEFT SIDEBAR ================= */}
      <Sidebar
        activeItem="dashboard"
        userRole={currentUser.role}
        onLogout={onLogout}
        currentUser={currentUser}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenMobile={() => setIsMobileMenuOpen(true)}
        onNavigate={(item) => {
          if (onNavigate) {
            onNavigate(item);
          } else {
            if (item === 'create-ticket') onCreateTicket?.();
            if (item === 'my-tickets') onViewAllTickets?.();
            if (item === 'master-category') onNavigateMasterCategory?.();
          }
        }}
      />

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 h-screen overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 pb-24 lg:pb-8 flex flex-col gap-4 custom-scrollbar">

        {/* Responsive Header */}
        <AppHeader
          currentUser={currentUser}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Welcome Banner Card */}
        <div className="relative w-full rounded-[18px] md:rounded-[24px] bg-[#0C3E7E] min-h-[140px] md:min-h-[160px] overflow-hidden shadow-sm flex items-center justify-between flex-shrink-0">
          {/* Banner Graphic Background on Right */}
          <img
            src="/assets/dashboard_banner.png"
            alt="Welcome Banner Graphic"
            className="absolute right-0 top-0 bottom-0 h-full w-auto object-cover object-right pointer-events-none select-none opacity-40 sm:opacity-90 md:opacity-100"
          />

          {/* Left Text Content with Gradient Backdrop to guarantee readability */}
          <div className="relative z-10 p-4 sm:p-5 md:p-6 max-w-full sm:max-w-[550px] bg-gradient-to-r from-[#0C3E7E] via-[#0C3E7E]/95 sm:via-[#0C3E7E]/90 to-transparent h-full flex flex-col justify-center">
            <div>
              <span className="text-[11.5px] sm:text-[12px] leading-[16px] text-blue-200/90 font-medium tracking-wide">
                {currentUser.department}
              </span>
              <h1 className="text-[20px] sm:text-[23px] md:text-[25px] leading-[26px] sm:leading-[30px] font-extrabold text-white tracking-[-0.5px] mt-0.5 mb-1">
                Welcome back, {currentUser.name}!
              </h1>
              <p className="text-[11px] sm:text-[11.5px] leading-[16px] text-blue-200/75 mb-2.5 sm:mb-3">
                {currentUser.role === 'admin' ? `${currentUser.department} • IT Admin & Specialist` : currentUser.department}
              </p>
              <button
                type="button"
                onClick={onCreateTicket}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-blue-50 text-[#0C3E7E] text-[12px] font-bold rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#0C3E7E]" />
                <span>Create New Ticket</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5 Metric Cards: Horizontal Slider Carousel on Mobile/Tablet (< xl), 5-Column Grid on Desktop (>= xl) */}
        <div className="relative group/slider w-full flex-shrink-0">
          {/* Scroll Navigation Arrows (visible on tablet / small desktop) */}
          <button
            type="button"
            onClick={() => scrollMetrics('left')}
            className="hidden sm:flex xl:hidden absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-slate-200/90 shadow-md items-center justify-center text-slate-700 hover:text-blue-600 hover:bg-white transition-all cursor-pointer"
            aria-label="Scroll ke kiri"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => scrollMetrics('right')}
            className="hidden sm:flex xl:hidden absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-slate-200/90 shadow-md items-center justify-center text-slate-700 hover:text-blue-600 hover:bg-white transition-all cursor-pointer"
            aria-label="Scroll ke kanan"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Swipeable Track */}
          <div
            ref={metricsSliderRef}
            className="flex xl:grid xl:grid-cols-5 gap-3 md:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory py-1 -mx-4 px-4 sm:mx-0 sm:px-0 flex-nowrap xl:flex-wrap"
          >
            <MetricCard
              label="Total requests"
              value={totalCount.toString()}
              subtitle={currentUser.role === 'admin' ? 'Total all tickets' : 'Submitted by you'}
              dotColor="blue"
              className="w-[145px] sm:w-[170px] xl:w-auto shrink-0 xl:shrink snap-start min-h-[105px]"
            />
            <MetricCard
              label="Open"
              value={openCount.toString()}
              subtitle={currentUser.role === 'admin' ? 'Awaiting assignment' : 'Waiting pickup'}
              dotColor="purple"
              className="w-[145px] sm:w-[170px] xl:w-auto shrink-0 xl:shrink snap-start min-h-[105px]"
            />
            <MetricCard
              label="In progress"
              value={inProgressCount.toString()}
              subtitle="Being handled"
              dotColor="cyan"
              className="w-[145px] sm:w-[170px] xl:w-auto shrink-0 xl:shrink snap-start min-h-[105px]"
            />
            <MetricCard
              label="Return"
              value={returnCount.toString()}
              subtitle="Needs revision"
              dotColor="orange"
              className="w-[145px] sm:w-[170px] xl:w-auto shrink-0 xl:shrink snap-start min-h-[105px]"
            />
            <MetricCard
              label="Solved"
              value={solvedCount.toString()}
              subtitle="Completed"
              dotColor="green"
              className="w-[145px] sm:w-[170px] xl:w-auto shrink-0 xl:shrink snap-start min-h-[105px]"
            />
          </div>
        </div>

        {/* Bottom Split Section: Latest Requests Table (2/3 Width) & Ticket Trend Chart (1/3 Width) */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 pb-6 flex-shrink-0">

          {/* LEFT: 5 Latest Requests Table (2 Columns / ~67% Width) */}
          <Card radius="xl" className="lg:col-span-2 w-full p-4 md:p-5 flex flex-col justify-between h-full shadow-sm bg-white border border-slate-200/80 overflow-hidden min-h-[350px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <h2 className="text-[15px] leading-[22px] font-bold text-[#0F172A]">
                {currentUser.role === 'admin' ? 'Your 5 latest ticket by USER' : 'Your 5 latest requests'}
              </h2>
              <button
                type="button"
                onClick={onViewAllTickets}
                className="text-[12px] font-semibold text-[#2563EB] hover:text-[#1d4ed8] hover:underline transition-colors cursor-pointer"
              >
                View all
              </button>
            </div>

            {/* Requests Table Container */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto pr-1 custom-scrollbar">
              <table className="w-full min-w-[480px] sm:min-w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_0_#f1f5f9]">
                  <tr className="border-b border-slate-100 text-[11px] leading-[16px] font-semibold text-[#64748B]">
                    <th className="pb-2.5 pl-1 font-semibold w-[36px]">No</th>
                    <th className="pb-2.5 px-3 font-semibold min-w-[200px]">Subject</th>
                    <th className="pb-2.5 px-3 font-semibold w-[180px] hidden sm:table-cell">Category</th>
                    <th className="pb-2.5 px-3 font-semibold w-[140px] whitespace-nowrap">Submitted</th>
                    <th className="pb-2.5 pr-1 font-semibold text-right sm:text-left w-[140px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {latestFiveRequests.map((req, index) => (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 pl-1 text-[11.5px] font-medium text-[#64748B] align-top">
                        {index + 1}
                      </td>
                      <td className="py-3 px-3 align-top">
                        <button
                          type="button"
                          onClick={() => onSelectTicket ? onSelectTicket(req) : onViewAllTickets?.()}
                          className="text-[12.5px] font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors text-left line-clamp-2 leading-snug cursor-pointer"
                        >
                          {req.subject}
                        </button>
                      </td>
                      <td className="py-3 px-3 align-top hidden sm:table-cell">
                        <div className="text-[12px] font-semibold text-[#1E293B] leading-tight">
                          {req.category}
                        </div>
                        <div className="text-[11px] text-[#64748B] mt-0.5 leading-tight">
                          {req.subcategory}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[11.5px] text-[#1E293B] whitespace-nowrap align-top">
                        {req.submitted}
                      </td>
                      <td className="py-3 pr-1 align-top text-right sm:text-left">
                        <div>
                          <Badge status={req.status} />
                        </div>
                        {req.handler && (
                          <div className="text-[11px] text-[#64748B] mt-1 whitespace-nowrap">
                            {req.handler}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* RIGHT: Modern Interactive Line Chart (1 Column / ~33% Width) */}
          <div className="lg:col-span-1 w-full h-full min-h-[350px]">
            <TicketTrendChart
              tickets={currentRequests}
              apiChartTrend={dbStats?.chart_trend}
            />
          </div>

        </div>

      </main>

    </div>
  );
};
