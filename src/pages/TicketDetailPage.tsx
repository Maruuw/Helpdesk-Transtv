import React, { useState } from 'react';
import { Sidebar } from '@/components/layout';
import { Card, Badge, Button } from '@/components/ui';
import type { TicketRequestItem } from './DashboardPage';
import {
  FileText,
  ArrowLeft,
  Check,
  ChevronDown,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  CheckCheck,
  User,
  ShieldCheck,
  CornerDownRight,
  X,
} from 'lucide-react';

import type { AppView } from '@/App';

interface TicketDetailPageProps {
  ticket: TicketRequestItem;
  onBack: () => void;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
  onUpdateTicket?: (
    ticketId: string,
    newStatus: 'Solved' | 'In progress' | 'Return' | 'Reject',
    responseMessage: string,
    handlerName?: string,
    responderRole?: 'IT Support' | 'User'
  ) => void;
}

type AvailableStatus = 'Return' | 'In progress' | 'Reject';

const ADMIN_STATUS_OPTIONS: { value: AvailableStatus; label: string; dotClass: string }[] = [
  {
    value: 'In progress',
    label: 'In progress',
    dotClass: 'bg-[#2563EB]',
  },
  {
    value: 'Return',
    label: 'Return',
    dotClass: 'bg-[#C97D0C]',
  },
  {
    value: 'Reject',
    label: 'Reject',
    dotClass: 'bg-[#DC2626]',
  },
];

