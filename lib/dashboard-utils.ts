import { RoadmapSubject, RoadmapTopic } from "@/types/roadmap";

export interface StudySession {
  id: string;
  userId: string;
  topicId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  completed: boolean;
}

export interface StudyTarget {
  minimumStudyHours: number;
  syllabusRequiredHours: number;
  totalStudyHours: number;
  remainingMinutes: number;
  remainingTopics: number;
  daysLeft: number;
  warning: string | null;
}

export interface DashboardResumeTopic {
  subject: string;
  topic: string;
  chapter: string;
  estimatedMinutes: number;
}

export interface DailyStudyAnalyticsPoint {
  day: string;
  hours: number;
  topics: number;
}

export interface HeatmapPoint {
  date: Date;
  value: number;
}

export interface RecentActivityGroup {
  label: string;
  items: string[];
}

export interface UpcomingItem {
  type: string;
  title: string;
  due: string;
  color: string;
}

function toDateValue(value: unknown) {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (value && typeof value === "object" && "toDate" in value) {
    const maybeDate = value as { toDate?: () => Date };
    if (typeof maybeDate.toDate === "function") {
      const parsed = maybeDate.toDate();
      return parsed instanceof Date ? parsed : null;
    }
  }

  return null;
}

function getDayStart(date: Date) {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
}

function getDayEnd(date: Date) {
  const day = new Date(date);
  day.setHours(23, 59, 59, 999);
  return day;
}

export function calculateOverallProgress(topics: RoadmapTopic[]) {
  const totalTopics = topics.length;
  const completedTopics = topics.filter((topic) => topic.completed).length;

  const progress = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

  return {
    totalTopics,
    completedTopics,
    progress,
  };
}

export function getStudyAnalytics(studySessions: StudySession[], topics: RoadmapTopic[], days = 7): {
  dailyStudyHours: DailyStudyAnalyticsPoint[];
  weeklyCompletions: DailyStudyAnalyticsPoint[];
} {
  const now = new Date();
  const dailyStudyHours: DailyStudyAnalyticsPoint[] = [];
  const weeklyCompletions: DailyStudyAnalyticsPoint[] = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - index);
    date.setHours(0, 0, 0, 0);

    const nextDay = new Date(date);
    nextDay.setHours(23, 59, 59, 999);

    const dayLabel = date.toLocaleDateString("en", { weekday: "short" });

    const minutes = studySessions
      .filter((session) => session.completed && session.endTime >= date && session.endTime <= nextDay)
      .reduce((sum, session) => sum + (session.duration ?? 0), 0);

    const completedSessions = studySessions.filter((session) => session.completed && session.endTime >= date && session.endTime <= nextDay).length;
    const completedTopics = topics.filter((topic) => topic.completed).length;

    dailyStudyHours.push({
      day: dayLabel,
      hours: Number((minutes / 60).toFixed(1)),
      topics: completedSessions,
    });

    weeklyCompletions.push({
      day: dayLabel,
      hours: completedSessions,
      topics: completedSessions,
    });
  }

  return {
    dailyStudyHours,
    weeklyCompletions: weeklyCompletions.map((point) => ({
      ...point,
      topics: Math.max(0, point.topics),
    })),
  };
}

export function getConsistencyHeatmap(studySessions: StudySession[], days = 28): HeatmapPoint[] {
  const now = new Date();

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (days - 1 - index));
    date.setHours(0, 0, 0, 0);

    const nextDay = new Date(date);
    nextDay.setHours(23, 59, 59, 999);

    const minutes = studySessions
      .filter((session) => session.completed && session.endTime >= date && session.endTime <= nextDay)
      .reduce((sum, session) => sum + (session.duration ?? 0), 0);

    const value = minutes <= 0 ? 0 : minutes <= 30 ? 1 : minutes <= 60 ? 2 : minutes <= 120 ? 3 : 4;

    return { date, value };
  });
}

