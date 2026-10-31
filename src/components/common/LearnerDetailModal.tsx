import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, XCircle, Clock, BookOpen, Bug, BarChart3, ShieldAlert } from 'lucide-react';
import { DerivedLearner, ReviewRecord, Decision, InterventionStatus } from '../../types';

interface LearnerDetailModalProps {
  learner: DerivedLearner | null;
  review?: ReviewRecord;
  onClose: () => void;
  onSaveReview: (
    learnerId: string,
    decision: Decision,
    notes?: string,
    intervention?: {
      type?: string;
      status?: InterventionStatus;
      date?: string;
      outcome?: string;
    }
  ) => void;
}

export const LearnerDetailModal: React.FC<LearnerDetailModalProps> = ({
  learner,
  review,
  onClose,
  onSaveReview,
}) => {
  if (!learner) return null;

  const [decision, setDecision] = useState<Decision>(review?.confirmation || 'PENDING');
  const [notes, setNotes] = useState<string>(review?.notes || '');
  const [interventionType, setInterventionType] = useState<string>(review?.intervention_type || 'Hỗ trợ trực tiếp');
  const [interventionStatus, setInterventionStatus] = useState<InterventionStatus>(review?.intervention_status || 'PENDING');
  const [interventionDate, setInterventionDate] = useState<string>(review?.intervention_date || new Date().toISOString().split('T')[0]);
  const [interventionOutcome, setInterventionOutcome] = useState<string>(review?.intervention_outcome || '');

  const handleSave = () => {
    if (interventionStatus === 'RESOLVED' && (!interventionOutcome || interventionOutcome.trim() === '')) {
      alert('Vui lòng nhập kết quả can thiệp trước khi đánh dấu Đã giải quyết.');
      return;
    }
    onSaveReview(learner.learner_id, decision, notes, {
      type: interventionType,
      status: interventionStatus,
      date: interventionDate,
      outcome: interventionOutcome,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 font-bold text-sky-800">
              {learner.learner_id.replace('STU', '#')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{learner.name}</h3>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {learner.class_name === 'LOP_A' ? 'Lớp A' : learner.class_name === 'LOP_B' ? 'Lớp B' : 'Lớp C'}
                </span>
                {learner.alert ? (
                  <span className="flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                    <AlertTriangle className="h-3 w-3" /> Cảnh báo sớm
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="h-3 w-3" /> Bình thường
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Mã: {learner.learner_id} • Điểm nguy cơ: {learner.risk_score}/100 • Pass test TB: {learner.avg_test_pass}%
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Alert Evidence Section */}
          {learner.alert && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
              <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
                <ShieldAlert className="h-4 w-4" />
                Cơ sở gợi ý cảnh báo (Evidence-based Alert):
              </div>
              <ul className="mt-2 space-y-1.5 pl-6 list-disc text-xs text-amber-950">
                {learner.alert_reasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-amber-800 italic">
                * Đây là gợi ý tự động từ dữ liệu kiểm thử & nộp bài. Giáo viên cần xem xét toàn diện trước khi thực hiện can thiệp sư phạm.
              </p>
            </div>
          )}

          {/* 6 Weeks Performance Grid */}
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
              <BarChart3 className="h-4 w-4 text-sky-700" />
              Lịch sử 6 tuần thực hành lập trình
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {learner.weeks.map((wk) => (
                <div key={wk.week} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Tuần {wk.week}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                      wk.testPassRate >= 70 ? 'bg-emerald-100 text-emerald-800' :
                      wk.testPassRate >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {wk.testPassRate}% Pass
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 truncate" title={wk.topic}>
                    {wk.topic}
                  </div>
                  <div className="mt-2 space-y-0.5 text-[11px] text-slate-500">
                    <div className="flex justify-between">
                      <span>Bài nộp:</span>
                      <span className="font-medium text-slate-800">{wk.submissions} lần</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lỗi cú pháp / logic:</span>
                      <span className="font-medium text-rose-700">{wk.syntaxErrors + wk.logicErrors}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thời lượng code:</span>
                      <span className="font-medium text-slate-800">{wk.practiceHours}h</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher Review & Confirmation Form */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
            <h4 className="text-sm font-semibold text-slate-900">
              Đánh giá chuyên môn & Kế hoạch can thiệp của Giáo viên
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Xác nhận của giáo viên đối với cảnh báo này:
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setDecision('CONFIRMED')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    decision === 'CONFIRMED'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Xác nhận cần hỗ trợ (CONFIRMED)
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('REJECTED')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    decision === 'REJECTED'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Bác bỏ cảnh báo / Bình thường (REJECTED)
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('PENDING')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    decision === 'PENDING'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  Chờ xem xét (PENDING)
                </button>
              </div>
            </div>

            {/* Pedagogical Intervention fields */}
            {decision === 'CONFIRMED' && (
              <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Chi tiết hành động can thiệp sư phạm
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Hình thức hỗ trợ:
                    </label>
                    <select
                      value={interventionType}
                      onChange={(e) => setInterventionType(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600"
                    >
                      <option value="Hỗ trợ trực tiếp">Hỗ trợ trực tiếp trên lớp</option>
                      <option value="Kèm 1-1 phụ đạo">Kèm 1-1 phụ đạo thuật toán</option>
                      <option value="Bổ trợ cú pháp & gỡ lỗi">Bài tập bổ trợ cú pháp & gỡ lỗi</option>
                      <option value="Ghép cặp học tập (Peer)">Ghép cặp học tập (Peer Programming)</option>
                      <option value="Nhắc nhở tiến độ & động viên">Nhắc nhở tiến độ & động viên</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Tiến độ can thiệp:
                    </label>
                    <select
                      value={interventionStatus}
                      onChange={(e) => setInterventionStatus(e.target.value as InterventionStatus)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600"
                    >
                      <option value="PENDING">Đang chờ thực hiện (PENDING)</option>
                      <option value="IN_PROGRESS">Đang can thiệp (IN_PROGRESS)</option>
                      <option value="RESOLVED">Đã cải thiện / Hoàn thành (RESOLVED)</option>
                      <option value="STOPPED">Tạm dừng (STOPPED)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Ngày triển khai:
                    </label>
                    <input
                      type="date"
                      value={interventionDate}
                      onChange={(e) => setInterventionDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Ghi nhận kết quả can thiệp:
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Đã hiểu vòng lặp, tự làm được bài tập 4"
                      value={interventionOutcome}
                      onChange={(e) => setInterventionOutcome(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Ghi chú sư phạm của giáo viên:
              </label>
              <textarea
                rows={3}
                placeholder="Nhập nhận định riêng của giáo viên về tình trạng học sinh này..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3.5 bg-slate-50 rounded-b-2xl">
          <span className="text-xs text-slate-500">
            {review?.updated_at ? `Cập nhật lần cuối: ${new Date(review.updated_at).toLocaleString('vi-VN')}` : 'Chưa có đánh giá lưu trước đó'}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-sky-800 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-sky-900"
            >
              Lưu đánh giá & Kế hoạch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
