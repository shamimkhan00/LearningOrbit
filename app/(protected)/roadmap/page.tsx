"use client";

import { useMemo } from "react";
import { TopicCard } from "@/components/roadmap/TopicCard";
import { TopicModal } from "@/components/roadmap/TopicModal";
import { Toast } from "@/components/roadmap/Toast";
import { useRoadmap } from "@/hooks/use-roadmap";
import { getProgressPercentage } from "@/lib/roadmap";
import type { RoadmapTopic } from "@/types/roadmap";
import Image from 'next/image';
import logoIcon from '@/app/icon0.svg';
import Link from "next/link";

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function RoadmapPage() {
  const {
    topics,
    subjects,
    activeFilter,
    setActiveFilter,
    collapsedSubjects,
    saving,
    loadingRoadmap,
    generating,
    modalOpen,
    modalMode,
    form,
    subjectForm,
    toastMsg,
    toastVisible,
    setSubjects,
    setSubjectForm,
    setModalOpen,
    toggleComplete,
    openAdd,
    openAddSubject,
    openEdit,
    saveModal,
    deleteTopic,
    deleteSubject,
    toggleSection,
    generateRoadmapFromApi,
    handleFormChange,
  } = useRoadmap();

  const SUBJECT_COLORS: Record<string, string> = {
    Physics: "#818CF8",
    Chemistry: "#34D399",
    Mathematics: "#FB923C",
  };

  const subjectFilters = useMemo(() => ["All", ...subjects.map((subject) => subject.name)], [subjects]);

  const filteredTopics = useMemo(
    () => (activeFilter === "All" ? topics : topics.filter((topic) => topic.subject === activeFilter)),
    [topics, activeFilter]
  );

  const groupedBySubject = useMemo(() => {
    const groups: Record<string, RoadmapTopic[]> = {};
    filteredTopics.forEach((topic) => {
      if (!groups[topic.subject]) {
        groups[topic.subject] = [];
      }
      groups[topic.subject].push(topic);
    });
    return groups;
  }, [filteredTopics]);

  const completedCount = topics.filter((topic) => topic.completed).length;
  const progressPct = getProgressPercentage(completedCount, topics.length);

  return (
    <main className="min-h-screen bg-[#0F172A] text-[#F8FAFC]">
      <div className="mx-auto max-w-lg pb-24">
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-[#334155] bg-[#0F172A]">
          <div className="flex items-center gap-2">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Image
                src={logoIcon}
                alt="LearningOrbit Logo"
                width={32}
                height={32}
                priority
              />

            </span>
            <div>
              <p className="text-sm font-medium leading-none">LearningOrbit</p>
              <p className="text-[11px] text-[#94A3B8] mt-[2px]">Study Roadmap</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openAddSubject}
              className="flex items-center gap-[6px] border border-[#334155] hover:bg-[#1E293B] text-[#F8FAFC] text-[13px] font-medium px-[14px] py-2 rounded-lg transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add subject
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-[6px] bg-indigo-500 hover:bg-indigo-600 text-white text-[13px] font-medium px-[14px] py-2 rounded-lg transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add topic
            </button>
          </div>
        </header>

        <div className="px-4 py-3 border-b border-[#334155] flex items-center justify-between">
          <div className="flex-1 mr-4">
            <div className="flex justify-between text-[12px] mb-[6px]">
              <span className="text-[#94A3B8]">
                {completedCount} of {topics.length} completed
              </span>
              <span className="text-indigo-400 font-medium">{progressPct}%</span>
            </div>

            <div className="h-1 bg-[#334155] rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="rounded-md p-[1px] bg-gradient-to-r from-red-500 via-blue-500 to-green-400">
  <Link
    href="/dashboard"
    className="block rounded-[5px] bg-[#0F172A] px-3 py-1.5 text-[12px] text-white"
  >
    Dashboard
  </Link>
</div>
        </div>

        <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar border-b border-[#334155]">
          {subjectFilters.map((subjectName) => (
            <button
              key={subjectName}
              onClick={() => setActiveFilter(subjectName)}
              className={`flex-shrink-0 px-[14px] py-[6px] rounded-full text-[12px] border transition-all duration-150 ${activeFilter === subjectName ? "bg-indigo-500 border-indigo-500 text-white" : "border-[#334155] text-[#94A3B8] hover:border-indigo-500/50"}`}
            >
              {subjectName}
            </button>
          ))}

        </div>

        <div className="px-4 pt-2">
          {loadingRoadmap && (
            <div className="text-center py-8 text-[#94A3B8] text-[13px]">Loading roadmap…</div>
          )}

          {!loadingRoadmap && topics.length === 0 && (
            <div className="text-center py-12 text-[#94A3B8]">
              <svg className="mx-auto mb-3 opacity-40" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="8" y1="15" x2="16" y2="15" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
              <p className="text-[13px] leading-relaxed mb-4">No roadmap saved yet.<br />Generate one from AI or add topics manually.</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <button
                  onClick={generateRoadmapFromApi}
                  disabled={generating}
                  className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {generating ? "Generating…" : "Generate roadmap"}
                </button>
                <button
                  onClick={openAdd}
                  className="rounded-lg border border-[#334155] px-4 py-2 text-sm text-[#F8FAFC]"
                >
                  Add topic
                </button>
              </div>
            </div>
          )}

          {Object.keys(groupedBySubject).length === 0 && !loadingRoadmap && topics.length > 0 && (
            <div className="text-center py-12 text-[#94A3B8]">
              <svg className="mx-auto mb-3 opacity-40" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="8" y1="15" x2="16" y2="15" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
              <p className="text-[13px] leading-relaxed">No topics found.<br />Add one to get started.</p>
            </div>
          )}

          {Object.entries(groupedBySubject).map(([subject, subjectTopics]) => {
            const isCollapsed = collapsedSubjects.has(subject);
            const doneInSubject = subjectTopics.filter((topic) => topic.completed).length;
            const color = SUBJECT_COLORS[subject] ?? "#6366F1";

            return (
              <div key={subject} className="mb-1">
                <button onClick={() => toggleSection(subject)} className="w-full flex items-center gap-2 py-3 text-left">
                  <span className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: color }} />
                  <span className="text-[11px] font-medium uppercase tracking-widest text-[#94A3B8]">{subject}</span>
                  <span className="text-[11px] text-[#334155] ml-auto mr-2">{doneInSubject}/{subjectTopics.length}</span>
                  <span className="text-[#94A3B8]">
                    <ChevronDownIcon open={!isCollapsed} />
                  </span>
                </button>

                {!isCollapsed && subjectTopics.map((topic) => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    onToggle={toggleComplete}
                    onEdit={openEdit}
                    onDelete={deleteTopic}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {modalOpen && (
        <TopicModal
          mode={modalMode}
          subject={subjects}
          form={form}
          subjectValue={subjectForm}
          onChange={handleFormChange}
          onSubjectChange={setSubjectForm}
          onSave={saveModal}
          onDeleteSubject={deleteSubject}
          onClose={() => setModalOpen(false)}
        />
      )}

      <Toast message={toastMsg} visible={toastVisible} />
    </main>
  );
}
