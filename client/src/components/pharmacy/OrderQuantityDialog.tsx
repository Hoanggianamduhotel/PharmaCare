import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Medicine } from "@shared/schema";

interface OrderQuantityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicine: Medicine;
}

export function OrderQuantityDialog({
  open,
  onOpenChange,
  medicine,
}: OrderQuantityDialogProps) {
  const [quantity, setQuantity] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (newQuantity: number) => {
      const response = await apiRequest("PATCH", `/api/medicines/${medicine.id}`, {
        so_luong_dat_hang: newQuantity,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật số lượng đặt hàng thành công!",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật số lượng đặt hàng",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const numericQuantity = quantity === "" ? 0 : Number(quantity);
    updateMutation.mutate(numericQuantity);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa số lượng đặt hàng</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Thuốc: <strong>{medicine.ten_thuoc}</strong>
          </p>

          <div className="space-y-2">
            <Label htmlFor="quantity">Số lượng đặt hàng</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              placeholder=""
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
