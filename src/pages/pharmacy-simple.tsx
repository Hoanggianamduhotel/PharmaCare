import React, { useState } from "react";
import { Plus, Search, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useThuoc, useThuocStats } from "@/hooks/useThuoc";

export default function PharmacyPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: medicines = [], isLoading: medicinesLoading } = useThuoc();
  const { data: statistics, isLoading: statsLoading } = useThuocStats();

  const filteredMedicines = medicines.filter(medicine =>
    medicine.ten_thuoc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.hoat_chat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Dược sĩ</h1>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Thêm thuốc
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng thuốc</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : statistics?.totalMedicines || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hết hàng</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {statsLoading ? "..." : statistics?.lowStockMedicines || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng tồn kho</CardTitle>
              <Package className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : statistics?.totalStock || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trạng thái</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">Hoạt động</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm thuốc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Medicine List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách thuốc trong kho</CardTitle>
            <CardDescription>
              Tên thuốc • Đơn vị • Tồn kho • Giá nhập • Giá bán • Đặt hàng • Đường dùng • Thao tác
            </CardDescription>
          </CardHeader>
          <CardContent>
            {medicinesLoading ? (
              <div className="text-center py-8">Đang tải...</div>
            ) : (
              <div className="space-y-4">
                {filteredMedicines.map((medicine) => (
                  <div
                    key={medicine.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1 space-y-1">
                      <h3 className="font-medium">{medicine.ten_thuoc}</h3>
                      <p className="text-sm text-gray-500">
                        {medicine.hoat_chat} • {medicine.ham_luong}
                      </p>
                      <p className="text-xs text-gray-400">
                        {medicine.dang_bao_che} • {medicine.quy_cach_dong_goi}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="min-w-16">{medicine.don_vi_tinh}</span>
                      <Badge variant={medicine.so_luong_ton_kho < 10 ? "destructive" : "secondary"}>
                        {medicine.so_luong_ton_kho}
                      </Badge>
                      <span className="min-w-20">{medicine.gia_mua_vao.toLocaleString()}đ</span>
                      <span className="min-w-20">{medicine.gia_ban_le.toLocaleString()}đ</span>
                      <span className="min-w-16">{medicine.so_luong_dat_hang}</span>
                      <span className="min-w-24 text-xs">{medicine.duong_dung}</span>
                      <Button size="sm" variant="outline">Sửa</Button>
                    </div>
                  </div>
                ))}
                
                {filteredMedicines.length === 0 && !medicinesLoading && (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? "Không tìm thấy thuốc nào" : "Không có dữ liệu"}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}