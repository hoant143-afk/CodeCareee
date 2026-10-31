export type ClassName = 'LOP_A' | 'LOP_B' | 'LOP_C';

export type Decision = 'CONFIRMED' | 'REJECTED' | 'PENDING';

export type InterventionStatus = 'NONE' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'STOPPED';

export interface WeeklyData {
  week: number;
  topic: string;
  submissions: number;
  testPassRate: number; // 0 - 100
  syntaxErrors: number;
  logicErrors: number;
  practiceHours: number;
  lastSubmission: string;
  completedTasks: number;
  totalTasks: number;
}

export interface LearnerRaw {
  learner_id: string; // STU001 - STU080
  name: string;
  class_name: ClassName;
  ground_truth_risk: boolean; // Teacher Ground Truth label for benchmark validation
  weeks: WeeklyData[];
}

export interface DerivedLearner extends LearnerRaw {
  alert: boolean;
  alert_reasons: string[];
  risk_score: number; // 0 - 100
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  avg_test_pass: number;
  total_submissions: number;
  total_practice_hours: number;
  latest_submission_date: string;
  weekly_pass_rates: number[];
}

export interface ReviewRecord {
  confirmation: Decision;
  notes?: string;
  intervention_type?: string;
  intervention_status?: InterventionStatus;
  intervention_date?: string;
  intervention_outcome?: string;
  updated_at?: string;
}

export interface Thresholds {
  minTestPassRate: number; // Default: 50%
  maxConsecutiveErrors: number; // Default: 6 errors
  maxDaysWithoutSubmission: number; // Default: 5 days
  riskThreshold: number; // Default score 60 for ALERT
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  target_id?: string;
  details: string;
  author: string;
}

export interface TeacherSurvey {
  id: string;
  timestamp: string;
  teacher_name?: string;
  class_evaluated: string;
  alert_accuracy_rating: number; // 1-5
  explanation_clarity_rating: number; // 1-5
  usefulness_rating: number; // 1-5
  feedback: string;
}

export interface TestCaseResult {
  id: string;
  name: string;
  description: string;
  status: 'PASS' | 'FAIL' | 'PENDING_UI';
  duration_ms: number;
  details: string;
}
