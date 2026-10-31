import { LearnerRaw } from '../types';

export class DataValidator {
  static validateLearner(data: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data || typeof data !== 'object') {
      return { valid: false, errors: ['Dữ liệu không phải là đối tượng hợp lệ'] };
    }

    const item = data as Partial<LearnerRaw>;

    if (!item.learner_id || typeof item.learner_id !== 'string') {
      errors.push('Thiếu mã định danh học sinh (learner_id)');
    }

    if (!item.name || typeof item.name !== 'string') {
      errors.push('Thiếu tên học sinh (name)');
    }

    if (!item.class_name || !['LOP_A', 'LOP_B', 'LOP_C'].includes(item.class_name)) {
      errors.push('Lớp không hợp lệ (phải là LOP_A, LOP_B hoặc LOP_C)');
    }

    if (!Array.isArray(item.weeks) || item.weeks.length === 0) {
      errors.push('Thiếu dữ liệu theo tuần (weeks)');
    } else {
      item.weeks.forEach((w, idx) => {
        if (typeof w.testPassRate !== 'number' || w.testPassRate < 0 || w.testPassRate > 100) {
          errors.push(`Tuần ${idx + 1}: Tỷ lệ pass test không hợp lệ (0-100)`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static validateLearnerList(list: unknown): { valid: boolean; validCount: number; errors: string[] } {
    if (!Array.isArray(list)) {
      return { valid: false, validCount: 0, errors: ['Dữ liệu nạp vào phải là mảng danh sách học sinh'] };
    }

    const allErrors: string[] = [];
    let validCount = 0;

    list.forEach((item, idx) => {
      const res = this.validateLearner(item);
      if (!res.valid) {
        allErrors.push(`Học sinh ở dòng #${idx + 1}: ${res.errors.join('; ')}`);
      } else {
        validCount++;
      }
    });

    return {
      valid: allErrors.length === 0,
      validCount,
      errors: allErrors,
    };
  }
}
