import React, { useState } from 'react';
import {
  AlertTriangle, CheckCircle2, XCircle, ArrowRight,
  Filter, ShieldCheck, HeartHandshake, Eye
} from 'lucide-react';
import { DerivedLearner, ReviewRecord } from '../../types';

interface AlertsViewProps {
  learners: DerivedLearner[];
  reviews: Record<string, ReviewRecord>;
  onSelectLearner: (id: string) => void;
  onReviewDecision: (id: string, decision: 'CONFIRMED' | 'REJECTED') => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  learners,
  reviews,
  onSelectLearner,
  onReviewDecision,
}) => {
  const [filterState, setFilterState] = useState<'UNREVIEWED' | 'CONFIRMED' | 'REJECTED' | 'ALL'>('UNREVIEWED');

  const alertLearners = learners.filter((l) => l.alert);

  const displayedAlerts = alertLearners.filter((l) => {
    const rev = reviews[l.learner_id];
    if (filterState === 'UNREVIEWED') {
      return !rev || rev.confirmation === 'PENDING';
    }
    if (filterState === 'CONFIRMED') {
      return rev?.confirmation === 'CONFIRMED';
    }
    if (filterState === 'REJECTED') {
      return rev?.confirmation === 'REJECTED';
    }
    return true;
  });

  const unreviewedCount = alertLearners.filter(
    (l) => !reviews[l.learner_id] || reviews[l.learner_id].confirmation === 'PENDING'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Cảnh báo cần xem</h1>
            {unreviewedCount > 0 && (
              <span className="rounded-full bg-amber-700 px-2.5 py-0.5 text-xs font-bold text-white">
                {unreviewedCount} chưa xử lý
              </span>
            )}
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl">
            Các trường hợp người học có biểu hiện sa sút kiểm thử hoặc vướng mắc cú pháp trong lớp học được chọn. Giáo viên xác minh lý do trước khi quyết định can thiệp.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex rounded-xl bg-white p-1 border border-amber-200">
            <button
              onClick={() => setFilterState('UNREVIEWED')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                filterState === 'UNREVIEWED' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chưa duyệt ({unreviewedCount})
            </button>
            <button
              onClick={() => setFilterState('CONFIRMED')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                filterState === 'CONFIRMED' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đã xác nhận ({alertLearners.filter(l => reviews[l.learner_id]?.confirmation === 'CONFIRMED').length})
            </button>
            <button
              onClick={() => setFilterState('REJECTED')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                filterState === 'REJECTED' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đã bác bỏ ({alertLearners.filter(l => reviews[l.learner_id]?.confirmation === 'REJECTED').length})
            </button>
            <button
              onClick={() => setFilterState('ALL')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                filterState === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({alertLearners.length})
            </button>
          </div>
        </div>
      </div>

      {/* Alerts Cards List */}
      <div className="space-y-4">
        {displayedAlerts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <h3 className="mt-3 text-base font-bold text-slate-900">Không có cảnh báo nào trong mục này</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              Tất cả học sinh trong nhóm đã được xem xét hoặc không có dấu hiệu cần lưu ý.
            </p>
          </div>
        ) : (
          displayedAlerts.map((learner) => {
            const rev = reviews[learner.learner_id];
            const isConfirmed = rev?.confirmation === 'CONFIRMED';
            const isRejected = rev?.confirmation === 'REJECTED';

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
                      <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-800">
                        Điểm nguy cơ: {learner.risk_score}/100
                      </span>
                    </div>

                    {/* Evidence Reasons */}
                    <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
                      <div className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" /> Bằng chứng thực nghiệm (Evidence):
                      </div>
                      <ul className="list-disc pl-5 text-xs text-amber-950 space-y-0.5">
                        {learner.alert_reasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Progress details */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span>Pass test TB: <strong className="text-slate-800">{learner.avg_test_pass}%</strong></span>
                      <span>Tổng bài nộp: <strong className="text-slate-800">{learner.total_submissions} lượt</strong></span>
                      <span>Giờ thực hành: <strong className="text-slate-800">{learner.total_practice_hours}h</strong></span>
                      {rev?.notes && (
                        <span className="text-sky-800 italic bg-sky-50 px-2 py-0.5 rounded">
                          Ghi chú GV: "{rev.notes}"
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2 shrink-0">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onReviewDecision(learner.learner_id, 'CONFIRMED')}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                          isConfirmed
                            ? 'bg-rose-700 text-white shadow-xs'
                            : 'border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100'
                        }`}
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {isConfirmed ? 'Đã xác nhận cần hỗ trợ' : 'Xác nhận cần hỗ trợ'}
                      </button>

                      <button
                        type="button"
                        onClick={() => onReviewDecision(learner.learner_id, 'REJECTED')}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                          isRejected
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {isRejected ? 'Đã bác bỏ' : 'Bác bỏ'}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectLearner(learner.learner_id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-sky-800 hover:text-sky-950 py-1"
                    >
                      <Eye className="h-3.5 w-3.5" /> Xem chi tiết & Lập can thiệp
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
