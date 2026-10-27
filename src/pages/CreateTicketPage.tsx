import React, { useState, useRef } from 'react';
import { Sidebar } from '@/components/layout';
import { Button, Card } from '@/components/ui';
import { ChevronDown, FileText, X, AlertCircle, Plus } from 'lucide-react';

interface CreateTicketPageProps {
  onCancel: () => void;
  onSubmitSuccess: (newTicket: {
    subject: string;
    group: string;
    category: string;
    description: string;
  }) => void;
  onLogout: () => void;
  onNavigate: (view: 'dashboard' | 'create-ticket' | 'my-tickets' | 'master-category') => void;
}

// Master Data: Dependent Category Mapping
const TICKET_MASTER_DATA: Record<string, string[]> = {
  'Software & Application': [
    'Aplikasi Insesys (Umum)',
    'Perubahan Data',
    'Bug / Error Export Laporan',
    'Software Request & Licensing',
    'Aplikasi Internal Lainnya',
  ],
  'Hardware & Device': [
    'Printer & Scanner Studio',
    'PC / Laptop Kantor',
    'Monitor & Layar Display',
    'Perangkat Studio & Broadcasting',
    'Aksesoris & Peripheral (Mouse, Keyboard)',
  ],
  'Network & Infrastructure': [
    'Akses VPN Remote Work',
    'Koneksi Jaringan WiFi / LAN',
    'Server & Database Access',
    'Firewall & IP Whitelist',
  ],
  'Account & Access': [
    'Reset Password TransHub',
    'Email Korporat (@transtv.co.id)',
    'Active Directory / Domain Login',
    'Akses Folder Shared Drive',
  ],
};

interface UploadedFileItem {
  id: string;
  name: string;
  size: string;
}

