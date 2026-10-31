import { LearnerRaw } from '../types';

export class DataValidator {
  static validateLearner(data: any, existingIds: Set<string>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data || typeof data !== 'object') {
      return { valid: false, errors: ['Dữ liệu không phải là đối tượng hợp lệ'] };
    }

    if (!data.learner_id || typeof data.learner_id !== 'string' || data.learner_id.trim() === '') {
      errors.push('Thiếu hoặc mã định danh học sinh rỗng');
    } else if (existingIds.has(data.learner_id)) {
      errors.push(`Mã định danh bị trùng lặp: ${data.learner_id}`);
    }

    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      errors.push('Thiếu tên học sinh');
    }

    if (!['LOP_A', 'LOP_B', 'LOP_C'].includes(data.class_name)) {
      errors.push(`Lớp không hợp lệ: ${data.class_name}`);
    }

    if (!Array.isArray(data.weeks) || data.weeks.length !== 6) {
      errors.push('Thiếu dữ liệu tuần hoặc không đủ 6 tuần học');
    } else {
      data.weeks.forEach((w: any, idx: number) => {
        if (typeof w.testPassRate !== 'number' || isNaN(w.testPassRate) || w.testPassRate < 0 || w.testPassRate > 100) {
          errors.push(`Tuần ${idx + 1}: Tỷ lệ pass test không hợp lệ`);
        }
        if (typeof w.submissions !== 'number' || isNaN(w.submissions) || w.submissions < 0) {
          errors.push(`Tuần ${idx + 1}: Số bài nộp không hợp lệ`);
        }
      });
    }

    return { valid: errors.length === 0, errors };
  }

  static validateLearnerList(list: any): { valid: boolean; errors: string[] } {
    if (!Array.isArray(list)) {
      return { valid: false, errors: ['Dữ liệu không phải là mảng'] };
    }

    const allErrors: string[] = [];
    const seenIds = new Set<string>();

    list.forEach((item, idx) => {
      const res = this.validateLearner(item, seenIds);
      if (!res.valid) {
        allErrors.push(`Học sinh #${idx + 1} (${item.learner_id || 'Unknown'}): ${res.errors.join('; ')}`);
      } else {
        seenIds.add(item.learner_id);
      }
    });

    return { valid: allErrors.length === 0, errors: allErrors };
  }
}