export function getRecentActivity(studySessions: StudySession[], topics: RoadmapTopic[]): RecentActivityGroup[] {
  const recentSessions = studySessions
    .filter((session) => session.completed)
    .sort((left, right) => new Date(right.endTime).getTime() - new Date(left.endTime).getTime())
    .slice(0, 4);

  if (!recentSessions.length) {
    return [];
  }

  const grouped = new Map<string, string[]>();
  const now = new Date();

  recentSessions.forEach((session) => {
    const sessionDate = new Date(session.endTime);
    const isToday = sessionDate.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = sessionDate.toDateString() === yesterday.toDateString();
    const label = isToday ? "Today" : isYesterday ? "Yesterday" : "Earlier";
    const topic = topics.find((item) => item.id === session.topicId)?.topic ?? "Study topic";
    const itemText = `${topic} — ${Math.max(1, Math.round((session.duration ?? 0) / 60))} min`;

    const items = grouped.get(label) ?? [];
    items.push(itemText);
    grouped.set(label, items);
  });

  return Array.from(grouped.entries()).map(([label, items]) => ({ label, items }));
}

export function getUpcomingItems(todaysPlan: TodaysPlanItem[]) {
  return todaysPlan.slice(0, 3).map((item, index) => ({
    type: index === 0 ? "Priority" : index === 1 ? "Focus" : "Revision",
    title: item.topic,
    due: index === 0 ? "Today" : index === 1 ? "Tomorrow" : "This week",
    color: index === 0 ? "#6366F1" : index === 1 ? "#8B5CF6" : "#A78BFA",
  }));
}

export function calculateTodayStudied(studySessions: StudySession[]) {
  const today = new Date();
  const start = getDayStart(today);
  const end = getDayEnd(today);

  const totalMinutes = studySessions
    .filter((session) => session.completed && session.endTime >= start && session.endTime <= end)
    .reduce((sum, session) => sum + (session.duration ?? 0), 0);

  return Math.round((totalMinutes / 60) * 10) / 10;
}

export function calculateStreak(studySessions: StudySession[]): number {
  if (!studySessions.length) {
    return 0;
  }

  const uniqueDates = [
    ...new Set(
      studySessions
        .filter((session) => session.completed)
        .map((session) => {
          const date = getDayStart(new Date(session.endTime));
          return date.getTime();
        })
    ),
  ].sort((a, b) => b - a);

  if (!uniqueDates.length) {
    return 0;
  }

  const today = getDayStart(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (uniqueDates[0] !== today.getTime() && uniqueDates[0] !== yesterday.getTime()) {
    return 0;
  }

  let expected = uniqueDates[0] === today.getTime() ? today.getTime() : yesterday.getTime();
  let streak = 0;

  for (const date of uniqueDates) {
    if (date === expected) {
      streak += 1;
      expected -= 24 * 60 * 60 * 1000;
    } else {
      break;
    }
  }

  return streak;
}

export function calculateSubjectProgress(subjects: RoadmapSubject[], topics: RoadmapTopic[]) {
  return subjects.map((subject) => {
    const subjectTopics = topics.filter((topic) => topic.subject === subject.name);
    const completed = subjectTopics.filter((topic) => topic.completed).length;
    const total = subjectTopics.length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      id: subject.id,
      name: subject.name,
      progress,
      completed,
      total,
      remaining: total - completed,
    };
  });
}

export function getExamDaysLeft(examDate: unknown) {
  const parsedDate = toDateValue(examDate);

  if (!parsedDate) {
    return 0;
  }

  const today = getDayStart(new Date());
  const target = getDayStart(parsedDate);
  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}

