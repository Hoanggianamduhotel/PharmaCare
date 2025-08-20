interface StatisticsBoardProps {
  statistics?: {
    totalMedicines: number;
    lowStockMedicines: number;
    pendingPrescriptions: number;
    totalValue: number;
  };
}

export function StatisticsBoard({ statistics }: StatisticsBoardProps) {
  if (!statistics) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Thống kê</h3>
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Thống kê</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Tổng thuốc:</span>
          <span className="font-semibold text-primary">{statistics.totalMedicines}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Sắp hết:</span>
          <span className="font-semibold text-orange-500">{statistics.lowStockMedicines}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Toa chờ:</span>
          <span className="font-semibold text-green-600">{statistics.pendingPrescriptions}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Tổng giá trị:</span>
          <span className="font-semibold text-primary">
            {statistics.totalValue.toLocaleString()} VNĐ
          </span>
        </div>
      </div>
    </div>
  );
}
