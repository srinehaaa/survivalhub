import type { Assignment, Exam, PriorityTask, Status, SurvivalBlock } from './types';
import { daysUntil } from './dateUtils';

// Weighted priority model
// Deadline urgency = 40%, Importance = 25%, Exam proximity = 20%, Estimated time = 15%
export const WEIGHTS = {
  deadline: 0.4,
  importance: 0.25,
  examProximity: 0.2,
  estimatedTime: 0.15,
} as const;

export const WEIGHT_LABELS = [
  { label: 'Deadline urgency', value: '40%' },
  { label: 'Importance', value: '25%' },
  { label: 'Exam proximity', value: '20%' },
  { label: 'Estimated time', value: '15%' },
];

const importanceMap = { high: 100, medium: 60, low: 30 } as const;

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Calculate a priority score from 0-100.
 * - deadlineDays: days until due (0 = today). Sooner = higher score.
 * - importance: high/medium/low
 * - examDays: days until nearest related exam (null = no exam factor)
 * - minutes: estimated time required
 */
export function calculatePriorityScore(
  deadlineDays: number,
  importance: 'high' | 'medium' | 'low',
  examDays: number | null,
  minutes: number
): number {
  // Deadline urgency: 0 days => 100, 14+ days => ~0
  const deadlineScore = Math.max(0, 100 - (Math.max(0, deadlineDays) / 14) * 100);

  // Importance normalized
  const importanceScore = importanceMap[importance];

  // Exam proximity: exam within 7 days => high, drops off after
  let examScore = 0;
  if (examDays !== null) {
    examScore = Math.max(0, 100 - (Math.max(0, examDays) / 14) * 100);
  }

  // Estimated time: more time required => slightly higher urgency (needs earlier start)
  // 30 min => 40, 180 min => 100
  const timeScore = clamp(40 + ((minutes - 30) / 150) * 60);

  const score =
    deadlineScore * WEIGHTS.deadline +
    importanceScore * WEIGHTS.importance +
    examScore * WEIGHTS.examProximity +
    timeScore * WEIGHTS.estimatedTime;

  return clamp(score);
}

export function scoreToStatus(score: number): Status {
  if (score >= 85) return 'urgent';
  if (score >= 70) return 'high';
  if (score >= 45) return 'medium';
  return 'low';
}

/** Build a unified priority task list from assignments + exams. */
export function buildPriorityTasks(
  assignments: Assignment[],
  exams: Exam[]
): PriorityTask[] {
  const tasks: PriorityTask[] = [];

  for (const a of assignments) {
    if (a.status === 'completed') continue;
    const dDays = daysUntil(a.deadline);
    // Find related exam for exam proximity
    const relatedExam = exams.find((e) => e.subject === a.subject);
    const examDays = relatedExam ? daysUntil(relatedExam.date) : null;
    const score = calculatePriorityScore(dDays, a.importance, examDays, a.estimatedMinutes);
    tasks.push({
      id: a.id,
      name: a.name,
      subject: a.subject,
      deadline: a.deadline,
      estimatedMinutes: a.estimatedMinutes,
      priorityScore: score,
      importance: a.importance,
      status: scoreToStatus(score),
      type: 'assignment',
    });
  }

  // Exams themselves become prep tasks when within 10 days
  for (const e of exams) {
    const dDays = daysUntil(e.date);
    if (dDays < 0 || dDays > 14) continue;
    const score = calculatePriorityScore(dDays, 'high', dDays, 120);
    tasks.push({
      id: e.id,
      name: `${e.name} Preparation`,
      subject: e.subject,
      deadline: e.date,
      estimatedMinutes: 120,
      priorityScore: score,
      importance: 'high',
      status: scoreToStatus(score),
      type: 'exam',
    });
  }

  return tasks.sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Generate a survival plan for the given number of minutes.
 * Greedy fill: allocate blocks to the highest-priority tasks, inserting breaks.
 */
export function generateSurvivalPlan(
  tasks: PriorityTask[],
  totalMinutes: number
): SurvivalBlock[] {
  const blocks: SurvivalBlock[] = [];
  const sorted = [...tasks].sort((a, b) => b.priorityScore - a.priorityScore);

  let remaining = totalMinutes;
  let cursor = 0;

  for (let i = 0; i < sorted.length && remaining > 0; i++) {
    const task = sorted[i];

    // Determine block length: give ~70% of remaining to the top task, capped at its estimate
    let blockLen: number;
    if (i === 0) {
      blockLen = Math.min(task.estimatedMinutes, Math.round(totalMinutes * 0.4));
    } else {
      blockLen = Math.min(task.estimatedMinutes, Math.round(remaining * 0.6));
    }
    blockLen = Math.max(15, blockLen);
    blockLen = Math.min(blockLen, remaining);

    blocks.push({
      startTime: formatBlockTime(cursor),
      endTime: formatBlockTime(cursor + blockLen),
      label: task.name,
      subject: task.subject,
      minutes: blockLen,
      isBreak: false,
      taskId: task.id,
    });

    cursor += blockLen;
    remaining -= blockLen;

    // Insert a 15-min break if more work remains
    if (remaining > 20) {
      const breakLen = Math.min(15, remaining);
      blocks.push({
        startTime: formatBlockTime(cursor),
        endTime: formatBlockTime(cursor + breakLen),
        label: 'Break',
        subject: '',
        minutes: breakLen,
        isBreak: true,
      });
      cursor += breakLen;
      remaining -= breakLen;
    }
  }

  return blocks;
}

function formatBlockTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h < 12 ? 'AM' : 'PM';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
}
