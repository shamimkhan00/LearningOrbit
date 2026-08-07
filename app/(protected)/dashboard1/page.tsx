"use client"

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Check, X, ChevronLeft, ChevronRight, Flame, Pencil } from 'lucide-react';
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/providers/AuthProvider";

type HabitStatus = 'done' | 'missed';

type Habit = {
  id: string;
  name: string;
};

type HabitEntries = Record<string, Record<number, Record<string, HabitStatus>>>;
type HabitNotes = Record<string, string>;
type TrackerData = {
  habits: Habit[];
  entries: HabitEntries;
  notes: HabitNotes;
};

const DEFAULT_HABITS: Habit[] = [
  { id: 'h0', name: 'GATE' },
  { id: 'h1', name: 'CS - Tech build' },
  { id: 'h2', name: 'Research, extra' },
  { id: 'h3', name: 'Salahs' },
  { id: 'h4', name: 'Quran/Arabic' },
  { id: 'h5', name: 'No Z' },
  { id: 'h6', name: 'Gym' },
  { id: 'h7', name: 'Business' },
];

const DONE = '#1D3557';
const MISSED = '#B3541E';
const EMPTY = '#EFEBE1';
const EMPTY_STROKE = '#D9D4C7';

function normalizeTrackerData(raw: unknown): Partial<TrackerData> {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  const data = raw as Partial<TrackerData>;

  return {
    habits: Array.isArray(data.habits) ? data.habits : undefined,
    entries: data.entries && typeof data.entries === "object" ? data.entries : undefined,
    notes: data.notes && typeof data.notes === "object" ? data.notes : undefined,
  };
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function ringSegmentPath(cx: number, cy: number, rInner: number, rOuter: number, startAngle: number, endAngle: number) {
  const a0 = startAngle + 0.6;
  const a1 = endAngle - 0.6;
  const p1 = polarToCartesian(cx, cy, rOuter, a1);
  const p2 = polarToCartesian(cx, cy, rOuter, a0);
  const p3 = polarToCartesian(cx, cy, rInner, a0);
  const p4 = polarToCartesian(cx, cy, rInner, a1);
  const large = a1 - a0 <= 180 ? 0 : 1;
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 0 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 ${large} 1 ${p4.x} ${p4.y}`,
    'Z',
  ].join(' ');
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function monthKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

export default function HabitTracker() {
  const { user, loading: authLoading } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);
  const [entries, setEntries] = useState<HabitEntries>({});
  const [notes, setNotes] = useState<HabitNotes>({});
  const [loaded, setLoaded] = useState(false);
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [editingHabits, setEditingHabits] = useState(false);

  const mKey = monthKey(year, month);
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const totalDays = daysInMonth(year, month);
  const activeDays = isCurrentMonth ? now.getDate() : totalDays;

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setLoaded(true);
      return;
    }

    const currentUser = user;
    let cancelled = false;

    async function loadHabitTracker() {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snapshot = await getDoc(userRef);
        const trackerData = normalizeTrackerData(snapshot.data()?.habitTracker);

        if (cancelled) {
          return;
        }

        if (trackerData.habits) setHabits(trackerData.habits);
        if (trackerData.entries) setEntries(trackerData.entries as HabitEntries);
        if (trackerData.notes) setNotes(trackerData.notes as HabitNotes);
      } catch {
        // fall back to defaults if Firestore is unavailable
      } finally {
        if (!cancelled) {
          setLoaded(true);
        }
      }
    }

    setLoaded(false);
    void loadHabitTracker();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const persist = useCallback(async (next: TrackerData) => {
    if (!user) {
      return;
    }

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          habitTracker: next,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch {
      console.error('save failed');
    }
  }, [user]);

  const monthEntries = entries[mKey] || {};

  const updateStatus = (day: number, habitId: string, nextStatus?: HabitStatus) => {
    const dayEntry = { ...(monthEntries[day] || {}) };
    if (nextStatus === undefined) {
      delete dayEntry[habitId];
    } else {
      dayEntry[habitId] = nextStatus;
    }

    const nextMonthEntries = { ...monthEntries, [day]: dayEntry };
    const nextEntries = { ...entries, [mKey]: nextMonthEntries };
    setEntries(nextEntries);
    void persist({ habits, entries: nextEntries, notes });
  };

  const cycleStatus = (day: number, habitId: string) => {
    const cur = monthEntries[day]?.[habitId];
    const next = cur === undefined ? 'done' : cur === 'done' ? 'missed' : undefined;
    updateStatus(day, habitId, next);
  };

  const setNote = (text: string) => {
    const nextNotes = { ...notes, [mKey]: text };
    setNotes(nextNotes);
    void persist({ habits, entries, notes: nextNotes });
  };

  const renameHabit = (id: string, name: string) => {
    const next = habits.map((h) => (h.id === id ? { ...h, name } : h));
    setHabits(next);
    void persist({ habits: next, entries, notes });
  };

  const addHabit = () => {
    if (habits.length >= 8) return;
    const next = [...habits, { id: `h${Date.now().toString(36)}`, name: '' }];
    setHabits(next);
    void persist({ habits: next, entries, notes });
  };

  const removeHabit = (id: string) => {
    const next = habits.filter((h) => h.id !== id);
    setHabits(next);
    void persist({ habits: next, entries, notes });
  };

  const changeMonth = (delta: number) => {
    let m = month + delta, y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setMonth(m); setYear(y);
    setSelectedDay(1);
  };

  const stats = useMemo(() => {
    return habits.map((h) => {
      let done = 0;
      for (let d = 1; d <= activeDays; d++) {
        if (monthEntries[d]?.[h.id] === 'done') done++;
      }
      let streak = 0;
      for (let d = activeDays; d >= 1; d--) {
        if (monthEntries[d]?.[h.id] === 'done') streak++;
        else break;
      }
      const pct = activeDays > 0 ? Math.round((done / activeDays) * 100) : 0;
      return { id: h.id, name: h.name, done, pct, streak };
    });
  }, [habits, monthEntries, activeDays]);

  const overallPct = useMemo(() => {
    if (habits.length === 0 || activeDays === 0) return 0;
    const totalDone = stats.reduce((s, x) => s + x.done, 0);
    return Math.round((totalDone / (habits.length * activeDays)) * 100);
  }, [stats, habits.length, activeDays]);

  if (!loaded) {
    return <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center text-[#8A8577] text-sm">Loading tracker…</div>;
  }

  const cx = 200, cy = 200, r0 = 46, maxR = 186;
  const n = Math.max(habits.length, 1);
  const ringW = (maxR - r0) / n;
  const segAngle = 360 / totalDays;

  const monthName = new Date(year, month, 1).toLocaleDateString('en-IN', { month: 'long' });

  return (
    <div className="min-h-screen bg-[#FAF9F6]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .display { font-family: 'Space Grotesk', system-ui, sans-serif; }
      `}</style>

      {/* Header */}
      <div className="px-5 pt-6 pb-3 sticky top-0 bg-[#FAF9F6] z-20 border-b border-[#E8E4DA]">
        <div className="flex items-center justify-between">
          <button onClick={() => changeMonth(-1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-[#E8E4DA] text-[#6B6558]">
            <ChevronLeft size={16} />
          </button>
          <div className="text-center">
            <p className="display text-[12px] tracking-[0.14em] uppercase text-[#B3541E] font-semibold">Habits</p>
            <h1 className="display text-[19px] font-bold text-[#1F2937]">{monthName} {year}</h1>
          </div>
          <button onClick={() => changeMonth(1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-[#E8E4DA] text-[#6B6558]">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="px-4 py-5 max-w-md mx-auto pb-16 ">
        {/* Circular tracker */}
        <div className="bg-white rounded-2xl border border-[#E8E4DA] p-3 ">
          <svg viewBox="-5 -5 410 410" className="w-full h-auto">
            {habits.map((h, i) => {
              const rInner = r0 + i * ringW;
              const rOuter = rInner + ringW;
              return Array.from({ length: totalDays }, (_, idx) => {
                const day = idx + 1;
                const startAngle = idx * segAngle;
                const endAngle = startAngle + segAngle;
                const status = monthEntries[day]?.[h.id];
                const fill = status === 'done' ? DONE : status === 'missed' ? MISSED : EMPTY;
                const future = isCurrentMonth && day > now.getDate();
                return (
                  <path
                    key={`${h.id}-${day}`}
                    d={ringSegmentPath(cx, cy, rInner, rOuter, startAngle, endAngle)}
                    fill={future ? '#F5F3EC' : fill}
                    stroke={EMPTY_STROKE}
                    strokeWidth={1}
                    opacity={future ? 0.6 : status ? 0.92 : 1}
                    // onClick={() => !future && cycleStatus(day, h.id)}
                    // style={{ cursor: future ? 'default' : 'pointer' }}
                  />
                );
              });
            })}
            {/* day labels */}
            {Array.from({ length: totalDays }, (_, idx) => {
              const day = idx + 1;
              const mid = idx * segAngle + segAngle / 2;
              const pos = polarToCartesian(cx, cy, maxR + 14, mid);
              const flip = mid > 90 && mid < 270;
              return (
                <text
                  key={`lbl-${day}`}
                  x={pos.x}
                  y={pos.y}
                  fontSize="9"
                  fill={day === selectedDay ? '#B3541E' : '#8A8577'}
                  fontWeight={day === selectedDay ? 700 : 400}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${flip ? mid + 180 : mid}, ${pos.x}, ${pos.y})`}
                  style={{ cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  onClick={() => setSelectedDay(day)}
                >
                  {day}
                </text>
              );
            })}
            {/* center hub */}
            <circle cx={cx} cy={cy} r={r0 - 4} fill="#FAF9F6" stroke="#E8E4DA" strokeWidth={1} />
            <text x={cx} y={cy - 8} textAnchor="middle" fontSize="22" fontWeight="700" fill="#1F2937" fontFamily="Space Grotesk, sans-serif">
              {overallPct}%
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#8A8577" fontFamily="Inter, sans-serif">
              this month
            </text>
          </svg>

          <div className="flex items-center justify-center gap-4 mt-1 text-[11px] text-[#6B6558]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: DONE }} /> Done</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: MISSED }} /> Missed</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm inline-block border border-[#D9D4C7]" style={{ background: EMPTY }} /> Unmarked</span>
          </div>
        </div>

        {/* Day panel */}
        <section className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="display text-[13px] tracking-[0.1em] uppercase text-[#8A8577] font-semibold">
              Day {selectedDay}
            </h2>
            <div className="flex gap-1 overflow-x-auto max-w-[55%] no-scrollbar">
              {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`shrink-0 w-6 h-6 text-[10px] rounded-full flex items-center justify-center ${
                    d === selectedDay ? 'bg-[#1F2937] text-white' : 'text-[#8A8577]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <ul className="space-y-1.5">
            {habits.map((h) => {
              const status = monthEntries[selectedDay]?.[h.id];
              return (
                <li key={h.id} className="bg-white rounded-xl border border-[#E8E4DA] px-3 py-2.5 flex items-center justify-between gap-2">
                  <span className="text-[13.5px] text-[#1F2937] truncate">{h.name || 'Untitled habit'}</span>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => updateStatus(selectedDay, h.id, 'done')}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${status === 'done' ? 'bg-[#1D3557] text-white' : 'bg-[#F1EFE8] text-[#8A8577]'}`}
                      aria-label="Mark done"
                    >
                      <Check size={15} />
                    </button>
                    <button
                      onClick={() => updateStatus(selectedDay, h.id, 'missed')}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${status === 'missed' ? 'bg-[#B3541E] text-white' : 'bg-[#F1EFE8] text-[#8A8577]'}`}
                      aria-label="Mark missed"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Stats */}
        <section className="mt-6">
          <h2 className="display text-[13px] tracking-[0.1em] uppercase text-[#8A8577] font-semibold mb-2">This month</h2>
          <ul className="space-y-1.5">
            {stats.map((s) => (
              <li key={s.id} className="bg-white rounded-xl border border-[#E8E4DA] px-3 py-2.5 flex items-center justify-between">
                <span className="text-[13px] text-[#1F2937] truncate">{s.name || 'Untitled habit'}</span>
                <div className="flex items-center gap-3 shrink-0">
                  {s.streak > 0 && (
                    <span className="flex items-center gap-0.5 text-[11px] text-[#B3541E] font-medium">
                      <Flame size={12} /> {s.streak}
                    </span>
                  )}
                  <span className="text-[12px] text-[#6B6558] font-medium w-9 text-right">{s.pct}%</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Habit list editor */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="display text-[13px] tracking-[0.1em] uppercase text-[#8A8577] font-semibold">Habits</h2>
            <button onClick={() => setEditingHabits((v) => !v)} className="text-[#6B6558]">
              <Pencil size={14} />
            </button>
          </div>
          {editingHabits ? (
            <div className="space-y-1.5">
              {habits.map((h, i) => (
                <div key={h.id} className="flex items-center gap-2 bg-white rounded-xl border border-[#E8E4DA] px-3 py-1.5">
                  <span className="text-[11px] text-[#8A8577] w-4">{i + 1}</span>
                  <input
                    value={h.name}
                    onChange={(e) => renameHabit(h.id, e.target.value)}
                    placeholder="Habit name"
                    className="flex-1 text-[13.5px] text-[#1F2937] outline-none py-1"
                  />
                  <button onClick={() => removeHabit(h.id)} className="text-[#B3541E]">
                    <X size={15} />
                  </button>
                </div>
              ))}
              {habits.length < 8 && (
                <button onClick={addHabit} className="w-full flex items-center justify-center gap-1 text-[13px] text-[#2F5D62] font-medium py-2">
                  <Plus size={14} /> Add habit
                </button>
              )}
            </div>
          ) : (
            <p className="text-[12px] text-[#8A8577]">Tap the pencil to rename or add habits (max 8, innermost ring first).</p>
          )}
        </section>

        {/* Notes */}
        <section className="mt-6">
          <h2 className="display text-[13px] tracking-[0.1em] uppercase text-[#8A8577] font-semibold mb-2">Notes</h2>
          <textarea
            value={notes[mKey] || ''}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reflections, plans, anything for this month…"
            rows={4}
            className="w-full rounded-xl border border-[#E8E4DA] bg-white px-3 py-2.5 text-[13.5px] text-[#1F2937] outline-none focus:border-[#2F5D62] resize-none"
          />
        </section>
      </div>
    </div>
  );
}
