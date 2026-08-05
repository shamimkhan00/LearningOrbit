"use client";

import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

import { useRoadmap } from "@/hooks/use-roadmap";
import {
  generateTodaysPlan,
  calculateOverallProgress,
  calculateStreak,
  calculateSubjectProgress,
  calculateTodayStudied,
  calculateXP,
  calculateXpProgress,
  calculateAheadDays,
  calculateWeeklyMomentum,
  calculatePerformanceScore,
  calculatePerformanceDelta,
  calculateAverageSessionDuration,
  getExamDaysLeft,
  getResumeTopic,
} from "@/lib/dashboard-utils";


export const MOTIVATIONS = [
  "Every topic completed brings you closer to your goal.",
  "Stay consistent. Results will follow.",
  "One focused session is better than hours of distraction.",
  "Small progress every day compounds into success.",
  "Today's effort becomes tomorrow's confidence.",
  "Keep showing up. That's where success begins.",
  "Focus on progress, not perfection.",
  "The hardest chapter becomes the easiest after practice.",
  "Discipline beats motivation.",
  "Future you will thank you for studying today.",

  // Consistency
  "Consistency beats intensity every time.",
  "Show up today. That's how champions are made.",
  "Success is built one study session at a time.",
  "Keep the streak alive.",
  "A little progress is still progress.",
  "Stay patient. Stay consistent.",
  "Don't break today's momentum.",
  "Keep moving, even if it's one chapter at a time.",
  "Learning compounds like interest.",
  "One more session. One step closer.",

  // Focus
  "Focus on the next topic, not the entire syllabus.",
  "One chapter at a time. One victory at a time.",
  "Deep focus creates lasting understanding.",
  "Distraction steals your future.",
  "Give this session your full attention.",
  "Your phone can wait. Your goals can't.",
  "Concentrate now. Celebrate later.",
  "Every focused minute matters.",
  "Quality study beats long study.",
  "Protect your focus like it's your superpower.",

  // Exams
  "The exam rewards preparation, not luck.",
  "Every solved problem increases your confidence.",
  "Preparation turns pressure into confidence.",
  "Master today's topics before worrying about tomorrow.",
  "Revision starts with understanding.",
  "Strong foundations make difficult chapters easier.",
  "Every question you solve is one less to fear.",
  "The syllabus shrinks every time you study.",
  "Today's revision prevents tomorrow's panic.",
  "Your preparation decides your performance.",

  // Discipline
  "Motivation fades. Discipline stays.",
  "Do it even when you don't feel like it.",
  "The best students aren't always the smartest—they're the most consistent.",
  "Progress is earned, never given.",
  "Excuses don't complete chapters.",
  "Small actions repeated daily create big results.",
  "Discipline is choosing your future over comfort.",
  "The hardest part is starting.",
  "Your habits shape your rank.",
  "Keep going. You're building something bigger.",

  // Confidence
  "You know more today than you did yesterday.",
  "Confidence grows with every completed topic.",
  "Trust the process.",
  "Believe in your preparation.",
  "Every session makes you stronger.",
  "Progress creates confidence.",
  "Every completed chapter is proof you can do this.",
  "You're capable of more than you think.",
  "Your effort is never wasted.",
  "Keep proving yourself right.",

  // Daily
  "Win today's study session.",
  "Today's work is tomorrow's advantage.",
  "Study now. Relax later.",
  "Don't wait for motivation. Start anyway.",
  "The best time to study is now.",
  "Every page matters.",
  "Every concept mastered is a step toward success.",
  "Make today count.",
  "Keep learning. Keep growing.",
  "Your future starts with today's decisions.",

  // AI Tracker Style
  "Complete today's plan to stay ahead of schedule.",
  "One completed topic unlocks the next milestone.",
  "Every green checkmark is real progress.",
  "Momentum is built one task at a time.",
  "Stay on track. Your roadmap is waiting.",
  "Today's plan is your shortest path to success.",
  "Keep your progress bar moving.",
  "Small wins build big achievements.",
  "Complete today's targets before tomorrow begins.",
  "Your roadmap only moves when you do.",

  // Short
  "Keep learning.",
  "Stay curious.",
  "Keep improving.",
  "You've got this.",
  "Stay focused.",
  "Keep going.",
  "Never stop learning.",
  "Trust yourself.",
  "Learn. Practice. Repeat.",
  "Progress over perfection.",

  // Premium feel
  "Today's discipline becomes tomorrow's achievement.",
  "Master the process. Results will follow.",
  "Great results begin with small daily actions.",
  "The finish line gets closer with every topic.",
  "The effort you invest today shapes the future you want.",
  "Knowledge grows every time you choose to study.",
  "Turn today's effort into tomorrow's confidence.",
  "Stay committed. Success follows consistency.",
  "Keep climbing. Every chapter is another step.",
  "You're writing your success story one topic at a time."
];

