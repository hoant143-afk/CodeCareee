import { DerivedLearner, LearnerRaw, Thresholds, ClassName } from '../types';

export class AnalyticsService {
  /**
   * Derive analytics and alert inference for a student given thresholds.
   */
  static deriveLearner(raw: LearnerRaw, thresholds: Thresholds): DerivedLearner {
    const weeks = raw.weeks || [];
    const totalSubmissions = weeks.reduce((sum, w) => sum + w.submissions, 0);
    const totalHours = weeks.reduce((sum, w) => sum + w.practiceHours, 0);
    const weeklyPassRates = weeks.map((w) => w.testPassRate);
    const avgTestPass = weeks.length > 0
      ? Math.round(weeklyPassRates.reduce((a, b) => a + b, 0) / weeks.length)
      : 0;

    const latestWeek = weeks[weeks.length - 1];
    const prevWeek = weeks[weeks.length - 2];

    const alertReasons: string[] = [];
    let riskScore = 0;

    if (latestWeek) {
      // Evidence 1: Test pass rate in latest week
      if (latestWeek.testPassRate < thresholds.minTestPassRate) {
        const diff = thresholds.minTestPassRate - latestWeek.testPassRate;
        riskScore += 35 + Math.min(25, diff);
        alertReasons.push(`Tỷ lệ pass test tuần ${latestWeek.week} đạt ${latestWeek.testPassRate}% (dưới ngưỡng tối thiểu ${thresholds.minTestPassRate}%)`);
      }

      // Evidence 2: Drop in test pass compared to previous week
      if (prevWeek && prevWeek.testPassRate - latestWeek.testPassRate >= 15) {
        const drop = prevWeek.testPassRate - latestWeek.testPassRate;
        riskScore += 20;
        alertReasons.push(`Kết quả kiểm thử giảm đột ngột ${drop}% so với tuần trước (${prevWeek.testPassRate}% → ${latestWeek.testPassRate}%)`);
      }

    // Evidence 3: High compiler syntax/logic errors (Total for the week)
      const totalErrors = latestWeek.syntaxErrors + latestWeek.logicErrors;
      if (totalErrors >= thresholds.maxConsecutiveErrors) {
        riskScore += 25;
        alertReasons.push(`Ghi nhận ${totalErrors} lần gặp lỗi biên dịch & logic ở tuần ${latestWeek.week} (ngưỡng: ${thresholds.maxConsecutiveErrors})`);
      }

      // Evidence 4: Low practice hours
      if (latestWeek.practiceHours < 2.0) {
        riskScore += 15;
        alertReasons.push(`Thời lượng thực hành ít (${latestWeek.practiceHours}h/tuần), nguy cơ hổng kiến thức thực hành`);
      }
    }

    riskScore = Math.min(100, Math.max(0, riskScore));

    const isAlert = riskScore >= thresholds.riskThreshold;

    let riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (riskScore >= 70) riskLevel = 'HIGH';
    else if (riskScore >= 45) riskLevel = 'MEDIUM';

    return {
      ...raw,
      alert: isAlert,
      alert_reasons: alertReasons.length > 0 ? alertReasons : ['Tiến độ học tập và kiểm thử bình thường'],
      risk_score: riskScore,
      risk_level: riskLevel,
      avg_test_pass: avgTestPass,
      total_submissions: totalSubmissions,
      total_practice_hours: Math.round(totalHours * 10) / 10,
      latest_submission_date: latestWeek?.lastSubmission || 'Chưa nộp',
      weekly_pass_rates: weeklyPassRates,
    };
  }

  static deriveAllLearners(rawList: LearnerRaw[], thresholds: Thresholds): DerivedLearner[] {
    return rawList.map((l) => this.deriveLearner(l, thresholds));
  }

  /**
   * Confusion matrix and performance metrics
   */
  static calculateConfusionMatrix(learners: DerivedLearner[]) {
    let tp = 0; // Predicted ALERT, Ground Truth TRUE
    let fp = 0; // Predicted ALERT, Ground Truth FALSE
    let tn = 0; // Predicted NORMAL, Ground Truth FALSE
    let fn = 0; // Predicted NORMAL, Ground Truth TRUE

    learners.forEach((l) => {
      const pred = l.alert;
      const actual = l.ground_truth_risk;

      if (pred && actual) tp++;
      else if (pred && !actual) fp++;
      else if (!pred && !actual) tn++;
      else if (!pred && actual) fn++;
    });

    const total = learners.length;
    const accuracy = total > 0 ? (tp + tn) / total : 0;
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    const specificity = tn + fp > 0 ? tn / (tn + fp) : 0;

    return {
      total,
      tp,
      fp,
      tn,
      fn,
      accuracy: Math.round(accuracy * 1000) / 10, // e.g. 95.0%
      precision: Math.round(precision * 1000) / 10, // e.g. 93.5%
      recall: Math.round(recall * 1000) / 10, // e.g. 93.5%
      f1: Math.round(f1 * 1000) / 10,
      specificity: Math.round(specificity * 1000) / 10,
    };
  }

  /**
   * Disaggregated class breakdown to evaluate algorithmic fairness
   */
  static calculateClassFairness(learners: DerivedLearner[]) {
    const classes: ClassName[] = ['LOP_A', 'LOP_B', 'LOP_C'];
    return classes.map((cls) => {
      const subset = learners.filter((l) => l.class_name === cls);
      const metrics = this.calculateConfusionMatrix(subset);
      const alertRate = subset.length > 0
        ? Math.round((subset.filter((l) => l.alert).length / subset.length) * 100)
        : 0;
      return {
        className: cls,
        count: subset.length,
        alertCount: subset.filter((l) => l.alert).length,
        alertRate,
        ...metrics,
      };
    });
  }
}
