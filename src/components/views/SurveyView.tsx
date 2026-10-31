import React, { useState } from 'react';
import { FileCheck2, Send, Star, CheckCircle2 } from 'lucide-react';
import { TeacherSurvey, ClassName } from '../../types';
import { StorageService } from '../../services/storage';

interface SurveyViewProps {
  surveys: TeacherSurvey[];
  onSurveySubmitted: () => void;
}

export const SurveyView: React.FC<SurveyViewProps> = ({ surveys, onSurveySubmitted }) => {
  const [teacherName, setTeacherName] = useState('');
  const [evaluatedClass, setEvaluatedClass] = useState<ClassName>('LOP_A');
  const [accuracyRating, setAccuracyRating] = useState(4);
  const [clarityRating, setClarityRating] = useState(4);
  const [usefulnessRating, setUsefulnessRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.addSurvey({
      teacher_name: teacherName || 'Giáo viên phụ trách',
      class_evaluated: evaluatedClass,
      alert_accuracy_rating: accuracyRating,
      explanation_clarity_rating: clarityRating,
      usefulness_rating: usefulnessRating,
      feedback: feedbackText,
    });
    setSubmitted(true);
    setFeedbackText('');
    onSurveySubmitted();
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Góp ý của giáo viên</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          Khảo sát định kỳ về độ chính xác của các cảnh báo sớm và tính hữu ích của công cụ trong thực tế giảng dạy.
        </p>
      </div>

      {submitted && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Cảm ơn thầy/cô! Đóng góp ý kiến đã được ghi nhận vào hệ thống.
        </div>
      )}

      {/* Survey Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Họ tên giáo viên (tùy chọn):</label>
            <input
              type="text"
              placeholder="VD: Thầy Nguyễn Văn..."
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Lớp đang nhận xét:</label>
            <select
              value={evaluatedClass}
              onChange={(e) => setEvaluatedClass(e.target.value as ClassName)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600"
            >
              <option value="LOP_A">Lớp A</option>
              <option value="LOP_B">Lớp B</option>
              <option value="LOP_C">Lớp C</option>
            </select>
          </div>
        </div>

        {/* Rating scales */}
        <div className="space-y-4 border-t border-slate-100 pt-4">
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
              <span>1. Độ chính xác của các trường hợp cảnh báo:</span>
              <span className="font-bold text-sky-800">{accuracyRating} / 5 sao</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={accuracyRating}
              onChange={(e) => setAccuracyRating(Number(e.target.value))}
              className="w-full accent-sky-700"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
              <span>2. Tính rõ ràng của phần bằng chứng thực nghiệm (giải thích lý do):</span>
              <span className="font-bold text-sky-800">{clarityRating} / 5 sao</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={clarityRating}
              onChange={(e) => setClarityRating(Number(e.target.value))}
              className="w-full accent-sky-700"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
              <span>3. Mức độ hữu ích trong việc can thiệp sư phạm kịp thời:</span>
              <span className="font-bold text-sky-800">{usefulnessRating} / 5 sao</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={usefulnessRating}
              onChange={(e) => setUsefulnessRating(Number(e.target.value))}
              className="w-full accent-sky-700"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Góp ý cải tiến hoặc ghi nhận thêm:
          </label>
          <textarea
            rows={3}
            placeholder="Chia sẻ nhận xét cụ thể về tình huống báo nhầm hoặc đề xuất tiêu chí mới..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-sky-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-sky-900 transition shadow-xs"
          >
            <Send className="h-4 w-4" /> Gửi phiếu góp ý
          </button>
        </div>
      </form>

      {/* Past surveys history */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-3">Lịch sử ý kiến giáo viên ({surveys.length})</h3>
        <div className="space-y-3">
          {surveys.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold text-slate-800">
                <span>{item.teacher_name} ({item.class_evaluated === 'LOP_A' ? 'Lớp A' : item.class_evaluated === 'LOP_B' ? 'Lớp B' : 'Lớp C'})</span>
                <span className="text-slate-400 font-normal">{new Date(item.timestamp).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex gap-4 text-slate-600 text-[11px]">
                <span>Chính xác: <strong>{item.alert_accuracy_rating}/5★</strong></span>
                <span>Giải thích: <strong>{item.explanation_clarity_rating}/5★</strong></span>
                <span>Hữu ích: <strong>{item.usefulness_rating}/5★</strong></span>
              </div>
              {item.feedback && (
                <p className="text-slate-700 italic pt-1">"{item.feedback}"</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
