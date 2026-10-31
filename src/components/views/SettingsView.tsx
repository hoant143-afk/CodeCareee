import React, { useState } from 'react';
import { Sliders, Save, CheckCircle2, RotateCcw } from 'lucide-react';
import { Thresholds } from '../../types';
import { StorageService } from '../../services/storage';

interface SettingsViewProps {
  thresholds: Thresholds;
  onSaveThresholds: (thresholds: Thresholds) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  thresholds,
  onSaveThresholds,
}) => {
  const [formValues, setFormValues] = useState<Thresholds>(thresholds);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveThresholds(formValues);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    const defaults: Thresholds = {
      minTestPassRate: 50,
      maxConsecutiveErrors: 6,
      maxDaysWithoutSubmission: 5,
      riskThreshold: 60,
    };
    setFormValues(defaults);
    onSaveThresholds(defaults);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Cài đặt ngưỡng cảnh báo sớm</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Tùy chỉnh độ nhạy của thuật toán phân tích hành vi học lập trình để phù hợp với độ khó của môn học.
        </p>
      </div>

      {savedSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Đã lưu cài đặt ngưỡng mới vào bộ nhớ trình duyệt!
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
            1. Tỷ lệ vượt qua kiểm thử tối thiểu (Min Test Pass Rate)
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Học sinh có tỷ lệ pass test ở tuần học gần nhất dưới mức này sẽ bị ghi nhận điểm rủi ro.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="20"
              max="90"
              value={formValues.minTestPassRate}
              onChange={(e) => setFormValues({ ...formValues, minTestPassRate: Number(e.target.value) })}
              className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
            <span className="text-xs font-medium text-slate-600">% (Khuyến nghị: 50%)</span>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
            2. Giới hạn tổng lỗi biên dịch & logic / tuần
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Tổng số lỗi cú pháp và logic gặp phải trong một tuần vượt quá con số này báo hiệu học sinh đang bị bế tắc lập trình.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="2"
              max="20"
              value={formValues.maxConsecutiveErrors}
              onChange={(e) => setFormValues({ ...formValues, maxConsecutiveErrors: Number(e.target.value) })}
              className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
            <span className="text-xs font-medium text-slate-600">lỗi / tuần (Khuyến nghị: 6 lỗi)</span>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
            3. Ngưỡng điểm nguy cơ kích hoạt cảnh báo (Risk Score Threshold)
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Tổng điểm rủi ro tổng hợp (0 - 100) để phân loại học sinh sang trạng thái BÁO ĐỘNG (ALERT).
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="30"
              max="85"
              value={formValues.riskThreshold}
              onChange={(e) => setFormValues({ ...formValues, riskThreshold: Number(e.target.value) })}
              className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
            <span className="text-xs font-medium text-slate-600">điểm (Khuyến nghị: 60 điểm cho chuẩn TP=29, FP=2)</span>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Khôi phục mặc định
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-sky-800 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-sky-900 transition"
          >
            <Save className="h-4 w-4" /> Lưu cấu hình
          </button>
        </div>
      </form>
    </div>
  );
};
