import React, { useState } from "react";
import { Plus, Search, Package, AlertTriangle, Menu } from "lucide-react";

// Mock data for demo
const mockMedicines = [
  {
    id: "1",
    ten_thuoc: "Paracetamol 500mg",
    hoat_chat: "Paracetamol",
    ham_luong: "500mg",
    dang_bao_che: "Viên nén",
    quy_cach_dong_goi: "Hộp 100 viên",
    don_vi_tinh: "Viên",
    so_luong_ton_kho: 150,
    so_luong_dat_hang: 0,
    gia_mua_vao: 1200,
    gia_ban_le: 1500,
    duong_dung: "Uống"
  },
  {
    id: "2", 
    ten_thuoc: "Amoxicillin 250mg",
    hoat_chat: "Amoxicillin",
    ham_luong: "250mg",
    dang_bao_che: "Viên nang",
    quy_cach_dong_goi: "Hộp 50 viên",
    don_vi_tinh: "Viên",
    so_luong_ton_kho: 8,
    so_luong_dat_hang: 50,
    gia_mua_vao: 2800,
    gia_ban_le: 3500,
    duong_dung: "Uống"
  },
  {
    id: "3",
    ten_thuoc: "Vitamin C 1000mg",
    hoat_chat: "Acid ascorbic",
    ham_luong: "1000mg",
    dang_bao_che: "Viên sủi",
    quy_cach_dong_goi: "Hộp 20 viên",
    don_vi_tinh: "Viên",
    so_luong_ton_kho: 75,
    so_luong_dat_hang: 0,
    gia_mua_vao: 3200,
    gia_ban_le: 4000,
    duong_dung: "Uống"
  }
];

export default function PharmacyPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const filteredMedicines = mockMedicines.filter(medicine =>
    medicine.ten_thuoc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.hoat_chat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <div className="flex items-center p-2 bg-blue-100 rounded text-blue-700">
              <Plus className="w-5 h-5" />
              {sidebarOpen && <span className="ml-3">Thêm thuốc</span>}
            </div>
            <div className="flex items-center p-2 hover:bg-gray-100 rounded">
              <Package className="w-5 h-5" />
              {sidebarOpen && <span className="ml-3">Kho thuốc & Toa thuốc</span>}
            </div>
            <div className="flex items-center p-2 hover:bg-gray-100 rounded">
              <AlertTriangle className="w-5 h-5" />
              {sidebarOpen && <span className="ml-3">Chế độ tối</span>}
            </div>
          </div>
        </nav>
        
        <div className="p-4 border-t">
          {sidebarOpen && (
            <div>
              <p className="text-sm text-gray-600">Xin chào, Dược sĩ</p>
              <p className="text-xs text-gray-500">DS</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Quản lý Dược sĩ</h1>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Thêm thuốc
            </button>
          </div>
        </header>

        <div className="flex-1 p-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng thuốc</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hết hàng</p>
                  <p className="text-2xl font-bold text-red-500">1</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng tồn kho</p>
                  <p className="text-2xl font-bold">233</p>
                </div>
                <Package className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Trạng thái</p>
                  <p className="text-2xl font-bold text-green-500">Demo</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm thuốc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Medicine List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Danh sách thuốc trong kho</h2>
              <p className="text-sm text-gray-600 mt-1">
                Tên thuốc • Đơn vị • Tồn kho • Giá nhập • Giá bán • Đặt hàng • Đường dùng • Thao tác
              </p>
            </div>
            
            <div className="p-6">
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
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        medicine.so_luong_ton_kho < 10 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {medicine.so_luong_ton_kho}
                      </span>
                      <span className="min-w-20">{medicine.gia_mua_vao.toLocaleString()}đ</span>
                      <span className="min-w-20">{medicine.gia_ban_le.toLocaleString()}đ</span>
                      <span className="min-w-16">{medicine.so_luong_dat_hang}</span>
                      <span className="min-w-24 text-xs">{medicine.duong_dung}</span>
                      <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50">
                        Sửa
                      </button>
                    </div>
                  </div>
                ))}
                
                {filteredMedicines.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? "Không tìm thấy thuốc nào" : "Không có dữ liệu"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}