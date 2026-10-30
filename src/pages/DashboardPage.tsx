import React from 'react';
import { Sidebar } from '@/components/layout';
import { MetricCard, Badge, Card } from '@/components/ui';
import { TicketTrendChart } from '@/components/dashboard/TicketTrendChart';
import { Plus } from 'lucide-react';
import type { TicketRequestItem } from '@/types/ticket';
import { initialLatestRequests } from '@/types/ticket';

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
    name: 'Damar Pratama',
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
  // RBAC: Jika User biasa, hanya tampilkan tiket miliknya
  // Jika Admin IT, tampilkan seluruh tiket antrean sistem
  const currentRequests = currentUser.role === 'user'
    ? tickets.filter((t) => t.nik === currentUser.nik || t.requester === currentUser.name)
    : tickets;

  const latestFiveRequests = currentRequests.slice(0, 5);
  const totalCount = currentRequests.length;
  const openCount = currentRequests.filter((r) => r.status === 'Open').length;
  const returnCount = currentRequests.filter((r) => r.status === 'Return' || r.status === 'Waiting').length;
  const inProgressCount = currentRequests.filter((r) => r.status === 'In progress').length;
  const solvedCount = currentRequests.filter((r) => r.status === 'Solved').length;

  return (
    <div className="w-full h-screen min-h-screen flex overflow-hidden bg-[#ECF1F7] select-none">

      {/* ================= LEFT SIDEBAR ================= */}
      <Sidebar
        activeItem="dashboard"
        userRole={currentUser.role}
        onLogout={onLogout}
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
      <main className="flex-1 h-screen overflow-y-auto px-6 py-4 md:px-8 md:py-5 flex flex-col gap-4 custom-scrollbar">

        {/* Top Logo */}
        <div className="flex items-center justify-between flex-shrink-0">
          <img
            src="/assets/helpdesk.png"
            alt="Helpdesk Logo"
            className="h-[42px] md:h-[48px] w-auto object-contain select-none"
          />
        </div>

        {/* Welcome Banner Card */}
        <div className="relative w-full rounded-[20px] md:rounded-[24px] bg-[#0C3E7E] min-h-[145px] md:min-h-[160px] max-h-[175px] overflow-hidden shadow-sm flex items-center justify-between flex-shrink-0">
          {/* Banner Graphic Background on Right */}
          <img
            src="/assets/dashboard_banner.png"
            alt="Welcome Banner Graphic"
            className="absolute right-0 top-0 bottom-0 h-full w-auto object-cover object-right pointer-events-none select-none opacity-90 md:opacity-100"
          />

          {/* Left Text Content with Gradient Backdrop to guarantee readability */}
          <div className="relative z-10 p-5 md:p-6 max-w-[550px] bg-gradient-to-r from-[#0C3E7E] via-[#0C3E7E]/95 to-transparent h-full flex flex-col justify-center">
            <div>
              <span className="text-[12px] leading-[16px] text-blue-200/90 font-medium tracking-wide">
                {currentUser.department}
              </span>
              <h1 className="text-[22px] sm:text-[25px] leading-[30px] font-extrabold text-white tracking-[-0.75px] mt-0.5 mb-0.5">
                Welcome back, {currentUser.name}!
              </h1>
              <p className="text-[11.5px] leading-[16px] text-blue-200/75 mb-3">
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

        {/* 5 Metric Cards Row (Termasuk Open Ticket) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 flex-shrink-0">
          <MetricCard
            label="Total requests"
            value={totalCount.toString()}
            subtitle={currentUser.role === 'admin' ? 'Total all tickets' : 'Submitted by you'}
            dotColor="blue"
            className="p-3.5 md:p-4 min-h-[105px] md:min-h-[110px]"
          />
          <MetricCard
            label="Open"
            value={openCount.toString()}
            subtitle={currentUser.role === 'admin' ? 'Awaiting assignment' : 'Waiting pickup'}
            dotColor="purple"
            className="p-3.5 md:p-4 min-h-[105px] md:min-h-[110px]"
          />
          <MetricCard
            label="In progress"
            value={inProgressCount.toString()}
            subtitle="Being handled"
            dotColor="cyan"
            className="p-3.5 md:p-4 min-h-[105px] md:min-h-[110px]"
          />
          <MetricCard
            label="Return"
            value={returnCount.toString()}
            subtitle="Needs revision"
            dotColor="orange"
            className="p-3.5 md:p-4 min-h-[105px] md:min-h-[110px]"
          />
          <MetricCard
            label="Solved"
            value={solvedCount.toString()}
            subtitle="Completed"
            dotColor="green"
            className="p-3.5 md:p-4 min-h-[105px] md:min-h-[110px]"
          />
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
              <table className="w-full text-left border-collapse">
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
            <TicketTrendChart tickets={currentRequests} />
          </div>

        </div>

      </main>

    </div>
  );
};
