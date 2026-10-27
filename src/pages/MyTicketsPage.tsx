import React, { useState, useMemo } from 'react';
import { Sidebar } from '@/components/layout';
import { Card, Badge, Button } from '@/components/ui';
import type { TicketRequestItem } from './DashboardPage';
import { Plus, Search, AlertCircle } from 'lucide-react';

interface MyTicketsPageProps {
  tickets: TicketRequestItem[];
  onNavigate: (view: 'dashboard' | 'create-ticket' | 'my-tickets' | 'master-category') => void;
  onLogout: () => void;
  onCreateTicket: () => void;
  onSelectTicket: (ticket: TicketRequestItem) => void;
}

type StatusFilter = 'All' | 'Return' | 'In progress' | 'Solved' | 'Reject';

export const MyTicketsPage: React.FC<MyTicketsPageProps> = ({
  tickets,
  onNavigate,
  onLogout,
  onCreateTicket,
  onSelectTicket,
}) => {
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Counts for tabs
  const allCount = tickets.length;
  const returnCount = tickets.filter((t) => t.status === 'Return' || t.status === 'Waiting').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In progress').length;
  const solvedCount = tickets.filter((t) => t.status === 'Solved').length;
  const rejectCount = tickets.filter((t) => t.status === 'Reject').length;

  // Filtered list
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Status filter
      if (activeFilter !== 'All') {
        if (activeFilter === 'Return') {
          if (ticket.status !== 'Return' && ticket.status !== 'Waiting') return false;
        } else if (ticket.status !== activeFilter) {
          return false;
        }
      }
      // Search query filter (subject, description, category, subcategory)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSubject = ticket.subject.toLowerCase().includes(query);
        const matchesDescription = ticket.description?.toLowerCase().includes(query) ?? false;
        const matchesCategory = ticket.category.toLowerCase().includes(query);
        const matchesSubcategory = ticket.subcategory.toLowerCase().includes(query);
        return matchesSubject || matchesDescription || matchesCategory || matchesSubcategory;
      }
      return true;
    });
  }, [tickets, activeFilter, searchQuery]);

  return (
    <div className="w-full h-screen min-h-screen flex overflow-hidden bg-[#ECF1F7] select-none">
      {/* ================= LEFT SIDEBAR ================= */}
      <Sidebar
        activeItem="my-tickets"
        onLogout={onLogout}
        onNavigate={onNavigate}
      />

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 h-screen overflow-y-auto px-6 py-6 md:px-8 md:py-7 flex flex-col gap-6 custom-scrollbar">
        {/* Top Header Row: Logo Helpdesk on Left, User Badge on Right */}
        <div className="flex items-center justify-between flex-shrink-0">
          <img
            src="/assets/helpdesk.png"
            alt="Helpdesk Logo"
            className="h-[42px] md:h-[48px] w-auto object-contain select-none"
          />

          {/* User Badge */}
          <div className="flex items-center gap-2.5 bg-white pl-1.5 pr-4 py-1.5 rounded-full border border-slate-200/80 shadow-sm">
            <div className="w-[30px] h-[30px] rounded-full bg-[#DDE5ED] text-[#1E293B] font-bold text-[12px] flex items-center justify-center">
              DP
            </div>
            <span className="text-[13px] font-semibold text-[#1E293B]">
              Damar Pratama
            </span>
          </div>
        </div>

        {/* Page Title & Subtitle with Create New Ticket Button aligned to the right (di ujung) */}
        <div className="flex items-center justify-between gap-4 flex-shrink-0">
          <div>
            <h1 className="text-[26px] md:text-[30px] leading-[36px] font-extrabold text-[#0F172A] tracking-[-0.5px]">
              My tickets
            </h1>
            <p className="text-[13px] leading-[20px] text-[#64748B] mt-0.5">
              Every request you have submitted, newest first.
            </p>
          </div>

          {/* + Create New Ticket Button */}
          <Button
            variant="primary-form"
            onClick={onCreateTicket}
            leftIcon={<Plus className="w-4 h-4 text-white" />}
            className="py-[10px] px-[22px] text-[13px] font-bold bg-[#153F85] hover:bg-[#0e2c5e] text-white rounded-full shadow-sm flex-shrink-0"
          >
            Create New Ticket
          </Button>
        </div>

        {/* Main Card: Filter Pills, Search Bar, and Full Tickets Table */}
        <Card radius="xl" className="p-6 md:p-8 bg-white shadow-sm border border-slate-200/70 mb-6 flex-1 flex flex-col min-h-0">
          {/* Top Controls: Filter Tabs & Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6 flex-shrink-0">
            {/* Filter Pills */}
            <div className="flex items-center flex-wrap gap-2">
              {/* All */}
              <button
                type="button"
                onClick={() => setActiveFilter('All')}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold transition-all cursor-pointer ${
                  activeFilter === 'All'
                    ? 'bg-[#0F2D60] text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-[#64748B]'
                }`}
              >
                <span>All</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeFilter === 'All' ? 'bg-white/20 text-white' : 'bg-slate-200 text-[#475569]'
                  }`}
                >
                  {allCount}
                </span>
              </button>

              {/* Return */}
              <button
                type="button"
                onClick={() => setActiveFilter('Return')}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold transition-all cursor-pointer ${
                  activeFilter === 'Return'
                    ? 'bg-[#0F2D60] text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-[#64748B]'
                }`}
              >
                <span>Return</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeFilter === 'Return' ? 'bg-white/20 text-white' : 'bg-slate-200 text-[#475569]'
                  }`}
                >
                  {returnCount}
                </span>
              </button>

              {/* In progress */}
              <button
                type="button"
                onClick={() => setActiveFilter('In progress')}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold transition-all cursor-pointer ${
                  activeFilter === 'In progress'
                    ? 'bg-[#0F2D60] text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-[#64748B]'
                }`}
              >
                <span>In progress</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeFilter === 'In progress' ? 'bg-white/20 text-white' : 'bg-slate-200 text-[#475569]'
                  }`}
                >
                  {inProgressCount}
                </span>
              </button>

              {/* Solved */}
              <button
                type="button"
                onClick={() => setActiveFilter('Solved')}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold transition-all cursor-pointer ${
                  activeFilter === 'Solved'
                    ? 'bg-[#0F2D60] text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-[#64748B]'
                }`}
              >
                <span>Solved</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeFilter === 'Solved' ? 'bg-white/20 text-white' : 'bg-slate-200 text-[#475569]'
                  }`}
                >
                  {solvedCount}
                </span>
              </button>

              {/* Reject */}
              <button
                type="button"
                onClick={() => setActiveFilter('Reject')}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold transition-all cursor-pointer ${
                  activeFilter === 'Reject'
                    ? 'bg-[#DC2626] text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-[#64748B]'
                }`}
              >
                <span>Reject</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeFilter === 'Reject' ? 'bg-white/20 text-white' : 'bg-slate-200 text-[#475569]'
                  }`}
                >
                  {rejectCount}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by subject"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-[280px] pl-10 pr-4 py-2 rounded-full text-[13px] text-[#1E293B] border border-[#CBD5E1] bg-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] shadow-sm transition-all"
              />
            </div>
          </div>

          {/* Full Tickets Table */}
          <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_0_#f1f5f9]">
                <tr className="border-b border-slate-100 text-[12px] leading-[18px] font-semibold text-[#64748B]">
                  <th className="pb-3 pl-2 font-semibold w-[44px]">No</th>
                  <th className="pb-3 px-4 font-semibold w-[220px]">Subject</th>
                  <th className="pb-3 px-4 font-semibold w-[280px]">Description</th>
                  <th className="pb-3 px-4 font-semibold">Category</th>
                  <th className="pb-3 px-4 font-semibold">Submitted</th>
                  <th className="pb-3 pr-2 font-semibold text-right sm:text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket, index) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* No */}
                      <td className="py-4 pl-2 text-[12.5px] font-medium text-[#64748B] align-top">
                        {index + 1}
                      </td>

                      {/* Subject with ellipsis */}
                      <td className="py-4 px-4 align-top max-w-[220px]">
                        <button
                          type="button"
                          onClick={() => onSelectTicket(ticket)}
                          className="text-[13.5px] font-semibold text-[#2563EB] group-hover:underline cursor-pointer block truncate text-left w-full"
                          title={ticket.subject}
                        >
                          {ticket.subject}
                        </button>
                      </td>

                      {/* Description with ellipsis */}
                      <td className="py-4 px-4 align-top max-w-[280px]">
                        <span
                          className="text-[12.5px] leading-[18px] text-[#64748B] block truncate"
                          title={ticket.description || '-'}
                        >
                          {ticket.description || '-'}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 align-top">
                        <div className="text-[12.5px] font-semibold text-[#1E293B]">
                          {ticket.category}
                        </div>
                        <div className="text-[11px] text-[#64748B] mt-0.5">
                          {ticket.subcategory}
                        </div>
                      </td>

                      {/* Submitted */}
                      <td className="py-4 px-4 text-[12.5px] text-[#1E293B] whitespace-nowrap align-top">
                        {ticket.submitted}
                      </td>

                      {/* Status */}
                      <td className="py-4 pr-2 align-top text-right sm:text-left whitespace-nowrap">
                        <Badge status={ticket.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#64748B]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="w-8 h-8 text-[#94A3B8]" />
                        <span className="text-[14px] font-medium">
                          Tidak ada tiket yang cocok dengan filter atau kata kunci pencarian.
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
};

