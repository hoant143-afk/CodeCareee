import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, Clock, FileCode2, RefreshCw } from 'lucide-react';
import { TestCaseResult } from '../../types';
import { TestRunner } from '../../services/testRunner';

export const TestCasesView: React.FC = () => {
  const [results, setResults] = useState<TestCaseResult[]>(() => TestRunner.runAllTests());
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      setResults(TestRunner.runAllTests());
      setIsRunning(false);
    }, 300);
  };

  const passCount = results.filter((r) => r.status === 'PASS').length;
  const failCount = results.filter((r) => r.status === 'FAIL').length;
  const pendingCount = results.filter((r) => r.status === 'PENDING_UI').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Kiểm tra hệ thống (Test Cases)</h1>
            <span className="rounded-md bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-800">
              14 Kịch bản kiểm thử
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Bộ kiểm thử tự động xác minh tính toàn vẹn dữ liệu, ma trận TP=29/FP=2, độ chính xác thuật toán và bảo lưu tiến độ.
          </p>
        </div>
        <button
          onClick={handleRunTests}
          disabled={isRunning}
          className="flex items-center gap-2 rounded-xl bg-sky-800 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-sky-900 transition self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
          Chạy lại bộ kiểm thử
        </button>
      </div>

      {/* Test summary banner */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs text-center">
          <div className="text-2xl font-bold text-emerald-800">{passCount} PASS</div>
          <div className="text-xs text-emerald-700 font-medium mt-0.5">Kiểm thử thành công</div>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-xs text-center">
          <div className="text-2xl font-bold text-rose-800">{failCount} FAIL</div>
          <div className="text-xs text-rose-700 font-medium mt-0.5">Lỗi phát hiện</div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs text-center">
          <div className="text-2xl font-bold text-amber-800">{pendingCount} PENDING</div>
          <div className="text-xs text-amber-700 font-medium mt-0.5">Chờ kiểm thử giao diện</div>
        </div>
      </div>

      {/* Test cases list */}
      <div className="space-y-3">
        {results.map((test) => (
          <div
            key={test.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {test.status === 'PASS' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : test.status === 'FAIL' ? (
                    <XCircle className="h-5 w-5 text-rose-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {test.id}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{test.name}</h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{test.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {test.duration_ms > 0 && (
                  <span className="text-[11px] text-slate-400 font-mono">{test.duration_ms}ms</span>
                )}
                <span
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                    test.status === 'PASS'
                      ? 'bg-emerald-100 text-emerald-800'
                      : test.status === 'FAIL'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {test.status === 'PASS' ? '12 PASS' : test.status === 'FAIL' ? 'FAIL' : 'CHỜ GIAO DIỆN'}
                </span>
              </div>
            </div>

            <div className="mt-3 rounded-xl bg-slate-50 border border-slate-100 p-2.5 text-xs text-slate-600 font-mono">
              → {test.details}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
