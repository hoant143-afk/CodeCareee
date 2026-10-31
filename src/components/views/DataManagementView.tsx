import React, { useState } from 'react';
import { Database, Download, Upload, RotateCcw, Check, AlertCircle, FileText } from 'lucide-react';
import { LearnerRaw } from '../../types';
import { StorageService } from '../../services/storage';
import { DataValidator } from '../../services/dataValidator';

interface DataManagementViewProps {
  learnersRaw: LearnerRaw[];
  onDataReloaded: () => void;
}

export const DataManagementView: React.FC<DataManagementViewProps> = ({
  learnersRaw,
  onDataReloaded,
}) => {
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleExportJson = () => {
    const dataStr = JSON.stringify(learnersRaw, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CodeCare_Learners_80_Data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    StorageService.addLog('EXPORT_DATA', `Xuất tệp JSON chứa ${learnersRaw.length} hồ sơ`, undefined, 'Giáo viên');
  };

  const handleExportCsv = () => {
    const headers = ['learner_id', 'name', 'class_name', 'ground_truth_risk', 'week6_pass_rate', 'week6_submissions', 'week6_syntax_errors'];
    const rows = learnersRaw.map((l) => {
      const w6 = l.weeks[l.weeks.length - 1];
      return [
        l.learner_id,
        `"${l.name}"`,
        l.class_name,
        l.ground_truth_risk ? 'TRUE' : 'FALSE',
        w6?.testPassRate ?? '',
        w6?.submissions ?? '',
        w6?.syntaxErrors ?? '',
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CodeCare_Learners_Export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    StorageService.addLog('EXPORT_CSV', `Xuất tệp CSV chứa ${learnersRaw.length} học sinh`, undefined, 'Giáo viên');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const validation = DataValidator.validateLearnerList(parsed);
        if (!validation.valid) {
          setImportStatus({
            success: false,
            message: `Lỗi định dạng: ${validation.errors.slice(0, 3).join('; ')}`,
          });
          return;
        }

        StorageService.saveLearnersRaw(parsed);
        StorageService.addLog('IMPORT_DATA', `Nạp thành công ${parsed.length} hồ sơ từ tệp ${file.name}`, undefined, 'Giáo viên');
        setImportStatus({
          success: true,
          message: `Đã nạp thành công ${parsed.length} hồ sơ học sinh vào hệ thống.`,
        });
        onDataReloaded();
      } catch (err: any) {
        setImportStatus({
          success: false,
          message: `Không thể đọc tệp JSON: ${err.message}`,
        });
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Khôi phục lại toàn bộ dữ liệu 80 học sinh mặc định ban đầu? Thao tác này sẽ ghi đè các sửa đổi cục bộ.')) {
      StorageService.resetLearners();
      setImportStatus({ success: true, message: 'Đã khôi phục 80 hồ sơ mẫu ban đầu.' });
      onDataReloaded();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Quản lý dữ liệu người học</h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Dữ liệu được lưu trữ an toàn trong trình duyệt cục bộ (localStorage). Bạn có thể xuất bản sao lưu hoặc khôi phục dữ liệu chuẩn bất kỳ lúc nào.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <Download className="h-4 w-4" /> Xuất JSON
            </button>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <FileText className="h-4 w-4" /> Xuất CSV
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-800 hover:bg-rose-100 transition"
            >
              <RotateCcw className="h-4 w-4" /> Khôi phục dữ liệu gốc
            </button>
          </div>
        </div>
      </div>

      {importStatus && (
        <div className={`rounded-xl p-4 text-xs font-semibold flex items-center gap-2 ${
          importStatus.success ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          {importStatus.success ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {importStatus.message}
        </div>
      )}

      {/* Upload card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-xs flex flex-col justify-center items-center">
          <Upload className="h-10 w-10 text-sky-700 mb-2" />
          <h3 className="text-sm font-bold text-slate-900">Nạp tập tin dữ liệu (JSON)</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Định dạng tương thích với schema 80 hồ sơ của CodeCare
          </p>
          <label className="cursor-pointer rounded-xl bg-sky-800 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-900 transition">
            Chọn tệp từ máy
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Thông số bộ dữ liệu đang lưu trên thiết bị:</h3>
          <div className="grid grid-cols-3 gap-3 text-center my-4">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <div className="text-xl font-bold text-slate-900">{learnersRaw.length}</div>
              <div className="text-[11px] text-slate-500">Tổng số hồ sơ</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <div className="text-xl font-bold text-sky-800">
                {learnersRaw.filter(l => l.class_name === 'LOP_A').length} / {learnersRaw.filter(l => l.class_name === 'LOP_B').length} / {learnersRaw.filter(l => l.class_name === 'LOP_C').length}
              </div>
              <div className="text-[11px] text-slate-500">Lớp A / B / C</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <div className="text-xl font-bold text-amber-800">
                {learnersRaw.filter(l => l.ground_truth_risk).length}
              </div>
              <div className="text-[11px] text-slate-500">Nhãn Ground Truth chuẩn</div>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            * Lưu ý: Toàn bộ dữ liệu được lưu trên trình duyệt hiện tại và không tự đồng bộ lên máy chủ đám mây nhằm bảo vệ tính riêng tư của dữ liệu thực hành.
          </p>
        </div>
      </div>
    </div>
  );
};
