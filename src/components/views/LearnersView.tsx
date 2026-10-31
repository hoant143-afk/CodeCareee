import React, { useState, useMemo } from 'react';
import { Search, Filter, AlertTriangle, CheckCircle2, ChevronRight, UserPlus, FileSpreadsheet } from 'lucide-react';
import { DerivedLearner, ReviewRecord } from '../../types';

interface LearnersViewProps {
  learners: DerivedLearner[];
  reviews: Record<string, ReviewRecord>;
  onSelectLearner: (id: string) => void;
}

export const LearnersView: React.FC<LearnersViewProps> = ({
  learners,
  reviews,
  onSelectLearner,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'ALERT' | 'NORMAL' | 'HIGH_RISK'>('ALL');
  const [sortBy, setSortBy] = useState<'id' | 'risk_desc' | 'pass_asc'>('id');

  const filteredLearners = useMemo(() => {
    return learners
      .filter((l) => {
        const matchesSearch =
          l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.learner_id.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;

        if (riskFilter === 'ALERT') return l.alert;
        if (riskFilter === 'NORMAL') return !l.alert;
        if (riskFilter === 'HIGH_RISK') return l.risk_score >= 70;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'risk_desc') return b.risk_score - a.risk_score;
        if (sortBy === 'pass_asc') return a.avg_test_pass - b.avg_test_pass;
        return a.learner_id.localeCompare(b.learner_id);
      });
  }, [learners, searchTerm, riskFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Danh sách người học</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Quản lý hồ sơ, theo dõi bài tập và đánh giá nguy cơ của từng học sinh theo lớp học.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl px-3.5 py-2">
          <span>Đang hiển thị: {filteredLearners.length} / {learners.length} học sinh</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh hoặc mã STU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <label className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-600">
            <Filter className="h-3.5 w-3.5" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ALERT">Chỉ học sinh cảnh báo ({learners.filter(l => l.alert).length})</option>
              <option value="HIGH_RISK">Nguy cơ cao (&ge;70đ)</option>
              <option value="NORMAL">Bình thường</option>
            </select>
          </label>

          <label className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-600">
            <span className="font-medium">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none"
            >
              <option value="id">Theo mã STU (tăng dần)</option>
              <option value="risk_desc">Điểm nguy cơ (cao đến thấp)</option>
              <option value="pass_asc">Điểm test TB (thấp nhất)</option>
            </select>
          </label>
        </div>
      </div>

      {/* Learners Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
              <tr>
                <th className="p-3.5">Mã & Họ tên</th>
                <th className="p-3.5">Lớp</th>
                <th className="p-3.5">Trạng thái cảnh báo</th>
                <th className="p-3.5">Điểm nguy cơ</th>
                <th className="p-3.5">Pass test TB</th>
                <th className="p-3.5">Diễn biến 6 tuần</th>
                <th className="p-3.5">Xác nhận của GV</th>
                <th className="p-3.5 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLearners.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Không tìm thấy học sinh nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredLearners.map((learner) => {
                  const review = reviews[learner.learner_id];
                  return (
                    <tr
                      key={learner.learner_id}
                      onClick={() => onSelectLearner(learner.learner_id)}
                      className="cursor-pointer hover:bg-sky-50/40 transition"
                    >
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{learner.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{learner.learner_id}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                          {learner.class_name === 'LOP_A' ? 'Lớp A' : learner.class_name === 'LOP_B' ? 'Lớp B' : 'Lớp C'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {learner.alert ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                            <AlertTriangle className="h-3 w-3" /> Cảnh báo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                            <CheckCircle2 className="h-3 w-3" /> Bình thường
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              style={{ width: `${learner.risk_score}%` }}
                              className={`h-full ${
                                learner.risk_score >= 70 ? 'bg-rose-600' :
                                learner.risk_score >= 45 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            />
                          </div>
                          <span className="font-bold text-slate-800">{learner.risk_score}đ</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-900">{learner.avg_test_pass}%</span>
                      </td>
                      <td className="p-3.5">
                        {/* Sparkline mini bars */}
                        <div className="flex items-end gap-1 h-6">
                          {learner.weekly_pass_rates.map((rate, idx) => (
                            <div
                              key={idx}
                              title={`Tuần ${idx + 1}: ${rate}%`}
                              style={{ height: `${Math.max(15, (rate / 100) * 24)}px` }}
                              className={`w-2 rounded-t-xs ${
                                rate >= 70 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="p-3.5">
                        {review?.confirmation === 'CONFIRMED' ? (
                          <span className="rounded bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-semibold text-rose-800">
                            Đã xác nhận ({review.intervention_status || 'PENDING'})
                          </span>
                        ) : review?.confirmation === 'REJECTED' ? (
                          <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                            Đã bác bỏ
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Chưa đánh giá</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <ChevronRight className="inline-block h-4 w-4 text-slate-400" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
