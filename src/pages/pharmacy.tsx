import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PharmacySidebar } from "@/components/pharmacy/PharmacySidebar";
import { MedicineInventory } from "@/components/pharmacy/MedicineInventory";
import { PrescriptionManager } from "@/components/pharmacy/PrescriptionManager";
import { CharacterAssistant } from "@/components/pharmacy/CharacterAssistant";
import { AddMedicineDialog } from "@/components/pharmacy/AddMedicineDialog";
import { OrderQuantityDialog } from "@/components/pharmacy/OrderQuantityDialog";
import { PrescriptionDetailsDialog } from "@/components/pharmacy/PrescriptionDetailsDialog";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-provider";
import { Menu, Plus } from "lucide-react";
import type { Medicine, PrescriptionWithDetails } from "@shared/schema";

export default function PharmacyPage() {
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [addMedicineOpen, setAddMedicineOpen] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionWithDetails | null>(null);

  const { data: medicines = [] } = useQuery<Medicine[]>({
    queryKey: ["/api/medicines"],
  });

  const { data: prescriptions = [] } = useQuery<PrescriptionWithDetails[]>({
    queryKey: ["/api/prescriptions"],
  });

  const { data: statistics } = useQuery<{
    totalMedicines: number;
    lowStockMedicines: number;
    pendingPrescriptions: number;
    totalValue: number;
  }>({
    queryKey: ["/api/statistics"],
  });

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleEditOrderQuantity = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setOrderDialogOpen(true);
  };

  const handleViewPrescription = (prescription: PrescriptionWithDetails) => {
    setSelectedPrescription(prescription);
    setPrescriptionDialogOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 overflow-hidden`}
      >
        <PharmacySidebar
          onAddMedicine={() => setAddMedicineOpen(true)}
          onToggleTheme={toggleTheme}
          statistics={statistics}
          theme={theme}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">Kho thuốc & Toa thuốc</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Xin chào, Dược sĩ</span>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">DS</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Main content area */}
          <main className="flex-1 p-6 overflow-auto">
            <MedicineInventory
              medicines={medicines}
              onEditOrderQuantity={handleEditOrderQuantity}
            />
            <PrescriptionManager
              prescriptions={prescriptions}
              onViewPrescription={handleViewPrescription}
            />
          </main>

          {/* Character Assistant */}
          <aside className="w-80 border-l overflow-y-auto">
            <CharacterAssistant
              statistics={statistics}
              pendingPrescriptions={prescriptions.filter(p => p.trang_thai === "Chờ")}
            />
          </aside>
        </div>
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={() => setAddMedicineOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Dialogs */}
      <AddMedicineDialog
        open={addMedicineOpen}
        onOpenChange={setAddMedicineOpen}
        existingMedicines={medicines}
      />

      {selectedMedicine && (
        <OrderQuantityDialog
          open={orderDialogOpen}
          onOpenChange={setOrderDialogOpen}
          medicine={selectedMedicine}
        />
      )}

      {selectedPrescription && (
        <PrescriptionDetailsDialog
          open={prescriptionDialogOpen}
          onOpenChange={setPrescriptionDialogOpen}
          prescription={selectedPrescription}
        />
      )}
    </div>
  );
}