// ─── Mock Data ────────────────────────────────────────────────────────────────

const STUDY_HOURS = [
  { day: "Mon", hours: 2.5 }, { day: "Tue", hours: 3.2 },
  { day: "Wed", hours: 1.8 }, { day: "Thu", hours: 4.1 },
  { day: "Fri", hours: 3.5 }, { day: "Sat", hours: 4.8 },
  { day: "Sun", hours: 2.1 },
];

const COMPLETION_DATA = [
  { day: "Mon", topics: 4 }, { day: "Tue", topics: 7 },
  { day: "Wed", topics: 3 }, { day: "Thu", topics: 9 },
  { day: "Fri", topics: 6 },
];

const SUBJECT_COLORS = {
  Physics: "#6366F1",
  Chemistry: "#8B5CF6",
  Maths: "#A78BFA",
  Biology: "#C4B5FD",
};

const RECENT_ACTIVITY = [
  { label: "Today", items: ["Laws of Motion — 25 min", "Mole Concept — 48 min"] },
  { label: "Yesterday", items: ["Vectors — 32 min", "Trigonometry — 40 min"] },
];

const UPCOMING = [
  { type: "Revision", title: "Vectors", due: "Tomorrow", color: "#6366F1" },
  { type: "Mock Test", title: "Full Syllabus", due: "Sunday", color: "#8B5CF6" },
  { type: "Chapter Target", title: "Chemical Bonding", due: "2 days", color: "#A78BFA" },
];

const BADGES = [
  { icon: "🔥", label: "Streak" },
  { icon: "📚", label: "100 Topics" },
  { icon: "⚡", label: "Early Bird" },
  { icon: "🎯", label: "Goal Crusher" },
];

const HEATMAP_DATA = (() => {
  const days = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    days.push({ date: d, value: Math.random() > 0.2 ? Math.floor(Math.random() * 4) + 1 : 0 });
  }
  return days;
})();

const ANALYTICS_STATS = [
  { label: "Study streak" },
  { label: "Focus score" },
  { label: "Avg session" },
  { label: "Completion" },
];

// ─── Root ─────────────────────────────────────────────────────────────────────

const heatColor = v => ["#1E293B", "#312E81", "#4338CA", "#6366F1", "#818CF8"][v] ?? "#1E293B";

const diffStyle = d => ({
  Easy: { color: "#4ADE80", border: "#166534" },
  Medium: { color: "#FBBF24", border: "#92400E" },
  Hard: { color: "#F87171", border: "#7F1D1D" },
}[d] ?? { color: "#94A3B8", border: "#334155" });

const DarkTooltip = ({ active, payload, label }) => active && payload?.length ? (
  <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#E2E8F0" }}>
    <p style={{ margin: 0, color: "#94A3B8", fontSize: 11 }}>{label}</p>
    <p style={{ margin: "2px 0 0", fontWeight: 600 }}>{payload[0].value}{payload[0].name === "hours" ? "h" : " topics"}</p>
  </div>
) : null;

// ─── Primitives ───────────────────────────────────────────────────────────────

function Ring({ pct, size = 80, stroke = 7, color = "#6366F1", label }) {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1E293B" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ}
        strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y={label ? "46%" : "50%"} dominantBaseline="middle" textAnchor="middle"
        fill="#F1F5F9" fontSize={size * 0.19} fontWeight={700}>{pct}%</text>
      {label && <text x="50%" y="66%" dominantBaseline="middle" textAnchor="middle"
        fill="#64748B" fontSize={size * 0.12}>{label}</text>}
    </svg>
  );
}