export const CreateTicketPage: React.FC<CreateTicketPageProps> = ({
  onCancel,
  onSubmitSuccess,
  onLogout,
  onNavigate,
}) => {
  // Read-only user from Employee Master Data
  const defaultUser = {
    name: 'Raden Azhar Fadhlur Rohman',
    nik: '231270322',
  };

  // Form states
  const [subject, setSubject] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<UploadedFileItem[]>([]);

  // Validation and submit states
  const [errors, setErrors] = useState<{
    subject?: string;
    group?: string;
    category?: string;
    description?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    subject: string;
    group: string;
    category: string;
    submittedAt: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Group change handler - resets category
  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const group = e.target.value;
    setSelectedGroup(group);
    setSelectedCategory('');
    if (errors.group) {
      setErrors((prev) => ({ ...prev, group: undefined }));
    }
  };

  // Category change handler
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: undefined }));
    }
  };

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: UploadedFileItem[] = Array.from(e.target.files).map((file, idx) => ({
        id: `${Date.now()}-${idx}`,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
      }));
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  // Validation & Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!subject.trim()) {
      newErrors.subject = 'Subject tiket wajib diisi.';
    }
    if (!selectedGroup) {
      newErrors.group = 'Group tiket wajib dipilih.';
    }
    if (!selectedCategory) {
      newErrors.category = 'Ticket category wajib dipilih.';
    }
    if (!description.trim()) {
      newErrors.description = 'Deskripsi masalah wajib diisi.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const now = new Date();
    const dateFormatted = `${now.getDate()} ${now.toLocaleString('id-ID', { month: 'short' })} ${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Simulate sending ticket
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedData({
        subject,
        group: selectedGroup,
        category: selectedCategory,
        submittedAt: dateFormatted,
      });
      setShowSuccessModal(true);
    }, 600);
  };

  const handleConfirmSuccess = () => {
    setShowSuccessModal(false);
    onSubmitSuccess({
      subject,
      group: selectedGroup,
      category: selectedCategory,
      description,
    });
  };

  return (
    <div className="w-full h-screen min-h-screen flex overflow-hidden bg-[#ECF1F7] select-none">
      {/* ================= LEFT SIDEBAR ================= */}
      <Sidebar
        activeItem="create-ticket"
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

          {/* User Badge (Figma DP Damar Pratama) */}
          <div className="flex items-center gap-2.5 bg-white pl-1.5 pr-4 py-1.5 rounded-full border border-slate-200/80 shadow-sm">
            <div className="w-[30px] h-[30px] rounded-full bg-[#DDE5ED] text-[#1E293B] font-bold text-[12px] flex items-center justify-center">
              DP
            </div>
            <span className="text-[13px] font-semibold text-[#1E293B]">
              Damar Pratama
            </span>
          </div>
        </div>

        {/* Page Title & Subtitle */}
        <div className="flex-shrink-0">
          <h1 className="text-[24px] md:text-[28px] leading-[34px] font-extrabold text-[#0F172A] tracking-[-0.5px]">
            Create a new ticket
          </h1>
          <p className="text-[13px] leading-[20px] text-[#64748B] mt-0.5">
            Describe the issue and our team will pick it up.
          </p>
        </div>

        {/* Form Container Card */}
        <Card radius="xl" className="p-6 md:p-8 bg-white shadow-sm border border-slate-200/70 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ROW 1: Read-Only Master Employee Data (User & NIK) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[12px] leading-[16px] font-bold text-[#1E293B] mb-2">
                  User <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={defaultUser.name}
                    readOnly
                    disabled
                    aria-label="Nama Karyawan"
                    className="w-full text-[13px] leading-[18px] text-[#1E293B] font-medium bg-[#DDE5ED] border border-[#CBD5E1] rounded-[8px] py-3 px-4 cursor-not-allowed select-none focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-[#64748B] mt-1">
                  Otomatis terisi dari master data karyawan
                </p>
              </div>

              <div>
                <label className="block text-[12px] leading-[16px] font-bold text-[#1E293B] mb-2">
                  NIK
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={defaultUser.nik}
                    readOnly
                    disabled
                    aria-label="NIK Karyawan"
                    className="w-full text-[13px] leading-[18px] text-[#1E293B] font-medium bg-[#DDE5ED] border border-[#CBD5E1] rounded-[8px] py-3 px-4 cursor-not-allowed select-none focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-[#64748B] mt-1">
                  Nomor Induk Karyawan aktif
                </p>
              </div>
            </div>

            {/* ROW 2: Subject (Mandatory) */}
            <div>
              <label className="block text-[12px] leading-[16px] font-bold text-[#1E293B] mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Summarize the problem in one line"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (errors.subject) setErrors((prev) => ({ ...prev, subject: undefined }));
                }}
                className={`w-full text-[13px] leading-[18px] text-[#1E293B] rounded-[8px] py-3 px-4 transition-all duration-150 placeholder:text-[#94A3B8] focus:outline-none ${
                  errors.subject
                    ? 'border border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border border-[#CBD5E1] bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] shadow-sm'
                }`}
              />
              {errors.subject && (
                <p className="text-[11.5px] text-red-500 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.subject}
                </p>
              )}
            </div>

            {/* ROW 3: Dependent Dropdowns (Group Ticket -> Ticket Category) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Group Ticket */}
              <div>
                <label className="block text-[12px] leading-[16px] font-bold text-[#1E293B] mb-2">
                  Group Ticket <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedGroup}
                    onChange={handleGroupChange}
                    className={`w-full appearance-none text-[13px] leading-[18px] rounded-[8px] py-3 pl-4 pr-10 bg-white transition-all duration-150 cursor-pointer focus:outline-none ${
                      !selectedGroup ? 'text-[#94A3B8]' : 'text-[#1E293B] font-medium'
                    } ${
                      errors.group
                        ? 'border border-red-500 bg-red-50/20'
                        : 'border border-[#CBD5E1] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] shadow-sm'
                    }`}
                  >
                    <option value="" disabled>
                      Select a group
                    </option>
                    {Object.keys(TICKET_MASTER_DATA).map((grp) => (
                      <option key={grp} value={grp} className="text-[#1E293B]">
                        {grp}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.group && (
                  <p className="text-[11.5px] text-red-500 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.group}
                  </p>
                )}
              </div>

              {/* Ticket Category (Locked until group is selected) */}
              <div>
                <label className="block text-[12px] leading-[16px] font-bold text-[#1E293B] mb-2">
                  Ticket category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    disabled={!selectedGroup}
                    onChange={handleCategoryChange}
                    className={`w-full appearance-none text-[13px] leading-[18px] rounded-[8px] py-3 pl-4 pr-10 transition-all duration-150 focus:outline-none ${
                      !selectedGroup
                        ? 'bg-[#DDE5ED] border border-[#CBD5E1] text-[#64748B] cursor-not-allowed select-none'
                        : !selectedCategory
                        ? 'bg-white border border-[#CBD5E1] text-[#94A3B8] cursor-pointer focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]'
                        : 'bg-white border border-[#CBD5E1] text-[#1E293B] font-medium cursor-pointer focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]'
                    } ${errors.category ? 'border-red-500 bg-red-50/20' : ''}`}
                  >
                    <option value="" disabled>
                      {!selectedGroup ? 'Select a group first' : 'Select a category'}
                    </option>
                    {selectedGroup &&
                      TICKET_MASTER_DATA[selectedGroup]?.map((cat) => (
                        <option key={cat} value={cat} className="text-[#1E293B]">
                          {cat}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.category && (
                  <p className="text-[11.5px] text-red-500 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.category}
                  </p>
                )}
              </div>
            </div>

            {/* ROW 4: Description (Mandatory) */}
            <div>
              <label className="block text-[12px] leading-[16px] font-bold text-[#1E293B] mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={5}
                placeholder="What happened, when did it start, and what did you expect?"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) {
                    setErrors((prev) => ({ ...prev, description: undefined }));
                  }
                }}
                className={`w-full text-[13px] leading-[20px] text-[#1E293B] rounded-[8px] p-4 transition-all duration-150 placeholder:text-[#94A3B8] resize-y min-h-[120px] focus:outline-none ${
                  errors.description
                    ? 'border border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border border-[#CBD5E1] bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] shadow-sm'
                }`}
              />
              {errors.description && (
                <p className="text-[11.5px] text-red-500 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* ROW 5: Attachments Section */}
            <div>
              <label className="block text-[12px] leading-[16px] font-bold text-[#1E293B] mb-2">
                Attachments
              </label>

              <div className="border border-[#CBD5E1] rounded-[16px] p-5 space-y-4 bg-white">
                {/* Choose File Row */}
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#EFEFEF] hover:bg-[#e2e2e2] active:bg-[#d8d8d8] text-[#1E293B] text-[12px] font-medium px-3.5 py-1.5 rounded-[4px] border border-[#CBD5E1] transition-colors cursor-pointer select-none"
                  >
                    Choose File
                  </button>
                  <span className="text-[12px] text-[#64748B]">
                    {attachments.length > 0 ? `${attachments.length} file(s) attached` : 'No file chosen'}
                  </span>
                </div>

                <div className="text-[11px] text-[#64748B]">
                  [Allowed file types and maximum size per file: JPG, PNG, PDF up to 10MB]
                </div>

                {/* Attached File Cards */}
                {attachments.length > 0 && (
                  <div className="space-y-2.5 pt-1">
                    {attachments.map((file) => (
                      <div
                        key={file.id}
                        className="max-w-[420px] border border-[#E2E8F0] rounded-[12px] p-3 flex items-center justify-between bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-[36px] h-[36px] rounded-[8px] bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] flex-shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-[12.5px] font-bold text-[#1E293B]">
                              {file.name}
                            </div>
                            <div className="text-[11px] text-[#64748B]">
                              {file.size}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(file.id)}
                          className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-[#94A3B8] hover:text-[#1E293B] transition-colors cursor-pointer"
                          title="Hapus file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Another File Button: Only visible when at least 1 file is uploaded */}
                {attachments.length > 0 && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 bg-[#DDE9F6] hover:bg-[#cbe0f5] text-[#153F85] text-[12px] font-bold px-4 py-2 rounded-full transition-colors cursor-pointer select-none"
                    >
                      <Plus className="w-4 h-4" />
                      Add another file
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions: Cancel & Send ticket */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary-form"
                onClick={onCancel}
                className="py-[10px] px-[28px] text-[12px] font-bold rounded-full border-[#CBD5E1] text-[#334155] hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary-form"
                isLoading={isSubmitting}
                className="py-[10px] px-[28px] text-[12px] font-bold rounded-full bg-[#153F85] hover:bg-[#0e2c5e] text-white shadow-sm transition-all"
              >
                Send ticket
              </Button>
            </div>
          </form>
        </Card>
      </main>

      {/* ================= SUCCESS CONFIRMATION MODAL (FIGMA EXACT) ================= */}
      {showSuccessModal && submittedData && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4 select-none">
          <div className="bg-white rounded-[26px] max-w-[490px] w-full p-8 md:p-9 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Green Circle Checkmark Icon */}
            <div className="w-[52px] h-[52px] rounded-full bg-[#16A34A] text-white mx-auto flex items-center justify-center mb-4 shadow-sm">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-[26px] md:text-[28px] font-extrabold text-[#0F172A] tracking-[-0.5px] mb-2">
              Ticket sent
            </h3>

            {/* Subtitle */}
            <p className="text-[13.5px] leading-[22px] text-[#64748B] max-w-[340px] mx-auto mb-6">
              We received your request. You can follow its status from My Ticket List.
            </p>

            {/* Summary Paired Data Box */}
            <div className="bg-[#E9F0F8] rounded-[18px] p-4.5 sm:p-5 mb-7 text-left space-y-3">
              {/* Row 1: Subject */}
              <div className="flex items-start justify-between gap-4">
                <span className="text-[13px] text-[#64748B] font-medium flex-shrink-0">
                  Subject
                </span>
                <span className="text-[13px] text-[#0F172A] font-semibold text-right break-words line-clamp-2">
                  {submittedData.subject}
                </span>
              </div>

              {/* Row 2: Category */}
              <div className="flex items-start justify-between gap-4">
                <span className="text-[13px] text-[#64748B] font-medium flex-shrink-0">
                  Category
                </span>
                <span className="text-[13px] text-[#0F172A] font-semibold text-right">
                  {submittedData.group} / {submittedData.category}
                </span>
              </div>

              {/* Row 3: Submitted Date & Time */}
              <div className="flex items-start justify-between gap-4">
                <span className="text-[13px] text-[#64748B] font-medium flex-shrink-0">
                  Submitted
                </span>
                <span className="text-[13px] text-[#0F172A] font-semibold text-right">
                  {submittedData.submittedAt}
                </span>
              </div>
            </div>

            {/* Action Button: View my tickets */}
            <button
              type="button"
              onClick={handleConfirmSuccess}
              className="w-full sm:w-auto min-w-[200px] py-[12px] px-8 text-[13px] font-bold bg-[#153F85] hover:bg-[#0f2d60] active:scale-95 text-white rounded-full transition-all shadow-sm cursor-pointer select-none"
            >
              View my tickets
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
