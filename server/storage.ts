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
    this.khambenhList.set(kbId, { id: kbId, ...sampleKhambenh });
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
    const newK: Khambenh = { id, ...k };
    this.khambenhList.set(id, newK);
    return newK;
  }

  // Toa thuốc
  async createToathuoc(data: InsertToathuoc[]) {
    const out: Toathuoc[] = [];
    for (const d of data) {
      const id = `tt-${this.currentId++}`;
      const obj: Toathuoc = { id, ...d };
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