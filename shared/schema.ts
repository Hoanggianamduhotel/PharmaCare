import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, numeric } from "drizzle-orm/pg-core";
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

// Additional tables for Vietnamese pharmacy schema
export const thuoc = pgTable("thuoc", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ten_thuoc: text("ten_thuoc").notNull(),
  don_vi: text("don_vi"),
  so_luong_ton: numeric("so_luong_ton"),
  gia_ban: numeric("gia_ban"),
  created_at: timestamp("created_at").defaultNow(),
  gia_nhap: numeric("gia_nhap", { precision: 10, scale: 2 }),
  so_luong_dat_hang: integer("so_luong_dat_hang").default(0),
  duong_dung: text("duong_dung"),
  phan_loai: text("phan_loai"),
});

export const khambenh = pgTable("khambenh", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  benh_nhan_id: text("benh_nhan_id").notNull(),
  bac_si_id: text("bac_si_id").notNull(),
  ngay_kham: text("ngay_kham").notNull(),
  chan_doan: text("chan_doan").notNull(),
  ghi_chu: text("ghi_chu"),
});

export const toathuoc = pgTable("toathuoc", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  khambenh_id: text("khambenh_id").notNull(),
  thuoc_id: text("thuoc_id").notNull(),
  so_luong: integer("so_luong").notNull(),
  cach_dung: text("cach_dung"),
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Medicine = typeof medicines.$inferSelect;
export type InsertMedicine = typeof medicines.$inferInsert;
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;
export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = typeof prescriptions.$inferInsert;
export type PrescriptionMedicine = typeof prescription_medicines.$inferSelect;
export type InsertPrescriptionMedicine = typeof prescription_medicines.$inferInsert;

// Vietnamese schema types
export type Thuoc = typeof thuoc.$inferSelect;
export type InsertThuoc = typeof thuoc.$inferInsert;
export type Khambenh = typeof khambenh.$inferSelect;
export type InsertKhambenh = typeof khambenh.$inferInsert;
export type Toathuoc = typeof toathuoc.$inferSelect;
export type InsertToathuoc = typeof toathuoc.$inferInsert;

// Insert schemas for new tables
export const insertThuocSchema = createInsertSchema(thuoc).omit({
  id: true,
});

export const insertKhambenhSchema = createInsertSchema(khambenh).omit({
  id: true,
});

export const insertToathuocSchema = createInsertSchema(toathuoc).omit({
  id: true,
});

// Extended types for complex queries
export type PrescriptionWithDetails = Prescription & {
  ten_benhnhan: string;
  tuoi: number;
  medicines: (PrescriptionMedicine & { ten_thuoc: string; don_vi: string })[];
};

// Export inferred types using z.infer for consistent validation
export type InsertUserInferred = z.infer<typeof insertUserSchema>;
export type InsertMedicineInferred = z.infer<typeof insertMedicineSchema>;
export type InsertPatientInferred = z.infer<typeof insertPatientSchema>;
export type InsertPrescriptionInferred = z.infer<typeof insertPrescriptionSchema>;
export type InsertPrescriptionMedicineInferred = z.infer<typeof insertPrescriptionMedicineSchema>;
