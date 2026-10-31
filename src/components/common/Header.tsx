import React from 'react';
import { Bell, UserRound } from 'lucide-react';
import { ClassName } from '../../types';

interface HeaderProps {
  selectedClass: 'ALL' | ClassName;
  onClassChange: (className: 'ALL' | ClassName) => void;
  selectedWeek: number;
  onWeekChange: (week: number) => void;
  unreviewedAlertsCount: number;
  onOpenAlerts: () => void;
  showWeekFilter?: boolean;
  classCounts?: Record<ClassName, number>;
  totalLearners?: number;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedClass, onClassChange, selectedWeek, onWeekChange,
  unreviewedAlertsCount, onOpenAlerts, showWeekFilter = true,
  classCounts, totalLearners, onLogout,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-900 text-lg font-bold text-white">C</div>
          <div>
            <div className="text-lg font-bold text-slate-900">CodeCare</div>
            <p className="text-xs text-slate-500">Theo dõi và hỗ trợ học sinh học lập trình</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
            <span className="font-medium text-slate-600">Lớp</span>
            <select
              aria-label="Lọc theo lớp"
              value={selectedClass}
              onChange={(e) => onClassChange(e.target.value as 'ALL' | ClassName)}
              className="max-w-40 rounded bg-white px-2 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600"
            >
              <option value="ALL">Tất cả ({totalLearners ?? '…'})</option>
              <option value="LOP_A">Lớp A ({classCounts?.LOP_A ?? '…'})</option>
              <option value="LOP_B">Lớp B ({classCounts?.LOP_B ?? '…'})</option>
              <option value="LOP_C">Lớp C ({classCounts?.LOP_C ?? '…'})</option>
            </select>
          </label>
          {showWeekFilter && (
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
              <span className="font-medium text-slate-600">Lịch sử tuần</span>
              <select
                aria-label="Chọn tuần xem trên trang tổng quan"
                value={selectedWeek}
                onChange={(e) => onWeekChange(Number(e.target.value))}
                className="rounded bg-white px-2 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600"
              >
                {[6, 5, 4, 3, 2, 1].map((wk) => <option value={wk} key={wk}>Tuần {wk}</option>)}
              </select>
            </label>
          )}
          <span className="rounded-md bg-amber-50 px-2 py-1.5 font-medium text-amber-900" title="Dữ liệu mẫu có sẵn trong ứng dụng">
            Dữ liệu lưu trên trình duyệt
          </span>
          <button
            type="button"
            onClick={onOpenAlerts}
            aria-label={`Xem cảnh báo chưa xử lý: ${unreviewedAlertsCount}`}
            className="relative rounded-lg bg-slate-100 p-2.5 text-slate-700 hover:bg-slate-200"
          >
            <Bell className="h-4 w-4" />
            {unreviewedAlertsCount > 0 && (
              <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-amber-700 px-1 text-center text-[10px] font-bold text-white">{unreviewedAlertsCount}</span>
            )}
          </button>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-2 text-slate-600">
            <UserRound className="h-4 w-4" />
            <span className="hidden sm:inline">Giáo viên (demo)</span>
            <button
              onClick={onLogout}
              className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-800 px-2 py-1 rounded ml-1"
            >
              Thoát
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
