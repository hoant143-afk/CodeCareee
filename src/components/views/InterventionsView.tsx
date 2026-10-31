import React, { useState } from 'react';
import {
  HeartHandshake, CheckCircle2, Clock, AlertCircle,
  Plus, Edit3, ArrowRight, UserCheck, Calendar
} from 'lucide-react';
import { DerivedLearner, ReviewRecord, InterventionStatus } from '../../types';

interface InterventionsViewProps {
  learners: DerivedLearner[];
  reviews: Record<string, ReviewRecord>;
  onSelectLearner: (id: string) => void;
  onUpdateInterventionStatus: (id: string, status: InterventionStatus) => void;
}

export const InterventionsView: React.FC<InterventionsViewProps> = ({
  learners,
  reviews,
  onSelectLearner,
  onUpdateInterventionStatus,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | InterventionStatus>('ALL');

  // Learners with active or recorded interventions
  const intervenedLearners = learners.filter((l) => {
    const rev = reviews[l.learner_id];
    return rev && rev.intervention_status && rev.intervention_status !== 'NONE';
  });

  const displayedList = intervenedLearners.filter((l) => {
    if (statusFilter === 'ALL') return true;
    return reviews[l.learner_id]?.intervention_status === statusFilter;
  });

  const inProgressCount = intervenedLearners.filter(
    (l) => reviews[l.learner_id]?.intervention_status === 'IN_PROGRESS'
  ).length;

  const resolvedCount = intervenedLearners.filter(
    (l) => reviews[l.learner_id]?.intervention_status === 'RESOLVED'
  ).length;

  const pendingCount = intervenedLearners.filter(
    (l) => reviews[l.learner_id]?.intervention_status === 'PENDING'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Hỗ trợ học sinh (Can thiệp sư phạm)</h1>
            <span className="rounded-full bg-indigo-700 px-2.5 py-0.5 text-xs font-bold text-white">
              {inProgressCount} đang diễn ra
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl">
            Theo dõi kế hoạch kèm cặp, phụ đạo cú pháp và tiến độ cải thiện của học sinh sau khi giáo viên xác nhận cảnh báo.
          </p>
        </div>

        {/* Stats Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex rounded-xl bg-white p-1 border border-indigo-200">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                statusFilter === 'ALL' ? 'bg-indigo-700 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({intervenedLearners.length})
            </button>
            <button
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                statusFilter === 'IN_PROGRESS' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đang làm ({inProgressCount})
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                statusFilter === 'PENDING' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chờ xếp lịch ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('RESOLVED')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                statusFilter === 'RESOLVED' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đã hoàn thành ({resolvedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Interventions List */}
      <div className="space-y-4">
        {displayedList.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <HeartHandshake className="mx-auto h-12 w-12 text-indigo-400" />
            <h3 className="mt-3 text-base font-bold text-slate-900">Chưa có kế hoạch hỗ trợ nào trong mục này</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              Khi bạn bấm "Xác nhận cần hỗ trợ" ở mục Cảnh báo hoặc trong Hồ sơ người học, các kế hoạch hỗ trợ sẽ xuất hiện tại đây.
            </p>
          </div>
        ) : (
          displayedList.map((learner) => {
            const rev = reviews[learner.learner_id]!;
            const status = rev.intervention_status || 'PENDING';

            return (
              <div
                key={learner.learner_id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-slate-900">{learner.name}</span>
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {learner.learner_id}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-800">
                        {learner.class_name === 'LOP_A' ? 'Lớp A' : learner.class_name === 'LOP_B' ? 'Lớp B' : 'Lớp C'}
                      </span>
                      <span className={`rounded-md px-2.5 py-0.5 text-xs font-bold ${
                        status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-900' :
                        status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-900' :
                        status === 'STOPPED' ? 'bg-slate-200 text-slate-700' : 'bg-sky-100 text-sky-900'
                      }`}>
                        {status === 'IN_PROGRESS' ? 'Đang can thiệp' :
                         status === 'RESOLVED' ? 'Đã hoàn thành' :
                         status === 'STOPPED' ? 'Tạm dừng' : 'Đang chờ'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                        <span className="text-slate-500">Hình thức hỗ trợ:</span>
                        <div className="font-semibold text-slate-900 mt-0.5">
                          {rev.intervention_type || 'Hỗ trợ trực tiếp trên lớp'}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                        <span className="text-slate-500">Ngày bắt đầu:</span>
                        <div className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-500" />
                          {rev.intervention_date || 'Chưa ghi nhận'}
                        </div>
                      </div>
                    </div>

                    {rev.notes && (
                      <div className="text-xs text-slate-700 bg-indigo-50/50 border border-indigo-100 rounded-xl p-3">
                        <span className="font-bold text-indigo-950">Ghi chú của giáo viên: </span>
                        {rev.notes}
                      </div>
                    )}

                    {rev.intervention_outcome && (
                      <div className="text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                        <span className="font-bold text-emerald-950">Kết quả tiến bộ: </span>
                        {rev.intervention_outcome}
                      </div>
                    )}
                  </div>

                  {/* Status update buttons */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2 shrink-0">
                    <div className="flex flex-wrap gap-1.5">
                      {status !== 'IN_PROGRESS' && (
                        <button
                          type="button"
                          onClick={() => onUpdateInterventionStatus(learner.learner_id, 'IN_PROGRESS')}
                          className="rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                        >
                          Chuyển sang: Đang can thiệp
                        </button>
                      )}
                      {status !== 'RESOLVED' && (
                        <button
                          type="button"
                          onClick={() => onUpdateInterventionStatus(learner.learner_id, 'RESOLVED')}
                          className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
                        >
                          Đánh dấu: Đã giải quyết
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectLearner(learner.learner_id)}
                      className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 py-1"
                    >
                      Cập nhật chi tiết & kết quả →
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
