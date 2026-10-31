import { LearnerRaw, ReviewRecord, Thresholds, AuditLog, TeacherSurvey } from '../types';
import { INITIAL_LEARNERS } from './seedData';

const KEYS = {
  LEARNERS: 'codecare_learners_v2',
  REVIEWS: 'codecare_reviews_v2',
  THRESHOLDS: 'codecare_thresholds_v2',
  LOGS: 'codecare_audit_logs_v2',
  SURVEYS: 'codecare_surveys_v2',
};

const DEFAULT_THRESHOLDS: Thresholds = {
  minTestPassRate: 50, // Flag if week 6 pass rate < 50%
  maxConsecutiveErrors: 6, // Flag if syntax + logic errors > 6
  maxDaysWithoutSubmission: 5,
  riskThreshold: 60, // Risk score >= 60 triggers ALERT
};

export class StorageService {
  static getLearnersRaw(): LearnerRaw[] {
    try {
      const data = localStorage.getItem(KEYS.LEARNERS);
      if (!data) {
        localStorage.setItem(KEYS.LEARNERS, JSON.stringify(INITIAL_LEARNERS));
        return INITIAL_LEARNERS;
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(KEYS.LEARNERS, JSON.stringify(INITIAL_LEARNERS));
        return INITIAL_LEARNERS;
      }
      return parsed;
    } catch {
      return INITIAL_LEARNERS;
    }
  }

  static saveLearnersRaw(learners: LearnerRaw[]): void {
    localStorage.setItem(KEYS.LEARNERS, JSON.stringify(learners));
  }

  static resetLearners(): LearnerRaw[] {
    localStorage.setItem(KEYS.LEARNERS, JSON.stringify(INITIAL_LEARNERS));
    this.addLog('RESET_DATA', 'Khôi phục toàn bộ 80 hồ sơ mẫu ban đầu', undefined, 'Giáo viên');
    return INITIAL_LEARNERS;
  }

  static getReviews(): Record<string, ReviewRecord> {
    try {
      const data = localStorage.getItem(KEYS.REVIEWS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  static saveReview(learnerId: string, review: ReviewRecord): void {
    const reviews = this.getReviews();
    reviews[learnerId] = {
      ...review,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));

    this.addLog(
      'UPDATE_REVIEW',
      `Cập nhật trạng thái xác nhận [${review.confirmation}] cho học sinh ${learnerId}. Can thiệp: ${review.intervention_status ?? 'NONE'}`,
      learnerId,
      'Giáo viên'
    );
  }

  static getThresholds(): Thresholds {
    try {
      const data = localStorage.getItem(KEYS.THRESHOLDS);
      return data ? { ...DEFAULT_THRESHOLDS, ...JSON.parse(data) } : DEFAULT_THRESHOLDS;
    } catch {
      return DEFAULT_THRESHOLDS;
    }
  }

  static saveThresholds(thresholds: Thresholds): void {
    localStorage.setItem(KEYS.THRESHOLDS, JSON.stringify(thresholds));
    this.addLog(
      'UPDATE_THRESHOLDS',
      `Thay đổi ngưỡng cảnh báo: Pass tối thiểu ${thresholds.minTestPassRate}%, Ngưỡng điểm nguy cơ ${thresholds.riskThreshold}`,
      undefined,
      'Giáo viên'
    );
  }

  static getLogs(): AuditLog[] {
    try {
      const data = localStorage.getItem(KEYS.LOGS);
      if (!data) {
        // Initial sample logs
        const initialLogs: AuditLog[] = [
          {
            id: 'log-1',
            timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
            action: 'SYSTEM_INIT',
            details: 'Khởi tạo hệ thống CodeCare với 80 hồ sơ học sinh (Lớp A, B, C)',
            author: 'Hệ thống',
          },
          {
            id: 'log-2',
            timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
            action: 'INFERENCE_RUN',
            details: 'Chạy phân tích cảnh báo sớm tuần 6: phát hiện 31 trường hợp cần lưu ý',
            author: 'Hệ thống AI',
          },
        ];
        localStorage.setItem(KEYS.LOGS, JSON.stringify(initialLogs));
        return initialLogs;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static addLog(action: string, details: string, targetId?: string, author: string = 'Giáo viên'): void {
    const logs = this.getLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      action,
      target_id: targetId,
      details,
      author,
    };
    logs.unshift(newLog);
    // Keep last 100 logs
    if (logs.length > 100) logs.pop();
    localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
  }

  static clearLogs(): void {
    localStorage.setItem(KEYS.LOGS, JSON.stringify([]));
  }

  static getSurveys(): TeacherSurvey[] {
    try {
      const data = localStorage.getItem(KEYS.SURVEYS);
      if (!data) {
        const initialSurveys: TeacherSurvey[] = [
          {
            id: 'surv-1',
            timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
            teacher_name: 'Thầy Hoàng',
            class_evaluated: 'LOP_A',
            alert_accuracy_rating: 5,
            explanation_clarity_rating: 4,
            usefulness_rating: 5,
            feedback: 'Cảnh báo đúng lúc học sinh gặp khó khăn ở vòng lặp lồng nhau tuần 5. Rất trực quan.',
          },
        ];
        localStorage.setItem(KEYS.SURVEYS, JSON.stringify(initialSurveys));
        return initialSurveys;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static addSurvey(survey: Omit<TeacherSurvey, 'id' | 'timestamp'>): void {
    const surveys = this.getSurveys();
    const newSurvey: TeacherSurvey = {
      ...survey,
      id: `surv-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    surveys.unshift(newSurvey);
    localStorage.setItem(KEYS.SURVEYS, JSON.stringify(surveys));
    this.addLog('SUBMIT_SURVEY', `Gửi phiếu đánh giá độ chính xác cảnh báo cho ${survey.class_evaluated}`, undefined, survey.teacher_name || 'Giáo viên');
  }
}
