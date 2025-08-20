import { supabase } from "./supabase";
import {
  type User,
  type InsertUser,
  type Medicine,
  type InsertMedicine,
  type Patient,
  type InsertPatient,
  type Prescription,
  type InsertPrescription,
  type PrescriptionMedicine,
  type InsertPrescriptionMedicine,
  type PrescriptionWithDetails,
} from "@shared/schema";

console.log('Initializing Supabase storage...');

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Medicine methods
  getMedicines(): Promise<Medicine[]>;
  getMedicine(id: string): Promise<Medicine | undefined>;
  createMedicine(medicine: InsertMedicine): Promise<Medicine>;
  updateMedicine(id: string, medicine: Partial<InsertMedicine>): Promise<Medicine | undefined>;
  deleteMedicine(id: string): Promise<boolean>;

  // Patient methods
  getPatients(): Promise<Patient[]>;
  getPatient(id: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;

  // Prescription methods
  getPrescriptions(): Promise<PrescriptionWithDetails[]>;
  getPrescription(id: string): Promise<PrescriptionWithDetails | undefined>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  updatePrescriptionStatus(id: string, status: string): Promise<Prescription | undefined>;

  // Prescription medicine methods
  getPrescriptionMedicines(prescriptionId: string): Promise<Array<PrescriptionMedicine & { ten_thuoc: string; don_vi: string }>>;
  createPrescriptionMedicine(prescriptionMedicine: InsertPrescriptionMedicine): Promise<PrescriptionMedicine>;
}

// In-memory storage for demo
class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private medicines: Map<string, Medicine> = new Map();
  private patients: Map<string, Patient> = new Map();
  private prescriptions: Map<string, Prescription> = new Map();
  private prescriptionMedicines: Map<string, PrescriptionMedicine> = new Map();

  constructor() {
    // Add sample data
    const sampleMedicines: Medicine[] = [
      {
        id: "1",
        ten_thuoc: "Paracetamol 500mg",
        don_vi: "Viên",
        so_luong_ton: 100,
        so_luong_dat_hang: 50,
        gia_nhap: 200,
        gia_ban: 500,
        duong_dung: "Uống",
        created_at: new Date()
      },
      {
        id: "2", 
        ten_thuoc: "Amoxicillin 250mg",
        don_vi: "Viên",
        so_luong_ton: 75,
        so_luong_dat_hang: 25,
        gia_nhap: 300,
        gia_ban: 800,
        duong_dung: "Uống",
        created_at: new Date()
      }
    ];
    
    sampleMedicines.forEach(med => this.medicines.set(med.id, med));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = { ...user, id: Date.now().toString() };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async getMedicines(): Promise<Medicine[]> {
    return Array.from(this.medicines.values());
  }

  async getMedicine(id: string): Promise<Medicine | undefined> {
    return this.medicines.get(id);
  }

  async createMedicine(medicine: InsertMedicine): Promise<Medicine> {
    const newMedicine: Medicine = { 
      ...medicine, 
      id: Date.now().toString(),
      created_at: new Date()
    };
    this.medicines.set(newMedicine.id, newMedicine);
    return newMedicine;
  }

  async updateMedicine(id: string, medicine: Partial<InsertMedicine>): Promise<Medicine | undefined> {
    const existing = this.medicines.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...medicine };
    this.medicines.set(id, updated);
    return updated;
  }

  async deleteMedicine(id: string): Promise<boolean> {
    return this.medicines.delete(id);
  }

  async getPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const newPatient: Patient = { 
      ...patient, 
      id: Date.now().toString(),
      created_at: new Date()
    };
    this.patients.set(newPatient.id, newPatient);
    return newPatient;
  }

  async getPrescriptions(): Promise<PrescriptionWithDetails[]> {
    return Array.from(this.prescriptions.values()).map(p => ({
      ...p,
      ten_benhnhan: this.patients.get(p.patient_id)?.ten_benhnhan || "Unknown",
      tuoi: 0,
      medicines: []
    }));
  }

  async getPrescription(id: string): Promise<PrescriptionWithDetails | undefined> {
    const prescription = this.prescriptions.get(id);
    if (!prescription) return undefined;
    const patient = this.patients.get(prescription.patient_id);
    return {
      ...prescription,
      ten_benhnhan: patient?.ten_benhnhan || "Unknown",
      tuoi: 0,
      medicines: []
    };
  }

  async createPrescription(prescription: InsertPrescription): Promise<Prescription> {
    const newPrescription: Prescription = { 
      ...prescription, 
      id: Date.now().toString(),
      created_at: new Date()
    };
    this.prescriptions.set(newPrescription.id, newPrescription);
    return newPrescription;
  }

  async updatePrescriptionStatus(id: string, status: string): Promise<Prescription | undefined> {
    const existing = this.prescriptions.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, trang_thai: status };
    this.prescriptions.set(id, updated);
    return updated;
  }

  async getPrescriptionMedicines(prescriptionId: string): Promise<Array<PrescriptionMedicine & { ten_thuoc: string; don_vi: string }>> {
    return Array.from(this.prescriptionMedicines.values())
      .filter(pm => pm.prescription_id === prescriptionId)
      .map(pm => {
        const medicine = this.medicines.get(pm.medicine_id);
        return {
          ...pm,
          ten_thuoc: medicine?.ten_thuoc || "Unknown",
          don_vi: medicine?.don_vi || "Unknown"
        };
      });
  }

  async createPrescriptionMedicine(prescriptionMedicine: InsertPrescriptionMedicine): Promise<PrescriptionMedicine> {
    const newPM: PrescriptionMedicine = { 
      ...prescriptionMedicine, 
      id: Date.now().toString(),
      created_at: new Date()
    };
    this.prescriptionMedicines.set(newPM.id, newPM);
    return newPM;
  }
}

