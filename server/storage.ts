import { supabase } from "./supabase";
import {
  type Thuoc,
  type InsertThuoc,
  type Toathuoc,
  type InsertToathuoc,
  type Khambenh,
  type InsertKhambenh,
  type User,
  type InsertUser,
  type Medicine,
  type InsertMedicine,
} from "@shared/schema";

console.log('Initializing Supabase storage...');

export interface IStorage {
  // User
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Thuốc
  getAllThuoc(): Promise<Thuoc[]>;
  getThuocById(id: string): Promise<Thuoc | undefined>;
  searchThuocByName(searchTerm: string): Promise<Thuoc[]>;
  updateThuocStock(id: string, newStock: number): Promise<void>;

  // Legacy Medicine API support
  getMedicine(id: string): Promise<Medicine | undefined>;
  createMedicine(medicine: InsertMedicine): Promise<Medicine>;
  updateMedicine(id: string, medicine: Partial<InsertMedicine>): Promise<Medicine | undefined>;
  deleteMedicine(id: string): Promise<boolean>;

  // Khám bệnh
  getKhambenhById(id: string): Promise<Khambenh | undefined>;
  createKhambenh(khambenh: InsertKhambenh): Promise<Khambenh>;

  // Toa thuốc
  createToathuoc(toathuoc: InsertToathuoc[]): Promise<Toathuoc[]>;
  getToathuocByKhambenhId(khambenhId: string): Promise<Toathuoc[]>;
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private thuocList = new Map<string, Thuoc>();
  private khambenhList = new Map<string, Khambenh>();
  private toathuocList = new Map<string, Toathuoc>();
  private currentUserId = 1;
  private currentId = 1;

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleThuoc: Omit<Thuoc, "id">[] = [
      { ten_thuoc: "Augmentin 625mg", don_vi: "Viên", so_luong_ton: 150 },
      { ten_thuoc: "Amoxicillin 500mg", don_vi: "Viên", so_luong_ton: 200 },
      { ten_thuoc: "Aspirin 100mg", don_vi: "Viên", so_luong_ton: 75 },
      { ten_thuoc: "Azithromycin 250mg", don_vi: "Viên", so_luong_ton: 80 },
      { ten_thuoc: "Ambroxol 30mg", don_vi: "Viên", so_luong_ton: 120 },
      { ten_thuoc: "Ampicillin 250mg", don_vi: "Viên", so_luong_ton: 90 },
      { ten_thuoc: "Amlodipine 5mg", don_vi: "Viên", so_luong_ton: 65 },
      { ten_thuoc: "Acetaminophen 500mg", don_vi: "Viên", so_luong_ton: 250 },
      { ten_thuoc: "Betamethasone 0.5mg", don_vi: "Viên", so_luong_ton: 40 },
      { ten_thuoc: "Bromhexine 8mg", don_vi: "Viên", so_luong_ton: 100 },
      { ten_thuoc: "Cephalexin 500mg", don_vi: "Viên", so_luong_ton: 85 },
      { ten_thuoc: "Ciprofloxacin 500mg", don_vi: "Viên", so_luong_ton: 70 },
      { ten_thuoc: "Clarithromycin 250mg", don_vi: "Viên", so_luong_ton: 55 },
      { ten_thuoc: "Dexamethasone 0.5mg", don_vi: "Viên", so_luong_ton: 30 },
      { ten_thuoc: "Diclofenac 50mg", don_vi: "Viên", so_luong_ton: 95 },
      { ten_thuoc: "Paracetamol 500mg", don_vi: "Viên", so_luong_ton: 300 },
      { ten_thuoc: "Prednisolone 5mg", don_vi: "Viên", so_luong_ton: 60 },
      { ten_thuoc: "Vitamin C 1000mg", don_vi: "Viên", so_luong_ton: 100 },
      { ten_thuoc: "Vitamin B1 100mg", don_vi: "Viên", so_luong_ton: 80 },
      { ten_thuoc: "Vitamin D3 1000IU", don_vi: "Viên", so_luong_ton: 120 },
    ];

    sampleThuoc.forEach((t) => {
      const id = `thuoc-${this.currentId++}`;
      this.thuocList.set(id, { id, ...t });
    });