function Bar2({ pct, color = "#6366F1", h = 5 }) {
  return (
    <div style={{ background: "#0F172A", borderRadius: 99, height: h, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width .6s ease" }} />
    </div>
  );
}

function SectionHead({ title, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#F1F5F9" }}>{title}</h2>
      {action && <button style={S.textBtn}>{action}</button>}
    </div>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function Header() {
  return (
    <header style={S.header}>
      <span style={S.logo}>LearningOrbit</span>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ ...S.hBtn, width: 120, justifyContent: "flex-start", gap: 6 }}>
          <span style={{ fontSize: 13 }}>🔍</span>
          <span style={{ fontSize: 12, color: "#64748B" }}>Search…</span>
        </div>
        <button style={S.hBtn} aria-label="Notifications">🔔</button>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#312E81", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#818CF8" }}>R</div>
      </div>
    </header>
  );
}

function Hero({ dashboard }) {
  const {
    progress,
    completedTopics,
    totalTopics,
    streak,
    todayGoal,
    todayStudied,
    examName,
    examDaysLeft,
    performanceScore,
    performanceDelta,
    resumeTopic,
  } = dashboard;
  const goalPct = Math.round((todayStudied / Math.max(todayGoal, 1)) * 100);
  const today = new Date().getDate();
  const message = MOTIVATIONS[today % MOTIVATIONS.length];
  const deltaLabel = performanceDelta >= 0 ? `↑ +${performanceDelta}%` : `↓ ${performanceDelta}%`;
  return (
    <div style={{ padding: "20px 16px 0" }}>
      {/* Greeting */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 13, color: "#94A3B8" }}>Good afternoon 👋</p>
        <h1 style={{ margin: "2px 0 4px", fontSize: 18, fontWeight: 700, color: "#F1F5F9" }}>{message}</h1>
        <p style={{ margin: 0, fontSize: 13, color: "#818CF8" }}>Push Past Your Limits</p>
      </div>

      {/* Streak + Exam badges */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={S.badge("#431407", "#FB923C")}>Streak {streak} days</span>
        <span style={S.badge("#1E1B4B", "#818CF8")}>Exam {examDaysLeft}d until {examName}</span>
        <span style={S.badge("#111827", "#34D399")}>Topics {completedTopics}/{totalTopics}</span>
      </div>

      {/* Metric row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {/* Progress ring */}
        <div style={{ ...S.miniCard, alignItems: "center", justifyContent: "center" }}>
          <Ring pct={progress} size={72} label="done" />
        </div>
        {/* Performance score */}
        <div style={{ ...S.miniCard, justifyContent: "center" }}>
          <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>Today&apos;s score</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#6366F1", lineHeight: 1 }}>{performanceScore}</div>
          <div style={{ fontSize: 11, color: "#4ADE80", marginTop: 3 }}>{deltaLabel} vs yesterday</div>
          <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>Excellent</div>
        </div>
        {/* Exam countdown */}
        <div style={{ ...S.miniCard, alignItems: "center", justifyContent: "center", background: "#1E1B4B", borderColor: "#312E81" }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#818CF8", lineHeight: 1 }}>{examDaysLeft}</div>
          <div style={{ fontSize: 10, color: "#6366F1", marginTop: 4, textAlign: "center", lineHeight: 1.4 }}>days until<br />{examName}</div>
        </div>
      </div>

      {/* Today's goal */}
      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: "#94A3B8" }}>Today&apos;s goal</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9" }}>{todayStudied} / {todayGoal} hrs</span>
        </div>
        <Bar2 pct={goalPct} h={7} />
        <div style={{ fontSize: 11, color: "#64748B", marginTop: 6 }}>{Math.max(todayGoal - todayStudied, 0)} hours remaining today</div>
        {resumeTopic && (
          <div style={{ fontSize: 11, color: "#818CF8", marginTop: 8 }}>
            Next up: {resumeTopic.topic} • {resumeTopic.estimatedMinutes} min
          </div>
        )}
      </div>
    </div>
  );
}

// function ResumeCard() {
//   const r = USER.resumeTopic;
//   return (
//     <div style={{ padding: "0 16px 16px" }}>
//       <div style={{ ...S.card, background: "#1E1B4B", borderColor: "#312E81", display: "flex", alignItems: "center", gap: 14 }}>
//         <div style={{ width: 44, height: 44, borderRadius: 10, background: r.color + "33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📖</div>
//         <div style={{ flex: 1, minWidth: 0 }}>
//           <div style={{ fontSize: 11, color: "#818CF8", marginBottom: 2 }}>{r.subject} · Resume where you left off</div>
//           <div style={{ fontSize: 14, fontWeight: 600, color: "#F1F5F9", marginBottom: 6 }}>{r.topic}</div>
//           <Bar2 pct={r.progress} color={r.color} h={4} />
//           <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>{r.progress}% complete</div>
//         </div>
//         <button style={{ ...S.pillBtn, background: r.color, color: "#fff", flexShrink: 0 }}>Resume →</button>
//       </div>
//     </div>
//   );
// }

function TodaysPlan() {
  const { subjects, topics, dailyStudyHours } = useRoadmap();

  const todayPlan = generateTodaysPlan(
    topics,
    subjects,
    dailyStudyHours
  );
  const totalMin = todayPlan.reduce(
    (sum, item) => sum + item.estimatedMinutes,
    0
  );
  return (
    <div style={S.section}>
      <SectionHead title="Today's plan" action="See all" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {todayPlan.map((item, i) => {
          const dc = diffStyle(item.difficulty);
          const color = SUBJECT_COLORS[item.subject] ?? "#6366F1";
          return (
            <div key={i} style={{ ...S.card, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 3, borderRadius: 99, background: color, alignSelf: "stretch", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "#64748B" }}>{item.subject}</span>
                  <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 99, color: dc.color, border: `1px solid ${dc.border}`, background: "#0F172A" }}>{item.difficulty}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#F1F5F9", marginBottom: 6 }}>{item.topic}</div>
                <div style={{ fontSize: 11, color: "#64748B" }}>{item.chapter}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: "#94A3B8" }}>{item.estimatedMinutes} min</span>
                <button style={{ ...S.pillBtn, background: color, color: "#fff", fontSize: 11 }}>
                  Start
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
        <span style={{ fontSize: 12, color: "#64748B" }}>Total: {Math.floor(totalMin / 60)}h {totalMin % 60}m</span>
      </div>
    </div>
  );
}

function AnalyticsRow({ dashboard }) {
  const { streak, performanceScore, averageSessionDuration, progress } = dashboard;
  return (
    <div style={{ padding: "0 16px", marginBottom: 4 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {ANALYTICS_STATS.map((s, i) => {
          const value =
            s.label === "Study streak"
              ? `${streak} days`
              : s.label === "Focus score"
                ? `${performanceScore}%`
                : s.label === "Avg session"
                  ? `${averageSessionDuration} min`
                  : `${progress}%`;
          return (
            <div key={i} style={{ ...S.card, display: "flex", alignItems: "center", gap: 10 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9" }}>{value}</div>
                <div style={{ fontSize: 11, color: "#64748B" }}>{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StudyCharts() {
  return (
    <div style={S.section}>
      <SectionHead title="Study analytics" />

      <div style={{ fontSize: 12, color: "#64748B", marginBottom: 8 }}>Daily study hours</div>
      <ResponsiveContainer width="100%" height={130}>
        <LineChart data={STUDY_HOURS} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
          <XAxis dataKey="day" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<DarkTooltip />} />
          <Line type="monotone" dataKey="hours" name="hours" stroke="#6366F1" strokeWidth={2.5}
            dot={{ fill: "#6366F1", r: 3 }} activeDot={{ r: 5, fill: "#818CF8" }} />
        </LineChart>
      </ResponsiveContainer>

      <div style={{ fontSize: 12, color: "#64748B", margin: "16px 0 8px" }}>Topics completed this week</div>
      <ResponsiveContainer width="100%" height={110}>
        <BarChart data={COMPLETION_DATA} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
          <XAxis dataKey="day" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<DarkTooltip />} />
          <Bar dataKey="topics" name="topics" fill="#6366F1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function HeatmapAndDonut({ dashboard, subjectDistribution }) {
  const { streak } = dashboard;
  const weeks = [];
  for (let i = 0; i < HEATMAP_DATA.length; i += 7) weeks.push(HEATMAP_DATA.slice(i, i + 7));
  return (
    <div style={S.section}>
      <SectionHead title="Consistency heatmap" />
      <div style={{ display: "flex", gap: 5, marginBottom: 10, overflowX: "auto", paddingBottom: 2 }}>
        {weeks.map((wk, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {wk.map((d, di) => (
              <div key={di} title={`${d.date.toLocaleDateString()}: ${d.value}h`}
                style={{ width: 16, height: 16, borderRadius: 3, background: heatColor(d.value), cursor: "default" }} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 14 }}>
        <span style={{ fontSize: 11, color: "#64748B" }}>Less</span>
        {[0, 1, 2, 3, 4].map(v => <div key={v} style={{ width: 11, height: 11, borderRadius: 2, background: heatColor(v) }} />)}
        <span style={{ fontSize: 11, color: "#64748B" }}>More</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#FB923C", fontWeight: 600 }}>🔥 {streak} day streak</span>
      </div>

      {/* Subject distribution donut */}
      <div style={{ borderTop: "1px solid #1E293B", paddingTop: 16 }}>
        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>Subject distribution</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <PieChart width={100} height={100}>
            <Pie data={subjectDistribution} cx={45} cy={45} innerRadius={28} outerRadius={46}
              dataKey="value" paddingAngle={2}>
              {subjectDistribution.map((e, i) => (
                <Cell key={i} fill={SUBJECT_COLORS[e.name] ?? "#6366F1"} />
              ))}
            </Pie>
            <Tooltip formatter={(v, n) => [`${v}%`, n]}
              contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, fontSize: 12, color: "#E2E8F0" }} />
          </PieChart>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
            {subjectDistribution.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 99, background: SUBJECT_COLORS[s.name] ?? "#6366F1", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#94A3B8", flex: 1 }}>{s.name}</span>
                <span style={{ fontSize: 12, color: "#F1F5F9", fontWeight: 600 }}>{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SubjectCards() {
  const { subjects, topics } = useRoadmap();

  const subjectProgress = calculateSubjectProgress(
    subjects,
    topics
  );
  return (
    <div style={S.section}>
      <SectionHead title="Subject progress" />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {subjectProgress.map((s, i) => {
          const color = SUBJECT_COLORS[s.name] ?? "#6366F1";

          return (
            <div key={i} style={S.card}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Circular indicator */}
                <Ring pct={s.progress} size={54} stroke={5} color={color} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#F1F5F9" }}>{s.name}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>{s.completed}/{s.total} topics</div>
                  <Bar2 pct={s.progress} color={color} h={4} />
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
                    <button style={{ ...S.textBtn }}>Continue →</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// function AICoach() {
//   const focus = USER.resumeTopic;
//   return (
//     <div style={{ ...S.section, background: "linear-gradient(135deg,#1E1B4B 0%,#1E293B 100%)", borderTop: "1px solid #312E81" }}>
//       <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
//         <div style={{ width: 34, height: 34, borderRadius: 10, background: "#312E81", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
//         <div>
//           <div style={{ fontSize: 14, fontWeight: 600, color: "#F1F5F9" }}>AI Coach</div>
//           <div style={{ fontSize: 11, color: "#818CF8" }}>Personalised for today</div>
//         </div>
//       </div>

//       {/* Actionable focus card */}
//       <div style={{ background: "#0F172A", borderRadius: 12, border: "1px solid #312E81", padding: "14px", marginBottom: 14 }}>
//         <div style={{ fontSize: 11, color: "#818CF8", marginBottom: 4 }}>Today&apos;s focus</div>
//         <div style={{ fontSize: 16, fontWeight: 700, color: "#F1F5F9", marginBottom: 6 }}>{focus.subject}</div>
//         <div style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.55, marginBottom: 10 }}>
//           Organic Chemistry has the highest exam weightage. Finishing it today raises your completion to <span style={{ color: "#6366F1", fontWeight: 600 }}>47%</span>.
//         </div>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <div>
//             <div style={{ fontSize: 11, color: "#64748B" }}>Estimated time</div>
//             <div style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9" }}>58 min</div>
//           </div>
//           <button style={{ ...S.pillBtn, background: "#6366F1", color: "#fff" }}>Start now →</button>
//         </div>
//       </div>

//       <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
//         {[
//           { icon: "📈", text: `You're ahead in Physics. Great pace.` },
//           { icon: "⚠️", text: `Chemistry hasn't been studied for 5 days.` },
//           { icon: "📅", text: `Study 3.2h/day to finish 18 days before your exam.` },
//         ].map((item, i) => (
//           <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
//             <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
//             <p style={{ margin: 0, fontSize: 13, color: "#CBD5E1", lineHeight: 1.5 }}>{item.text}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

function RecentAndUpcoming() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
      {/* Recent */}
      <div style={{ ...S.section, borderRight: "1px solid #1E293B" }}>
        <SectionHead title="Recent" />
        {RECENT_ACTIVITY.map((g, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: "#64748B", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{g.label}</div>
            {g.items.map((item, j) => (
              <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "5px 0", borderBottom: "1px solid #1E293B" }}>
                <span style={{ fontSize: 11, color: "#4ADE80", marginTop: 1 }}>✓</span>
                <span style={{ fontSize: 12, color: "#CBD5E1", lineHeight: 1.4 }}>{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Upcoming */}
      <div style={S.section}>
        <SectionHead title="Upcoming" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {UPCOMING.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "8px 10px", borderRadius: 10, background: "#0F172A", border: `1px solid ${item.color}22` }}>
              <div style={{ width: 3, height: "100%", minHeight: 32, borderRadius: 99, background: item.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, color: "#64748B" }}>{item.type}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#F1F5F9", marginTop: 1 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: item.color, marginTop: 2 }}>{item.due}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Achievements({ dashboard }) {
  const { xpCurrent, xpNext, level, xp } = dashboard;
  const xpPct = Math.round((xpCurrent / Math.max(xpNext, 1)) * 100);
  return (
    <div style={S.section}>
      <SectionHead title="Achievements" />
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: "#1E293B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏆</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#F1F5F9" }}>Level {level}</div>
          <div style={{ fontSize: 11, color: "#64748B", margin: "3px 0 6px" }}>{xpCurrent.toLocaleString()} / {xpNext.toLocaleString()} XP</div>
          <Bar2 pct={xpPct} color="#8B5CF6" />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: "#1E293B", border: "1px solid #334155" }}>
          <span style={{ fontSize: 17 }}>⚡</span>
          <span style={{ fontSize: 12, color: "#CBD5E1" }}>{xp} XP</span>
        </div>
        {BADGES.map((b, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: "#1E293B", border: "1px solid #334155" }}>
            <span style={{ fontSize: 17 }}>{b.icon}</span>
            <span style={{ fontSize: 12, color: "#CBD5E1" }}>{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FAB() {
  const [open, setOpen] = useState(false);
  const actions = [
    { label: "Start session", icon: "▶", color: "#3B82F6" },
    { label: "Add topic", icon: "📝", color: "#22C55E" },
    { label: "Quick revision", icon: "📖", color: "#A78BFA" },
    { label: "Ask AI", icon: "🤖", color: "#8B5CF6" },
    { label: "View stats", icon: "📊", color: "#F97316" },
  ];
  return (
    <div style={{ position: "fixed", bottom: 24, right: 16, zIndex: 50, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
          {actions.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "#1E293B", border: "1px solid #334155", borderRadius: 10, padding: "8px 14px", cursor: "pointer" }}>
              <span style={{ fontSize: 13, color: "#F1F5F9" }}>{a.label}</span>
              <span style={{ fontSize: 16, background: a.color + "22", padding: "3px 6px", borderRadius: 6 }}>{a.icon}</span>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => setOpen(o => !o)} aria-label="Quick actions" style={{
        width: 52, height: 52, borderRadius: 99,
        background: open ? "#4338CA" : "#6366F1",
        border: "none", cursor: "pointer", fontSize: 24, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 20px rgba(99,102,241,0.45)",
        transform: open ? "rotate(45deg)" : "rotate(0deg)",
        transition: "transform .2s, background .2s",
      }}>+</button>
    </div>
  );
}

// ─── Style tokens ─────────────────────────────────────────────────────────────

const S = {
  page: {
    minHeight: "100vh", background: "#0F172A",
    fontFamily: "'Inter',-apple-system,sans-serif", color: "#F1F5F9",
    paddingBottom: 90,
  },
  header: {
    position: "sticky", top: 0, zIndex: 40,
    background: "#0F172A", borderBottom: "1px solid #1E293B",
    padding: "10px 16px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  logo: { fontSize: 17, fontWeight: 700, color: "#6366F1", letterSpacing: "-0.02em" },
  hBtn: {
    height: 32, borderRadius: 8, background: "#1E293B",
    border: "none", cursor: "pointer", fontSize: 15,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "0 10px", color: "#94A3B8",
  },
  section: {
    padding: "20px 16px 16px",
    borderTop: "1px solid #1E293B",
  },
  card: {
    background: "#1E293B", borderRadius: 12, padding: "12px 14px",
    border: "1px solid #334155",
  },
  miniCard: {
    background: "#1E293B", borderRadius: 12, padding: "12px 10px",
    border: "1px solid #334155", display: "flex", flexDirection: "column",
  },
  badge: (bg, color) => ({
    fontSize: 12, padding: "4px 10px", borderRadius: 99,
    background: bg, color, fontWeight: 500,
  }),
  textBtn: {
    background: "none", border: "none", color: "#6366F1",
    fontSize: 13, cursor: "pointer", padding: 0, fontWeight: 500,
  },
  pillBtn: {
    padding: "6px 14px", borderRadius: 99,
    border: "none", fontSize: 12, fontWeight: 600,
    cursor: "pointer",
  },
};

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { topics, studySessions, dailyStudyHours, profile, subjects } = useRoadmap();
  const { progress, completedTopics, totalTopics } = calculateOverallProgress(topics);
  const streak = calculateStreak(studySessions);
  const todayStudied = calculateTodayStudied(studySessions);
  const xp = calculateXP(topics, studySessions, dailyStudyHours, streak, todayStudied);
  const { level, xpCurrent, xpNext } = calculateXpProgress(xp);
  const examDaysLeft = getExamDaysLeft(profile.examDate);
  const performanceScore = calculatePerformanceScore(topics, studySessions, dailyStudyHours, streak, todayStudied);
  const performanceDelta = calculatePerformanceDelta(topics, studySessions, dailyStudyHours, todayStudied, streak);
  const weeklyMomentum = calculateWeeklyMomentum(studySessions, dailyStudyHours);
  const aheadDays = calculateAheadDays(topics, dailyStudyHours, profile.examDate);
  const averageSessionDuration = calculateAverageSessionDuration(studySessions);
  const todayPlan = generateTodaysPlan(topics, subjects, dailyStudyHours);
  const resumeTopic = getResumeTopic(todayPlan);
  const subjectProgress = calculateSubjectProgress(subjects, topics);
  const subjectDistribution = subjectProgress
    .filter((subject) => subject.total > 0)
    .map((subject) => ({
      name: subject.name,
      value: totalTopics === 0 ? 0 : Math.round((subject.total / totalTopics) * 100),
    }));

  const dashboard = {
    progress,
    completedTopics,
    totalTopics,
    streak,
    todayGoal: profile.dailyStudyHours,
    todayStudied,
    examName: profile.exam || "JEE",
    examDaysLeft,
    aheadDays,
    performanceScore,
    performanceDelta,
    weeklyMomentum,
    xp,
    level,
    xpCurrent,
    xpNext,
    averageSessionDuration,
    resumeTopic,
  };

  return (
    <div style={S.page}>
      <Header />
      <Hero dashboard={dashboard} />
      {/* <ResumeCard /> */}
      <TodaysPlan />
      <AnalyticsRow dashboard={dashboard} />
      <StudyCharts />
      <HeatmapAndDonut dashboard={dashboard} subjectDistribution={subjectDistribution} />
      <SubjectCards />
      {/* <AICoach /> */}
      <RecentAndUpcoming />
      <Achievements dashboard={dashboard} />
      <FAB />
    </div>
  );
}
