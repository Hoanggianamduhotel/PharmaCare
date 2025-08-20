import { Button } from "@/components/ui/button";
import { StatisticsBoard } from "./StatisticsBoard";
import { Pill, Plus, Moon, Sun, LogOut } from "lucide-react";

interface PharmacySidebarProps {
  onAddMedicine: () => void;
  onToggleTheme: () => void;
  statistics?: any;
  theme: string;
}

export function PharmacySidebar({
  onAddMedicine,
  onToggleTheme,
  statistics,
  theme,
}: PharmacySidebarProps) {
  const handleLogout = () => {
    alert("Đăng xuất thành công!");
  };

  return (
    <div className="w-64 bg-card border-r h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-primary flex items-center">
          <Pill className="mr-2 h-6 w-6" />
          Quản lý Dược sĩ
        </h1>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1">
        <ul className="space-y-1">
          <li>
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-3"
              onClick={onAddMedicine}
            >
              <Plus className="mr-3 h-4 w-4 text-primary" />
              Thêm thuốc
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-3"
              onClick={onToggleTheme}
            >
              {theme === "light" ? (
                <Moon className="mr-3 h-4 w-4" />
              ) : (
                <Sun className="mr-3 h-4 w-4" />
              )}
              {theme === "light" ? "Chế độ tối" : "Chế độ sáng"}
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-3 text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Đăng xuất
            </Button>
          </li>
        </ul>
      </nav>

      {/* Statistics */}
      <div className="p-4 border-t">
        <StatisticsBoard statistics={statistics} />
      </div>
    </div>
  );
}