    // Sample khám bệnh
    const sampleKhambenh: Omit<Khambenh, "id"> = {
      benh_nhan_id: "bn-001",
      bac_si_id: "bs-001",
      ngay_kham: new Date().toISOString().split("T")[0],
      chan_doan: "Viêm họng cấp",
      ghi_chu: "Bệnh nhân cần nghỉ ngơi",
    };
    const kbId = `kb-${this.currentId++}`;
    this.khambenhList.set(kbId, { 
      id: kbId, 
      benh_nhan_id: sampleKhambenh.benh_nhan_id,
      bac_si_id: sampleKhambenh.bac_si_id,
      ngay_kham: sampleKhambenh.ngay_kham,
      chan_doan: sampleKhambenh.chan_doan,
      ghi_chu: sampleKhambenh.ghi_chu || null,
    });
  }

  // User
  async getUser(id: string) {
    return this.users.get(id);
  }
  async getUserByUsername(username: string) {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }
  async createUser(user: InsertUser) {
    const id = `user-${this.currentUserId++}`;
    const newUser: User = { id, ...user };
    this.users.set(id, newUser);
    return newUser;
  }

  // Thuốc
  async getAllThuoc() {
    return Array.from(this.thuocList.values()).sort((a, b) =>
      a.ten_thuoc.localeCompare(b.ten_thuoc)
    );
  }
  async getThuocById(id: string) {
    return this.thuocList.get(id);
  }
  async searchThuocByName(searchTerm: string) {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      return this.getAllThuoc().then((arr) => arr.slice(0, 15));
    }

    const all = Array.from(this.thuocList.values());
    const starts = all.filter((t) =>
      t.ten_thuoc.toLowerCase().startsWith(term)
    );
    const incl = all.filter((t) => {
      const name = t.ten_thuoc.toLowerCase();
      return name.includes(term) && !name.startsWith(term);
    });
    starts.sort((a, b) => a.ten_thuoc.localeCompare(b.ten_thuoc));
    incl.sort((a, b) => a.ten_thuoc.localeCompare(b.ten_thuoc));
    return [...starts, ...incl].slice(0, 15);
  }
  async updateThuocStock(id: string, newStock: number) {
    const t = this.thuocList.get(id);
    if (t) this.thuocList.set(id, { ...t, so_luong_ton: newStock });
  }

  // Khám bệnh
  async getKhambenhById(id: string) {
    return this.khambenhList.get(id);
  }
  async createKhambenh(k: InsertKhambenh) {
    const id = `kb-${this.currentId++}`;
    const newK: Khambenh = { 
      id, 
      benh_nhan_id: k.benh_nhan_id,
      bac_si_id: k.bac_si_id,
      ngay_kham: k.ngay_kham,
      chan_doan: k.chan_doan,
      ghi_chu: k.ghi_chu || null,
    };
    this.khambenhList.set(id, newK);
    return newK;
  }

  // Toa thuốc
  async createToathuoc(data: InsertToathuoc[]) {
    const out: Toathuoc[] = [];
    for (const d of data) {
      const id = `tt-${this.currentId++}`;
      const obj: Toathuoc = { 
        id, 
        khambenh_id: d.khambenh_id,
        thuoc_id: d.thuoc_id,
        so_luong: d.so_luong,
        cach_dung: d.cach_dung || null,
      };
      this.toathuocList.set(id, obj);
      out.push(obj);
    }
    return out;
  }
  async getToathuocByKhambenhId(khambenhId: string) {
    return Array.from(this.toathuocList.values()).filter(
      (t) => t.khambenh_id === khambenhId
    );
  }

  // Legacy Medicine API methods - convert from Thuoc to Medicine format
  async getMedicine(id: string): Promise<Medicine | undefined> {
    const thuoc = this.thuocList.get(id);
    if (!thuoc) return undefined;
    
    return {
      id: thuoc.id,
      ten_thuoc: thuoc.ten_thuoc,
      don_vi: thuoc.don_vi,
      so_luong_ton: thuoc.so_luong_ton,
      gia_nhap: 0,
      gia_ban: 0,
      so_luong_dat_hang: 0,
      duong_dung: "Uống",
      created_at: new Date()
    };
  }

  async createMedicine(medicine: InsertMedicine): Promise<Medicine> {
    const id = `thuoc-${this.currentId++}`;
    const thuoc: Thuoc = {
      id,
      ten_thuoc: medicine.ten_thuoc,
      don_vi: medicine.don_vi,
      so_luong_ton: medicine.so_luong_ton || 0
    };
    this.thuocList.set(id, thuoc);
    
    return {
      id,
      ten_thuoc: medicine.ten_thuoc,
      don_vi: medicine.don_vi,
      so_luong_ton: medicine.so_luong_ton || 0,
      gia_nhap: medicine.gia_nhap || 0,
      gia_ban: medicine.gia_ban || 0,
      so_luong_dat_hang: medicine.so_luong_dat_hang || 0,
      duong_dung: medicine.duong_dung || "Uống",
      created_at: new Date()
    };
  }

  async updateMedicine(id: string, medicine: Partial<InsertMedicine>): Promise<Medicine | undefined> {
    const existing = this.thuocList.get(id);
    if (!existing) return undefined;

    const updated = { ...existing };
    if (medicine.ten_thuoc) updated.ten_thuoc = medicine.ten_thuoc;
    if (medicine.don_vi) updated.don_vi = medicine.don_vi;
    if (medicine.so_luong_ton !== undefined) updated.so_luong_ton = medicine.so_luong_ton;
    
    this.thuocList.set(id, updated);
    
    return {
      id: updated.id,
      ten_thuoc: updated.ten_thuoc,
      don_vi: updated.don_vi,
      so_luong_ton: updated.so_luong_ton,
      gia_nhap: medicine.gia_nhap || 0,
      gia_ban: medicine.gia_ban || 0,
      so_luong_dat_hang: medicine.so_luong_dat_hang || 0,
      duong_dung: medicine.duong_dung || "Uống",
      created_at: new Date()
    };
  }

  async deleteMedicine(id: string): Promise<boolean> {
    return this.thuocList.delete(id);
  }
}

