import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Medicine } from "@shared/schema";

const medicineSchema = z.object({
  ten_thuoc: z.string().min(1, "Tên thuốc không được để trống"),
  don_vi: z.string().min(1, "Đơn vị không được để trống"),
  so_luong_ton: z.number().min(0, "Số lượng tồn phải >= 0").or(z.undefined()),
  gia_nhap: z.number().min(0, "Giá nhập phải >= 0").or(z.undefined()),
  gia_ban: z.number().min(0, "Giá bán phải >= 0").or(z.undefined()),
  so_luong_dat_hang: z.number().min(0, "Số lượng đặt hàng phải >= 0").or(z.undefined()),
  duong_dung: z.string().min(1, "Đường dùng không được để trống"),
});

interface AddMedicineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingMedicines: Medicine[];
}

export function AddMedicineDialog({
  open,
  onOpenChange,
  existingMedicines,
}: AddMedicineDialogProps) {
  const [tab, setTab] = useState("new");
  const [selectedExistingMedicine, setSelectedExistingMedicine] = useState<Medicine | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Refs for keyboard navigation
  const tenThuocRef = useRef<HTMLInputElement>(null);
  const donViRef = useRef<HTMLInputElement>(null);
  const soLuongTonRef = useRef<HTMLInputElement>(null);
  const soLuongDatHangRef = useRef<HTMLInputElement>(null);
  const giaNhapRef = useRef<HTMLInputElement>(null);
  const giaBanRef = useRef<HTMLInputElement>(null);
  const duongDungRef = useRef<HTMLInputElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  const form = useForm<z.infer<typeof medicineSchema>>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      ten_thuoc: "",
      don_vi: "",
      so_luong_ton: undefined,
      gia_nhap: undefined,
      gia_ban: undefined,
      so_luong_dat_hang: undefined,
      duong_dung: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof medicineSchema>) => {
      // Handle undefined values by converting to 0 for API
      const processedData = {
        ...data,
        so_luong_ton: data.so_luong_ton ?? 0,
        gia_nhap: data.gia_nhap ?? 0,
        gia_ban: data.gia_ban ?? 0,
        so_luong_dat_hang: data.so_luong_dat_hang ?? 0,
      };
      const response = await apiRequest("POST", "/api/medicines", processedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({
        title: "Thành công",
        description: "Đã thêm thuốc mới thành công!",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi thêm thuốc",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updateData: Partial<z.infer<typeof medicineSchema>> }) => {
      const response = await apiRequest("PATCH", `/api/medicines/${data.id}`, data.updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật thuốc thành công!",
      });
      onOpenChange(false);
      form.reset();
      setSelectedExistingMedicine(null);
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật thuốc",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof medicineSchema>) => {
    if (tab === "new") {
      createMutation.mutate(data);
    } else if (selectedExistingMedicine) {
      const updateData: Partial<z.infer<typeof medicineSchema>> = {};
      
      // Only update fields that have changed
      if (data.so_luong_ton && data.so_luong_ton > 0) {
        updateData.so_luong_ton = selectedExistingMedicine.so_luong_ton + data.so_luong_ton;
      }
      if (data.gia_nhap && data.gia_nhap > 0) updateData.gia_nhap = data.gia_nhap;
      if (data.gia_ban && data.gia_ban > 0) updateData.gia_ban = data.gia_ban;
      if (data.so_luong_dat_hang && data.so_luong_dat_hang > 0) updateData.so_luong_dat_hang = data.so_luong_dat_hang;
      if (data.duong_dung) updateData.duong_dung = data.duong_dung;

      updateMutation.mutate({
        id: selectedExistingMedicine.id,
        updateData,
      });
    }
  };

  const handleExistingMedicineSelect = (medicineId: string) => {
    const medicine = existingMedicines.find(m => m.id === medicineId);
    if (medicine) {
      setSelectedExistingMedicine(medicine);
      form.setValue("ten_thuoc", medicine.ten_thuoc);
      form.setValue("don_vi", medicine.don_vi);
      form.setValue("duong_dung", medicine.duong_dung);
    }
  };

  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    form.reset();
    setSelectedExistingMedicine(null);
  };

  // Handle Enter key navigation
  const handleKeyDown = (e: React.KeyboardEvent, nextRef?: React.RefObject<HTMLInputElement | HTMLButtonElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      } else {
        // If no next ref, submit form
        form.handleSubmit(onSubmit)();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nhập thông tin thuốc</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={handleTabChange} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new">Thuốc mới</TabsTrigger>
            <TabsTrigger value="existing">Thuốc cũ</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <TabsContent value="new" className="space-y-4 mt-0">
                <FormField
                  control={form.control}
                  name="ten_thuoc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên thuốc *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nhập tên thuốc" 
                          {...field}
                          ref={tenThuocRef}
                          onKeyDown={(e) => handleKeyDown(e, donViRef)}
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="existing" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tên thuốc (cũ)</label>
                  <Select onValueChange={handleExistingMedicineSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn thuốc có sẵn" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingMedicines.map((medicine) => (
                        <SelectItem key={medicine.id} value={medicine.id}>
                          {medicine.ten_thuoc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <FormField
                control={form.control}
                name="don_vi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đơn vị *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Viên, ml, gói..."
                        {...field}
                        ref={donViRef}
                        onKeyDown={(e) => handleKeyDown(e, soLuongTonRef)}
                        disabled={tab === "existing" && !!selectedExistingMedicine}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="so_luong_ton"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {tab === "existing" ? "Số lượng nhập thêm" : "Số lượng tồn"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder=""
                          {...field}
                          ref={soLuongTonRef}
                          onKeyDown={(e) => handleKeyDown(e, soLuongDatHangRef)}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="so_luong_dat_hang"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lượng đặt hàng</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder=""
                          {...field}
                          ref={soLuongDatHangRef}
                          onKeyDown={(e) => handleKeyDown(e, giaNhapRef)}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gia_nhap"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá nhập (VNĐ)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder=""
                          {...field}
                          ref={giaNhapRef}
                          onKeyDown={(e) => handleKeyDown(e, giaBanRef)}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gia_ban"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá bán (VNĐ)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder=""
                          {...field}
                          ref={giaBanRef}
                          onKeyDown={(e) => handleKeyDown(e, duongDungRef)}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="duong_dung"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đường dùng *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Uống, tiêm, bôi ngoài da..."
                        {...field}
                        ref={duongDungRef}
                        onKeyDown={(e) => handleKeyDown(e, saveButtonRef)}
                        disabled={tab === "existing" && !!selectedExistingMedicine}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  ref={saveButtonRef}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? "Đang lưu..." : "Lưu thuốc"}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