// Supabase storage implementation
export class SupabaseStorage implements IStorage {
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

  async getMedicines(): Promise<Medicine[]> {
    const { data, error } = await supabase.from('medicines').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getMedicine(id: string): Promise<Medicine | undefined> {
    const { data } = await supabase.from('medicines').select('*').eq('id', id).single();
    return data || undefined;
  }

  async createMedicine(medicine: InsertMedicine): Promise<Medicine> {
    const { data, error } = await supabase.from('medicines').insert(medicine).select().single();
    if (error) throw error;
    return data;
  }

  async updateMedicine(id: string, medicine: Partial<InsertMedicine>): Promise<Medicine | undefined> {
    const { data, error } = await supabase.from('medicines').update(medicine).eq('id', id).select().single();
    if (error) throw error;
    return data || undefined;
  }

  async deleteMedicine(id: string): Promise<boolean> {
    const { error } = await supabase.from('medicines').delete().eq('id', id);
    return !error;
  }

  async getPatients(): Promise<Patient[]> {
    const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    const { data } = await supabase.from('patients').select('*').eq('id', id).single();
    return data || undefined;
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const { data, error } = await supabase.from('patients').insert(patient).select().single();
    if (error) throw error;
    return data;
  }

  async getPrescriptions(): Promise<PrescriptionWithDetails[]> {
    const { data, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        patients(ten_benhnhan, tuoi)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map((p: any) => ({
      ...p,
      ten_benhnhan: p.patients?.ten_benhnhan || 'Unknown',
      tuoi: p.patients?.tuoi || 0,
      medicines: []
    }));
  }

  async getPrescription(id: string): Promise<PrescriptionWithDetails | undefined> {
    const { data } = await supabase
      .from('prescriptions')
      .select(`
        *,
        patients(ten_benhnhan, tuoi),
        prescription_medicines(
          *,
          medicines(ten_thuoc, don_vi)
        )
      `)
      .eq('id', id)
      .single();
    
    if (!data) return undefined;
    
    return {
      ...data,
      ten_benhnhan: data.patients?.ten_benhnhan || 'Unknown',
      tuoi: data.patients?.tuoi || 0,
      medicines: data.prescription_medicines || []
    };
  }

  async createPrescription(prescription: InsertPrescription): Promise<Prescription> {
    const { data, error } = await supabase.from('prescriptions').insert(prescription).select().single();
    if (error) throw error;
    return data;
  }

  async updatePrescriptionStatus(id: string, status: string): Promise<Prescription | undefined> {
    const { data, error } = await supabase.from('prescriptions').update({ trang_thai: status }).eq('id', id).select().single();
    if (error) throw error;
    return data || undefined;
  }

  async getPrescriptionMedicines(prescriptionId: string): Promise<Array<PrescriptionMedicine & { ten_thuoc: string; don_vi: string }>> {
    const { data, error } = await supabase
      .from('prescription_medicines')
      .select(`
        *,
        medicines(ten_thuoc, don_vi)
      `)
      .eq('prescription_id', prescriptionId);
    
    if (error) throw error;
    
    return (data || []).map((pm: any) => ({
      ...pm,
      ten_thuoc: pm.medicines?.ten_thuoc || 'Unknown',
      don_vi: pm.medicines?.don_vi || 'Unknown'
    }));
  }

  async createPrescriptionMedicine(prescriptionMedicine: InsertPrescriptionMedicine): Promise<PrescriptionMedicine> {
    const { data, error } = await supabase.from('prescription_medicines').insert(prescriptionMedicine).select().single();
    if (error) throw error;
    return data;
  }
}

// Initialize with memory storage for demo, try database when possible
let storage: IStorage = new MemoryStorage();
let isUsingMemoryStorage = true;

// Try to initialize Supabase storage
const initializeStorage = async () => {
  try {
    const supabaseStorage = new SupabaseStorage();
    // Test connection with timeout
    const testPromise = supabaseStorage.getMedicines();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 8000)
    );
    
    await Promise.race([testPromise, timeoutPromise]);
    storage = supabaseStorage;
    isUsingMemoryStorage = false;
    console.log('✅ Connected to Supabase database successfully');
  } catch (error: any) {
    console.log('⚠️  Supabase connection failed, using memory storage');
    console.log('Error details:', error.message);
    storage = new MemoryStorage();
    isUsingMemoryStorage = true;
  }
};

// Try to connect to database on startup
initializeStorage();

export { storage };
export const getStorageInfo = () => ({ isUsingMemoryStorage });