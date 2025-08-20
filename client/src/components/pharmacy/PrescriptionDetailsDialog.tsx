import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Pill, PillBottle, Droplet } from "lucide-react";
import type { PrescriptionWithDetails } from "@shared/schema";

interface PrescriptionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescription: PrescriptionWithDetails;
}

export function PrescriptionDetailsDialog({
  open,
  onOpenChange,
  prescription,
}: PrescriptionDetailsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await apiRequest("PATCH", `/api/prescriptions/${prescription.id}/status`, {
        status,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái toa thuốc thành công!",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật trạng thái",
        variant: "destructive",
      });
    },
  });

  const getMedicineIcon = (tenThuoc: string) => {
    if (tenThuoc.toLowerCase().includes("vitamin") || tenThuoc.toLowerCase().includes("sủi")) {
      return <Droplet className="h-4 w-4 text-blue-500" />;
    }
    if (tenThuoc.toLowerCase().includes("capsule") || tenThuoc.toLowerCase().includes("amoxicillin")) {
      return <PillBottle className="h-4 w-4 text-green-500" />;
    }
    return <Pill className="h-4 w-4 text-primary" />;
  };

  const handleMarkAsDispensed = () => {
    updateStatusMutation.mutate("Đã cấp toa");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Toa thuốc của: {prescription.ten_benhnhan}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Information Card */}
          <Card className="bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Thông tin khám bệnh
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Chẩn đoán:</strong> {prescription.chan_doan}
                </p>
                <p>
                  <strong>Ngày khám:</strong> {prescription.ngaytoa}
                </p>
                <p>
                  <strong>Bác sĩ:</strong> {prescription.ten_bac_si}
                </p>
                <p className="flex items-center gap-2">
                  <strong>Trạng thái:</strong>
                  <Badge
                    variant={prescription.trang_thai === "Chờ" ? "secondary" : "default"}
                  >
                    {prescription.trang_thai}
                  </Badge>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Prescription Medicines */}
          <div>
            <h4 className="font-medium mb-4">Danh sách thuốc</h4>
            <div className="space-y-3">
              {prescription.medicines.map((medicine) => (
                <Card key={medicine.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium flex items-center gap-2">
                          {getMedicineIcon(medicine.ten_thuoc)}
                          {medicine.ten_thuoc}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {medicine.don_vi} - {medicine.so_lan_dung} lần -{" "}
                          {medicine.so_luong_moi_lan} mỗi lần
                        </p>
                        <p className="text-sm font-medium text-primary">
                          Tổng: {medicine.tong_so_luong} {medicine.don_vi}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateStatusMutation.isPending}
            >
              Đóng
            </Button>
            {prescription.trang_thai === "Chờ" && (
              <Button
                onClick={handleMarkAsDispensed}
                disabled={updateStatusMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {updateStatusMutation.isPending ? "Đang cập nhật..." : "Đã phát thuốc"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
