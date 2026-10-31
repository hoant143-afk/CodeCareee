import { LearnerRaw, WeeklyData } from '../types';

const TOPICS = [
  'Nhập xuất dữ liệu & Biến',
  'Cấu trúc điều kiện if/else',
  'Vòng lặp for/while',
  'Mảng & Xử lý chuỗi',
  'Hàm & Phạm vi biến',
  'Cấu trúc dữ liệu & Thuật toán',
];

const VIETNAMESE_NAMES = [
  'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Minh Đức', 'Vũ Thị Hạnh',
  'Hoàng Quốc Hùng', 'Đặng Mai Hương', 'Bùi Tuấn Kiệt', 'Đỗ Thanh Long', 'Ngô Bảo Nam',
  'Dương Thu Nga', 'Lý Hải Quân', 'Mai Phương Thảo', 'Hồ Công Thành', 'Võ Trúc Linh',
  'Phan Đăng Khoa', 'Trương Gia Bảo', 'Đinh Tiến Đạt', 'Lâm Khánh Vy', 'Cao Xuân Phúc',
  'Lê Thị Thu Trang', 'Nguyễn Tấn Phát', 'Trần Đình Trọng', 'Phạm Quỳnh Anh', 'Vũ Đức Duy',
  'Hoàng Kim Ngân', 'Đặng Hải Đăng', 'Bùi Bích Phương', 'Đỗ Thành Trung', 'Ngô Mỹ Linh',
  'Dương Gia Huy', 'Lý Ánh Tuyết', 'Mai Văn Toàn', 'Hồ Thị Kim Oanh', 'Võ Đình Tuấn',
  'Phan Thanh Thúy', 'Trương Hồng Quân', 'Đinh Ngọc Diệp', 'Lâm Minh Châu', 'Cao Hoài Nam',
  'Nguyễn Trọng Nghĩa', 'Trần Thu Hà', 'Lê Hữu Thắng', 'Phạm Tuyết Mai', 'Vũ Quốc Bảo',
  'Hoàng Nhật Minh', 'Đặng Thùy Dung', 'Bùi Quang Khải', 'Đỗ Thảo Nguyên', 'Ngô Hữu Phước',
  'Dương Tuấn Anh', 'Lý Mỹ Duyên', 'Mai Xuân Bách', 'Hồ Bích Ngọc', 'Võ Hoàng Quân',
  'Phan Diệu Linh', 'Trương Quốc Anh', 'Đinh Văn Hoàng', 'Lâm Thúy Hằng', 'Cao Tuấn Kiệt',
  'Nguyễn Ái Vân', 'Trần Công Danh', 'Lê Thị Mỹ Lệ', 'Phạm Nhật Huy', 'Vũ Hương Giang',
  'Hoàng Văn Nam', 'Đặng Ngọc Ánh', 'Bùi Tiến Dũng', 'Đỗ Thùy Trang', 'Ngô Gia Khánh',
  'Dương Hữu Tài', 'Lý Thị Thảo', 'Mai Đăng Quang', 'Hồ Ngọc Hà', 'Võ Minh Trí',
  'Phan Bảo Trâm', 'Trương Nhật Tân', 'Đinh Quỳnh Châu', 'Lâm Đình Phong', 'Cao Thị Yến Nhi'
];

/**
 * 80 students across 3 classes:
 * LOP_A: STU001 - STU028 (28 students)
 * LOP_B: STU029 - STU054 (26 students)
 * LOP_C: STU055 - STU080 (26 students)
 *
 * Algorithm Confusion Matrix Benchmark:
 * TP = 29 (Predicted ALERT, Ground Truth = TRUE)
 * FP = 2  (Predicted ALERT, Ground Truth = FALSE) -> STU012, STU044
 * FN = 2  (Predicted NORMAL, Ground Truth = TRUE) -> STU025, STU068
 * TN = 47 (Predicted NORMAL, Ground Truth = FALSE) -> Remaining 47 students
 * Total ALERT = 31, Total Ground Truth = 31, Total Learners = 80
 */
