import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { LearnerDetailModal } from './components/common/LearnerDetailModal';
import { LoginView } from './components/LoginView';
import { OverviewView } from './components/views/OverviewView';
import { LearnersView } from './components/views/LearnersView';
import { AlertsView } from './components/views/AlertsView';
import { InterventionsView } from './components/views/InterventionsView';
import { AuditView } from './components/views/AuditView';
import { DataManagementView } from './components/views/DataManagementView';
import { SettingsView } from './components/views/SettingsView';
import { LogsView } from './components/views/LogsView';
import { SurveyView } from './components/views/SurveyView';
import { TestCasesView } from './components/views/TestCasesView';
import { ClassName, DerivedLearner, LearnerRaw, ReviewRecord, Thresholds, InterventionStatus } from './types';
import { StorageService } from './services/storage';
import { AnalyticsService } from './services/analytics';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('codecare_auth') === 'true';
  });

  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [selectedClass, setSelectedClass] = useState<'ALL' | ClassName>('ALL');
  const [selectedWeek, setSelectedWeek] = useState<number>(6);
  const [selectedLearnerId, setSelectedLearnerId] = useState<string | null>(null);

  // Raw learners and thresholds from storage
  const [rawLearners, setRawLearners] = useState<LearnerRaw[]>(() => StorageService.getLearnersRaw());
  const [thresholds, setThresholds] = useState<Thresholds>(() => StorageService.getThresholds());
  const [reviews, setReviews] = useState<Record<string, ReviewRecord>>(() => StorageService.getReviews());
  const [logs, setLogs] = useState(() => StorageService.getLogs());
  const [surveys, setSurveys] = useState(() => StorageService.getSurveys());

  const handleLogin = () => {
    localStorage.setItem('codecare_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('codecare_auth');
    setIsAuthenticated(false);
  };

  // Derive learners with alert classification
  const allDerivedLearners = useMemo(() => {
    return AnalyticsService.deriveAllLearners(rawLearners, thresholds);
  }, [rawLearners, thresholds]);

  // Dynamic class counts: never assume a fixed number of learners.
  const classCounts = useMemo(() => ({
    LOP_A: allDerivedLearners.filter(l => l.class_name === 'LOP_A').length,
    LOP_B: allDerivedLearners.filter(l => l.class_name === 'LOP_B').length,
    LOP_C: allDerivedLearners.filter(l => l.class_name === 'LOP_C').length,
  }), [allDerivedLearners]);

  // Selected learner object for modal
  const selectedLearner = useMemo(() => {
    if (!selectedLearnerId) return null;
    return allDerivedLearners.find((l) => l.learner_id === selectedLearnerId) || null;
  }, [selectedLearnerId, allDerivedLearners]);

  // Learners filtered by class
  const visibleLearners = useMemo(() => {
    if (selectedClass === 'ALL') return allDerivedLearners;
    return allDerivedLearners.filter((l) => l.class_name === selectedClass);
  }, [allDerivedLearners, selectedClass]);

  // Unreviewed alerts count for the currently selected class only
  const unreviewedAlertsCount = useMemo(() => {
    return visibleLearners.filter(
      (l) => l.alert && (!reviews[l.learner_id] || reviews[l.learner_id]?.confirmation === 'PENDING')
    ).length;
  }, [visibleLearners, reviews]);

  // Active interventions count
  const activeInterventionsCount = useMemo(() => {
    return visibleLearners.filter(
      (l) => reviews[l.learner_id]?.intervention_status === 'IN_PROGRESS'
    ).length;
  }, [visibleLearners, reviews]);

  // Update confirmation without wiping progress from an existing intervention
  const handleReview = (learnerId: string, decision: 'CONFIRMED' | 'REJECTED', notes?: string) => {
    const previous = reviews[learnerId] || {};
    const updatedReview: ReviewRecord = {
      ...previous,
      confirmation: decision,
      notes: notes?.trim() || previous.notes || '',
      intervention_status: decision === 'CONFIRMED'
        ? (previous.intervention_status && previous.intervention_status !== 'NONE' ? previous.intervention_status : 'PENDING')
        : (previous.intervention_status === 'IN_PROGRESS' ? 'STOPPED' : previous.intervention_status || 'NONE'),
      intervention_type: previous.intervention_type || 'Hỗ trợ trực tiếp',
    };
    StorageService.saveReview(learnerId, updatedReview);
    setReviews(StorageService.getReviews());
    setLogs(StorageService.getLogs());
  };

  // Save learner from modal
  const handleSaveLearnerReview = (
    learnerId: string,
    decision: 'CONFIRMED' | 'REJECTED' | 'PENDING',
    notes?: string,
    intervention?: {
      type?: string;
      status?: InterventionStatus;
      date?: string;
      outcome?: string;
    }
  ) => {
    const previous = reviews[learnerId] || {};
    const updatedReview: ReviewRecord = {
      ...previous,
      confirmation: decision,
      notes,
      ...(intervention ? {
        intervention_type: intervention.type,
        intervention_status: intervention.status,
        intervention_date: intervention.date,
        intervention_outcome: intervention.outcome,
      } : {}),
    };
    StorageService.saveReview(learnerId, updatedReview);
    setReviews(StorageService.getReviews());
    setLogs(StorageService.getLogs());
  };

  const handleUpdateInterventionStatus = (learnerId: string, status: InterventionStatus) => {
    const previous = reviews[learnerId] || { confirmation: 'CONFIRMED' };
    const updatedReview: ReviewRecord = {
      ...previous,
      intervention_status: status,
    };
    StorageService.saveReview(learnerId, updatedReview);
    setReviews(StorageService.getReviews());
    setLogs(StorageService.getLogs());
  };

  const handleSaveThresholds = (newThresholds: Thresholds) => {
    StorageService.saveThresholds(newThresholds);
    setThresholds(newThresholds);
    setLogs(StorageService.getLogs());
  };

  const handleDataReloaded = () => {
    setRawLearners(StorageService.getLearnersRaw());
    setReviews(StorageService.getReviews());
    setLogs(StorageService.getLogs());
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen flex-col bg-slate-100 font-sans text-slate-800 antialiased overflow-hidden">
      {/* Top Header */}
      <Header
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        selectedWeek={selectedWeek}
        onWeekChange={setSelectedWeek}
        unreviewedAlertsCount={unreviewedAlertsCount}
        onOpenAlerts={() => setCurrentTab('alerts')}
        showWeekFilter={currentTab === 'overview'}
        classCounts={classCounts}
        totalLearners={allDerivedLearners.length}
        onLogout={handleLogout}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          unreviewedAlertsCount={unreviewedAlertsCount}
          activeInterventionsCount={activeInterventionsCount}
          totalLearners={allDerivedLearners.length}
        />

        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'overview' && (
            <OverviewView
              learners={visibleLearners}
              totalLearners={allDerivedLearners.length}
              selectedWeek={selectedWeek}
              reviews={reviews}
              onSelectLearner={setSelectedLearnerId}
              onNavigateTab={(tab) => setCurrentTab(tab as NavTab)}
            />
          )}

          {currentTab === 'learners' && (
            <LearnersView
              learners={visibleLearners}
              reviews={reviews}
              onSelectLearner={setSelectedLearnerId}
            />
          )}

          {currentTab === 'alerts' && (
            <AlertsView
              learners={visibleLearners}
              reviews={reviews}
              onSelectLearner={setSelectedLearnerId}
              onReviewDecision={handleReview}
            />
          )}

          {currentTab === 'interventions' && (
            <InterventionsView
              learners={visibleLearners}
              reviews={reviews}
              onSelectLearner={setSelectedLearnerId}
              onUpdateInterventionStatus={handleUpdateInterventionStatus}
            />
          )}

          {currentTab === 'audit' && (
            <AuditView
              learners={visibleLearners}
              thresholds={thresholds}
              onSelectLearner={setSelectedLearnerId}
            />
          )}

          {currentTab === 'data' && (
            <DataManagementView
              learnersRaw={rawLearners}
              onDataReloaded={handleDataReloaded}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              thresholds={thresholds}
              onSaveThresholds={handleSaveThresholds}
            />
          )}

          {currentTab === 'logs' && (
            <LogsView
              logs={logs}
              onLogsCleared={() => setLogs([])}
            />
          )}

          {currentTab === 'survey' && (
            <SurveyView
              surveys={surveys}
              onSurveySubmitted={() => setSurveys(StorageService.getSurveys())}
            />
          )}

          {currentTab === 'testcases' && (
            <TestCasesView />
          )}
        </main>
      </div>

      {/* Student Profile / Review Modal */}
      {selectedLearner && (
        <LearnerDetailModal
          learner={selectedLearner}
          review={reviews[selectedLearner.learner_id]}
          onClose={() => setSelectedLearnerId(null)}
          onSaveReview={handleSaveLearnerReview}
        />
      )}
    </div>
  );
}
