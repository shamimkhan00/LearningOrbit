"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { calculateTodayStudied, type StudySession } from "@/lib/dashboard-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoadmapTopic {
  id: string;
  topic: string;
  subject: string;
  completed: boolean;
  estimatedMinutes?: number;
  chapter?: string;
  difficulty?: string;
  weightage?: string;
}

interface TopicQuickCompleteProps {
  topics: RoadmapTopic[];
  studySessions: StudySession[];
  toggleComplete: (topicId: string) => Promise<void> | void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TopicQuickComplete({
  topics,
  studySessions,
  toggleComplete,
}: TopicQuickCompleteProps) {
  const [user, setUser] = useState<User | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState("");
  const [lastStudiedUpdate, setLastStudiedUpdate] = useState<number>(0);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Calculate today's study time ──────────────────────────────────────────
  const todayStudied = useMemo(() => calculateTodayStudied(studySessions), [studySessions]);

  useEffect(() => {
    // Trigger animation when the study total changes.
    setLastStudiedUpdate(Date.now());
  }, [todayStudied]);

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2800);
  }, []);

  // ── Mark topic done/undone ─────────────────────────────────────────────────
  const handleToggleComplete = useCallback(
    async (topic: RoadmapTopic) => {
      if (!user || savingId) return;
      setSavingId(topic.id);

      try {
        await toggleComplete(topic.id);
        showToast(
          !topic.completed
            ? `✓ "${topic.topic}" marked complete (+${topic.estimatedMinutes || 0} min)`
            : `↩ "${topic.topic}" marked incomplete (-${topic.estimatedMinutes || 0} min)`
        );
      } catch (err) {
        console.error("Failed to update topic:", err);
        showToast("Failed to save. Please try again.");
      } finally {
        setSavingId(null);
      }
    },
    [user, savingId, toggleComplete, showToast]
  );

  // ── Filtered + sliced list ─────────────────────────────────────────────────
  const incompleteTopics = topics.filter((t) => !t.completed);

  const filtered = query.trim()
    ? incompleteTopics.filter(
        (t) =>
          t.topic.toLowerCase().includes(query.toLowerCase()) ||
          t.subject.toLowerCase().includes(query.toLowerCase()) ||
          (t.chapter?.toLowerCase().includes(query.toLowerCase()) ?? false)
      )
    : incompleteTopics;

  const DEFAULT_COUNT = 3;
  const visible = query.trim() ? filtered : showAll ? filtered : filtered.slice(0, DEFAULT_COUNT);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        background: "#1E293B",
        borderRadius: "16px",
        padding: "20px",
        border: "1px solid rgba(99,102,241,0.18)",
        position: "relative",
        fontFamily: "inherit",
        marginBottom: "15px"
      }}
    >
      {/* Header with today's study time */}
      <div style={{ 
        marginBottom: "16px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "flex-start"
      }}>
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: 600,
              color: "#E2E8F0",
              letterSpacing: "-0.01em",
            }}
          >
            Quick Complete
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748B" }}>
            Mark topics as done — synced instantly
          </p>
        </div>
        {/* <div
          style={{
            background: "rgba(99,102,241,0.12)",
            padding: "4px 12px",
            borderRadius: "20px",
            border: "1px solid rgba(99,102,241,0.2)",
            textAlign: "center",
            transition: "all 0.3s ease",
            animation: lastStudiedUpdate > 0 ? "pulseUpdate 0.5s ease" : "none",
          }}
        >
          <div style={{ fontSize: "11px", color: "#64748B" }}>Today</div>
          <div style={{ 
            fontSize: "16px", 
            fontWeight: 600, 
            color: "#A5B4FC",
            transition: "all 0.3s ease",
          }}>
            {todayStudied.toFixed(1)}h
          </div>
        </div> */}
      </div>

      {/* Add keyframe animation */}
      <style>{`
        @keyframes pulseUpdate {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); background: rgba(99,102,241,0.25); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Search bar */}
      <div style={{ position: "relative", marginBottom: "14px" }}>
        <span
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#475569",
            pointerEvents: "none",
            fontSize: "14px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="#64748B" strokeWidth="1.8" />
            <path d="M14 14l3 3" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowAll(false);
          }}
          placeholder="Search topics, subjects, or chapters…"
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: "#0F172A",
            border: "1px solid rgba(99,102,241,0.22)",
            borderRadius: "10px",
            padding: "9px 12px 9px 34px",
            color: "#E2E8F0",
            fontSize: "13px",
            outline: "none",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = "rgba(99,102,241,0.6)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = "rgba(99,102,241,0.22)")
          }
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: "#475569",
              cursor: "pointer",
              padding: "2px",
              fontSize: "16px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Topic list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {topics.length === 0 ? (
          <EmptyState />
        ) : filtered.length === 0 ? (
          <p style={{ color: "#475569", fontSize: "13px", textAlign: "center", padding: "12px 0" }}>
            No topics match "{query}"
          </p>
        ) : (
          visible.map((topic) => (
            <TopicRow
              key={topic.id}
              topic={topic}
              saving={savingId === topic.id}
              onToggle={handleToggleComplete}
            />
          ))
        )}
      </div>

      {/* Show more / less */}
      {/* {!query.trim() && incompleteTopics.length > DEFAULT_COUNT && (
        <button
          onClick={() => setShowAll((p) => !p)}
          style={{
            marginTop: "12px",
            width: "100%",
            background: "transparent",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: "8px",
            color: "#818CF8",
            fontSize: "12px",
            fontWeight: 500,
            padding: "8px",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(99,102,241,0.08)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          {showAll
            ? `Show less`
            : `Show all ${incompleteTopics.length} incomplete topics`}
        </button>
      )} */}

      {/* Progress pill */}
      {topics.length > 0 && (
        <ProgressPill topics={topics} />
      )}

      {/* Toast */}
      {toastMsg && <Toast msg={toastMsg} />}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TopicRow({
  topic,
  saving,
  onToggle,
}: {
  topic: RoadmapTopic;
  saving: boolean;
  onToggle: (t: RoadmapTopic) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        background: topic.completed
          ? "rgba(99,102,241,0.07)"
          : "rgba(15,23,42,0.5)",
        borderRadius: "10px",
        padding: "10px 12px",
        border: topic.completed
          ? "1px solid rgba(99,102,241,0.25)"
          : "1px solid rgba(255,255,255,0.05)",
        transition: "all 0.2s",
      }}
    >
      {/* Left: info */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: 500,
            color: topic.completed ? "#818CF8" : "#CBD5E1",
            textDecoration: topic.completed ? "line-through" : "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            opacity: topic.completed ? 0.75 : 1,
          }}
        >
          {topic.topic}
        </p>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: "11px",
              color: "#475569",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {topic.subject}
          </p>
          {topic.chapter && (
            <p
              style={{
                margin: "2px 0 0",
                fontSize: "10px",
                color: "#334155",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                background: "rgba(51,65,85,0.3)",
                padding: "0 6px",
                borderRadius: "4px",
              }}
            >
              {topic.chapter}
            </p>
          )}
          {topic.estimatedMinutes && (
            <span
              style={{
                fontSize: "10px",
                color: "#334155",
                margin: "2px 0 0",
              }}
            >
              · {topic.estimatedMinutes} min
            </span>
          )}
        </div>
      </div>

      {/* Right: button */}
      <button
        onClick={() => onToggle(topic)}
        disabled={saving}
        style={{
          flexShrink: 0,
          padding: "5px 12px",
          borderRadius: "7px",
          fontSize: "12px",
          fontWeight: 600,
          border: "none",
          cursor: saving ? "not-allowed" : "pointer",
          transition: "all 0.15s",
          background: topic.completed
            ? "rgba(99,102,241,0.15)"
            : "linear-gradient(135deg,#6366F1,#8B5CF6)",
          color: topic.completed ? "#818CF8" : "#fff",
          opacity: saving ? 0.6 : 1,
          minWidth: "72px",
        }}
      >
        {saving ? "…" : topic.completed ? "Undo" : "Mark Done"}
      </button>
    </div>
  );
}

function ProgressPill({ topics }: { topics: RoadmapTopic[] }) {
  const done = topics.filter((t) => t.completed).length;
  const pct = Math.round((done / topics.length) * 100);
  return (
    <div
      style={{
        marginTop: "14px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <div
        style={{
          flex: 1,
          height: "4px",
          background: "rgba(255,255,255,0.06)",
          borderRadius: "99px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg,#6366F1,#A78BFA)",
            borderRadius: "99px",
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <span style={{ fontSize: "11px", color: "#64748B", whiteSpace: "nowrap" }}>
        {done}/{topics.length} done
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px 0 8px",
        color: "#475569",
        fontSize: "13px",
      }}
    >
      <div style={{ fontSize: "24px", marginBottom: "6px" }}>📚</div>
      Generate a roadmap first to see your topics here.
    </div>
  );
}

function Toast({ msg }: { msg: string }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "-48px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#1E293B",
        border: "1px solid rgba(99,102,241,0.35)",
        borderRadius: "10px",
        padding: "8px 16px",
        fontSize: "12px",
        color: "#A5B4FC",
        whiteSpace: "nowrap",
        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        zIndex: 50,
        animation: "fadeIn 0.2s ease",
      }}
    >
      {msg}
    </div>
  );
}