export function calculateStudyTarget(
  topics: RoadmapTopic[],
  examDate: unknown,
  minimumStudyHours: number
): StudyTarget {
  const minimum = Math.max(0, Number(minimumStudyHours ?? 0));
  const remainingTopics = topics.filter((topic) => !topic.completed);
  const remainingMinutes = remainingTopics.reduce((sum, topic) => sum + (topic.estimatedMinutes ?? 0), 0);
  const parsedExamDate = toDateValue(examDate);

  if (!parsedExamDate) {
    return {
      minimumStudyHours: minimum,
      syllabusRequiredHours: 0,
      totalStudyHours: minimum,
      remainingMinutes,
      remainingTopics: remainingTopics.length,
      daysLeft: 0,
      warning: null,
    };
  }

  const today = getDayStart(new Date());
  const target = getDayStart(parsedExamDate);
  const diffMs = target.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysLeft <= 0) {
    return {
      minimumStudyHours: minimum,
      syllabusRequiredHours: remainingMinutes > 0 ? remainingMinutes / 60 : 0,
      totalStudyHours: minimum,
      remainingMinutes,
      remainingTopics: remainingTopics.length,
      daysLeft: 0,
      warning: remainingMinutes > 0 ? "The exam date has passed, but syllabus topics are still incomplete." : null,
    };
  }

  const syllabusRequiredHours = remainingMinutes / 60 / daysLeft;
  const roundedSyllabusHours = Math.max(0, Math.round(syllabusRequiredHours * 10) / 10);
  const totalStudyHours = Math.max(0.5, Math.round((minimum + roundedSyllabusHours) * 10) / 10);
  const impossibleToCover = remainingMinutes > daysLeft * 24 * 60 || totalStudyHours > 24;
  const extraNeeded = Math.max(0, roundedSyllabusHours - minimum);
  const warning = impossibleToCover
    ? "Even studying full-time, there is not enough time to cover the remaining syllabus before the exam."
    : remainingMinutes > 0 && extraNeeded > 0
      ? `You need about ${extraNeeded.toFixed(1)} extra hrs/day beyond your minimum to finish the syllabus on time.`
      : null;

  return {
    minimumStudyHours: minimum,
    syllabusRequiredHours: roundedSyllabusHours,
    totalStudyHours,
    remainingMinutes,
    remainingTopics: remainingTopics.length,
    daysLeft,
    warning,
  };
}

export function calculateXP(
  topics: RoadmapTopic[],
  studySessions: StudySession[],
  dailyStudyHours: number,
  streak: number,
  todayStudied: number
) {
  const completedTopics = topics.filter((topic) => topic.completed).length;
  const completedSessions = studySessions.filter((session) => session.completed).length;
  const dailyGoalComplete = todayStudied >= dailyStudyHours ? 100 : 0;

  const streakBonus =
    streak >= 30 ? 250 :
      streak >= 14 ? 150 :
        streak >= 7 ? 100 :
          streak >= 3 ? 50 : 0;

  return completedTopics * 50 + completedSessions * 20 + dailyGoalComplete + streakBonus;
}

export function calculateLevel(xp: number) {
  const xpPerLevel = 100;
  return 1 + Math.floor(xp / xpPerLevel);
}

export function calculateXpProgress(xp: number) {
  const xpPerLevel = 100;
  const level = calculateLevel(xp);
  const xpCurrent = xp % xpPerLevel;
  const xpNext = xpPerLevel;

  return { level, xpCurrent, xpNext };
}

export function calculateAheadDays(
  topics: RoadmapTopic[],
  dailyStudyHours: number,
  examDate: unknown
) {
  const remainingTopics = topics.filter((topic) => !topic.completed);
  const totalMinutes = remainingTopics.reduce((sum, topic) => {
    const minutesByDifficulty = {
      easy: 30,
      medium: 45,
      hard: 60,
    } as const;

    return sum + minutesByDifficulty[topic.difficulty];
  }, 0);

  if (!remainingTopics.length || dailyStudyHours <= 0) {
    return 0;
  }

  const estimatedDays = totalMinutes / 60 / dailyStudyHours;
  const estimatedCompletionDate = new Date();
  estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + Math.ceil(estimatedDays));

  const parsedExamDate = toDateValue(examDate);
  if (!parsedExamDate) {
    return 0;
  }

  const diffMs = parsedExamDate.getTime() - estimatedCompletionDate.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function calculateWeeklyMomentum(studySessions: StudySession[], dailyStudyHours: number) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const weeklyMinutes = studySessions
    .filter((session) => session.completed && session.endTime >= start && session.endTime <= end)
    .reduce((sum, session) => sum + (session.duration ?? 0), 0);

  const weeklyGoalMinutes = dailyStudyHours * 7 * 60;
  return weeklyGoalMinutes <= 0 ? 0 : Math.round((weeklyMinutes / weeklyGoalMinutes) * 100);
}

export function calculateAverageSessionDuration(studySessions: StudySession[]) {
  const completedSessions = studySessions.filter((session) => session.completed);
  if (!completedSessions.length) {
    return 0;
  }

  const totalMinutes = completedSessions.reduce((sum, session) => sum + (session.duration ?? 0), 0);
  return Math.round(totalMinutes / completedSessions.length);
}

