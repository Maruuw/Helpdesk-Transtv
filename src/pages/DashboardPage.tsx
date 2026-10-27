import React from 'react';
import { Sidebar } from '@/components/layout';
import { MetricCard, Badge, Button, Card } from '@/components/ui';
import { Plus } from 'lucide-react';

export interface TicketResponseItem {
  id: string;
  responder: string;
  role: string;
  submitted: string;
  status?: 'Solved' | 'In progress' | 'Return' | 'Reject';
  message: string;
}

export interface TicketRequestItem {
  id: string;
  no: number;
  subject: string;
  description?: string;
  category: string;
  subcategory: string;
  submitted: string;
  status: 'Solved' | 'In progress' | 'Waiting' | 'Return' | 'Pending' | 'Open' | 'Reject';
  handler?: string;
  requester?: string;
  nik?: string;
  department?: string;
  attachments?: { id: string; name: string; size: string }[];
  responses?: TicketResponseItem[];
}

interface DashboardPageProps {
  onLogout?: () => void;
  onCreateTicket?: () => void;
  onViewAllTickets?: () => void;
  onNavigateMasterCategory?: () => void;
  onSelectTicket?: (ticket: TicketRequestItem) => void;
  tickets?: TicketRequestItem[];
}

export const initialLatestRequests: TicketRequestItem[] = [
  {
    id: 'REQ-2026-001',
    no: 1,
    subject: 'test 123',
    description: 'Mohon bantuan untuk perubahan data master karyawan pada sistem Insesys karena terdapat salah input penempatan divisi.',
    category: 'Aplikasi Insesys (Umum)',
    subcategory: 'Perubahan Data',
    submitted: '21 Jan 2026, 18:46',
    status: 'Solved',
    handler: 'Raden Azhar Fadhlur Rohman',
    requester: 'Raden Azhar Fadhlur Rohman',
    nik: '231270322',
    department: 'Information Technology',
    attachments: [{ id: 'att-1', name: '[file-name.png]', size: '[Size]' }],
  },
  {
    id: 'REQ-2026-002',
    no: 2,
    subject: 'Permintaan Akses VPN Kerja Remote & Server DB',
    description: 'Permintaan open port dan akun VPN Cisco AnyConnect untuk keperluan remote deployment database weekend ini.',
    category: 'Network & Security',
    subcategory: 'Akses VPN & Firewall',
    submitted: '25 Jan 2026, 10:15',
    status: 'In progress',
    handler: 'Tri Wahyudi (IT Infrastructure)',
    requester: 'Raden Azhar Fadhlur Rohman',
    nik: '231270322',
    department: 'Information Technology',
    attachments: [{ id: 'att-2', name: 'form_approval_vpn.pdf', size: '520 KB' }],
  },
  {
    id: 'REQ-2026-003',
    no: 3,
    subject: 'Kendala Koneksi Printer Studio 1 News Lantai 3',
    description: 'Printer Canon iR-ADV di meja produser Studio 1 offline dan tidak merespon print cue dari PC kontrol.',
    category: 'Hardware & Perangkat',
    subcategory: 'Printer / Scanner',
    submitted: '26 Jan 2026, 14:30',
    status: 'In progress',
    handler: 'Fajar Nugraha',
    requester: 'Raden Azhar Fadhlur Rohman',
    nik: '231270322',
    department: 'Information Technology',
  },
  {
    id: 'REQ-2026-004',
    no: 4,
    subject: 'Reset Password Akun TransHub & Email Korporat',
    description: 'Akun TransHub terkunci setelah salah memasukkan OTP 3 kali. Mohon bantuan reset password.',
    category: 'Akun & Akses',
    subcategory: 'User Management',
    submitted: '27 Jan 2026, 08:20',
    status: 'Return',
    handler: 'Awaiting IT Assignment',
    requester: 'Raden Azhar Fadhlur Rohman',
    nik: '231270322',
    department: 'Information Technology',
  },
  {
    id: 'REQ-2026-005',
    no: 5,
    subject: 'Lisensi Software Adobe Premiere Pro Video Editor',
    description: 'Pengajuan lisensi Adobe Creative Cloud Premiere Pro 2026 untuk unit video editing pasca produksi.',
    category: 'Software License',
    subcategory: 'Software Request',
    submitted: '27 Jan 2026, 09:45',
    status: 'Solved',
    handler: 'Dimas Pratama',
    requester: 'Raden Azhar Fadhlur Rohman',
    nik: '231270322',
    department: 'Information Technology',
  },
];

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onLogout,
  onCreateTicket,
  onViewAllTickets,
  onNavigateMasterCategory,
  onSelectTicket,
  tickets = initialLatestRequests,
}) => {
  const currentRequests = tickets;
  const latestFiveRequests = currentRequests.slice(0, 5);
  const totalCount = currentRequests.length;
  const returnCount = currentRequests.filter((r) => r.status === 'Return' || r.status === 'Waiting').length;
  const inProgressCount = currentRequests.filter((r) => r.status === 'In progress').length;
  const solvedCount = currentRequests.filter((r) => r.status === 'Solved').length;

  return (
    <div className="w-full h-screen min-h-screen flex overflow-hidden bg-[#ECF1F7] select-none">
      
      {/* ================= LEFT SIDEBAR ================= */}
      <Sidebar
        activeItem="dashboard"
        onLogout={onLogout}
        onNavigate={(item) => {
          if (item === 'create-ticket') onCreateTicket?.();
          if (item === 'my-tickets') onViewAllTickets?.();
          if (item === 'master-category') onNavigateMasterCategory?.();
        }}
      />

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 h-screen overflow-hidden px-6 py-4 md:px-8 md:py-5 flex flex-col gap-3.5 md:gap-4">
        
        {/* Top Logo */}
        <div className="flex items-center justify-between flex-shrink-0">
          {/* ========================================================================= */}
          {/* UKURAN LOGO HELPDESK DASHBOARD:                                           */}
          {/* Ubah h-[42px] md:h-[48px] di bawah untuk memperbesar / memperkecil        */}
          {/* ========================================================================= */}
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
          <div className="relative z-10 p-5 md:p-6 max-w-[550px] bg-gradient-to-r from-[#0C3E7E] via-[#0C3E7E]/95 to-transparent h-full flex flex-col justify-between">
            <div>
              <span className="text-[12.5px] leading-[18px] text-blue-200/90 font-medium tracking-wide">
                Software Development
              </span>
              <h1 className="text-[22px] sm:text-[26px] leading-[32px] font-extrabold text-white tracking-[-0.75px] mt-1 mb-0.5">
                Welcome back, Damar!
              </h1>
              <p className="text-[11.5px] leading-[16px] text-blue-200/75">
                Software Development
              </p>
            </div>
          </div>
        </div>

        {/* 4 Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 flex-shrink-0">
          <MetricCard
            label="Total requests"
            value={totalCount.toString()}
            subtitle="Submitted by you"
            dotColor="blue"
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
            label="In progress"
            value={inProgressCount.toString()}
            subtitle="Being handled"
            dotColor="blue"
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

        {/* Bottom Split Section: Latest Requests Table & Got a new issue Card */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 pb-1">
          
          {/* ============ LEFT: Your 5 latest requests (2 Columns) ============ */}
          <Card radius="xl" className="lg:col-span-2 p-5 md:p-6 flex flex-col h-full overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <h2 className="text-[16px] leading-[24px] font-bold text-[#0F172A]">
                Your 5 latest requests
              </h2>
              <button
                onClick={onViewAllTickets}
                className="text-[12px] font-semibold text-[#2563EB] hover:text-[#1d4ed8] hover:underline transition-colors"
              >
                View all
              </button>
            </div>

            {/* Requests Table Container: only this scrolls vertically if needed */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto pr-1.5 custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_0_#f1f5f9]">
                  <tr className="border-b border-slate-100 text-[11.5px] leading-[17.25px] font-semibold text-[#64748B]">
                    <th className="pb-2.5 pl-1 font-semibold w-[36px]">No</th>
                    <th className="pb-2.5 px-3 font-semibold">Subject</th>
                    <th className="pb-2.5 px-3 font-semibold">Category</th>
                    <th className="pb-2.5 px-3 font-semibold">Submitted</th>
                    <th className="pb-2.5 pr-1 font-semibold text-right sm:text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {latestFiveRequests.map((req, index) => (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 pl-1 text-[12px] font-medium text-[#64748B] align-top">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-3 align-top max-w-[210px]">
                        <button
                          onClick={() => onSelectTicket ? onSelectTicket(req) : onViewAllTickets?.()}
                          className="text-[13px] font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors text-left line-clamp-2 leading-snug cursor-pointer"
                        >
                          {req.subject}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 align-top">
                        <div className="text-[12px] font-semibold text-[#1E293B]">
                          {req.category}
                        </div>
                        <div className="text-[11px] text-[#64748B] mt-0.5">
                          {req.subcategory}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-[12px] text-[#1E293B] whitespace-nowrap align-top">
                        {req.submitted}
                      </td>
                      <td className="py-2.5 pr-1 align-top text-right sm:text-left">
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

          {/* ============ RIGHT: Got a new issue? (1 Column) ============ */}
          <Card radius="xl" className="p-5 md:p-6 flex flex-col justify-between h-full shadow-sm">
            <div>
              <h2 className="text-[16px] leading-[24px] font-bold text-[#0F172A] mb-2">
                Got a new issue?
              </h2>
              <p className="text-[13px] leading-[20px] text-[#64748B]">
                Send a request and follow its status right here.
              </p>
            </div>

            <div className="pt-4">
              <Button
                variant="primary-list"
                size="md"
                onClick={onCreateTicket}
                leftIcon={<Plus className="w-4 h-4 text-white" />}
                className="w-full py-[12px] text-[13px] font-semibold bg-[#193B70] hover:bg-[#122c54] text-white shadow-sm"
              >
                Create New Ticket
              </Button>
            </div>
          </Card>

        </div>

      </main>

    </div>
  );
};
