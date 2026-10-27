import React, { useState, useMemo } from 'react';
import { Sidebar } from '@/components/layout';
import { Card } from '@/components/ui';
import {
  ChevronDown,
  Search,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
  Check,
} from 'lucide-react';

export interface CategoryItem {
  id: string;
  department: string;
  categoryName: string;
  group: string;
  status: string; // e.g. 'IT Software Development', 'HRIS', etc.
}

interface MasterCategoryPageProps {
  onNavigate: (view: 'dashboard' | 'create-ticket' | 'my-tickets' | 'master-category') => void;
  onLogout: () => void;
}

const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-1',
    department: 'Informatika',
    categoryName: 'Aplikasi Insosys (Umum)\n(Perubahan Data)',
    group: 'Hozpitalitation',
    status: 'IT Software Development',
  },
  {
    id: 'cat-2',
    department: 'Human Capital',
    categoryName: 'Aplikasi HR - HRSS (Cuti online)',
    group: 'Hozpitalitation',
    status: 'HRIS',
  },
  {
    id: 'cat-3',
    department: 'Informatika',
    categoryName: 'Aplikasi ERP',
    group: 'Hozpitalitation',
    status: 'IT Software Development',
  },
  {
    id: 'cat-4',
    department: 'Informatika',
    categoryName: 'Jaringan & Infrastruktur (VPN Cisco)',
    group: 'Hozpitalitation',
    status: 'IT Infrastructure',
  },
  {
    id: 'cat-5',
    department: 'Human Capital',
    categoryName: 'Master Data Karyawan TransHub',
    group: 'Hozpitalitation',
    status: 'HRIS',
  },
];

const DEPARTMENT_OPTIONS = [
  'Informatika',
  'Human Capital',
  'Finance & Accounting',
  'News & Production',
  'Broadcast & Transmission',
  'General Affair',
];

const GROUP_OPTIONS = [
  'Hozpitalitation',
  'IT Software Development',
  'IT Infrastructure',
  'Hardware & Device',
  'Account & Access',
  'Broadcast Support',
];

