import React, { useState } from 'react';
import { History, Trash2, Clock, User, Shield } from 'lucide-react';
import { AuditLog } from '../../types';
import { StorageService } from '../../services/storage';

interface LogsViewProps {
  logs: AuditLog[];
  onLogsCleared: () => void;
}

export const LogsView: React.FC<LogsViewProps> = ({ logs, onLogsCleared }) => {
  const [filterAction, setFilterAction] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    if (filterAction === 'ALL') return true;
    return log.action === filterAction;
  });

  const handleClear = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử thao tác?')) {
      StorageService.clearLogs();
      onLogsCleared();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Lịch sử thao tác (Audit Logs)</h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              {logs.length} bản ghi
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Theo dõi mọi hành động của giáo viên và hệ thống để đảm bảo tính minh bạch và truy vết nghiệp vụ.
          </p>
        </div>
        {logs.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-800 hover:bg-rose-100 transition self-start sm:self-auto"
          >
            <Trash2 className="h-4 w-4" /> Xóa lịch sử
          </button>
        )}
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
              <tr>
                <th className="p-3.5">Thời gian</th>
                <th className="p-3.5">Hành động</th>
                <th className="p-3.5">Người thực hiện</th>
                <th className="p-3.5">Đối tượng</th>
                <th className="p-3.5">Nội dung chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Chưa có bản ghi lịch sử nào.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('vi-VN')}
                    </td>
                    <td className="p-3.5">
                      <span className="font-mono text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-800">
                      {log.author}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-sky-800">
                      {log.target_id || '—'}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
