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
  getUser(id: number): Promise<User | undefined>;
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

// In-memory storage for demo when database is unreachable
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

export class SupabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getMedicines(): Promise<Medicine[]> {
    return await db.select().from(medicines).orderBy(asc(medicines.ten_thuoc));
  }

  async getMedicine(id: string): Promise<Medicine | undefined> {
    const result = await db.select().from(medicines).where(eq(medicines.id, id)).limit(1);
    return result[0];
  }

  async createMedicine(medicine: InsertMedicine): Promise<Medicine> {
    const result = await db.insert(medicines).values(medicine).returning();
    return result[0];
  }

  async updateMedicine(id: string, medicine: Partial<InsertMedicine>): Promise<Medicine | undefined> {
    const result = await db.update(medicines).set(medicine).where(eq(medicines.id, id)).returning();
    return result[0];
  }

  async deleteMedicine(id: string): Promise<boolean> {
    const result = await db.delete(medicines).where(eq(medicines.id, id));
    return result.length > 0;
  }

  async getPatients(): Promise<Patient[]> {
    return await db.select().from(patients).orderBy(asc(patients.ten_benhnhan));
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    const result = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
    return result[0];
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const result = await db.insert(patients).values(patient).returning();
    return result[0];
  }

  async getPrescriptions(): Promise<PrescriptionWithDetails[]> {
    const prescriptionsResult = await db
      .select({
        id: prescriptions.id,
        patient_id: prescriptions.patient_id,
        khambenh_id: prescriptions.khambenh_id,
        ngaytoa: prescriptions.ngaytoa,
        chan_doan: prescriptions.chan_doan,
        ten_bac_si: prescriptions.ten_bac_si,
        trang_thai: prescriptions.trang_thai,
        created_at: prescriptions.created_at,
        ten_benhnhan: patients.ten_benhnhan,
      })
      .from(prescriptions)
      .innerJoin(patients, eq(prescriptions.patient_id, patients.id))
      .orderBy(desc(prescriptions.created_at));

    const prescriptionsWithMedicines: PrescriptionWithDetails[] = [];

    for (const prescription of prescriptionsResult) {
      const medicinesResult = await db
        .select({
          id: prescription_medicines.id,
          prescription_id: prescription_medicines.prescription_id,
          medicine_id: prescription_medicines.medicine_id,
          so_lan_dung: prescription_medicines.so_lan_dung,
          so_luong_moi_lan: prescription_medicines.so_luong_moi_lan,
          tong_so_luong: prescription_medicines.tong_so_luong,
          created_at: prescription_medicines.created_at,
          ten_thuoc: medicines.ten_thuoc,
          don_vi: medicines.don_vi,
        })
        .from(prescription_medicines)
        .innerJoin(medicines, eq(prescription_medicines.medicine_id, medicines.id))
        .where(eq(prescription_medicines.prescription_id, prescription.id));

      prescriptionsWithMedicines.push({
        ...prescription,
        medicines: medicinesResult,
      });
    }

    return prescriptionsWithMedicines;
  }

  async getPrescription(id: string): Promise<PrescriptionWithDetails | undefined> {
    const prescriptionResult = await db
      .select({
        id: prescriptions.id,
        patient_id: prescriptions.patient_id,
        khambenh_id: prescriptions.khambenh_id,
        ngaytoa: prescriptions.ngaytoa,
        chan_doan: prescriptions.chan_doan,
        ten_bac_si: prescriptions.ten_bac_si,
        trang_thai: prescriptions.trang_thai,
        created_at: prescriptions.created_at,
        ten_benhnhan: patients.ten_benhnhan,
      })
      .from(prescriptions)
      .innerJoin(patients, eq(prescriptions.patient_id, patients.id))
      .where(eq(prescriptions.id, id))
      .limit(1);

    if (!prescriptionResult[0]) return undefined;

    const medicinesResult = await db
      .select({
        id: prescription_medicines.id,
        prescription_id: prescription_medicines.prescription_id,
        medicine_id: prescription_medicines.medicine_id,
        so_lan_dung: prescription_medicines.so_lan_dung,
        so_luong_moi_lan: prescription_medicines.so_luong_moi_lan,
        tong_so_luong: prescription_medicines.tong_so_luong,
        created_at: prescription_medicines.created_at,
        ten_thuoc: medicines.ten_thuoc,
        don_vi: medicines.don_vi,
      })
      .from(prescription_medicines)
      .innerJoin(medicines, eq(prescription_medicines.medicine_id, medicines.id))
      .where(eq(prescription_medicines.prescription_id, id));

    return {
      ...prescriptionResult[0],
      medicines: medicinesResult,
    };
  }

  async createPrescription(prescription: InsertPrescription): Promise<Prescription> {
    const result = await db.insert(prescriptions).values(prescription).returning();
    return result[0];
  }

  async updatePrescriptionStatus(id: string, status: string): Promise<Prescription | undefined> {
    const result = await db.update(prescriptions).set({ trang_thai: status }).where(eq(prescriptions.id, id)).returning();
    return result[0];
  }

  async getPrescriptionMedicines(prescriptionId: string): Promise<Array<PrescriptionMedicine & { ten_thuoc: string; don_vi: string }>> {
    return await db
      .select({
        id: prescription_medicines.id,
        prescription_id: prescription_medicines.prescription_id,
        medicine_id: prescription_medicines.medicine_id,
        so_lan_dung: prescription_medicines.so_lan_dung,
        so_luong_moi_lan: prescription_medicines.so_luong_moi_lan,
        tong_so_luong: prescription_medicines.tong_so_luong,
        created_at: prescription_medicines.created_at,
        ten_thuoc: medicines.ten_thuoc,
        don_vi: medicines.don_vi,
      })
      .from(prescription_medicines)
      .innerJoin(medicines, eq(prescription_medicines.medicine_id, medicines.id))
      .where(eq(prescription_medicines.prescription_id, prescriptionId));
  }

  async createPrescriptionMedicine(prescriptionMedicine: InsertPrescriptionMedicine): Promise<PrescriptionMedicine> {
    const result = await db.insert(prescription_medicines).values(prescriptionMedicine).returning();
    return result[0];
  }
}

// Initialize with memory storage for demo, try database when possible
let storage: IStorage = new MemoryStorage();
let isUsingMemoryStorage = true;

// Try to initialize database storage
const initializeStorage = async () => {
  try {
    const dbStorage = new DatabaseStorage();
    // Test connection with timeout
    const testPromise = dbStorage.getMedicines();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 8000)
    );
    
    await Promise.race([testPromise, timeoutPromise]);
    storage = dbStorage;
    isUsingMemoryStorage = false;
    console.log('✅ Connected to Supabase database successfully');
  } catch (error) {
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