export const INITIAL_LEARNERS: LearnerRaw[] = Array.from({ length: 80 }, (_, idx) => {
  const num = idx + 1;
  const idStr = num < 10 ? `STU00${num}` : `STU0${num}`;
  const className = num <= 28 ? 'LOP_A' : num <= 54 ? 'LOP_B' : 'LOP_C';
  const name = VIETNAMESE_NAMES[idx] || `Học sinh ${num}`;

  // Designating indices for TP, FP, FN, TN
  // TP (29 students): indices 0..10 (except 11), 28..37 (except 43), 54..63
  const tpNumbers = [
    1, 2, 3, 5, 6, 8, 9, 14, 16, 18, 20, // 11 in LOP_A
    30, 31, 33, 35, 38, 40, 42, 46, 50, // 9 in LOP_B
    56, 57, 59, 61, 64, 66, 70, 74, 78  // 9 in LOP_C
  ]; // Total = 11 + 9 + 9 = 29 TP

  const fpNumbers = [12, 44]; // 2 FP: Algorithm flags ALERT due to sudden week 6 slump, but Ground Truth is FALSE (student was sick, already mastered)
  const fnNumbers = [25, 68]; // 2 FN: Algorithm didn't flag (score slightly below threshold), but Ground Truth is TRUE (silent struggle)

  const isTP = tpNumbers.includes(num);
  const isFP = fpNumbers.includes(num);
  const isFN = fnNumbers.includes(num);

  const isGroundTruthRisk = isTP || isFN; // Exactly 29 + 2 = 31 Ground Truth Positives
  const willBeAlert = isTP || isFP; // Exactly 29 + 2 = 31 Algorithm Alerts

  // Generate 6 weeks of data reflecting whether the student triggers alert or not
  const weeks: WeeklyData[] = TOPICS.map((topic, wIdx) => {
    const weekNum = wIdx + 1;
    let testPassRate = 85;
    let submissions = 12;
    let syntaxErrors = 2;
    let logicErrors = 1;
    let practiceHours = 4.5;
    let completedTasks = 5;
    const totalTasks = 5;

    if (willBeAlert) {
      // Degrades over weeks 4, 5, 6
      if (weekNum <= 2) {
        testPassRate = 75 - (num % 5);
        submissions = 10;
        syntaxErrors = 4;
        logicErrors = 2;
        practiceHours = 3.5;
        completedTasks = 4;
      } else if (weekNum <= 4) {
        testPassRate = 55 - (num % 8);
        submissions = 8;
        syntaxErrors = 7;
        logicErrors = 5;
        practiceHours = 2.8;
        completedTasks = 3;
      } else {
        // Week 5-6 severe struggle
        testPassRate = 32 + (num % 12); // Under 45%
        submissions = 5 + (num % 4);
        syntaxErrors = 9 + (num % 4);
        logicErrors = 7 + (num % 3);
        practiceHours = 1.8;
        completedTasks = 2;
      }
    } else if (isFN) {
      // Marginal student: passes tests barely (52%), submissions barely passing, Ground truth flagged by teacher observation
      if (weekNum >= 4) {
        testPassRate = 52 + (num % 3);
        submissions = 7;
        syntaxErrors = 5;
        logicErrors = 4;
        practiceHours = 2.4;
        completedTasks = 3;
      } else {
        testPassRate = 65;
        submissions = 9;
        syntaxErrors = 4;
        logicErrors = 2;
        practiceHours = 3.0;
        completedTasks = 4;
      }
    } else {
      // Normal healthy student (TN)
      const basePass = 80 + ((num * 3) % 18);
      testPassRate = Math.min(100, basePass - (weekNum > 4 ? 4 : 0));
      submissions = 12 + (num % 7);
      syntaxErrors = Math.max(0, 3 - Math.floor(num % 3));
      logicErrors = Math.max(0, 2 - Math.floor(num % 2));
      practiceHours = 4.0 + (num % 3) * 0.5;
      completedTasks = weekNum === 6 ? 4 : 5;
    }

    const dayOffset = (80 - num) % 7;
    const lastSubDate = `2026-10-${Math.max(15, 30 - dayOffset - (6 - weekNum) * 5)} 20:30`;

    return {
      week: weekNum,
      topic,
      submissions,
      testPassRate,
      syntaxErrors,
      logicErrors,
      practiceHours,
      lastSubmission: lastSubDate,
      completedTasks,
      totalTasks,
    };
  });

  return {
    learner_id: idStr,
    name,
    class_name: className,
    ground_truth_risk: isGroundTruthRisk,
    weeks,
  };
});
