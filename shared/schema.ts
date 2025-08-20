import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const medicines = pgTable("medicines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ten_thuoc: text("ten_thuoc").notNull(),
  don_vi: text("don_vi").notNull(),
  so_luong_ton: integer("so_luong_ton").notNull().default(0),
  gia_nhap: integer("gia_nhap").notNull().default(0),
  gia_ban: integer("gia_ban").notNull().default(0),
  so_luong_dat_hang: integer("so_luong_dat_hang").notNull().default(0),
  duong_dung: text("duong_dung").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ten_benhnhan: text("ten_benhnhan").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const prescriptions = pgTable("prescriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patient_id: varchar("patient_id").notNull(),
  khambenh_id: varchar("khambenh_id").notNull(),
  ngaytoa: text("ngaytoa").notNull(),
  chan_doan: text("chan_doan").notNull(),
  ten_bac_si: text("ten_bac_si").notNull(),
  trang_thai: text("trang_thai").notNull().default("Chờ"),
  created_at: timestamp("created_at").defaultNow(),
});

export const prescription_medicines = pgTable("prescription_medicines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  prescription_id: varchar("prescription_id").notNull(),
  medicine_id: varchar("medicine_id").notNull(),
  so_lan_dung: integer("so_lan_dung").notNull(),
  so_luong_moi_lan: integer("so_luong_moi_lan").notNull(),
  tong_so_luong: integer("tong_so_luong").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMedicineSchema = createInsertSchema(medicines).omit({
  id: true,
  created_at: true,
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  created_at: true,
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true,
  created_at: true,
});

export const insertPrescriptionMedicineSchema = createInsertSchema(prescription_medicines).omit({
  id: true,
  created_at: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Medicine = typeof medicines.$inferSelect;
export type InsertMedicine = z.infer<typeof insertMedicineSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type PrescriptionMedicine = typeof prescription_medicines.$inferSelect;
export type InsertPrescriptionMedicine = z.infer<typeof insertPrescriptionMedicineSchema>;

export interface PrescriptionWithDetails extends Prescription {
  ten_benhnhan: string;
  medicines: Array<PrescriptionMedicine & { ten_thuoc: string; don_vi: string }>;
}