// Supabase storage implementation
export class SupabaseStorage implements IStorage {
  // User
  async getUser(id: string): Promise<User | undefined> {
    const { data } = await supabase.from('users').select('*').eq('id', id).single();
    return data || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data } = await supabase.from('users').select('*').eq('username', username).single();
    return data || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await supabase.from('users').insert(user).select().single();
    if (error) throw error;
    return data;
  }

  // Thuốc
  async getAllThuoc(): Promise<Thuoc[]> {
    const { data, error } = await supabase.from('thuoc').select('*').order('ten_thuoc');
    if (error) throw error;
    return data || [];
  }

  async getThuocById(id: string): Promise<Thuoc | undefined> {
    const { data } = await supabase.from('thuoc').select('*').eq('id', id).single();
    return data || undefined;
  }

  async searchThuocByName(searchTerm: string): Promise<Thuoc[]> {
    const { data, error } = await supabase
      .from('thuoc')
      .select('*')
      .ilike('ten_thuoc', `%${searchTerm}%`)
      .order('ten_thuoc')
      .limit(15);
    if (error) throw error;
    return data || [];
  }

  async updateThuocStock(id: string, newStock: number): Promise<void> {
    const { error } = await supabase
      .from('thuoc')
      .update({ so_luong_ton: newStock })
      .eq('id', id);
    if (error) throw error;
  }

  // Khám bệnh
  async getKhambenhById(id: string): Promise<Khambenh | undefined> {
    const { data } = await supabase.from('khambenh').select('*').eq('id', id).single();
    return data || undefined;
  }

  async createKhambenh(khambenh: InsertKhambenh): Promise<Khambenh> {
    const { data, error } = await supabase.from('khambenh').insert(khambenh).select().single();
    if (error) throw error;
    return data;
  }

  // Toa thuốc
  async createToathuoc(toathuoc: InsertToathuoc[]): Promise<Toathuoc[]> {
    const { data, error } = await supabase.from('toathuoc').insert(toathuoc).select();
    if (error) throw error;
    return data || [];
  }

  async getToathuocByKhambenhId(khambenhId: string): Promise<Toathuoc[]> {
    const { data, error } = await supabase
      .from('toathuoc')
      .select('*')
      .eq('khambenh_id', khambenhId);
    if (error) throw error;
    return data || [];
  }

  // Legacy Medicine API methods - work with thuoc table and map to Medicine format
  async getMedicine(id: string): Promise<Medicine | undefined> {
    const { data } = await supabase.from('thuoc').select('*').eq('id', id).single();
    if (!data) return undefined;
    
    return {
      id: data.id,
      ten_thuoc: data.ten_thuoc,
      don_vi: data.don_vi || "",
      so_luong_ton: data.so_luong_ton || 0,
      gia_nhap: data.gia_nhap || 0,
      gia_ban: data.gia_ban || 0,
      so_luong_dat_hang: data.so_luong_dat_hang || 0,
      duong_dung: data.duong_dung || "Uống",
      created_at: data.created_at || new Date()
    };
  }

  async createMedicine(medicine: InsertMedicine): Promise<Medicine> {
    const thuocData = {
      ten_thuoc: medicine.ten_thuoc,
      don_vi: medicine.don_vi,
      so_luong_ton: medicine.so_luong_ton,
      gia_nhap: medicine.gia_nhap,
      gia_ban: medicine.gia_ban,
      so_luong_dat_hang: medicine.so_luong_dat_hang,
      duong_dung: medicine.duong_dung
    };
    
    const { data, error } = await supabase.from('thuoc').insert(thuocData).select().single();
    if (error) throw error;
    
    return {
      id: data.id,
      ten_thuoc: data.ten_thuoc,
      don_vi: data.don_vi || "",
      so_luong_ton: data.so_luong_ton || 0,
      gia_nhap: data.gia_nhap || 0,
      gia_ban: data.gia_ban || 0,
      so_luong_dat_hang: data.so_luong_dat_hang || 0,
      duong_dung: data.duong_dung || "Uống",
      created_at: data.created_at || new Date()
    };
  }

  async updateMedicine(id: string, medicine: Partial<InsertMedicine>): Promise<Medicine | undefined> {
    const updateData: any = {};
    if (medicine.ten_thuoc) updateData.ten_thuoc = medicine.ten_thuoc;
    if (medicine.don_vi) updateData.don_vi = medicine.don_vi;
    if (medicine.so_luong_ton !== undefined) updateData.so_luong_ton = medicine.so_luong_ton;
    if (medicine.gia_nhap !== undefined) updateData.gia_nhap = medicine.gia_nhap;
    if (medicine.gia_ban !== undefined) updateData.gia_ban = medicine.gia_ban;
    if (medicine.so_luong_dat_hang !== undefined) updateData.so_luong_dat_hang = medicine.so_luong_dat_hang;
    if (medicine.duong_dung) updateData.duong_dung = medicine.duong_dung;
    
    const { data, error } = await supabase.from('thuoc').update(updateData).eq('id', id).select().single();
    if (error) throw error;
    if (!data) return undefined;
    
    return {
      id: data.id,
      ten_thuoc: data.ten_thuoc,
      don_vi: data.don_vi || "",
      so_luong_ton: data.so_luong_ton || 0,
      gia_nhap: data.gia_nhap || 0,
      gia_ban: data.gia_ban || 0,
      so_luong_dat_hang: data.so_luong_dat_hang || 0,
      duong_dung: data.duong_dung || "Uống",
      created_at: data.created_at || new Date()
    };
  }

  async deleteMedicine(id: string): Promise<boolean> {
    const { error } = await supabase.from('thuoc').delete().eq('id', id);
    return !error;
  }
}

// Initialize storage with fallback
let storage: IStorage = new MemStorage();
let isUsingMemoryStorage = true;

// Try to initialize Supabase storage
const initializeStorage = async () => {
  try {
    const supabaseStorage = new SupabaseStorage();
    // Test connection
    await supabaseStorage.getAllThuoc();
    storage = supabaseStorage;
    isUsingMemoryStorage = false;
    console.log('✅ Connected to Supabase database successfully');
  } catch (error: any) {
    console.log('⚠️  Supabase connection failed, using memory storage');
    console.log('Error details:', error.message);
    storage = new MemStorage();
    isUsingMemoryStorage = true;
  }
};

// Try to connect to database on startup
initializeStorage();

export { storage };
export const getStorageInfo = () => ({ isUsingMemoryStorage });