export function calculatePerformanceScore(
  topics: RoadmapTopic[],
  studySessions: StudySession[],
  dailyStudyHours: number,
  streak: number,
  todayStudied: number
) {
  const completedTopics = topics.filter((topic) => topic.completed).length;
  const totalTopics = topics.length;
  const completedSessions = studySessions.filter((session) => session.completed).length;

  const consistencyScore = Math.min(100, Math.round(streak * 12));
  const goalScore = dailyStudyHours <= 0 ? 0 : Math.min(100, Math.round((todayStudied / dailyStudyHours) * 100));
  const completionScore = totalTopics === 0 ? 100 : Math.round((completedTopics / totalTopics) * 100);
  const revisionScore = Math.min(100, Math.round((completedSessions / Math.max(1, Math.ceil(totalTopics / 3))) * 100));

  return Math.round(consistencyScore * 0.3 + goalScore * 0.3 + completionScore * 0.25 + revisionScore * 0.15);
}

export function calculatePerformanceDelta(
  topics: RoadmapTopic[],
  studySessions: StudySession[],
  dailyStudyHours: number,
  todayStudied: number,
  streak: number
) {
  const currentScore = calculatePerformanceScore(topics, studySessions, dailyStudyHours, streak, todayStudied);

  const previousWindowEnd = new Date();
  const previousWindowStart = new Date(previousWindowEnd);
  previousWindowStart.setDate(previousWindowEnd.getDate() - 14);
  previousWindowEnd.setDate(previousWindowEnd.getDate() - 7);

  const previousSessions = studySessions.filter((session) => {
    const sessionDate = new Date(session.endTime);
    return session.completed && sessionDate >= previousWindowStart && sessionDate < previousWindowEnd;
  });

  const previousStreak = calculateStreak(previousSessions);
  const previousScore = calculatePerformanceScore(topics, previousSessions, dailyStudyHours, previousStreak, calculateTodayStudied(previousSessions));

  return currentScore - previousScore;
}

const ESTIMATED_MINUTES_BY_DIFFICULTY: Record<RoadmapTopic["difficulty"], number> = {
  easy: 90,
  medium: 180,
  hard: 360,
};

const DIFFICULTY_SCORE: Record<RoadmapTopic["difficulty"], number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

const WEIGHTAGE_SCORE: Record<RoadmapTopic["weightage"], number> = {
  low: 1,
  medium: 2,
  high: 3,
};

export interface TodaysPlanItem {
  id: string;
  subject: string;
  chapter: string;
  topic: string;
  difficulty: RoadmapTopic["difficulty"];
  weightage: RoadmapTopic["weightage"];
  estimatedMinutes: number;
  priority: number;
}

type SubjectMetrics = {
  totalTopics: number;
  remainingTopics: number;
  subjectBalanceScore: number;
};

function getSubjectBalanceScore(remainingPercentage: number) {
  if (remainingPercentage <= 0.25) {
    return 0;
  }

  if (remainingPercentage <= 0.5) {
    return 1;
  }

  if (remainingPercentage <= 0.75) {
    return 2;
  }

  return 3;
}

function normalizeRemainingScores(subjectMetrics: Map<string, SubjectMetrics>) {
  const remainingCounts = Array.from(subjectMetrics.values()).map((metrics) => metrics.remainingTopics);
  const minRemaining = Math.min(...remainingCounts);
  const maxRemaining = Math.max(...remainingCounts);
  const remainingScores = new Map<string, number>();

  for (const [subjectName, metrics] of subjectMetrics.entries()) {
    if (maxRemaining === minRemaining) {
      remainingScores.set(subjectName, 0);
      continue;
    }

    const normalizedScore = Math.round(
      ((metrics.remainingTopics - minRemaining) / (maxRemaining - minRemaining)) * 2
    );

    remainingScores.set(subjectName, normalizedScore);
  }

  return remainingScores;
}

