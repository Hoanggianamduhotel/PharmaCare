import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertMedicineSchema, 
  insertPrescriptionSchema, 
  insertPatientSchema,
  insertThuocSchema,
  insertKhambenhSchema,
  insertToathuocSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Thuoc (Vietnamese) routes  
  app.get("/api/thuoc", async (req, res) => {
    try {
      const thuoc = await storage.getAllThuoc();
      res.json(thuoc);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách thuốc" });
    }
  });

  app.get("/api/thuoc/search", async (req, res) => {
    try {
      const { q = "" } = req.query;
      const thuoc = await storage.searchThuocByName(q as string);
      res.json(thuoc);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi tìm kiếm thuốc" });
    }
  });

  app.get("/api/thuoc/:id", async (req, res) => {
    try {
      const thuoc = await storage.getThuocById(req.params.id);
      if (!thuoc) {
        return res.status(404).json({ message: "Không tìm thấy thuốc" });
      }
      res.json(thuoc);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy thông tin thuốc" });
    }
  });

  app.patch("/api/thuoc/:id/stock", async (req, res) => {
    try {
      const { so_luong_ton } = req.body;
      await storage.updateThuocStock(req.params.id, so_luong_ton);
      res.json({ message: "Cập nhật tồn kho thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi cập nhật tồn kho" });
    }
  });

  // Legacy Medicine routes for compatibility
  app.get("/api/medicines", async (req, res) => {
    try {
      const thuoc = await storage.getAllThuoc();
      // Map to legacy format
      const medicines = thuoc.map(t => ({
        id: t.id,
        ten_thuoc: t.ten_thuoc,
        don_vi: t.don_vi,
        so_luong_ton: t.so_luong_ton,
        so_luong_dat_hang: 0,
        gia_nhap: 0,
        gia_ban: 0,
        duong_dung: "Uống",
        created_at: new Date()
      }));
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
    console.log("=== POST /api/medicines DEBUG ===");
    console.log("Body received:", JSON.stringify(req.body, null, 2));
    console.log("Storage type:", isUsingMemoryStorage ? "Memory" : "Supabase");
    
    try {
      // First test parsing
      console.log("Attempting to parse with schema...");
      const medicineData = insertMedicineSchema.parse(req.body);
      console.log("Parsed successfully:", JSON.stringify(medicineData, null, 2));
      
      // Then test storage
      console.log("Attempting to create medicine...");
      const medicine = await storage.createMedicine(medicineData);
      console.log("Medicine created successfully:", JSON.stringify(medicine, null, 2));
      
      res.status(201).json(medicine);
    } catch (error) {
      console.error("=== ERROR DETAILS ===");
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", (error as Error).message);
      console.error("Full error:", error);
      
      if (error instanceof z.ZodError) {
        console.error("Zod validation errors:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: error.errors });
      }
      
      res.status(500).json({ 
        message: "Lỗi khi thêm thuốc", 
        error: (error as Error).message,
        storageType: isUsingMemoryStorage ? "Memory" : "Supabase"
      });
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

  // Prescription routes (simplified placeholder)
  app.get("/api/prescriptions", async (req, res) => {
    try {
      res.json([]); // Return empty array for now
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách toa thuốc" });
    }
  });

  // Patient routes (simplified placeholder)
  app.get("/api/patients", async (req, res) => {
    try {
      res.json([]); // Return empty array for now
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách bệnh nhân" });
    }
  });

  // Statistics route
  app.get("/api/statistics", async (req, res) => {
    try {
      const thuoc = await storage.getAllThuoc();
      
      const totalMedicines = thuoc.length;
      const lowStockMedicines = thuoc.filter(t => t.so_luong_ton <= 10).length;
      const pendingPrescriptions = 0; // No prescriptions in simplified schema yet
      const totalValue = 0; // No pricing in simplified schema yet
      
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
