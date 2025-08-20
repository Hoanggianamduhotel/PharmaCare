import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMedicineSchema, insertPrescriptionSchema, insertPatientSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Medicine routes
  app.get("/api/medicines", async (req, res) => {
    try {
      const medicines = await storage.getMedicines();
      res.json(medicines);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách thuốc" });
    }
  });

  app.get("/api/medicines/:id", async (req, res) => {
    try {
      const medicine = await storage.getMedicine(req.params.id);
      if (!medicine) {
        return res.status(404).json({ message: "Không tìm thấy thuốc" });
      }
      res.json(medicine);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy thông tin thuốc" });
    }
  });

  app.post("/api/medicines", async (req, res) => {
    try {
      const medicineData = insertMedicineSchema.parse(req.body);
      const medicine = await storage.createMedicine(medicineData);
      res.status(201).json(medicine);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: error.errors });
      }
      res.status(500).json({ message: "Lỗi khi thêm thuốc" });
    }
  });

  app.patch("/api/medicines/:id", async (req, res) => {
    try {
      const updateData = insertMedicineSchema.partial().parse(req.body);
      const medicine = await storage.updateMedicine(req.params.id, updateData);
      if (!medicine) {
        return res.status(404).json({ message: "Không tìm thấy thuốc" });
      }
      res.json(medicine);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: error.errors });
      }
      res.status(500).json({ message: "Lỗi khi cập nhật thuốc" });
    }
  });

  app.delete("/api/medicines/:id", async (req, res) => {
    try {
      const success = await storage.deleteMedicine(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Không tìm thấy thuốc" });
      }
      res.json({ message: "Đã xóa thuốc thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi xóa thuốc" });
    }
  });

  // Prescription routes
  app.get("/api/prescriptions", async (req, res) => {
    try {
      const prescriptions = await storage.getPrescriptions();
      res.json(prescriptions);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách toa thuốc" });
    }
  });

  app.get("/api/prescriptions/:id", async (req, res) => {
    try {
      const prescription = await storage.getPrescription(req.params.id);
      if (!prescription) {
        return res.status(404).json({ message: "Không tìm thấy toa thuốc" });
      }
      res.json(prescription);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy thông tin toa thuốc" });
    }
  });

  app.patch("/api/prescriptions/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || typeof status !== "string") {
        return res.status(400).json({ message: "Trạng thái không hợp lệ" });
      }
      
      const prescription = await storage.updatePrescriptionStatus(req.params.id, status);
      if (!prescription) {
        return res.status(404).json({ message: "Không tìm thấy toa thuốc" });
      }
      res.json(prescription);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi cập nhật trạng thái toa thuốc" });
    }
  });

  // Patient routes
  app.get("/api/patients", async (req, res) => {
    try {
      const patients = await storage.getPatients();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách bệnh nhân" });
    }
  });

  app.post("/api/patients", async (req, res) => {
    try {
      const patientData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(patientData);
      res.status(201).json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: error.errors });
      }
      res.status(500).json({ message: "Lỗi khi thêm bệnh nhân" });
    }
  });

  // Statistics route
  app.get("/api/statistics", async (req, res) => {
    try {
      const medicines = await storage.getMedicines();
      const prescriptions = await storage.getPrescriptions();
      
      const totalMedicines = medicines.length;
      const lowStockMedicines = medicines.filter(m => m.so_luong_ton <= m.so_luong_dat_hang).length;
      const pendingPrescriptions = prescriptions.filter(p => p.trang_thai === "Chờ").length;
      const totalValue = medicines.reduce((sum, m) => sum + (m.so_luong_ton * m.gia_ban), 0);
      
      res.json({
        totalMedicines,
        lowStockMedicines,
        pendingPrescriptions,
        totalValue
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy thống kê" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