export const MasterCategoryPage: React.FC<MasterCategoryPageProps> = ({
  onNavigate,
  onLogout,
}) => {
  // Category table list state
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);

  // Form states
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [nameCategory, setNameCategory] = useState('');

  // Dropdown states for form
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);

  // Form error & success alerts
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isFilterDeptOpen, setIsFilterDeptOpen] = useState(false);
  const [isFilterStatusOpen, setIsFilterStatusOpen] = useState(false);

  // Action popover per row
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Extract unique statuses from categories for filter
  const availableStatuses = useMemo(() => {
    return Array.from(new Set(categories.map((c) => c.status)));
  }, [categories]);

  // Handle Create / Add Category
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDept) {
      setFormError('Silakan pilih Departement terlebih dahulu');
      return;
    }
    if (!selectedGroup) {
      setFormError('Silakan pilih Group terlebih dahulu');
      return;
    }
    if (!nameCategory.trim()) {
      setFormError('Silakan isi Name Category terlebih dahulu');
      return;
    }

    setFormError(null);

    // Determine status team based on department / group
    const assignedStatus =
      selectedDept === 'Human Capital'
        ? 'HRIS'
        : selectedDept === 'Informatika'
        ? 'IT Software Development'
        : `${selectedDept} Team`;

    const newCategory: CategoryItem = {
      id: `cat-${Date.now()}`,
      department: selectedDept,
      categoryName: nameCategory.trim(),
      group: selectedGroup,
      status: assignedStatus,
    };

    setCategories((prev) => [newCategory, ...prev]);
    setSuccessToast(`Kategori "${nameCategory.trim()}" berhasil dibuat dan ditambahkan!`);

    // Reset Form
    setNameCategory('');
    setSelectedDept('');
    setSelectedGroup('');

    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  // Handle Cancel Form
  const handleCancelForm = () => {
    setSelectedDept('');
    setSelectedGroup('');
    setNameCategory('');
    setFormError(null);
  };

  // Handle Delete Category
  const handleDeleteCategory = (id: string, name: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setActiveActionId(null);
    setSuccessToast(`Kategori "${name.replace(/\n/g, ' ')}" berhasil dihapus.`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      // Department filter
      if (filterDept !== 'All' && cat.department !== filterDept) {
        return false;
      }
      // Status filter
      if (filterStatus !== 'All' && cat.status !== filterStatus) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = cat.categoryName.toLowerCase().includes(query);
        const matchDept = cat.department.toLowerCase().includes(query);
        const matchGroup = cat.group.toLowerCase().includes(query);
        const matchStatus = cat.status.toLowerCase().includes(query);
        return matchName || matchDept || matchGroup || matchStatus;
      }
      return true;
    });
  }, [categories, filterDept, filterStatus, searchQuery]);

  return (
    <div className="w-full h-screen min-h-screen flex overflow-hidden bg-[#ECF1F7] select-none">
      {/* ================= LEFT SIDEBAR ================= */}
      <Sidebar
        activeItem="master-category"
        onLogout={onLogout}
        onNavigate={onNavigate}
      />

      {/* ================= RIGHT MAIN CONTENT ================= */}
      <main className="flex-1 h-screen overflow-y-auto px-6 md:px-10 py-6 custom-scrollbar flex flex-col">
        {/* Top Header with Helpdesk Brand & Profile */}
        <div className="flex items-center justify-between mb-7 flex-shrink-0">
          {/* Left: Helpdesk Brand Logo */}
          <img
            src="/assets/helpdesk.png"
            alt="Helpdesk Logo"
            className="h-[42px] md:h-[48px] w-auto object-contain select-none"
          />

          {/* Right: User Profile Pill */}
          <div className="flex items-center gap-2.5 bg-white pl-1.5 pr-4 py-1.5 rounded-full border border-slate-200/80 shadow-sm">
            <div className="w-[32px] h-[32px] rounded-full bg-[#E0E7FF] text-[#1E3A8A] font-bold text-[12px] flex items-center justify-center">
              DP
            </div>
            <span className="text-[13px] font-semibold text-[#1E293B]">
              Damar Pratama
            </span>
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-6 flex-shrink-0">
          <h1 className="text-[26px] md:text-[30px] leading-[36px] font-extrabold text-[#0B2347] tracking-[-0.5px]">
            New Category Ticket
          </h1>
        </div>

        {/* Toast Notification */}
        {successToast && (
          <div className="mb-6 bg-[#E7F7ED] border border-[#16A34A]/30 text-[#16A34A] px-4 py-3 rounded-[14px] flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 flex-shrink-0">
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

        {/* ================= CARD 1: FORM CREATE NEW CATEGORY ================= */}
        <Card radius="xl" className="p-6 md:p-8 bg-white shadow-sm border border-slate-200/70 mb-6 flex-shrink-0">
          <form onSubmit={handleCreateCategory} className="flex flex-col">
            {/* Row 1: Departement & Group (2 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
              {/* Field 1: Departement */}
              <div className="relative">
                <label className="block text-[13px] font-bold text-[#0F172A] mb-2">
                  Departement
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsDeptDropdownOpen((prev) => !prev);
                    setIsGroupDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-[12px] md:rounded-[14px] border text-left flex items-center justify-between text-[13.5px] transition-all cursor-pointer bg-white ${
                    isDeptDropdownOpen
                      ? 'border-[#2563EB] ring-2 ring-blue-100'
                      : 'border-[#CBD5E1] hover:border-slate-400'
                  }`}
                >
                  <span className={selectedDept ? 'font-semibold text-[#0F172A]' : 'text-[#64748B]'}>
                    {selectedDept || 'Select a group'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#64748B] transition-transform duration-200 ${
                      isDeptDropdownOpen ? 'rotate-180 text-[#2563EB]' : ''
                    }`}
                  />
                </button>

                {/* Departement Options */}
                {isDeptDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-[14px] shadow-lg z-20 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => {
                          setSelectedDept(dept);
                          setIsDeptDropdownOpen(false);
                          if (formError) setFormError(null);
                        }}
                        className={`w-full px-4 py-2.5 text-left flex items-center justify-between text-[13px] transition-colors hover:bg-slate-50 cursor-pointer ${
                          selectedDept === dept ? 'bg-blue-50/70 font-semibold text-[#2563EB]' : 'text-[#0F172A]'
                        }`}
                      >
                        <span>{dept}</span>
                        {selectedDept === dept && <Check className="w-4 h-4 text-[#2563EB]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Field 2: Group */}
              <div className="relative">
                <label className="block text-[13px] font-bold text-[#0F172A] mb-2">
                  Group
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsGroupDropdownOpen((prev) => !prev);
                    setIsDeptDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-[12px] md:rounded-[14px] border text-left flex items-center justify-between text-[13.5px] transition-all cursor-pointer bg-white ${
                    isGroupDropdownOpen
                      ? 'border-[#2563EB] ring-2 ring-blue-100'
                      : 'border-[#CBD5E1] hover:border-slate-400'
                  }`}
                >
                  <span className={selectedGroup ? 'font-semibold text-[#0F172A]' : 'text-[#64748B]'}>
                    {selectedGroup || 'Select a group'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#64748B] transition-transform duration-200 ${
                      isGroupDropdownOpen ? 'rotate-180 text-[#2563EB]' : ''
                    }`}
                  />
                </button>

                {/* Group Options */}
                {isGroupDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-[14px] shadow-lg z-20 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {GROUP_OPTIONS.map((grp) => (
                      <button
                        key={grp}
                        type="button"
                        onClick={() => {
                          setSelectedGroup(grp);
                          setIsGroupDropdownOpen(false);
                          if (formError) setFormError(null);
                        }}
                        className={`w-full px-4 py-2.5 text-left flex items-center justify-between text-[13px] transition-colors hover:bg-slate-50 cursor-pointer ${
                          selectedGroup === grp ? 'bg-blue-50/70 font-semibold text-[#2563EB]' : 'text-[#0F172A]'
                        }`}
                      >
                        <span>{grp}</span>
                        {selectedGroup === grp && <Check className="w-4 h-4 text-[#2563EB]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Name Category (Full Width) */}
            <div className="mb-6">
              <label className="block text-[13px] font-bold text-[#0F172A] mb-2">
                Name Category
              </label>
              <input
                type="text"
                placeholder="New Name"
                value={nameCategory}
                onChange={(e) => {
                  setNameCategory(e.target.value);
                  if (formError) setFormError(null);
                }}
                className="w-full px-4 py-3 rounded-[12px] md:rounded-[14px] border border-[#CBD5E1] text-[13.5px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all bg-white"
              />
            </div>

            {/* Form Error Notice */}
            {formError && (
              <div className="mb-4 flex items-center gap-2 text-red-600 text-[12.5px] font-medium bg-red-50 border border-red-100 p-3 rounded-[12px]">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Row 3: Action Buttons (Cancel & Send ticket) */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelForm}
                className="px-7 py-2.5 rounded-full border border-slate-300 text-[#0F172A] text-[13px] font-bold hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-7 py-2.5 rounded-full bg-[#153F85] hover:bg-[#0e2c5e] text-white text-[13px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
              >
                Send ticket
              </button>
            </div>
          </form>
        </Card>

        {/* ================= CARD 2: CATEGORY LIST & TABLE ================= */}
        <Card radius="xl" className="p-6 md:p-8 bg-white shadow-sm border border-slate-200/70 mb-6 flex-1 flex flex-col min-h-0">
          {/* Controls: Sort By (Departement, Status) & Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6 flex-shrink-0">
            {/* Left: Sort By Filters */}
            <div className="flex items-center flex-wrap gap-2.5">
              <span className="text-[13px] font-bold text-[#0F172A] mr-1">
                Sort By
              </span>

              {/* Pill 1: Departement Filter */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsFilterDeptOpen((prev) => !prev);
                    setIsFilterStatusOpen(false);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[12.5px] font-semibold transition-all cursor-pointer ${
                    filterDept !== 'All'
                      ? 'border-[#153F85] bg-blue-50 text-[#153F85]'
                      : 'border-slate-300 hover:border-slate-400 text-[#0F172A] bg-white'
                  }`}
                >
                  <span>{filterDept === 'All' ? 'Departement' : filterDept}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
                </button>

                {isFilterDeptOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-48 bg-white border border-slate-200 rounded-[14px] shadow-lg z-20 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={() => {
                        setFilterDept('All');
                        setIsFilterDeptOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-[12.5px] hover:bg-slate-50 cursor-pointer font-medium text-[#0F172A]"
                    >
                      Semua Departement
                    </button>
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => {
                          setFilterDept(dept);
                          setIsFilterDeptOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-[12.5px] hover:bg-slate-50 cursor-pointer ${
                          filterDept === dept ? 'bg-blue-50 text-[#2563EB] font-bold' : 'text-[#0F172A]'
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Pill 2: Status Filter */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsFilterStatusOpen((prev) => !prev);
                    setIsFilterDeptOpen(false);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[12.5px] font-semibold transition-all cursor-pointer ${
                    filterStatus !== 'All'
                      ? 'border-[#153F85] bg-blue-50 text-[#153F85]'
                      : 'border-slate-300 hover:border-slate-400 text-[#0F172A] bg-white'
                  }`}
                >
                  <span>{filterStatus === 'All' ? 'Status' : filterStatus}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
                </button>

                {isFilterStatusOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-56 bg-white border border-slate-200 rounded-[14px] shadow-lg z-20 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={() => {
                        setFilterStatus('All');
                        setIsFilterStatusOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-[12.5px] hover:bg-slate-50 cursor-pointer font-medium text-[#0F172A]"
                    >
                      Semua Status
                    </button>
                    {availableStatuses.map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setFilterStatus(st);
                          setIsFilterStatusOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-[12.5px] hover:bg-slate-50 cursor-pointer ${
                          filterStatus === st ? 'bg-blue-50 text-[#2563EB] font-bold' : 'text-[#0F172A]'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Search Bar */}
            <div className="relative w-full md:w-[260px]">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl md:rounded-full text-[13px] text-[#1E293B] border border-[#CBD5E1] bg-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] shadow-sm transition-all"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-[16px] border border-slate-200/80">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#E2E8F0]/70 border-b border-slate-200">
                  <th className="py-3.5 px-6 text-[12.5px] font-bold text-[#0F172A]">
                    Departement
                  </th>
                  <th className="py-3.5 px-6 text-[12.5px] font-bold text-[#0F172A]">
                    Category Name
                  </th>
                  <th className="py-3.5 px-6 text-[12.5px] font-bold text-[#0F172A]">
                    Group
                  </th>
                  <th className="py-3.5 px-6 text-[12.5px] font-bold text-[#0F172A]">
                    Status
                  </th>
                  <th className="py-3.5 px-6 text-[12.5px] font-bold text-[#0F172A] text-center w-[90px]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Departement */}
                      <td className="py-4 px-6 text-[13px] text-[#0F172A] font-medium align-middle">
                        {item.department}
                      </td>

                      {/* Category Name (multiline support) */}
                      <td className="py-4 px-6 text-[13px] text-[#0F172A] align-middle whitespace-pre-line leading-[20px]">
                        {item.categoryName}
                      </td>

                      {/* Group */}
                      <td className="py-4 px-6 text-[13px] text-[#0F172A] align-middle">
                        {item.group}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-[13px] text-[#0F172A] align-middle">
                        {item.status}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-center align-middle relative">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveActionId((prev) => (prev === item.id ? null : item.id))
                          }
                          className="w-7 h-7 mx-auto rounded-full border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-all cursor-pointer shadow-xs active:scale-90"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Action Dropdown Menu */}
                        {activeActionId === item.id && (
                          <div className="absolute right-6 top-10 w-36 bg-white border border-slate-200 rounded-[12px] shadow-lg z-30 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-left">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveActionId(null);
                                setSuccessToast(`Fitur edit "${item.categoryName.replace(/\n/g, ' ')}" siap dikembangkan.`);
                                setTimeout(() => setSuccessToast(null), 3000);
                              }}
                              className="w-full px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(item.id, item.categoryName)}
                              className="w-full px-3 py-2 text-[12px] text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[#64748B] text-[13px]">
                      Tidak ada kategori tiket yang sesuai dengan pencarian atau filter.
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
