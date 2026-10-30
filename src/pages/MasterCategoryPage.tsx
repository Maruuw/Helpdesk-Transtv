import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from '@/components/layout';
import { Card } from '@/components/ui';
import {
  ChevronDown,
  Search,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { helpdeskApi } from '@/services/api';
import {
  DB_GROUPS,
  DB_CATEGORIES_BY_GROUP,
} from '@/data/categoryMasterData';
import type { DbGroupItem } from '@/data/categoryMasterData';

export interface CategoryItem {
  id: string;
  categoryName: string;
  group: string;
  groupId: number;
  isForm: boolean;
  status: 'Visible' | 'Hidden';
  ticketsCount: number;
}

import type { AppView } from '@/App';

interface MasterCategoryPageProps {
  currentUser?: {
    nik: string;
    name: string;
    department: string;
    role: 'user' | 'admin';
  };
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
}

// Convert default DB data to initial table state
const buildInitialCategories = (): CategoryItem[] => {
  const list: CategoryItem[] = [];
  Object.entries(DB_CATEGORIES_BY_GROUP).forEach(([groupName, items]) => {
    items.forEach((item) => {
      list.push({
        id: String(item.id),
        categoryName: item.name,
        group: groupName,
        groupId: item.groupId,
        isForm: !!item.isForm,
        status: 'Visible',
        ticketsCount: 0,
      });
    });
  });
  return list;
};

export const MasterCategoryPage: React.FC<MasterCategoryPageProps> = ({
  currentUser = {
    nik: '231270322',
    name: 'Raden Azhar Fadhlur',
    department: 'Information Technology',
    role: 'admin',
  },
  onNavigate,
  onLogout,
}) => {
  // Category table list state
  const [categories, setCategories] = useState<CategoryItem[]>(buildInitialCategories);
  const [groups, setGroups] = useState<DbGroupItem[]>(DB_GROUPS);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [selectedGroup, setSelectedGroup] = useState('');
  const [nameCategory, setNameCategory] = useState('');
  const [isFormType, setIsFormType] = useState(false);

  // Dropdown states for form
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);

  // Form error & success alerts
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [isFilterGroupOpen, setIsFilterGroupOpen] = useState(false);
  const [isFilterTypeOpen, setIsFilterTypeOpen] = useState(false);

  // Action popover per row
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Load categories directly from Laravel API & Database
  const fetchCategoriesFromApi = async () => {
    setIsLoading(true);
    try {
      const res = await helpdeskApi.getCategories();
      if (res.success && res.data) {
        if (Array.isArray(res.data.groups) && res.data.groups.length > 0) {
          setGroups(res.data.groups);
        }
        if (Array.isArray(res.data.categories) && res.data.categories.length > 0) {
          const mapped: CategoryItem[] = res.data.categories.map((c: any) => ({
            id: String(c.id),
            categoryName: c.name,
            group: c.group_name || 'General IT',
            groupId: c.group_id,
            isForm: !!c.is_form,
            status: c.is_visible ? 'Hidden' : 'Visible',
            ticketsCount: c.tickets_count || 0,
          }));
          setCategories(mapped);
        }
      }
    } catch (err) {
      console.warn('Gagal memuat kategori dari API, menggunakan data lokal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesFromApi();
  }, []);

  // Handle Create / Add Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGroup) {
      setFormError('Silakan pilih Group IT penanganan terlebih dahulu');
      return;
    }
    if (!nameCategory.trim()) {
      setFormError('Silakan isi Name Category terlebih dahulu');
      return;
    }

    setFormError(null);
    const grpObj = groups.find((g) => g.name === selectedGroup);
    const targetGroupId = grpObj ? grpObj.id : 1;

    try {
      // POST ke Laravel API
      const res = await fetch('http://localhost:8000/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': 'transtv-helpdesk-secret-key-2026',
        },
        body: JSON.stringify({
          name: nameCategory.trim(),
          group_id: targetGroupId,
          is_visible: 0,
        }),
      });

      if (res.ok) {
        await fetchCategoriesFromApi();
        setSuccessToast(`Kategori "${nameCategory.trim()}" berhasil dibuat ke database!`);
      } else {
        throw new Error('Gagal simpan ke server');
      }
    } catch {
      // Fallback lokal
      const newCategory: CategoryItem = {
        id: `${Date.now()}`,
        categoryName: nameCategory.trim(),
        group: selectedGroup,
        groupId: targetGroupId,
        isForm: isFormType,
        status: 'Visible',
        ticketsCount: 0,
      };
      setCategories((prev) => [newCategory, ...prev]);
      setSuccessToast(`Kategori "${nameCategory.trim()}" berhasil ditambahkan!`);
    }

    // Reset Form
    setNameCategory('');
    setSelectedGroup('');
    setIsFormType(false);

    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  // Handle Cancel Form
  const handleCancelForm = () => {
    setSelectedGroup('');
    setNameCategory('');
    setIsFormType(false);
    setFormError(null);
  };

  // Handle Toggle Hide / Unhide (Ganti Edit jadi Hide/Unhide)
  const handleToggleVisibility = async (item: CategoryItem) => {
    const isCurrentlyVisible = item.status === 'Visible';
    // In database: 0 is visible, 1 is hidden
    const newIsVisibleVal = isCurrentlyVisible ? 1 : 0;

    try {
      await helpdeskApi.updateCategory(item.id, { is_visible: newIsVisibleVal });
    } catch (e) {
      console.warn('API updateCategory error, fallback update lokal:', e);
    }

    setCategories((prev) =>
      prev.map((c) =>
        c.id === item.id
          ? { ...c, status: isCurrentlyVisible ? 'Hidden' : 'Visible' }
          : c
      )
    );
    setActiveActionId(null);
    setSuccessToast(
      `Kategori "${item.categoryName}" berhasil di-${
        isCurrentlyVisible ? 'sembunyikan (Hidden)' : 'tampilkan (Visible)'
      }.`
    );
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Handle Delete Category
  const handleDeleteCategory = async (id: string, name: string) => {
    try {
      await fetch(`http://localhost:8000/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'X-API-KEY': 'transtv-helpdesk-secret-key-2026' },
      });
    } catch (e) {
      console.warn('API delete error, remove locally:', e);
    }

    setCategories((prev) => prev.filter((c) => c.id !== id));
    setActiveActionId(null);
    setSuccessToast(`Kategori "${name.replace(/\n/g, ' ')}" berhasil dihapus.`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      // Group filter
      if (filterGroup !== 'All' && cat.group !== filterGroup) {
        return false;
      }
      // Form Type filter
      if (filterType === 'Form' && !cat.isForm) return false;
      if (filterType === 'Standard' && cat.isForm) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = cat.categoryName.toLowerCase().includes(query);
        const matchGroup = cat.group.toLowerCase().includes(query);
        const matchId = cat.id.includes(query);
        return matchName || matchGroup || matchId;
      }
      return true;
    });
  }, [categories, filterGroup, filterType, searchQuery]);

  return (
    <div className="w-full h-screen min-h-screen flex overflow-hidden bg-[#ECF1F7] select-none">
      {/* ================= LEFT SIDEBAR ================= */}
      <Sidebar
        activeItem="master-category"
        userRole={currentUser.role}
        onLogout={onLogout}
        onNavigate={onNavigate}
      />

      {/* ================= RIGHT MAIN CONTENT ================= */}
      <main className="flex-1 h-screen overflow-y-auto px-6 md:px-10 py-6 pb-16 custom-scrollbar flex flex-col">
        {/* Top Header with Helpdesk Brand & Profile */}
        <div className="flex items-center justify-between mb-7 flex-shrink-0">
          <img
            src="/assets/helpdesk.png"
            alt="Helpdesk Logo"
            className="h-[42px] md:h-[48px] w-auto object-contain select-none"
          />

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 bg-white pl-1.5 pr-4 py-1.5 rounded-full border border-slate-200/80 shadow-sm">
            <div className="w-[32px] h-[32px] rounded-full bg-[#E0E7FF] text-[#1E3A8A] font-bold text-[12px] flex items-center justify-center uppercase">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <span className="text-[13px] font-semibold text-[#1E293B]">
              {currentUser.name}
            </span>
          </div>
        </div>

        {/* Page Title & Refresh */}
        <div className="mb-6 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-[26px] md:text-[30px] leading-[36px] font-extrabold text-[#0B2347] tracking-[-0.5px]">
              Master Category & Groups
            </h1>
            <p className="text-[13px] text-slate-500 mt-0.5">
              Kelola master kategori tiket dan penugasan group penanganan IT.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchCategoriesFromApi}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-[12.5px] font-bold text-[#153F85] shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
              {/* Field 1: Group Penanganan IT */}
              <div className="relative">
                <label className="block text-[13px] font-bold text-[#0F172A] mb-2">
                  Group Penanganan IT <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsGroupDropdownOpen((prev) => !prev)}
                  className={`w-full px-4 py-3 rounded-[12px] md:rounded-[14px] border text-left flex items-center justify-between text-[13.5px] transition-all cursor-pointer bg-white ${
                    isGroupDropdownOpen
                      ? 'border-[#2563EB] ring-2 ring-blue-100'
                      : 'border-[#CBD5E1] hover:border-slate-400'
                  }`}
                >
                  <span className={selectedGroup ? 'font-semibold text-[#0F172A]' : 'text-[#64748B]'}>
                    {selectedGroup || 'Pilih salah satu Group IT'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#64748B] transition-transform duration-200 ${
                      isGroupDropdownOpen ? 'rotate-180 text-[#2563EB]' : ''
                    }`}
                  />
                </button>

                {isGroupDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-[14px] shadow-lg z-20 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {groups.map((grp) => (
                      <button
                        key={grp.id}
                        type="button"
                        onClick={() => {
                          setSelectedGroup(grp.name);
                          setIsGroupDropdownOpen(false);
                          if (formError) setFormError(null);
                        }}
                        className={`w-full px-4 py-2.5 text-left flex items-center justify-between text-[13px] transition-colors hover:bg-slate-50 cursor-pointer ${
                          selectedGroup === grp.name
                            ? 'bg-blue-50/70 font-semibold text-[#2563EB]'
                            : 'text-[#0F172A]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center">
                            {grp.id}
                          </span>
                          {grp.name}
                        </span>
                        {selectedGroup === grp.name && (
                          <Check className="w-4 h-4 text-[#2563EB]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Field 2: Name Category */}
              <div>
                <label className="block text-[13px] font-bold text-[#0F172A] mb-2">
                  Nama Kategori Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Aplikasi Sales Tracker Baru"
                  value={nameCategory}
                  onChange={(e) => {
                    setNameCategory(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  className="w-full px-4 py-3 rounded-[12px] md:rounded-[14px] border border-[#CBD5E1] text-[13.5px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                />
              </div>
            </div>

            {/* Form Error Notice */}
            {formError && (
              <div className="mb-4 flex items-center gap-2 text-red-600 text-[12.5px] font-medium bg-red-50 border border-red-100 p-3 rounded-[12px]">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Action Buttons */}
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
                Create
              </button>
            </div>
          </form>
        </Card>

        {/* ================= CARD 2: CATEGORY LIST & TABLE ================= */}
        <Card radius="xl" className="p-6 md:p-8 bg-white shadow-sm border border-slate-200/70 mb-8 flex-shrink-0">
          {/* Controls: Filter & Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6 flex-shrink-0">
            {/* Left: Filters */}
            <div className="flex items-center flex-wrap gap-2.5">
              <span className="text-[13px] font-bold text-[#0F172A] mr-1">
                Filter:
              </span>

              {/* Pill 1: Group Filter */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsFilterGroupOpen((prev) => !prev);
                    setIsFilterTypeOpen(false);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[12.5px] font-semibold transition-all cursor-pointer ${
                    filterGroup !== 'All'
                      ? 'border-[#153F85] bg-blue-50 text-[#153F85]'
                      : 'border-slate-300 hover:border-slate-400 text-[#0F172A] bg-white'
                  }`}
                >
                  <span>{filterGroup === 'All' ? 'Semua Group' : filterGroup}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
                </button>

                {isFilterGroupOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-60 bg-white border border-slate-200 rounded-[14px] shadow-lg z-20 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={() => {
                        setFilterGroup('All');
                        setIsFilterGroupOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-[12.5px] hover:bg-slate-50 cursor-pointer font-medium text-[#0F172A]"
                    >
                      Semua Group ({categories.length})
                    </button>
                    {groups.map((grp) => (
                      <button
                        key={grp.id}
                        type="button"
                        onClick={() => {
                          setFilterGroup(grp.name);
                          setIsFilterGroupOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-[12.5px] hover:bg-slate-50 cursor-pointer ${
                          filterGroup === grp.name
                            ? 'bg-blue-50 text-[#2563EB] font-bold'
                            : 'text-[#0F172A]'
                        }`}
                      >
                        {grp.name} ({categories.filter((c) => c.group === grp.name).length})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Pill 2: Form Type Filter */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsFilterTypeOpen((prev) => !prev);
                    setIsFilterGroupOpen(false);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[12.5px] font-semibold transition-all cursor-pointer ${
                    filterType !== 'All'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                      : 'border-slate-300 hover:border-slate-400 text-[#0F172A] bg-white'
                  }`}
                >
                  <span>
                    {filterType === 'All'
                      ? 'Tipe Form'
                      : filterType === 'Form'
                      ? 'Form Aplikasi'
                      : 'Standar'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
                </button>

                {isFilterTypeOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-52 bg-white border border-slate-200 rounded-[14px] shadow-lg z-20 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={() => {
                        setFilterType('All');
                        setIsFilterTypeOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-[12.5px] hover:bg-slate-50 cursor-pointer font-medium text-[#0F172A]"
                    >
                      Semua Tipe Form
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterType('Form');
                        setIsFilterTypeOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-[12.5px] hover:bg-slate-50 cursor-pointer font-medium text-[#153F85]"
                    >
                      Form Aplikasi (12 Kategori)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterType('Standard');
                        setIsFilterTypeOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-[12.5px] hover:bg-slate-50 cursor-pointer font-medium text-slate-700"
                    >
                      Kategori Standar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Search Bar */}
            <div className="relative w-full md:w-[280px]">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari kategori atau group..."
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
                  <th className="py-3.5 px-4 text-[12px] font-bold text-[#0F172A] w-[70px]">
                    ID
                  </th>
                  <th className="py-3.5 px-6 text-[12.5px] font-bold text-[#0F172A]">
                    Category Name
                  </th>
                  <th className="py-3.5 px-6 text-[12.5px] font-bold text-[#0F172A]">
                    Group Penanganan
                  </th>
                  <th className="py-3.5 px-4 text-[12.5px] font-bold text-[#0F172A] text-center">
                    Tipe Form
                  </th>
                  <th className="py-3.5 px-4 text-[12.5px] font-bold text-[#0F172A] text-center">
                    Status
                  </th>
                  <th className="py-3.5 px-4 text-[12.5px] font-bold text-[#0F172A] text-center">
                    Tiket
                  </th>
                  <th className="py-3.5 px-4 text-[12.5px] font-bold text-[#0F172A] text-center w-[80px]">
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
                      {/* ID */}
                      <td className="py-3.5 px-4 text-[12px] font-mono text-slate-500 font-semibold align-middle">
                        #{item.id}
                      </td>

                      {/* Category Name */}
                      <td className="py-3.5 px-6 text-[13px] text-[#0F172A] font-semibold align-middle leading-[19px]">
                        {item.categoryName}
                      </td>

                      {/* Group */}
                      <td className="py-3.5 px-6 text-[13px] text-[#0F172A] align-middle">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium bg-slate-100 text-slate-700">
                          {item.group}
                        </span>
                      </td>

                      {/* Tipe Form (Form Aplikasi or Standar) */}
                      <td className="py-3.5 px-4 text-center align-middle">
                        {item.isForm ? (
                          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-[#153F85] border border-blue-200/70">
                            Form Aplikasi
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                            Standar
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center align-middle">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            item.status === 'Visible'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Total Tiket Count */}
                      <td className="py-3.5 px-4 text-center align-middle text-[12.5px] font-bold text-slate-700">
                        {item.ticketsCount}
                      </td>

                      {/* Action: Hide / Unhide or Hapus */}
                      <td className="py-3.5 px-4 text-center align-middle relative">
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
                          <div className="absolute right-4 top-10 w-40 bg-white border border-slate-200 rounded-[12px] shadow-lg z-30 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-left">
                            {/* Toggle Hide / Unhide Action */}
                            <button
                              type="button"
                              onClick={() => handleToggleVisibility(item)}
                              className="w-full px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                            >
                              {item.status === 'Visible' ? (
                                <>
                                  <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Sembunyikan</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Tampilkan</span>
                                </>
                              )}
                            </button>

                            {/* Delete Action */}
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(item.id, item.categoryName)}
                              className="w-full px-3 py-2 text-[12px] text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
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
                    <td colSpan={7} className="py-10 text-center text-[#64748B] text-[13px]">
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