function buildSubjectMetrics(topics: RoadmapTopic[], subjects: RoadmapSubject[]) {
  const subjectNames = new Set<string>([
    ...subjects.map((subject) => subject.name),
    ...topics.map((topic) => topic.subject),
  ]);

  const metrics = new Map<string, SubjectMetrics>();

  for (const subjectName of subjectNames) {
    const subjectTopics = topics.filter((topic) => topic.subject === subjectName);
    const totalTopics = subjectTopics.length;
    const remainingTopics = subjectTopics.filter((topic) => !topic.completed).length;
    const remainingPercentage = totalTopics === 0 ? 0 : remainingTopics / totalTopics;

    metrics.set(subjectName, {
      totalTopics,
      remainingTopics,
      subjectBalanceScore: getSubjectBalanceScore(remainingPercentage),
    });
  }

  return metrics;
}

export function getResumeTopic(todaysPlan: TodaysPlanItem[] | null | undefined): DashboardResumeTopic | null {
  const firstItem = todaysPlan?.[0];
  if (!firstItem) {
    return null;
  }

  return {
    subject: firstItem.subject,
    topic: firstItem.topic,
    chapter: firstItem.chapter,
    estimatedMinutes: firstItem.estimatedMinutes,
  };
}

export function generateTodaysPlan(topics: RoadmapTopic[], subjects: RoadmapSubject[], dailyStudyHours: number) {
  const incompleteTopics = topics.filter((topic) => !topic.completed);

  if (incompleteTopics.length === 0 || dailyStudyHours <= 0) {
    return [] as TodaysPlanItem[];
  }

  const subjectMetrics = buildSubjectMetrics(topics, subjects);
  const remainingScores = normalizeRemainingScores(subjectMetrics);

  const prioritizedTopics = incompleteTopics
    .map((topic) => {
      const subjectScore = subjectMetrics.get(topic.subject)?.subjectBalanceScore ?? 0;
      const remainingScore = remainingScores.get(topic.subject) ?? 0;
      const difficultyScore = DIFFICULTY_SCORE[topic.difficulty];
      const weightageScore = WEIGHTAGE_SCORE[topic.weightage];
      const revisionScore = 0;
      const estimatedMinutes = topic.estimatedMinutes || 90;
      const priority = difficultyScore + weightageScore + subjectScore + remainingScore + revisionScore;

      return {
        id: topic.id,
        subject: topic.subject,
        chapter: topic.chapter,
        topic: topic.topic,
        difficulty: topic.difficulty,
        weightage: topic.weightage,
        estimatedMinutes,
        priority,
        difficultyScore,
        weightageScore,
        subjectScore,
        remainingScore,
      };
    })
    .sort((left, right) => {
      if (right.priority !== left.priority) {
        return right.priority - left.priority;
      }

      if (right.weightageScore !== left.weightageScore) {
        return right.weightageScore - left.weightageScore;
      }

      if (right.difficultyScore !== left.difficultyScore) {
        return right.difficultyScore - left.difficultyScore;
      }

      if (right.remainingScore !== left.remainingScore) {
        return right.remainingScore - left.remainingScore;
      }

      if (right.subjectScore !== left.subjectScore) {
        return right.subjectScore - left.subjectScore;
      }

      if (left.estimatedMinutes !== right.estimatedMinutes) {
        return left.estimatedMinutes - right.estimatedMinutes;
      }

      return left.id.localeCompare(right.id);
    });

  let remainingMinutes = Math.floor(dailyStudyHours * 60);
  const todaysPlan: TodaysPlanItem[] = [];

  for (const topic of prioritizedTopics) {
    const estimatedMinutes = topic.estimatedMinutes;

    if (remainingMinutes < estimatedMinutes) {
      continue;
    }

    remainingMinutes -= estimatedMinutes;
    todaysPlan.push({
      id: topic.id,
      subject: topic.subject,
      chapter: topic.chapter,
      topic: topic.topic,
      difficulty: topic.difficulty,
      weightage: topic.weightage,
      estimatedMinutes,
      priority: topic.priority,
    });
  }

  return todaysPlan;
}


export function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning 👋";
  }

  if (hour >= 12 && hour < 17) {
    return "Good afternoon 👋";
  }

  if (hour >= 17 && hour < 21) {
    return "Good evening 👋";
  }

  return "Good night 🌙";
}
