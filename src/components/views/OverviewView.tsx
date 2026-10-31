import React from 'react';
import {
  Users, AlertTriangle, HeartHandshake, CheckCircle2,
  TrendingUp, BarChart3, AlertCircle, Calendar, ArrowRight, ShieldCheck
} from 'lucide-react';
import { DerivedLearner, ReviewRecord } from '../../types';

interface OverviewViewProps {
  learners: DerivedLearner[];
  totalLearners: number;
  selectedWeek: number;
  reviews: Record<string, ReviewRecord>;
  onSelectLearner: (id: string) => void;
  onNavigateTab: (tab: 'learners' | 'alerts' | 'interventions' | 'audit') => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  learners,
  totalLearners,
  selectedWeek,
  reviews,
  onSelectLearner,
  onNavigateTab,
}) => {
  const alertCount = learners.filter((l) => l.alert).length;
  const confirmedCount = learners.filter(
    (l) => reviews[l.learner_id]?.confirmation === 'CONFIRMED'
  ).length;
  const activeInterventions = learners.filter(
    (l) => reviews[l.learner_id]?.intervention_status === 'IN_PROGRESS'
  ).length;

  const currentWeekMetrics = learners.map((l) => {
    const wk = l.weeks.find((w) => w.week === selectedWeek) || l.weeks[l.weeks.length - 1];
    return wk;
  });

  const avgPassRate = currentWeekMetrics.length > 0
    ? Math.round(currentWeekMetrics.reduce((sum, w) => sum + (w?.testPassRate || 0), 0) / currentWeekMetrics.length)
    : 0;

  const totalSubmissions = currentWeekMetrics.reduce((sum, w) => sum + (w?.submissions || 0), 0);

  // Weekly trend pass rates for the 6 weeks
  const weeklyAverages = [1, 2, 3, 4, 5, 6].map((wNum) => {
    const rates = learners.map((l) => l.weeks.find((w) => w.week === wNum)?.testPassRate || 0);
    const avg = rates.length > 0 ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0;
    return { week: wNum, avg };
  });

  const urgentLearners = learners
    .filter((l) => l.alert)
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Tổng quan lớp học lập trình</h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              Theo dõi bài nộp, kết quả kiểm thử và các dấu hiệu học sinh cần hỗ trợ từ dữ liệu đã nạp vào CodeCare. Giáo viên xem lý do và xác nhận trước khi can thiệp; hệ thống chưa kết nối tự động với LMS.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs text-slate-700 shrink-0">
            <Calendar className="h-4 w-4 text-sky-700" />
            <span>Mã định danh trong bộ dữ liệu</span>
            <span className="font-semibold text-slate-900">• Tuần {selectedWeek}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Learners */}
        <div
          onClick={() => onNavigateTab('learners')}
          className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-sky-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Hồ sơ người học</span>
            <div className="rounded-xl bg-sky-50 p-2 text-sky-700 group-hover:bg-sky-600 group-hover:text-white transition">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{learners.length}</span>
            <span className="text-xs text-slate-500">/{totalLearners} tổng số</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Đang chọn trong bộ lọc lớp</p>
        </div>

        {/* Card 2: Alerts Count */}
        <div
          onClick={() => onNavigateTab('alerts')}
          className="group cursor-pointer rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-xs transition hover:border-amber-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Cảnh báo sớm</span>
            <div className="rounded-xl bg-amber-100 p-2 text-amber-800 group-hover:bg-amber-600 group-hover:text-white transition">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-950">{alertCount}</span>
            <span className="text-xs font-medium text-amber-800">
              {learners.length > 0 ? Math.round((alertCount / learners.length) * 100) : 0}% nhóm đang chọn
            </span>
          </div>
          <p className="mt-1 text-xs text-amber-900/80">Cần giáo viên xem xét lý do</p>
        </div>

        {/* Card 3: Active Interventions */}
        <div
          onClick={() => onNavigateTab('interventions')}
          className="group cursor-pointer rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 shadow-xs transition hover:border-indigo-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wide">Đang can thiệp</span>
            <div className="rounded-xl bg-indigo-100 p-2 text-indigo-800 group-hover:bg-indigo-600 group-hover:text-white transition">
              <HeartHandshake className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-950">{activeInterventions}</span>
            <span className="text-xs text-indigo-700">({confirmedCount} đã xác nhận)</span>
          </div>
          <p className="mt-1 text-xs text-indigo-900/80">Tiến độ hỗ trợ đang diễn ra</p>
        </div>

        {/* Card 4: Average Test Pass */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pass test tuần {selectedWeek}</span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{avgPassRate}%</span>
            <span className="text-xs text-slate-500">TB toàn lớp</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Tổng cộng {totalSubmissions} lượt nộp bài</p>
        </div>
      </div>

      {/* Charts & Trends Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend Chart (2 columns) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-sky-700" />
                Diễn biến tỷ lệ vượt qua kiểm thử qua 6 tuần
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Biểu đồ thể hiện kết quả tổng hợp theo tuần của dữ liệu đang xem; không suy đoán nguyên nhân thay đổi.
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded text-slate-700">
              Dữ liệu theo tuần
            </span>
          </div>

          <div className="mt-6 flex items-end justify-between gap-3 h-48 pt-6 px-2 border-b border-slate-200">
            {weeklyAverages.map((item) => {
              const isSelected = item.week === selectedWeek;
              const heightPct = Math.max(10, item.avg);
              return (
                <div key={item.week} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className={`text-xs font-bold ${isSelected ? 'text-sky-700' : 'text-slate-600'}`}>
                    {item.avg}%
                  </span>
                  <div className="w-full max-w-[44px] bg-slate-100 rounded-t-lg relative overflow-hidden flex items-end h-full">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        isSelected
                          ? 'bg-sky-700 shadow-sm'
                          : item.avg >= 70 ? 'bg-emerald-500' : item.avg >= 55 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-medium ${isSelected ? 'text-sky-800 font-bold' : 'text-slate-500'}`}>
                    Tuần {item.week}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-2">
            <span>Tuần 1: Nhập xuất cơ bản</span>
            <span>Tuần 3: Vòng lặp</span>
            <span>Tuần 6: Cấu trúc & Thuật toán</span>
          </div>
        </div>

        {/* Priority Attention List (1 column) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-700" />
              Cần lưu ý ưu tiên
            </h3>
            <button
              onClick={() => onNavigateTab('alerts')}
              className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1"
            >
              Xem tất cả ({alertCount}) <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Học sinh có điểm nguy cơ cao nhất trong lớp đang chọn:
          </p>

          <div className="flex-1 space-y-2.5">
            {urgentLearners.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-xs text-slate-400">
                Không có học sinh nào ở mức cảnh báo trong lớp này.
              </div>
            ) : (
              urgentLearners.map((learner) => {
                const rev = reviews[learner.learner_id];
                return (
                  <div
                    key={learner.learner_id}
                    onClick={() => onSelectLearner(learner.learner_id)}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-sky-300 hover:bg-sky-50/50"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">{learner.name}</span>
                        <span className="text-[11px] text-slate-500">{learner.learner_id}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate max-w-[200px] mt-0.5">
                        {learner.alert_reasons[0] || 'Điểm kiểm thử thấp'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="rounded bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800">
                        {learner.risk_score}đ
                      </span>
                      {rev?.confirmation === 'CONFIRMED' && (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                          Đã duyệt
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-700" />
              Quyền quyết định thuộc về giáo viên
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
