/**
 * TRANS TV Helpdesk Master Categories & Groups
 * Mapped 1:1 directly from database tables:
 * - tbl_group (5 groups)
 * - tbl_tiketkategori (104 categories)
 * - tbl_tiketform (12 software form categories linked to tbl_dataform)
 */

export interface DbCategoryItem {
  id: number;
  name: string;
  groupId: number;
  groupName: string;
  isForm?: boolean;
}

export interface DbGroupItem {
  id: number;
  name: string;
}

export const DB_GROUPS: DbGroupItem[] = [
  { id: 1, name: 'IT Software Development' },
  { id: 2, name: 'IT Broadcast Multimedia' },
  { id: 3, name: 'IT Support' },
  { id: 4, name: 'IT TOS' },
  { id: 5, name: 'HRIS' },
];

export const DB_CATEGORIES_BY_GROUP: Record<string, DbCategoryItem[]> = {
  'IT Software Development': [
    { id: 1, name: 'Aplikasi Insosys (Umum)(Perubahan Data)', groupId: 1, groupName: 'IT Software Development', isForm: false },
    { id: 2, name: 'Aplikasi ERP', groupId: 1, groupName: 'IT Software Development', isForm: false },
    { id: 5, name: 'Aplikasi Broadcast Equipment Management(Perubahan Data)', groupId: 1, groupName: 'IT Software Development', isForm: false },
    { id: 6, name: 'Aplikasi Asset Management(Perubahan Data)', groupId: 1, groupName: 'IT Software Development', isForm: false },
    { id: 7, name: 'Aplikasi Wardrobe Management(Perubahan Data)', groupId: 1, groupName: 'IT Software Development', isForm: false },
    { id: 8, name: 'Aplikasi Library Cassete Management(Perubahan Data)', groupId: 1, groupName: 'IT Software Development', isForm: false },
    { id: 35, name: 'Aplikasi Insosys -  Modul Budget(Perubahan Data)', groupId: 1, groupName: 'IT Software Development', isForm: false },
    { id: 36, name: 'Aplikasi Insosys -  Modul Procurement(Perubahan Data)', groupId: 1, groupName: 'IT Software Development', isForm: false },
    { id: 37, name: 'Aplikasi Insosys -  Modul FinAcc(Perubahan Data)', groupId: 1, groupName: 'IT Software Development', isForm: false },
    { id: 38, name: 'Aplikasi GS - Booking Tiket Pesawat', groupId: 1, groupName: 'IT Software Development', isForm: false },
    { id: 39, name: 'Aplikasi GS - Booking Hotel', groupId: 1, groupName: 'IT Software Development', isForm: false },
    { id: 40, name: 'Aplikasi GS - GPS Tracking', groupId: 1, groupName: 'IT Software Development', isForm: false },
    { id: 86, name: 'Aplikasi Insosys (Umum)(Tambah/Modifikasi Modul)', groupId: 1, groupName: 'IT Software Development', isForm: true },
    { id: 87, name: 'Aplikasi Insosys - Modul Budget(Tambah/Modifikasi Modul)', groupId: 1, groupName: 'IT Software Development', isForm: true },
    { id: 88, name: 'Aplikasi Insosys - Modul Procurement(Tambah/Modifikasi Modul)', groupId: 1, groupName: 'IT Software Development', isForm: true },
    { id: 89, name: 'Aplikasi Insosys - Modul FinAcc(Tambah/Modifikasi Modul)', groupId: 1, groupName: 'IT Software Development', isForm: true },
    { id: 90, name: 'Aplikasi Asset Management(Tambah/Modifikasi Modul)', groupId: 1, groupName: 'IT Software Development', isForm: true },
    { id: 91, name: 'Aplikasi Broadcast Equipment Management(Tambah/Modifikasi Modul)', groupId: 1, groupName: 'IT Software Development', isForm: true },
    { id: 92, name: 'Aplikasi Library Cassete Management(Tambah/Modifikasi Modul)', groupId: 1, groupName: 'IT Software Development', isForm: true },
    { id: 93, name: 'Aplikasi Wardrobe Management(Tambah/Modifikasi Modul)', groupId: 1, groupName: 'IT Software Development', isForm: true },
    { id: 102, name: 'Aplikasi E-Faktur', groupId: 1, groupName: 'IT Software Development', isForm: false },
    { id: 103, name: 'GEN21', groupId: 1, groupName: 'IT Software Development', isForm: false },
    { id: 104, name: 'Aplikasi Website E-Traffic (Tambah/Modifikasi Modul)', groupId: 1, groupName: 'IT Software Development', isForm: true },
    { id: 105, name: 'Website Sales Trans TV', groupId: 1, groupName: 'IT Software Development', isForm: false },
    { id: 110, name: 'Web CT ARSA', groupId: 1, groupName: 'IT Software Development', isForm: false },
    { id: 111, name: 'Website Editing Trans Tv', groupId: 1, groupName: 'IT Software Development', isForm: false },
    { id: 112, name: 'toa', groupId: 1, groupName: 'IT Software Development', isForm: false },
    { id: 113, name: 'TOA', groupId: 1, groupName: 'IT Software Development', isForm: false },
    { id: 114, name: 'Website Commercial TransTV', groupId: 1, groupName: 'IT Software Development', isForm: false },
  ],
  'IT Broadcast Multimedia': [
    { id: 16, name: 'Website Trans TV', groupId: 2, groupName: 'IT Broadcast Multimedia', isForm: false },
    { id: 17, name: 'Website Forum Trans Tv', groupId: 2, groupName: 'IT Broadcast Multimedia', isForm: false },
    { id: 18, name: 'Website Other', groupId: 2, groupName: 'IT Broadcast Multimedia', isForm: false },
    { id: 34, name: 'Aplikasi Multimedia', groupId: 2, groupName: 'IT Broadcast Multimedia', isForm: false },
    { id: 75, name: 'Aplikasi Website (Pembuatan Baru)', groupId: 2, groupName: 'IT Broadcast Multimedia', isForm: true },
    { id: 94, name: 'Aplikasi Website(Modifikasi Modul Website / Troubleshooting Website)', groupId: 2, groupName: 'IT Broadcast Multimedia', isForm: true },
    { id: 95, name: 'FTP Login Account (New/Update User Account/Troubleshoot FTP)', groupId: 2, groupName: 'IT Broadcast Multimedia', isForm: true },
    { id: 96, name: 'Broadcast Installasi', groupId: 2, groupName: 'IT Broadcast Multimedia', isForm: false },
    { id: 97, name: 'Broadcast Trouble Shooting Hardware', groupId: 2, groupName: 'IT Broadcast Multimedia', isForm: false },
    { id: 98, name: 'Broadcast Trouble Shooting Software', groupId: 2, groupName: 'IT Broadcast Multimedia', isForm: false },
    { id: 99, name: 'Broadcast Pembuatan Aplikasi Program Acara', groupId: 2, groupName: 'IT Broadcast Multimedia', isForm: false },
    { id: 100, name: 'Hardware Editing', groupId: 2, groupName: 'IT Broadcast Multimedia', isForm: false },
    { id: 101, name: 'Software Editing', groupId: 2, groupName: 'IT Broadcast Multimedia', isForm: false },
  ],
  'IT Support': [
    { id: 3, name: 'Aplikasi Intranet', groupId: 3, groupName: 'IT Support', isForm: false },
    { id: 19, name: 'Hardware CPU', groupId: 3, groupName: 'IT Support', isForm: false },
    { id: 20, name: 'Hardware Monitor', groupId: 3, groupName: 'IT Support', isForm: false },
    { id: 21, name: 'Hardware Keyboard / Mouse', groupId: 3, groupName: 'IT Support', isForm: false },
    { id: 22, name: 'Hardware Harddisk', groupId: 3, groupName: 'IT Support', isForm: false },
    { id: 23, name: 'Hardware Memory', groupId: 3, groupName: 'IT Support', isForm: false },
    { id: 24, name: 'Hardware Network', groupId: 3, groupName: 'IT Support', isForm: false },
    { id: 25, name: 'Hardware Printer', groupId: 3, groupName: 'IT Support', isForm: false },
    { id: 26, name: 'Support Email', groupId: 3, groupName: 'IT Support', isForm: false },
    { id: 27, name: 'Support Operating System', groupId: 3, groupName: 'IT Support', isForm: false },
    { id: 28, name: 'Support Network Login / Password', groupId: 3, groupName: 'IT Support', isForm: false },
    { id: 29, name: 'Support Virus', groupId: 3, groupName: 'IT Support', isForm: false },
    { id: 30, name: 'Support Internet', groupId: 3, groupName: 'IT Support', isForm: false },
    { id: 31, name: 'Support FTP', groupId: 3, groupName: 'IT Support', isForm: false },
    { id: 32, name: 'Support Mac (Apple)', groupId: 3, groupName: 'IT Support', isForm: false },
    { id: 33, name: 'Lain-lain', groupId: 3, groupName: 'IT Support', isForm: false },
    { id: 41, name: 'Support Instalasi', groupId: 3, groupName: 'IT Support', isForm: false },
  ],
  'IT TOS': [
    { id: 45, name: 'TOA Server - Leitch', groupId: 4, groupName: 'IT TOS', isForm: false },
    { id: 47, name: 'TOA Switcher', groupId: 4, groupName: 'IT TOS', isForm: false },
    { id: 50, name: 'TOA Routing Switcher', groupId: 4, groupName: 'IT TOS', isForm: false },
    { id: 51, name: 'TOA Emergency Switcher', groupId: 4, groupName: 'IT TOS', isForm: false },
    { id: 52, name: 'TOA Automation', groupId: 4, groupName: 'IT TOS', isForm: false },
    { id: 53, name: 'TOA Logo Generator', groupId: 4, groupName: 'IT TOS', isForm: false },
    { id: 54, name: 'TOA Subtitling', groupId: 4, groupName: 'IT TOS', isForm: false },
    { id: 55, name: 'TOA VTR', groupId: 4, groupName: 'IT TOS', isForm: false },
    { id: 56, name: 'TOA Support - MCR', groupId: 4, groupName: 'IT TOS', isForm: false },
    { id: 57, name: 'TOA Frame Sync', groupId: 4, groupName: 'IT TOS', isForm: false },
    { id: 58, name: 'TOA Intercom', groupId: 4, groupName: 'IT TOS', isForm: false },
    { id: 59, name: 'TOA CG - Deko', groupId: 4, groupName: 'IT TOS', isForm: false },
    { id: 60, name: 'TOA CG - Inscriber', groupId: 4, groupName: 'IT TOS', isForm: false },
    { id: 61, name: 'TOA Monitor Broadcast', groupId: 4, groupName: 'IT TOS', isForm: false },
    { id: 62, name: 'TOA Waveform', groupId: 4, groupName: 'IT TOS', isForm: false },
    { id: 63, name: 'TOA Audio Processor', groupId: 4, groupName: 'IT TOS', isForm: false },
    { id: 64, name: 'TOA Audio Monitor', groupId: 4, groupName: 'IT TOS', isForm: false },
    { id: 65, name: 'TOA Star Drive', groupId: 4, groupName: 'IT TOS', isForm: false },
    { id: 66, name: 'TOA Tape Ingest', groupId: 4, groupName: 'IT TOS', isForm: false },
    { id: 67, name: 'TOA Feed Ingest', groupId: 4, groupName: 'IT TOS', isForm: false },
    { id: 68, name: 'TOA Virtual - ViZRT', groupId: 4, groupName: 'IT TOS', isForm: false },
    { id: 69, name: 'TOA Editing - EDIUS', groupId: 4, groupName: 'IT TOS', isForm: false },
    { id: 70, name: 'TOA Editing - FCP', groupId: 4, groupName: 'IT TOS', isForm: false },
    { id: 71, name: 'TOA Editing - News Flash', groupId: 4, groupName: 'IT TOS', isForm: false },
    { id: 72, name: 'TOA Support - Library', groupId: 4, groupName: 'IT TOS', isForm: false },
    { id: 73, name: 'TOA Quality Control', groupId: 4, groupName: 'IT TOS', isForm: false },
    { id: 74, name: 'TOA Lain - Lain', groupId: 4, groupName: 'IT TOS', isForm: false },
  ],
  'HRIS': [
    { id: 4, name: 'Aplikasi HR - HRSS (Cuti online)', groupId: 5, groupName: 'HRIS', isForm: false },
    { id: 9, name: 'Aplikasi HR - FingerPrint', groupId: 5, groupName: 'HRIS', isForm: false },
    { id: 10, name: 'Aplikasi HR - Recruitment', groupId: 5, groupName: 'HRIS', isForm: false },
    { id: 11, name: 'Aplikasi HR - Training', groupId: 5, groupName: 'HRIS', isForm: false },
    { id: 12, name: 'Aplikasi HR - Exit Clearence', groupId: 5, groupName: 'HRIS', isForm: false },
    { id: 13, name: 'Aplikasi HR - Reimbursement', groupId: 5, groupName: 'HRIS', isForm: false },
    { id: 14, name: 'Aplikasi Portal SMS Internal', groupId: 5, groupName: 'HRIS', isForm: false },
    { id: 15, name: 'Aplikasi Portal SMS Kuis', groupId: 5, groupName: 'HRIS', isForm: false },
  ],
};

