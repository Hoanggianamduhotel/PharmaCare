import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserRound, Info, AlertTriangle, CheckCircle, Star } from "lucide-react";
import type { PrescriptionWithDetails } from "@shared/schema";

interface CharacterAssistantProps {
  statistics?: {
    totalMedicines: number;
    lowStockMedicines: number;
    pendingPrescriptions: number;
    totalValue: number;
  };
  pendingPrescriptions: PrescriptionWithDetails[];
}

export function CharacterAssistant({
  statistics,
  pendingPrescriptions,
}: CharacterAssistantProps) {
  const pendingCount = pendingPrescriptions.length;
  const lowStockCount = statistics?.lowStockMedicines || 0;

  return (
    <div className="p-4 space-y-6">
      {/* Character Avatar */}
      <div className="text-center">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-3">
          <UserRound className="h-12 w-12 text-white" />
        </div>
        <h3 className="font-medium">Trợ lý dược sĩ</h3>
        <p className="text-sm text-muted-foreground">Luôn sẵn sàng hỗ trợ bạn!</p>
      </div>

      {/* Notifications */}
      <div className="space-y-4">
        {pendingCount > 0 && (
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center">
                <Info className="mr-2 h-4 w-4" />
                Có {pendingCount} toa thuốc mới cần cấp!
              </p>
            </CardContent>
          </Card>
        )}

        {lowStockCount > 0 && (
          <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-3">
              <p className="text-sm text-orange-800 dark:text-orange-200 flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4" />
                {lowStockCount} loại thuốc sắp hết hàng
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-3">
            <p className="text-sm text-green-800 dark:text-green-200 flex items-center">
              <CheckCircle className="mr-2 h-4 w-4" />
              Hệ thống hoạt động bình thường
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Pending Prescriptions */}
      {pendingCount > 0 && (
        <div>
          <h4 className="font-medium mb-3 text-sm">Toa thuốc chờ cấp gần đây</h4>
          <div className="space-y-2">
            {pendingPrescriptions.slice(0, 3).map((prescription) => (
              <Card key={prescription.id} className="bg-muted/50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {prescription.ten_benhnhan}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {prescription.trang_thai}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {prescription.chan_doan}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Rotating Banner */}
      <Card className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
        <CardContent className="p-4 text-center">
          <Star className="h-6 w-6 mx-auto mb-2" />
          <p className="text-sm font-medium">Thông báo hệ thống</p>
          <p className="text-xs mt-1 opacity-90">Cập nhật phần mềm mới nhất</p>
        </CardContent>
      </Card>
    </div>
  );
}
