import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Pill, PillBottle, Droplet } from "lucide-react";
import type { Medicine } from "@shared/schema";

interface MedicineInventoryProps {
  medicines: Medicine[];
  onEditOrderQuantity: (medicine: Medicine) => void;
}

export function MedicineInventory({
  medicines,
  onEditOrderQuantity,
}: MedicineInventoryProps) {
  const getMedicineIcon = (tenThuoc: string) => {
    if (tenThuoc.toLowerCase().includes("vitamin") || tenThuoc.toLowerCase().includes("sủi")) {
      return <Droplet className="h-4 w-4 text-blue-500" />;
    }
    if (tenThuoc.toLowerCase().includes("capsule") || tenThuoc.toLowerCase().includes("amoxicillin")) {
      return <PillBottle className="h-4 w-4 text-green-500" />;
    }
    return <Pill className="h-4 w-4 text-primary" />;
  };

  const columns = [
    {
      key: "ten_thuoc" as keyof Medicine,
      label: "Tên thuốc",
      render: (value: string, item: Medicine) => (
        <div className="flex items-center">
          {getMedicineIcon(value)}
          <span className="ml-2 font-medium">{value}</span>
          {item.so_luong_ton <= item.so_luong_dat_hang && (
            <Badge variant="destructive" className="ml-2 text-xs">
              Sắp hết
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "don_vi" as keyof Medicine,
      label: "Đơn vị",
    },
    {
      key: "so_luong_ton" as keyof Medicine,
      label: "Tồn kho",
      render: (value: number, item: Medicine) => (
        <Badge
          variant={item.so_luong_ton <= item.so_luong_dat_hang ? "destructive" : "secondary"}
        >
          {value}
        </Badge>
      ),
      className: "text-right",
    },
    {
      key: "gia_nhap" as keyof Medicine,
      label: "Giá nhập",
      render: (value: number) => `${value.toLocaleString()} VNĐ`,
      className: "text-right",
    },
    {
      key: "gia_ban" as keyof Medicine,
      label: "Giá bán",
      render: (value: number) => (
        <span className="font-medium">{value.toLocaleString()} VNĐ</span>
      ),
      className: "text-right",
    },
    {
      key: "so_luong_dat_hang" as keyof Medicine,
      label: "Đặt hàng",
      render: (value: number, item: Medicine) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEditOrderQuantity(item);
          }}
          className="h-8 px-2"
        >
          {value}
        </Button>
      ),
      className: "text-right",
    },
    {
      key: "duong_dung" as keyof Medicine,
      label: "Đường dùng",
    },
    {
      key: "id" as keyof Medicine,
      label: "Thao tác",
      render: (_: string, item: Medicine) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onEditOrderQuantity(item);
          }}
          className="h-8 w-8"
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
      className: "text-center",
    },
  ];

  const getRowClassName = (item: Medicine) => {
    return item.so_luong_ton <= item.so_luong_dat_hang ? "low-stock-row" : "";
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Danh sách thuốc trong kho
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          data={medicines}
          columns={columns}
          getRowClassName={getRowClassName}
        />
      </CardContent>
    </Card>
  );
}
