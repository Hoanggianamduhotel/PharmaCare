import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PillBottle } from "lucide-react";
import type { PrescriptionWithDetails } from "@shared/schema";

interface PrescriptionManagerProps {
  prescriptions: PrescriptionWithDetails[];
  onViewPrescription: (prescription: PrescriptionWithDetails) => void;
}

export function PrescriptionManager({
  prescriptions,
  onViewPrescription,
}: PrescriptionManagerProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Chờ":
        return "secondary";
      case "Đã cấp toa":
        return "default";
      default:
        return "outline";
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
      "bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-400",
      "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
      "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
      "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const columns = [
    {
      key: "ten_benhnhan" as keyof PrescriptionWithDetails,
      label: "Tên bệnh nhân",
      render: (value: string) => (
        <div className="flex items-center">
          <Avatar className={`w-8 h-8 mr-3 ${getAvatarColor(value)}`}>
            <AvatarFallback className="text-xs">
              {value.split(" ").pop()?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "trang_thai" as keyof PrescriptionWithDetails,
      label: "Trạng thái",
      render: (value: string) => (
        <Badge variant={getStatusVariant(value)}>{value}</Badge>
      ),
    },
  ];

  return (
    <div className="prescription-section rounded-lg shadow-sm p-4 mb-6">
      <h3 className="text-lg font-medium text-purple-800 dark:text-purple-200 mb-4 flex items-center">
        <PillBottle className="mr-2 h-5 w-5" />
        Danh sách bệnh nhân chờ cấp thuốc
      </h3>

      <Card>
        <CardContent className="p-0">
          <DataTable
            data={prescriptions}
            columns={columns}
            onRowClick={onViewPrescription}
          />
        </CardContent>
      </Card>
    </div>
  );
}
