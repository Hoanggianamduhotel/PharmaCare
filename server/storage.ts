import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, asc } from "drizzle-orm";
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
  users,
  medicines,
  patients,
  prescriptions,
  prescription_medicines,
} from "@shared/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

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

export class DatabaseStorage implements IStorage {
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
    return result.rowCount > 0;
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

export const storage = new DatabaseStorage();
