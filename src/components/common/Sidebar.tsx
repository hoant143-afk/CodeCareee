import React, { useState } from 'react';
import {
  LayoutDashboard, Users, AlertTriangle, HeartHandshake, ShieldCheck,
  Database, Sliders, FileCheck2, History, FileCode2, ChevronDown,
  ChevronUp, Wrench, Info,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'learners'
  | 'alerts'
  | 'interventions'
  | 'audit'
  | 'data'
  | 'settings'
  | 'survey'
  | 'logs'
  | 'testcases';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  unreviewedAlertsCount: number;
  activeInterventionsCount: number;
  totalLearners?: number;
}

/** Navigation follows a teacher's tasks; diagnostics stay available under tools. */
export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  unreviewedAlertsCount,
  activeInterventionsCount,
  totalLearners,
}) => {
  const [toolsExpanded, setToolsExpanded] = useState(
    ['survey', 'logs', 'testcases'].includes(currentTab)
  );

  const mainItems = [
    { id: 'overview' as const, label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'learners' as const, label: 'Người học', icon: Users },
    { id: 'alerts' as const, label: 'Cảnh báo cần xem', icon: AlertTriangle, badge: unreviewedAlertsCount },
    { id: 'interventions' as const, label: 'Hỗ trợ học sinh', icon: HeartHandshake, badge: activeInterventionsCount },
    { id: 'audit' as const, label: 'Chất lượng cảnh báo', icon: ShieldCheck },
    { id: 'data' as const, label: 'Dữ liệu', icon: Database },
    { id: 'settings' as const, label: 'Cài đặt', icon: Sliders },
  ];

  const toolItems = [
    { id: 'logs' as const, label: 'Lịch sử thao tác', icon: History },
    { id: 'survey' as const, label: 'Góp ý của giáo viên', icon: FileCheck2 },
    { id: 'testcases' as const, label: 'Kiểm tra hệ thống', icon: FileCode2 },
  ];

  const renderItem = (item: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }) => {
    const Icon = item.icon;
    const active = currentTab === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => onTabChange(item.id)}
        aria-current={active ? 'page' : undefined}
        className={`flex min-w-0 items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
          active ? 'bg-sky-700 text-white' : 'text-slate-200 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <Icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{item.label}</span>
        </span>
        {typeof item.badge === 'number' && item.badge > 0 && (
          <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-950">
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside aria-label="Điều hướng CodeCare" className="w-full shrink-0 bg-slate-900 text-slate-200 lg:w-64 lg:min-h-full">
      <div className="border-b border-slate-700 px-4 py-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Không gian giáo viên</div>
        <div className="mt-1 text-sm font-semibold text-white">Theo dõi học lập trình</div>
        <div className="mt-0.5 text-xs text-slate-400">
          {typeof totalLearners === 'number' ? `${totalLearners} hồ sơ đang quản lý` : 'Dữ liệu trên thiết bị này'}
        </div>
      </div>
      <nav aria-label="Chức năng giáo viên" className="p-3">
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
          {mainItems.map(renderItem)}
        </div>
        <div className="mt-3 border-t border-slate-700 pt-3">
          <button
            type="button"
            aria-expanded={toolsExpanded}
            onClick={() => setToolsExpanded((open) => !open)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <span className="flex items-center gap-2"><Wrench className="h-4 w-4" />Công cụ quản trị</span>
            {toolsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {toolsExpanded && <div className="mt-1 grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">{toolItems.map(renderItem)}</div>}
        </div>
      </nav>
      <div className="hidden border-t border-slate-700 px-4 py-3 text-xs leading-relaxed text-slate-400 lg:flex lg:gap-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        Cảnh báo chỉ là gợi ý; giáo viên xác minh trước khi hỗ trợ.
      </div>
    </aside>
  );
};
