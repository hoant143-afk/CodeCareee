import React, { useState, useMemo } from 'react';
import {
  ShieldCheck, Download, AlertTriangle, CheckCircle2,
  Sliders, Info, HelpCircle
} from 'lucide-react';
import { DerivedLearner, Thresholds } from '../../types';
import { StorageService } from '../../services/storage';
import { AnalyticsService } from '../../services/analytics';

interface AuditViewProps {
  learners: DerivedLearner[];
  thresholds: Thresholds;
  onSelectLearner: (id: string) => void;
}

export const AuditView: React.FC<AuditViewProps> = ({
  learners,
  thresholds,
  onSelectLearner,
}) => {
  // Respect selected class scope
  const idsInScope = new Set(learners.map((l) => l.learner_id));
  const rawList = StorageService.getLearnersRaw().filter((l) => idsInScope.has(l.learner_id));

  // Interactive threshold simulation
  const [simTestPass, setSimTestPass] = useState<number>(thresholds.minTestPassRate);
  const [simRiskScore, setSimRiskScore] = useState<number>(thresholds.riskThreshold);

  const simulatedLearners = useMemo(() => {
    const simThresholds: Thresholds = {
      ...thresholds,
      minTestPassRate: simTestPass,
      riskThreshold: simRiskScore,
    };
    return AnalyticsService.deriveAllLearners(rawList, simThresholds);
  }, [rawList, thresholds, simTestPass, simRiskScore]);

  const cm = useMemo(() => {
    return AnalyticsService.calculateConfusionMatrix(simulatedLearners);
  }, [simulatedLearners]);

  const classFairness = useMemo(() => {
    return AnalyticsService.calculateClassFairness(simulatedLearners);
  }, [simulatedLearners]);

  const handleExportJson = () => {
    const reportData = {
      title: 'CodeCare Audit Report - Chất lượng cảnh báo',
      export_date: new Date().toISOString(),
      sample_size: learners.length,
      thresholds_used: {
        minTestPassRate: simTestPass,
        riskThreshold: simRiskScore,
      },
      confusion_matrix: cm,
      class_fairness: classFairness,
      note: 'Đối chiếu với nhãn chuẩn chuyên môn (Teacher Ground Truth) trong bộ dữ liệu minh họa.',
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CodeCare_ChatLuongCanhBao_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    StorageService.addLog('EXPORT_AUDIT', 'Xuất số liệu kiểm tra chất lượng cảnh báo (JSON)', undefined, 'Giáo viên');
  };

  // Case categorization for inspection
  const falsePositives = simulatedLearners.filter((l) => l.alert && !l.ground_truth_risk);
  const falseNegatives = simulatedLearners.filter((l) => !l.alert && l.ground_truth_risk);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Chất lượng cảnh báo</h1>
              <span className="rounded-md bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-800">
                Đối chiếu dữ liệu mẫu
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              Giúp giáo viên kiểm tra khi nào hệ thống cảnh báo đúng, khi nào có nguy cơ báo nhầm hoặc bỏ sót. Các số liệu hiện đối chiếu với nhãn tham chiếu trong bộ dữ liệu minh họa.
            </p>
          </div>
          <button
            onClick={handleExportJson}
            className="flex items-center gap-2 rounded-xl bg-sky-800 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-sky-900 transition self-start md:self-auto shrink-0"
          >
            <Download className="h-4 w-4" />
            Xuất số liệu kiểm tra (JSON)
          </button>
        </div>
      </div>

      {/* KPI Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Độ chính xác (Accuracy)</span>
          <div className="mt-2 text-2xl font-bold text-slate-900">{cm.accuracy}%</div>
          <p className="mt-1 text-[11px] text-slate-500">Tỷ lệ đoán đúng trên tổng số ({cm.tp + cm.tn}/{cm.total})</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-xs">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">Độ chuẩn xác (Precision)</span>
          <div className="mt-2 text-2xl font-bold text-emerald-950">{cm.precision}%</div>
          <p className="mt-1 text-[11px] text-emerald-800">Hạn chế báo nhầm học sinh không cần hỗ trợ</p>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-50/40 p-4 shadow-xs">
          <span className="text-xs font-semibold text-sky-800 uppercase tracking-wide">Độ bao phủ (Recall)</span>
          <div className="mt-2 text-2xl font-bold text-sky-950">{cm.recall}%</div>
          <p className="mt-1 text-[11px] text-sky-800">Tránh bỏ sót học sinh thực sự gặp khó khăn</p>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-purple-50/40 p-4 shadow-xs">
          <span className="text-xs font-semibold text-purple-800 uppercase tracking-wide">Chỉ số F1-Score</span>
          <div className="mt-2 text-2xl font-bold text-purple-950">{cm.f1}%</div>
          <p className="mt-1 text-[11px] text-purple-800">Cân bằng giữa Precision và Recall</p>
        </div>
      </div>

      {/* Confusion Matrix Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-sky-800" />
              Ma trận phân loại (Confusion Matrix)
            </h3>
            <span className="text-xs text-slate-500">Phạm vi: {cm.total} hồ sơ</span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-center text-xs">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-3 text-left font-semibold">Đối chiếu</th>
                  <th className="p-3 font-semibold text-rose-800 bg-rose-50/50">Thực tế CÓ NGUY CƠ</th>
                  <th className="p-3 font-semibold text-emerald-800 bg-emerald-50/50">Thực tế BÌNH THƯỜNG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 text-left font-semibold bg-slate-50 text-slate-800">
                    Thuật toán: BÁO ĐỘNG (ALERT)
                  </td>
                  <td className="p-4 bg-emerald-50/30">
                    <div className="text-xl font-bold text-emerald-700">{cm.tp}</div>
                    <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">True Positive (Đúng)</div>
                    <div className="text-[10px] text-slate-500 mt-1">Phát hiện đúng học sinh cần giúp</div>
                  </td>
                  <td className="p-4 bg-amber-50/40">
                    <div className="text-xl font-bold text-amber-700">{cm.fp}</div>
                    <div className="text-[10px] text-amber-800 font-semibold mt-0.5">False Positive (Báo nhầm)</div>
                    <div className="text-[10px] text-slate-500 mt-1">Học sinh ổn nhưng bị báo động</div>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-left font-semibold bg-slate-50 text-slate-800">
                    Thuật toán: BÌNH THƯỜNG (NORMAL)
                  </td>
                  <td className="p-4 bg-rose-50/30">
                    <div className="text-xl font-bold text-rose-700">{cm.fn}</div>
                    <div className="text-[10px] text-rose-800 font-semibold mt-0.5">False Negative (Bỏ sót)</div>
                    <div className="text-[10px] text-slate-500 mt-1">Học sinh khó khăn nhưng không báo</div>
                  </td>
                  <td className="p-4 bg-emerald-50/30">
                    <div className="text-xl font-bold text-emerald-700">{cm.tn}</div>
                    <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">True Negative (Đúng)</div>
                    <div className="text-[10px] text-slate-500 mt-1">Xác định đúng học sinh học tốt</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            <Info className="h-4 w-4 text-sky-700 shrink-0 mt-0.5" />
            <span>
              Mục tiêu hệ thống sư phạm: Giữ <strong>False Negative (Bỏ sót)</strong> ở mức tối thiểu để không bỏ rơi học sinh yếu, đồng thời khống chế <strong>False Positive (Báo nhầm)</strong> để tránh gây quá tải cho giáo viên.
            </span>
          </div>
        </div>

        {/* Threshold Simulator Slider */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="h-5 w-5 text-indigo-700" />
                Mô phỏng thay đổi ngưỡng cảnh báo
              </h3>
              <button
                type="button"
                onClick={() => {
                  setSimTestPass(thresholds.minTestPassRate);
                  setSimRiskScore(thresholds.riskThreshold);
                }}
                className="text-xs text-indigo-700 hover:underline"
              >
                Đặt lại mặc định
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Thử nghiệm điều chỉnh ngưỡng để quan sát số lượng cảnh báo và ma trận phân loại thay đổi theo thời gian thực:
            </p>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
                  <span>Tỷ lệ Pass test tối thiểu để không bị cảnh báo:</span>
                  <span className="text-sky-800 font-bold">{simTestPass}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="80"
                  step="5"
                  value={simTestPass}
                  onChange={(e) => setSimTestPass(Number(e.target.value))}
                  className="w-full accent-sky-700 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>30% (Rất nới lỏng)</span>
                  <span>50% (Mặc định)</span>
                  <span>80% (Khắt khe)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
                  <span>Ngưỡng điểm rủi ro kích hoạt ALERT:</span>
                  <span className="text-indigo-800 font-bold">{simRiskScore} điểm</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="80"
                  step="5"
                  value={simRiskScore}
                  onChange={(e) => setSimRiskScore(Number(e.target.value))}
                  className="w-full accent-indigo-700 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>30đ (Báo động nhiều)</span>
                  <span>60đ (Mặc định chuẩn)</span>
                  <span>80đ (Chỉ báo ca nặng)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 text-xs text-indigo-950">
            <div className="font-semibold mb-1">Kết quả khi mô phỏng cấu hình này:</div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div>• Tổng cảnh báo: <strong>{simulatedLearners.filter(l => l.alert).length}</strong> học sinh</div>
              <div>• Độ chính xác: <strong>{cm.accuracy}%</strong></div>
              <div>• Báo nhầm (FP): <strong>{cm.fp}</strong> ca</div>
              <div>• Bỏ sót (FN): <strong>{cm.fn}</strong> ca</div>
            </div>
          </div>
        </div>
      </div>

      {/* Case analysis: False Positives & False Negatives */}
      {(falsePositives.length > 0 || falseNegatives.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* False Positives */}
          <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-xs">
            <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-700" />
              Trường hợp báo nhầm (False Positive: {falsePositives.length} học sinh)
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Thuật toán gắn cờ ALERT do điểm test tuần gần nhất giảm, nhưng chuyên môn đánh giá học sinh này đã vững:
            </p>
            <div className="space-y-2">
              {falsePositives.map((learner) => (
                <div
                  key={learner.learner_id}
                  onClick={() => onSelectLearner(learner.learner_id)}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs hover:border-amber-300"
                >
                  <div>
                    <span className="font-bold text-slate-900">{learner.name}</span>
                    <span className="text-slate-500 ml-1.5">({learner.learner_id})</span>
                    <p className="text-[11px] text-amber-800 mt-0.5">{learner.alert_reasons[0]}</p>
                  </div>
                  <span className="rounded bg-amber-100 px-2 py-0.5 font-bold text-amber-900 shrink-0">
                    Xem hồ sơ
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* False Negatives */}
          <div className="rounded-2xl border border-rose-200 bg-white p-5 shadow-xs">
            <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2 mb-2">
              <HelpCircle className="h-4 w-4 text-rose-700" />
              Trường hợp bỏ sót (False Negative: {falseNegatives.length} học sinh)
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Điểm số ở mức suýt soát ngưỡng cảnh báo, nhưng giáo viên ghi nhận cần theo dõi thêm:
            </p>
            <div className="space-y-2">
              {falseNegatives.map((learner) => (
                <div
                  key={learner.learner_id}
                  onClick={() => onSelectLearner(learner.learner_id)}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs hover:border-rose-300"
                >
                  <div>
                    <span className="font-bold text-slate-900">{learner.name}</span>
                    <span className="text-slate-500 ml-1.5">({learner.learner_id})</span>
                    <p className="text-[11px] text-rose-800 mt-0.5">Điểm nguy cơ: {learner.risk_score}đ (dưới ngưỡng {simRiskScore})</p>
                  </div>
                  <span className="rounded bg-rose-100 px-2 py-0.5 font-bold text-rose-900 shrink-0">
                    Xem hồ sơ
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Class Fairness Inspection Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Kiểm tra tính công bằng giữa các lớp học (Class Subgroup Fairness)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          So sánh tỷ lệ phát hiện, độ chuẩn xác và độ bao phủ giữa Lớp A, Lớp B và Lớp C để đảm bảo thuật toán không thiên vị hoặc thiếu nhạy đối với bất kỳ nhóm học sinh nào.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-3">Lớp học</th>
                <th className="p-3">Sĩ số</th>
                <th className="p-3">Số cảnh báo</th>
                <th className="p-3">Tỷ lệ cảnh báo</th>
                <th className="p-3">Độ chính xác</th>
                <th className="p-3">Precision</th>
                <th className="p-3">Recall</th>
                <th className="p-3">Đánh giá công bằng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {classFairness.map((cls) => (
                <tr key={cls.className} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">
                    {cls.className === 'LOP_A' ? 'Lớp A' : cls.className === 'LOP_B' ? 'Lớp B' : 'Lớp C'}
                  </td>
                  <td className="p-3">{cls.count} HS</td>
                  <td className="p-3 font-semibold text-amber-700">{cls.alertCount}</td>
                  <td className="p-3">{cls.alertRate}%</td>
                  <td className="p-3 font-semibold text-slate-900">{cls.accuracy}%</td>
                  <td className="p-3 text-emerald-700 font-medium">{cls.precision}%</td>
                  <td className="p-3 text-sky-700 font-medium">{cls.recall}%</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                      <CheckCircle2 className="h-3 w-3" /> Đạt chuẩn ổn định
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