export const TicketDetailPage: React.FC<TicketDetailPageProps> = ({
  ticket,
  onBack,
  onNavigate,
  onLogout,
  onUpdateTicket,
}) => {
  const isSolved = ticket.status === 'Solved';
  const isInProgress = ticket.status === 'In progress';
  const isReturn = ticket.status === 'Return';
  const isReject = ticket.status === 'Reject';
  const isClosed = isSolved || isReject;

  // Extract clean ID number
  const numericId = ticket.id.replace(/\D/g, '') || '1234567789';

  // Toggle POV: 'admin' (IT Support) or 'user' (Pemohon Tiket)
  const [currentPOV, setCurrentPOV] = useState<'admin' | 'user'>('admin');

  // Form states for Admin Response
  const [selectedStatus, setSelectedStatus] = useState<AvailableStatus | ''>('');
  const [adminResponseMessage, setAdminResponseMessage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Form states for User Revision Response
  const [userResponseMessage, setUserResponseMessage] = useState('');
  const [userError, setUserError] = useState<string | null>(null);

  // Notification Toast
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Modal / Confirm Solved
  const [showSolvedConfirm, setShowSolvedConfirm] = useState(false);
  const [solvedNote, setSolvedNote] = useState('');

  // Check turn-based reply state:
  const responses = ticket.responses || [];
  const lastResponse = responses.length > 0 ? responses[responses.length - 1] : null;
  const isLastResponseFromUser = lastResponse?.role === 'User';

  const hasAdminReturned = ticket.status === 'Return';
  // Admin can reply if not closed AND (not returned OR user has replied)
  const canAdminReply = !isClosed && (!hasAdminReturned || isLastResponseFromUser);
  // User can reply return if status is Return AND user has not replied yet
  const canUserReplyReturn = !isClosed && hasAdminReturned && !isLastResponseFromUser;

  // Submit Handler for Admin Response (e.g. Return, In progress, or Reject)
  const handleAdminSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) {
      setAdminError('Silakan pilih Status Ticket terlebih dahulu');
      return;
    }
    if (!adminResponseMessage.trim()) {
      setAdminError('Silakan isi pesan Response terlebih dahulu');
      return;
    }

    setAdminError(null);
    onUpdateTicket?.(
      ticket.id,
      selectedStatus,
      adminResponseMessage.trim(),
      'Raden Azhar Fadhlur Rohman',
      'IT Support'
    );

    if (selectedStatus === 'Return') {
      setSuccessToast('Tiket berhasil di-Return ke pemohon. Menunggu balasan dari User.');
    } else if (selectedStatus === 'Reject') {
      setSuccessToast('Tiket berhasil ditolak (Reject). Tiket ditutup permanen.');
    } else {
      setSuccessToast('Respon berhasil dikirim. Status tiket: In progress.');
    }

    setAdminResponseMessage('');
    setSelectedStatus('');
    setTimeout(() => setSuccessToast(null), 4500);
  };

  // Submit Handler for User Response (USER NEVER CHANGES TICKET STATUS)
  const handleUserSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userResponseMessage.trim()) {
      setUserError('Silakan isi pesan balasan Anda');
      return;
    }

    setUserError(null);
    // User replies: status of the ticket DOES NOT CHANGE! Only admin can change status.
    onUpdateTicket?.(
      ticket.id,
      ticket.status as 'Solved' | 'In progress' | 'Return',
      userResponseMessage.trim(),
      ticket.requester || 'Damar Pratama',
      'User'
    );

    setSuccessToast('Balasan Anda berhasil dikirim ke IT Support.');
    setUserResponseMessage('');
    setTimeout(() => setSuccessToast(null), 4500);
  };

  // Direct "Mark as Solved" Button by Admin
  const handleDirectMarkSolved = () => {
    const note = solvedNote.trim() || 'Permasalahan telah berhasil diselesaikan oleh tim IT Support.';
    onUpdateTicket?.(
      ticket.id,
      'Solved',
      note,
      'Raden Azhar Fadhlur Rohman',
      'IT Support'
    );
    setShowSolvedConfirm(false);
    setSolvedNote('');
    setSuccessToast('Tiket telah resmi ditandai "Solved". Timeline progres kini telah selesai.');
    setTimeout(() => setSuccessToast(null), 4500);
  };

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
        {/* Top Header Row: Logo Helpdesk on Left, POV Switcher & User Badge on Right */}
        <div className="flex items-center justify-between flex-shrink-0 flex-wrap gap-4">
          <img
            src="/assets/helpdesk.png"
            alt="Helpdesk Logo"
            className="h-[42px] md:h-[48px] w-auto object-contain select-none"
          />

          <div className="flex items-center gap-3">
            {/* POV / Role Switcher Toggle */}
            <div className="flex items-center bg-white p-1 rounded-full border border-slate-200/90 shadow-sm text-[12px] font-semibold">
              <span className="text-[#64748B] px-2.5 text-[11px] uppercase tracking-wider font-bold hidden sm:inline">
                Mode POV:
              </span>
              <button
                type="button"
                onClick={() => setCurrentPOV('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  currentPOV === 'admin'
                    ? 'bg-[#153F85] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin (IT)</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentPOV('user')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  currentPOV === 'user'
                    ? 'bg-[#153F85] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{ticket.requester || 'Damar Pratama'}</span>
              </button>
            </div>

            {/* User Profile Badge */}
            <div className="flex items-center gap-2.5 bg-white pl-1.5 pr-4 py-1.5 rounded-full border border-slate-200/80 shadow-sm">
              <div className="w-[30px] h-[30px] rounded-full bg-[#DDE5ED] text-[#1E293B] font-bold text-[12px] flex items-center justify-center">
                {currentPOV === 'admin' ? 'IT' : 'DP'}
              </div>
              <span className="text-[13px] font-semibold text-[#1E293B]">
                {currentPOV === 'admin' ? 'Raden Azhar (IT)' : 'Damar Pratama'}
              </span>
            </div>
          </div>
        </div>

        {/* Back Link & Title Row */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors w-fit cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to tickets
          </button>

          {/* Ticket Title and Status Badge */}
          <div className="flex items-center flex-wrap gap-3.5 mt-1">
            <h1 className="text-[26px] md:text-[30px] leading-[36px] font-extrabold text-[#0F172A] tracking-[-0.5px]">
              {ticket.subject}
            </h1>
            <Badge status={ticket.status} />
          </div>
        </div>

        {/* Success Alert Toast */}
        {successToast && (
          <div className="bg-[#E7F7ED] border border-[#16A34A]/30 text-[#16A34A] px-4 py-3 rounded-[14px] flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 flex-shrink-0">
            <div className="flex items-center gap-2.5 text-[13px] font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
              <span>{successToast}</span>
            </div>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-[#16A34A] hover:text-green-800 text-[12px] font-bold cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Content Split: Left (Request Details & Response Section) + Right (Progress, Handled By, Attachments) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
          {/* ============ LEFT COLUMN (2 COLUMNS SPAN) ============ */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Card 1: Request Details */}
            <Card radius="xl" className="p-6 md:p-8 bg-white shadow-sm border border-slate-200/70">
              <h2 className="text-[16px] leading-[24px] font-bold text-[#0F172A] mb-6">
                Request details
              </h2>

              {/* 2-Columns Grid of Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                {/* Requester */}
                <div>
                  <div className="text-[11.5px] font-medium text-[#64748B] mb-1">
                    Requester
                  </div>
                  <div className="text-[13.5px] font-bold text-[#0F172A]">
                    {ticket.requester || 'Raden Azhar Fadhlur Rohman'}
                  </div>
                </div>

                {/* NIK */}
                <div>
                  <div className="text-[11.5px] font-medium text-[#64748B] mb-1">
                    NIK
                  </div>
                  <div className="text-[13.5px] font-bold text-[#0F172A]">
                    {ticket.nik || '231270322'}
                  </div>
                </div>

                {/* Departement */}
                <div>
                  <div className="text-[11.5px] font-medium text-[#64748B] mb-1">
                    Departement
                  </div>
                  <div className="text-[13.5px] font-bold text-[#0F172A]">
                    {ticket.department || 'Information Technology'}
                  </div>
                </div>

                {/* Ticket category */}
                <div>
                  <div className="text-[11.5px] font-medium text-[#64748B] mb-1">
                    Ticket category
                  </div>
                  <div className="text-[13.5px] font-bold text-[#0F172A]">
                    {ticket.subcategory || ticket.category}
                  </div>
                </div>

                {/* Group category */}
                <div>
                  <div className="text-[11.5px] font-medium text-[#64748B] mb-1">
                    Group category
                  </div>
                  <div className="text-[13.5px] font-bold text-[#0F172A] uppercase">
                    {ticket.category}
                  </div>
                </div>

                {/* Ticket ID */}
                <div>
                  <div className="text-[11.5px] font-medium text-[#64748B] mb-1">
                    Ticket ID
                  </div>
                  <div className="text-[13.5px] font-bold text-[#0F172A]">
                    {numericId.padEnd(10, '789')}
                  </div>
                </div>

                {/* Submitted */}
                <div>
                  <div className="text-[11.5px] font-medium text-[#64748B] mb-1">
                    Submitted
                  </div>
                  <div className="text-[13.5px] font-bold text-[#0F172A]">
                    {ticket.submitted}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 my-6" />

              {/* Description */}
              <div>
                <div className="text-[11.5px] font-medium text-[#64748B] mb-2">
                  Description
                </div>
                <p className="text-[13.5px] leading-[22px] text-[#1E293B] whitespace-pre-wrap">
                  {ticket.description || '[Ticket description from the user]'}
                </p>
              </div>
            </Card>

            {/* Card 2: Response Support Section (WITHOUT "Admin Action" BADGE) */}
            <Card radius="xl" className="p-6 md:p-8 bg-white shadow-sm border border-slate-200/70">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[16px] leading-[24px] font-bold text-[#0F172A]">
                  Response Support
                </h2>
              </div>

              {/* Response Conversation History */}
              {responses.length > 0 && (
                <div className="mb-6 space-y-3">
                  <div className="text-[12px] font-bold text-[#64748B] uppercase tracking-wide">
                    Riwayat Respon ({responses.length})
                  </div>
                  <div className="space-y-3 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
                    {responses.map((resp) => {
                      const isRespFromAdmin = resp.role === 'IT Support';
                      return (
                        <div
                          key={resp.id}
                          className={`rounded-[14px] p-4 text-[13px] border ${
                            isRespFromAdmin
                              ? 'bg-slate-50/90 border-slate-200/80'
                              : 'bg-blue-50/60 border-blue-100'
                          }`}
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-[24px] h-[24px] rounded-full font-bold text-[10px] flex items-center justify-center text-white ${
                                  isRespFromAdmin ? 'bg-[#0C3E7E]' : 'bg-[#2563EB]'
                                }`}
                              >
                                {isRespFromAdmin ? 'IT' : 'US'}
                              </div>
                              <span className="font-bold text-[#0F172A] text-[13px]">
                                {resp.responder}
                              </span>
                              <span className="text-[11px] text-[#64748B] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                {resp.role}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11.5px] text-[#64748B] flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {resp.submitted}
                              </span>
                              {isRespFromAdmin && resp.status && <Badge status={resp.status} />}
                            </div>
                          </div>
                          <p className="text-[#334155] leading-[20px] whitespace-pre-wrap pl-8">
                            {resp.message}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-slate-100 my-4" />
                </div>
              )}

              {/* ================= CONDITION 1: TICKET IS CLOSED (SOLVED OR REJECT) ================= */}
              {isSolved ? (
                <div className="bg-[#E7F7ED] border border-[#16A34A]/30 rounded-[14px] p-4 flex items-center gap-3 text-[#16A34A]">
                  <CheckCheck className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-[13.5px]">Tiket Telah Selesai (Solved)</div>
                    <div className="text-[12px] text-green-700 mt-0.5">
                      Penanganan tiket ini telah tuntas diselesaikan oleh {ticket.handler || 'IT Support'}. Form respon ditutup.
                    </div>
                  </div>
                </div>
              ) : isReject ? (
                <div className="bg-[#FEF2F2] border border-[#DC2626]/30 rounded-[14px] p-4 flex items-center gap-3 text-[#DC2626]">
                  <X className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-[13.5px]">Tiket Telah Ditolak (Rejected)</div>
                    <div className="text-[12px] text-rose-700 mt-0.5">
                      Tiket ini ditolak oleh {ticket.handler || 'IT Support'} dan telah ditutup permanen. Form respon ditutup.
                    </div>
                  </div>
                </div>
              ) : currentPOV === 'admin' ? (
                /* ================= CONDITION 2: POV ADMIN ================= */
                canAdminReply ? (
                  /* Admin can reply (select Return, In progress, or Solved) */
                  <form onSubmit={handleAdminSubmitResponse} className="flex flex-col gap-4">
                    {/* Status Ticket Dropdown */}
                    <div className="relative">
                      <label className="block text-[12.5px] font-bold text-[#0F172A] mb-1.5">
                        Status Ticket <span className="text-red-500">*</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                        className={`w-full px-4 py-3 rounded-[12px] md:rounded-[14px] border text-left flex items-center justify-between text-[13.5px] transition-all cursor-pointer bg-white ${
                          isDropdownOpen
                            ? 'border-[#2563EB] ring-2 ring-blue-100'
                            : 'border-[#CBD5E1] hover:border-slate-400'
                        }`}
                      >
                        {selectedStatus ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                selectedStatus === 'Return'
                                  ? 'bg-[#C97D0C]'
                                  : selectedStatus === 'Reject'
                                  ? 'bg-[#DC2626]'
                                  : 'bg-[#2563EB]'
                              }`}
                            />
                            <span className="font-semibold text-[#0F172A]">
                              {selectedStatus}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#64748B]">Select a Status</span>
                        )}
                        <ChevronDown
                          className={`w-4 h-4 text-[#64748B] transition-transform duration-200 ${
                            isDropdownOpen ? 'rotate-180 text-[#2563EB]' : ''
                          }`}
                        />
                      </button>

                      {/* Dropdown Options */}
                      {isDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-[14px] shadow-lg z-20 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                          {ADMIN_STATUS_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setSelectedStatus(opt.value);
                                setIsDropdownOpen(false);
                                setAdminError(null);
                              }}
                              className={`w-full px-4 py-2.5 text-left flex items-center justify-between transition-colors hover:bg-slate-50 cursor-pointer ${
                                selectedStatus === opt.value
                                  ? 'bg-blue-50/70 font-semibold'
                                  : ''
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`w-2.5 h-2.5 rounded-full ${opt.dotClass}`}
                                />
                                <span className="text-[13px] text-[#0F172A]">
                                  {opt.label}
                                </span>
                              </div>
                              {selectedStatus === opt.value && (
                                <Check className="w-4 h-4 text-[#2563EB]" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Response Textarea */}
                    <div>
                      <label className="block text-[12.5px] font-bold text-[#0F172A] mb-1.5">
                        Response <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder={
                          selectedStatus === 'Return'
                            ? 'Tuliskan hal yang perlu direvisi atau data yang harus dilengkapi oleh pemohon...'
                            : selectedStatus === 'Reject'
                            ? 'Tuliskan alasan penolakan tiket (misal: duplikat tiket, melanggar kebijakan SOP, diluar wewenang IT)...'
                            : selectedStatus === 'In progress'
                            ? 'Tuliskan catatan progres atau tindakan awal IT Support...'
                            : 'What happened, when did it start, and what did you expect?'
                        }
                        value={adminResponseMessage}
                        onChange={(e) => {
                          setAdminResponseMessage(e.target.value);
                          if (adminError) setAdminError(null);
                        }}
                        className="w-full px-4 py-3 rounded-[12px] md:rounded-[14px] border border-[#CBD5E1] text-[13.5px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all custom-scrollbar resize-none h-[95px]"
                      />
                    </div>

                    {/* Error Notice */}
                    {adminError && (
                      <div className="flex items-center gap-1.5 text-red-600 text-[12px] font-medium">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{adminError}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="py-2.5 px-7 text-[13px] font-bold bg-[#153F85] hover:bg-[#0e2c5e] text-white rounded-full shadow-sm flex items-center gap-2 cursor-pointer transition-all hover:shadow active:scale-95 whitespace-nowrap"
                      >
                        <Send className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Send</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Admin already returned ticket -> Waiting for User reply (1x) */
                  <div className="bg-[#FEF5E7] border border-[#C97D0C]/30 rounded-[14px] p-3.5 text-[#C97D0C]">
                    <div className="flex items-center gap-2 font-bold text-[13.5px]">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>Menunggu Tanggapan Pemohon ({ticket.requester || 'Damar Pratama'})</span>
                    </div>
                  </div>
                )
              ) : (
                /* ================= CONDITION 3: POV USER ================= */
                hasAdminReturned ? (
                  canUserReplyReturn ? (
                    /* User can reply 1x to the Return note (yellow redundant box removed) */
                    <form onSubmit={handleUserSubmitResponse} className="flex flex-col gap-4">
                      <div>
                        <label className="block text-[12.5px] font-bold text-[#0F172A] mb-1.5">
                          Balasan Revisi Pemohon <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Tuliskan keterangan perbaikan atau kelengkapan data yang diminta IT Support..."
                          value={userResponseMessage}
                          onChange={(e) => {
                            setUserResponseMessage(e.target.value);
                            if (userError) setUserError(null);
                          }}
                          className="w-full px-4 py-3 rounded-[12px] md:rounded-[14px] border border-[#CBD5E1] text-[13.5px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all custom-scrollbar resize-none h-[95px]"
                        />
                      </div>

                      {userError && (
                        <div className="flex items-center gap-1.5 text-red-600 text-[12px] font-medium">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{userError}</span>
                        </div>
                      )}

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          className="py-2.5 px-7 text-[13px] font-bold bg-[#153F85] hover:bg-[#0e2c5e] text-white rounded-full shadow-sm flex items-center gap-2 cursor-pointer transition-all hover:shadow active:scale-95 whitespace-nowrap"
                        >
                          <Send className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Send</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* User already replied 1x to Return -> Waiting for Admin decision */
                    <div className="bg-slate-50 border border-slate-200/80 rounded-[14px] p-3.5 text-[#334155]">
                      <div className="flex items-center gap-2 font-bold text-[13.5px] text-[#0F172A]">
                        <Clock className="w-4 h-4 text-[#2563EB]" />
                        <span>Balasan Revisi Anda Telah Dikirim</span>
                      </div>
                    </div>
                  )
                ) : (
                  /* User viewing in-progress, pending, or open -> Freetext response allowed */
                  <form onSubmit={handleUserSubmitResponse} className="flex flex-col gap-4">
                    <div className="bg-blue-50/70 border border-blue-100 rounded-[12px] p-3 text-[12.5px] text-[#1E3A8A] flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
                      <span>Tiket sedang dalam penanganan IT Support. Anda dapat mengirimkan balasan pesan atau informasi di bawah:</span>
                    </div>

                    <div>
                      <label className="block text-[12.5px] font-bold text-[#0F172A] mb-1.5">
                        Tanggapan Pemohon <span className="text-[#64748B] font-normal">(Freetext)</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Ketik pesan balasan atau informasi tambahan untuk IT Support..."
                        value={userResponseMessage}
                        onChange={(e) => {
                          setUserResponseMessage(e.target.value);
                          if (userError) setUserError(null);
                        }}
                        className="w-full px-4 py-3 rounded-[12px] md:rounded-[14px] border border-[#CBD5E1] text-[13.5px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all custom-scrollbar resize-none h-[95px]"
                      />
                    </div>

                    {userError && (
                      <div className="flex items-center gap-1.5 text-red-600 text-[12px] font-medium">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{userError}</span>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="py-2.5 px-7 text-[13px] font-bold bg-[#153F85] hover:bg-[#0e2c5e] text-white rounded-full shadow-sm flex items-center gap-2 cursor-pointer transition-all hover:shadow active:scale-95 whitespace-nowrap"
                      >
                        <Send className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Send</span>
                      </button>
                    </div>
                  </form>
                )
              )}
            </Card>
          </div>

          {/* ============ RIGHT COLUMN (PROGRESS, HANDLED BY, ATTACHMENTS) ============ */}
          <div className="flex flex-col gap-5">
            {/* Card 1: Progress Stepper (STACK DI TENGAH SAMPAI ADA BUTTON SOLVED) */}
            <Card radius="xl" className="p-6 md:p-7 bg-white shadow-sm border border-slate-200/70">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[16px] leading-[24px] font-bold text-[#0F172A]">
                  Progress
                </h2>
                {!isSolved && !isReject && (
                  <span className="text-[11px] font-semibold text-[#64748B] bg-slate-100 px-2.5 py-0.5 rounded-full">
                    Sedang Berjalan
                  </span>
                )}
                {isReject && (
                  <span className="text-[11px] font-semibold text-[#DC2626] bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                    Ditolak
                  </span>
                )}
              </div>

              <div className="relative pl-1">
                {/* Step 1: Open ticket (Always checked green) */}
                <div className="flex items-start gap-4 pb-8 relative">
                  {/* Vertical connecting line to Step 2 */}
                  <div
                    className={`absolute left-[13px] top-[26px] bottom-0 w-[2px] ${
                      isSolved
                        ? 'bg-[#16A34A]'
                        : isReject
                        ? 'bg-[#DC2626]'
                        : isInProgress
                        ? 'bg-[#F59E0B]'
                        : isReturn
                        ? 'bg-[#C97D0C]'
                        : 'bg-slate-200'
                    }`}
                  />

                  {/* Icon Checkmark */}
                  <div className="w-[26px] h-[26px] rounded-full bg-[#16A34A] text-white flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>

                  <div>
                    <div className="text-[13px] font-bold text-[#0F172A]">
                      Open ticket
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-0.5">
                      {ticket.submitted}
                    </div>
                  </div>
                </div>

                {/* Step 2: In progress / Return / Menunggu Penanganan */}
                <div className="flex items-start gap-4 pb-8 relative">
                  {/* Vertical connecting line to Step 3:
                      HIJAU jika Solved, MERAH jika Reject, ABU-ABU jika masih pending/in-progress */}
                  <div
                    className={`absolute left-[13px] top-[26px] bottom-0 w-[2px] ${
                      isSolved
                        ? 'bg-[#16A34A]'
                        : isReject
                        ? 'bg-[#DC2626]'
                        : 'bg-slate-200'
                    }`}
                  />

                  {/* Icon Checkmark / Circle / Clock */}
                  <div
                    className={`w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-sm ${
                      isSolved
                        ? 'bg-[#16A34A] text-white'
                        : isReject
                        ? 'bg-rose-100 text-[#DC2626]'
                        : isInProgress
                        ? 'bg-[#F59E0B] text-white shadow-sm ring-4 ring-amber-100'
                        : isReturn
                        ? 'bg-[#C97D0C] text-white shadow-sm ring-4 ring-orange-100'
                        : 'border-2 border-slate-300 bg-white text-transparent'
                    }`}
                  >
                    {isSolved ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : isReject ? (
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : isInProgress ? (
                      <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : isReturn ? (
                      <CornerDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-300" />
                    )}
                  </div>

                  <div>
                    <div className="text-[13px] font-bold text-[#0F172A]">
                      {isSolved
                        ? 'In progress'
                        : isReject
                        ? 'Penanganan Selesai'
                        : isInProgress
                        ? 'In progress'
                        : isReturn
                        ? 'Return (Revisi)'
                        : 'Menunggu Penanganan'}
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-0.5">
                      {isSolved
                        ? ticket.submitted
                        : isReject
                        ? 'Tiket ditolak oleh IT Support'
                        : isInProgress
                        ? ticket.submitted
                        : isReturn
                        ? 'Perlu tindakan / revisi dari pemohon'
                        : 'Menunggu tindakan awal IT Support'}
                    </div>
                  </div>
                </div>

                {/* Step 3: Solved / Rejected */}
                <div className="flex items-start gap-4 relative">
                  {/* Icon Checkmark: Hijau jika isSolved, Merah jika isReject */}
                  <div
                    className={`w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-sm transition-all duration-300 ${
                      isSolved
                        ? 'bg-[#16A34A] text-white scale-105'
                        : isReject
                        ? 'bg-[#DC2626] text-white scale-105 ring-4 ring-rose-100'
                        : 'border-2 border-slate-300 bg-white text-transparent'
                    }`}
                  >
                    {isReject ? (
                      <X className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    )}
                  </div>

                  <div>
                    <div
                      className={`text-[13px] font-bold ${
                        isReject ? 'text-[#DC2626]' : 'text-[#0F172A]'
                      }`}
                    >
                      {isReject ? 'Rejected' : 'Solved'}
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-0.5">
                      {isSolved
                        ? `by ${ticket.handler || 'Raden Azhar Fadhlur Rohman'}`
                        : isReject
                        ? `Ditolak oleh ${ticket.handler || 'IT Support'}`
                        : 'Waiting for resolution'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Button Solved inside Progress card if not yet solved or rejected */}
              {currentPOV === 'admin' && !isSolved && !isReject && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowSolvedConfirm(true)}
                    className="w-full py-2.5 px-4 text-[13px] font-bold bg-[#16A34A] hover:bg-[#15803d] text-white rounded-full shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all hover:shadow active:scale-[0.99] whitespace-nowrap"
                  >
                    <Check className="w-4 h-4 stroke-[2.5] flex-shrink-0" />
                    <span>Selesaikan Tiket</span>
                  </button>
                </div>
              )}
            </Card>

            {/* Card 2: Handled by */}
            <div className="bg-[#E9F0F8] rounded-[20px] p-5 shadow-sm border border-blue-100/50">
              <div className="text-[11.5px] font-semibold text-[#64748B] tracking-wide">
                Handled by
              </div>
              <div className="text-[14.5px] font-bold text-[#0F172A] mt-1">
                {ticket.handler || 'Raden Azhar Fadhlur Rohman'}
              </div>
            </div>

            {/* Card 3: Attachments */}
            <Card radius="xl" className="p-6 md:p-7 bg-white shadow-sm border border-slate-200/70">
              <h2 className="text-[16px] leading-[24px] font-bold text-[#0F172A] mb-4">
                Attachments
              </h2>

              <div className="space-y-3">
                {ticket.attachments && ticket.attachments.length > 0 ? (
                  ticket.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="border border-[#E2E8F0] rounded-[16px] p-4 flex items-center justify-between bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-[38px] h-[38px] rounded-[10px] bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[12.5px] font-bold text-[#0F172A] truncate max-w-[120px]">
                            {att.name}
                          </div>
                          <div className="text-[11px] text-[#64748B]">
                            {att.size}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => alert(`Mengunduh berkas ${att.name}`)}
                        className="text-[12.5px] font-bold text-[#2563EB] hover:text-[#1d4ed8] hover:underline cursor-pointer px-1 py-1 flex-shrink-0"
                      >
                        Download
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="border border-[#E2E8F0] rounded-[16px] p-4 flex items-center justify-between bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-3">
                      <div className="w-[38px] h-[38px] rounded-[10px] bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[12.5px] font-bold text-[#0F172A]">
                          [file-name.png]
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          [Size]
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert('Mengunduh berkas lampiran')}
                      className="text-[12.5px] font-bold text-[#2563EB] hover:text-[#1d4ed8] hover:underline cursor-pointer px-1 py-1 flex-shrink-0"
                    >
                      Download
                    </button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Modal Konfirmasi Selesaikan Tiket (Mark as Solved) */}
        {showSolvedConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-[24px] max-w-[460px] w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 text-[#16A34A] flex items-center justify-center flex-shrink-0">
                  <CheckCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-[#0F172A]">
                    Tandai Tiket Selesai (Solved)?
                  </h3>
                  <p className="text-[12px] text-[#64748B]">
                    Status tiket akan diubah menjadi Solved dan timeline selesai.
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-[12px] font-bold text-[#0F172A] mb-1.5">
                  Catatan Solusi / Penyelesaian (Opsional):
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Kendala telah diperbaiki dan diverifikasi normal kembali."
                  value={solvedNote}
                  onChange={(e) => setSolvedNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#CBD5E1] text-[13px] text-[#0F172A] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-green-100 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSolvedConfirm(false)}
                  className="px-4 py-2 rounded-full text-[13px] font-semibold text-[#64748B] hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <Button
                  type="button"
                  variant="primary-form"
                  onClick={handleDirectMarkSolved}
                  className="px-6 py-2 rounded-full text-[13px] font-bold bg-[#16A34A] hover:bg-[#15803d] text-white shadow-sm cursor-pointer"
                >
                  Ya, Selesaikan Tiket
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
