import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx-js-style';
import { Sidebar, AppHeader } from '@/components/layout';
import type { AppView } from '@/App';
import {
  ChevronDown,
  Search,
  FileSpreadsheet,
  CheckCircle2,
  X,
  RefreshCw,
} from 'lucide-react';
import { helpdeskApi } from '@/services/api';

export interface ReportItem {
  id: string;
  ticketSubject: string;
  ticketSubtitle: string;
  requesterName: string;
  requesterDept: string;
  group: string;
  handledByName: string;
  handledByInitials: string;
  handledByColor: string;
  solution: string;
  categoryDetail: string;
  handledOn: string;
  year: number;
  month: string;
  status?: string;
}

interface ReportPageProps {
  currentUser?: {
    nik: string;
    name: string;
    department: string;
    role: 'user' | 'admin';
  };
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
}

const INITIAL_REPORT_DATA: ReportItem[] = [
  {
    id: 'rep-1',
    ticketSubject: 'Permohonan Penghapusan Data Transaksi',
    ticketSubtitle: 'Aplikasi Insosys (Umum)',
    requesterName: 'Okky Kurniawan',
    requesterDept: 'ART',
    group: 'IT Software Development',
    handledByName: 'Niel Hakim Pradana',
    handledByInitials: 'NH',
    handledByColor: 'bg-[#DBEAFE] text-[#1D4ED8]',
    solution: 'Silahkan dicek kembali. Terima kasih',
    categoryDetail: 'Aplikasi Insosys (Umum) (Perubahan Data)',
    handledOn: '2 Jan 2024, 19:49',
    year: 2024,
    month: 'Januari',
  },
  {
    id: 'rep-2',
    ticketSubject: 'PC muncul keterangan repair',
    ticketSubtitle: 'Hardware CPU',
    requesterName: 'M Azis Suhab',
    requesterDept: 'Human Capital',
    group: 'IT Support',
    handledByName: 'Genito Irhamsyah',
    handledByInitials: 'GI',
    handledByColor: 'bg-[#EDE9FE] text-[#6D28D9]',
    solution: 'Telah dilakukan perbaikan bootable OS Windows dan pengecekan harddisk CPU.',
    categoryDetail: 'Hardware CPU (Repair OS & Booting)',
    handledOn: '15 Jan 2024, 14:20',
    year: 2024,
    month: 'Januari',
  },
  {
    id: 'rep-3',
    ticketSubject: 'Perbaikan PC',
    ticketSubtitle: 'Hardware CPU',
    requesterName: 'M Azis Suhab',
    requesterDept: 'Human Capital',
    group: 'IT Support',
    handledByName: 'Wahidin',
    handledByInitials: 'W',
    handledByColor: 'bg-[#F3E8FF] text-[#7E22CE]',
    solution: 'Penggantian power supply unit (PSU 500W) dan pembersihan thermal paste prosesor.',
    categoryDetail: 'Hardware CPU (Ganti Komponen)',
    handledOn: '18 Jan 2024, 11:15',
    year: 2024,
    month: 'Januari',
  },
  {
    id: 'rep-4',
    ticketSubject: 'Pembuatan RV',
    ticketSubtitle: 'Aplikasi Insosys - Modul Budget (Tambah/Modifi...',
    requesterName: 'Dwi Suharto Wirawan',
    requesterDept: 'Budget & Management Acc',
    group: 'IT Software Development',
    handledByName: 'Indah Astya Ningrum',
    handledByInitials: 'IA',
    handledByColor: 'bg-[#EDE9FE] text-[#6D28D9]',
    solution: 'Menu pembuatan Request Voucher (RV) pada modul Budget Insosys telah diaktifkan untuk user terkait.',
    categoryDetail: 'Aplikasi Insosys - Modul Budget (Tambah/Modifikasi Menu)',
    handledOn: '22 Jan 2024, 10:30',
    year: 2024,
    month: 'Januari',
  },
  {
    id: 'rep-5',
    ticketSubject: 'Revisi Rekanan',
    ticketSubtitle: 'Aplikasi Insosys (Umum) (Perubahan Data)',
    requesterName: 'Shinta Sintyawati',
    requesterDept: 'Production Operation',
    group: 'IT Software Development',
    handledByName: 'Indah Astya Ningrum',
    handledByInitials: 'IA',
    handledByColor: 'bg-[#EDE9FE] text-[#6D28D9]',
    solution: 'Data identitas dan rekening rekanan telah disesuaikan dengan dokumen terbaru.',
    categoryDetail: 'Aplikasi Insosys (Perubahan Data Master Rekanan)',
    handledOn: '29 Jan 2024, 16:45',
    year: 2024,
    month: 'Januari',
  },
];

// 5 Group Resmi Database Sesuai tbl_group di HeidiSQL
const GROUPS_LIST = [
  'All Group',
  'IT Software Development',
  'IT Broadcast Multimedia',
  'IT Support',
  'IT TOS',
  'HRIS',
];

const YEARS_LIST = ['Years', '2026', '2025', '2024', '2023', '2022'];

const MONTHS_LIST = [
  'Month',
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const ReportPage: React.FC<ReportPageProps> = ({
  currentUser = {
    nik: '231270322',
    name: 'Raden Azhar Fadhlur',
    department: 'Information Technology',
    role: 'admin',
  },
  onNavigate,
  onLogout,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Live Report dataset from MySQL Database
  const [reportData, setReportData] = useState<ReportItem[]>(INITIAL_REPORT_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filters
  const [selectedGroup, setSelectedGroup] = useState<string>('All Group');
  const [selectedYear, setSelectedYear] = useState<string>('Years');
  const [selectedMonth, setSelectedMonth] = useState<string>('Month');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dropdown open states for filter pills
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);

  // Expanded row ID
  const [expandedRowId, setExpandedRowId] = useState<string | null>('rep-1');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load report data from backend MySQL API
  const fetchReportData = () => {
    setIsLoading(true);
    helpdeskApi
      .getReports({
        group: selectedGroup,
        year: selectedYear,
        month: selectedMonth,
        search: searchQuery,
        limit: 1000,
      })
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setReportData(res.data);
          if (res.data[0]) {
            setExpandedRowId(res.data[0].id);
          }
        }
      })
      .catch((err) => {
        console.warn('API getReports error, fallback ke data lokal:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedGroup, selectedYear, selectedMonth, searchQuery]);

  // Toggle row accordion dropdown
  const handleToggleRow = (id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  // Filtered dataset (Backend already filters, local fallback logic handles in-memory)
  const filteredData = useMemo(() => {
    return reportData.filter((item) => {
      // Group filter
      if (selectedGroup !== 'All Group' && item.group !== selectedGroup) {
        return false;
      }
      // Year filter
      if (selectedYear !== 'Years' && item.year.toString() !== selectedYear) {
        return false;
      }
      // Month filter
      if (selectedMonth !== 'Month' && item.month.toLowerCase() !== selectedMonth.toLowerCase()) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSubject = item.ticketSubject.toLowerCase().includes(q);
        const matchSubtitle = item.ticketSubtitle.toLowerCase().includes(q);
        const matchReq = item.requesterName.toLowerCase().includes(q);
        const matchDept = item.requesterDept.toLowerCase().includes(q);
        const matchHandler = item.handledByName.toLowerCase().includes(q);
        const matchSolution = item.solution.toLowerCase().includes(q);
        const matchCategory = item.categoryDetail.toLowerCase().includes(q);
        return (
          matchSubject ||
          matchSubtitle ||
          matchReq ||
          matchDept ||
          matchHandler ||
          matchSolution ||
          matchCategory
        );
      }
      return true;
    });
  }, [reportData, selectedGroup, selectedYear, selectedMonth, searchQuery]);

  // Pagination slicing
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredData.slice(startIndex, endIndex);

  // Export to Native Microsoft Excel (.xlsx) dengan kolom rapi terpisah
  const handleExportToExcel = () => {
    if (!filteredData || filteredData.length === 0) {
      setToastMessage('Tidak ada data tiket untuk diekspor!');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const headers = [
      'No',
      'No Tiket',
      'Ticket Subject',
      'Ticket Subcategory',
      'Requested By',
      'Department',
      'Group',
      'Handled By',
      'Solution / Detail Permasalahan',
      'Category Detail',
      'Handled On',
      'Year',
      'Month',
    ];

    const dataRows = filteredData.map((item, idx) => [
      idx + 1,
      item.id,
      item.ticketSubject,
      item.ticketSubtitle,
      item.requesterName,
      item.requesterDept,
      item.group,
      item.handledByName,
      item.solution,
      item.categoryDetail,
      item.handledOn,
      item.year,
      item.month,
    ]);

    // Buat worksheet dari array 2 dimensi
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

    // Atur lebar kolom yang proporsional agar teks tidak terpotong di Excel
    worksheet['!cols'] = [
      { wch: 6 },  // No
      { wch: 16 }, // No Tiket
      { wch: 34 }, // Ticket Subject
      { wch: 32 }, // Ticket Subcategory
      { wch: 24 }, // Requested By
      { wch: 24 }, // Department
      { wch: 26 }, // Group
      { wch: 24 }, // Handled By
      { wch: 50 }, // Solution
      { wch: 36 }, // Category Detail
      { wch: 20 }, // Handled On
      { wch: 10 }, // Year
      { wch: 14 }, // Month
    ];

    // Atur tinggi baris (Row Heights)
    const rowHeights = [{ hpt: 28 }]; // Header row: 28pt (lega dan proporsional)
    for (let i = 1; i <= dataRows.length; i++) {
      rowHeights.push({ hpt: 22 }); // Data rows: 22pt
    }
    worksheet['!rows'] = rowHeights;

    // Styling Sel per Baris dan Kolom (Warna Header TRANS TV, Border, Alignment, dan Zebra Rows)
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        if (!cell) continue;

        if (R === 0) {
          // ================= HEADER TITLE STYLING =================
          cell.s = {
            fill: {
              fgColor: { rgb: '0C3E7E' }, // Corporate Navy Blue TRANS TV
            },
            font: {
              name: 'Calibri',
              sz: 11,
              bold: true,
              color: { rgb: 'FFFFFF' }, // Teks Putih Tebal
            },
            alignment: {
              vertical: 'center',
              horizontal: 'center',
              wrapText: true,
            },
            border: {
              top: { style: 'thin', color: { rgb: '072A56' } },
              bottom: { style: 'medium', color: { rgb: '072A56' } },
              left: { style: 'thin', color: { rgb: '1E40AF' } },
              right: { style: 'thin', color: { rgb: '1E40AF' } },
            },
          };
        } else {
          // ================= DATA ROWS STYLING =================
          const isEvenRow = R % 2 === 0;
          const isCenterCol = [0, 1, 10, 11, 12].includes(C); // No, No Tiket, Handled On, Year, Month

          cell.s = {
            fill: {
              // Zebra alternating row colors untuk kemudahan membaca baris
              fgColor: { rgb: isEvenRow ? 'F8FAFC' : 'FFFFFF' },
            },
            font: {
              name: 'Calibri',
              sz: 10,
              color: { rgb: '1E293B' },
            },
            alignment: {
              vertical: 'center',
              horizontal: isCenterCol ? 'center' : 'left',
              wrapText: false,
            },
            border: {
              top: { style: 'thin', color: { rgb: 'E2E8F0' } },
              bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
              left: { style: 'thin', color: { rgb: 'E2E8F0' } },
              right: { style: 'thin', color: { rgb: 'E2E8F0' } },
            },
          };
        }
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Tiket');

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Report_Helpdesk_TRANS_TV_${dateStr}.xlsx`;

    // Buat file binary .xlsx dan download via Blob
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show friendly confirmation toast
    setToastMessage(`Laporan berhasil diekspor (${filteredData.length} baris data tiket ke format Excel .xlsx)!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="w-full h-screen min-h-screen flex overflow-hidden bg-[#ECF1F7] select-none font-sans">
      {/* ================= LEFT SIDEBAR ================= */}
      <Sidebar
        activeItem="report"
        userRole={currentUser.role}
        onLogout={onLogout}
        currentUser={currentUser}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenMobile={() => setIsMobileMenuOpen(true)}
        onNavigate={onNavigate}
      />

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 h-screen overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-7 pb-24 lg:pb-8 flex flex-col gap-5 sm:gap-6 custom-scrollbar">
        {/* Top Header */}
        <AppHeader
          currentUser={currentUser}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Page Title & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
          <div>
            <h1 className="text-[22px] sm:text-[26px] md:text-[30px] leading-[30px] sm:leading-[36px] font-extrabold text-[#0F172A] tracking-[-0.5px]">
              Report
            </h1>
            <p className="text-[12.5px] sm:text-[13px] text-slate-500 mt-0.5">
              Laporan data tiket historis dan berjalan dari database Helpdesk TRANS TV.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchReportData}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-[12.5px] font-bold text-[#153F85] shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* Toast Alert Notification */}
        {toastMessage && (
          <div className="flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="text-[13.5px] font-medium">{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-600 hover:text-emerald-800 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Invisible Backdrop to close filter dropdowns when clicking outside */}
        {(isGroupDropdownOpen || isYearDropdownOpen || isMonthDropdownOpen) && (
          <div
            className="fixed inset-0 z-20"
            onClick={() => {
              setIsGroupDropdownOpen(false);
              setIsYearDropdownOpen(false);
              setIsMonthDropdownOpen(false);
            }}
          />
        )}

        {/* ================= REPORT CARD CONTAINER ================= */}
        <div className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 md:p-8 shadow-sm border border-slate-200/80 flex flex-col gap-6 relative z-10">
          {/* Top Control Bar: Filters on Left, Export & Search on Right */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Filter Pills - Horizontal slider on mobile, neat row with visible overflow on desktop */}
            <div className="flex items-center gap-2.5 overflow-x-auto sm:overflow-visible no-scrollbar pb-1 sm:pb-0 flex-nowrap sm:flex-wrap shrink-0 max-w-full relative z-20">
              <span className="text-[13px] font-semibold text-slate-700 mr-1 shrink-0 flex items-center gap-1.5">
                Filter By
              </span>

              {/* Group Filter Dropdown Pill (5 Database Groups) */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsGroupDropdownOpen(!isGroupDropdownOpen);
                    setIsYearDropdownOpen(false);
                    setIsMonthDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 bg-white border border-slate-300 hover:border-slate-400 px-3.5 py-1.5 rounded-full text-[13px] font-medium text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#0C3E7E]"
                >
                  <span className="whitespace-nowrap">{selectedGroup}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </button>

                {/* Native select overlay on mobile for perfect non-clipping picker */}
                <select
                  value={selectedGroup}
                  onChange={(e) => {
                    setSelectedGroup(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="sm:hidden absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                  aria-label="Pilih Group"
                >
                  {GROUPS_LIST.map((grp) => (
                    <option key={grp} value={grp}>
                      {grp}
                    </option>
                  ))}
                </select>

                {isGroupDropdownOpen && (
                  <div className="hidden sm:block absolute left-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-[13px] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {GROUPS_LIST.map((grp) => (
                      <button
                        key={grp}
                        onClick={() => {
                          setSelectedGroup(grp);
                          setIsGroupDropdownOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors ${
                          selectedGroup === grp
                            ? 'font-bold text-[#0C3E7E] bg-blue-50/50'
                            : 'text-slate-700'
                        }`}
                      >
                        {grp}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Years Filter Dropdown Pill */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsYearDropdownOpen(!isYearDropdownOpen);
                    setIsGroupDropdownOpen(false);
                    setIsMonthDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 bg-white border border-slate-300 hover:border-slate-400 px-3.5 py-1.5 rounded-full text-[13px] font-medium text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#0C3E7E]"
                >
                  <span className="whitespace-nowrap">{selectedYear}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </button>

                {/* Native select overlay on mobile */}
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="sm:hidden absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                  aria-label="Pilih Tahun"
                >
                  {YEARS_LIST.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>

                {isYearDropdownOpen && (
                  <div className="hidden sm:block absolute left-0 mt-1.5 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-[13px] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {YEARS_LIST.map((yr) => (
                      <button
                        key={yr}
                        onClick={() => {
                          setSelectedYear(yr);
                          setIsYearDropdownOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors ${
                          selectedYear === yr
                            ? 'font-bold text-[#0C3E7E] bg-blue-50/50'
                            : 'text-slate-700'
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Month Filter Dropdown Pill */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsMonthDropdownOpen(!isMonthDropdownOpen);
                    setIsGroupDropdownOpen(false);
                    setIsYearDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 bg-white border border-slate-300 hover:border-slate-400 px-3.5 py-1.5 rounded-full text-[13px] font-medium text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#0C3E7E]"
                >
                  <span className="whitespace-nowrap">{selectedMonth}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </button>

                {/* Native select overlay on mobile */}
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="sm:hidden absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                  aria-label="Pilih Bulan"
                >
                  {MONTHS_LIST.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                {isMonthDropdownOpen && (
                  <div className="hidden sm:block absolute left-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-[13px] max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                    {MONTHS_LIST.map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setSelectedMonth(m);
                          setIsMonthDropdownOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors ${
                          selectedMonth === m
                            ? 'font-bold text-[#0C3E7E] bg-blue-50/50'
                            : 'text-slate-700'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Export to Excel Button & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={handleExportToExcel}
                className="flex items-center justify-center gap-2 bg-[#0C3E7E] hover:bg-[#092e5e] text-white px-5 py-2.5 rounded-full text-[13px] font-bold shadow-sm transition-all cursor-pointer select-none active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>EXPORT TO EXCEL</span>
              </button>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari tiket di database..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-[220px] pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-full text-[13px] placeholder:text-slate-400 focus:outline-none focus:border-[#0C3E7E] focus:ring-1 focus:ring-[#0C3E7E] transition-all"
                />
              </div>
            </div>
          </div>

          {/* ================= TABLE LIST ================= */}
          <div className="w-full overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Table Column Headers */}
              <div className="grid grid-cols-12 gap-4 pb-3 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none px-3">
                <div className="col-span-4">TICKET</div>
                <div className="col-span-3">REQUESTED BY</div>
                <div className="col-span-2">GROUP</div>
                <div className="col-span-3">HANDLED BY</div>
              </div>

              {/* Table Data Rows */}
              <div className="divide-y divide-slate-100">
                {currentItems.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-[14px]">
                    {isLoading ? 'Sedang memuat data dari database...' : 'Tidak ada data report yang sesuai dengan filter atau pencarian.'}
                  </div>
                ) : (
                  currentItems.map((item) => {
                    const isExpanded = expandedRowId === item.id;
                    const isSoftwareDev = item.group === 'IT Software Development';

                    return (
                      <div
                        key={item.id}
                        className={`transition-colors py-4 px-3 rounded-2xl ${
                          isExpanded ? 'bg-slate-50/40' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        {/* Main Clickable Row */}
                        <div
                          onClick={() => handleToggleRow(item.id)}
                          className="grid grid-cols-12 gap-4 items-center cursor-pointer group"
                        >
                          {/* Col 1: TICKET */}
                          <div className="col-span-4 pr-2">
                            <h3 className="text-[14px] leading-[20px] font-bold text-[#1E293B] group-hover:text-[#0C3E7E] transition-colors">
                              {item.ticketSubject}
                            </h3>
                            <p className="text-[12px] leading-[16px] text-slate-400 font-normal mt-0.5">
                              {item.ticketSubtitle}
                            </p>
                          </div>

                          {/* Col 2: REQUESTED BY */}
                          <div className="col-span-3">
                            <div className="text-[13.5px] leading-[18px] font-bold text-[#1E293B]">
                              {item.requesterName}
                            </div>
                            <div className="text-[12px] leading-[16px] text-slate-400 font-normal mt-0.5">
                              {item.requesterDept}
                            </div>
                          </div>

                          {/* Col 3: GROUP BADGE */}
                          <div className="col-span-2">
                            <span
                              className={`inline-block px-3.5 py-1 rounded-full text-[12px] font-semibold tracking-tight ${
                                isSoftwareDev
                                  ? 'bg-[#F1EEFE] text-[#6E42E5]'
                                  : 'bg-[#E7F0FD] text-[#2563EB]'
                              }`}
                            >
                              {item.group}
                            </span>
                          </div>

                          {/* Col 4: HANDLED BY */}
                          <div className="col-span-3 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0 ${item.handledByColor}`}
                              >
                                {item.handledByInitials}
                              </div>
                              <span className="text-[13.5px] font-semibold text-[#1E293B]">
                                {item.handledByName}
                              </span>
                            </div>

                            {/* Chevron Indicator */}
                            <div className="text-slate-400 pl-2">
                              <ChevronDown
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-180 text-[#0C3E7E]' : ''
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* ================= DROPDOWN DETAIL ACCORDION ================= */}
                        {isExpanded && (
                          <div className="mt-4 p-5 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl animate-in fade-in slide-from-top-1 duration-200">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                              {/* Left Side: SOLUTION / PROBLEM */}
                              <div className="md:col-span-7 pr-4">
                                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                                  SOLUTION / DETAIL PERMASALAHAN
                                </span>
                                <p className="text-[13.5px] leading-[22px] font-medium text-slate-800 whitespace-pre-line">
                                  {item.solution}
                                </p>
                              </div>

                              {/* Right Side: CATEGORY & HANDLED ON */}
                              <div className="md:col-span-5 space-y-4">
                                <div>
                                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                                    CATEGORY
                                  </span>
                                  <p className="text-[13.5px] leading-[20px] font-medium text-slate-800">
                                    {item.categoryDetail}
                                  </p>
                                </div>

                                <div>
                                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                                    HANDLED ON
                                  </span>
                                  <p className="text-[13.5px] leading-[20px] font-medium text-slate-800">
                                    {item.handledOn}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ================= BOTTOM PAGINATION ================= */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-[13px] text-slate-500">
            <div>
              Menampilkan <span className="font-semibold text-slate-700">{totalItems === 0 ? 0 : startIndex + 1}</span> sampai{' '}
              <span className="font-semibold text-slate-700">{endIndex}</span> dari{' '}
              <span className="font-semibold text-slate-700">{totalItems}</span> tiket
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5 select-none">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validCurrentPage === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                &lt;
              </button>

              {/* Numbered Page Buttons */}
              {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => {
                const pageNumber = i + 1;
                const isActive = pageNumber === validCurrentPage;

                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-8 h-8 rounded-lg font-bold text-[13px] flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-[#193B70] text-white shadow-sm'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              {totalPages > 3 && (
                <>
                  <span className="px-1 text-slate-400">...</span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(totalPages)}
                    className={`w-8 h-8 rounded-lg font-bold text-[13px] flex items-center justify-center transition-colors ${
                      totalPages === validCurrentPage
                        ? 'bg-[#193B70] text-white shadow-sm'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validCurrentPage >= totalPages}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
