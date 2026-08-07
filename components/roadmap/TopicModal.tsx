import type { RoadmapSubject, RoadmapTopic } from "@/types/roadmap";


interface TopicModalProps {
  mode: "add" | "edit" | "subject";
  subject: RoadmapSubject[];
  form: {
    topic: string;
    chapter: string;
    subject: string;
    difficulty: RoadmapTopic["difficulty"];
    weightage: RoadmapTopic["weightage"];
  };
  subjectValue: string;
  onChange: (field: string, value: string) => void;
  onSubjectChange: (value: string) => void;
  onSave: () => void;
  onDeleteSubject: (subjectId: string) => void;
  onClose: () => void;
}

export function TopicModal({ mode, subject, form, subjectValue, onChange, onSubjectChange, onSave, onDeleteSubject, onClose }: TopicModalProps) {

    return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-[#1E293B] rounded-t-2xl border-t border-[#334155] px-5 pt-4 pb-10">
        <div className="w-9 h-1 rounded-full bg-[#334155] mx-auto mb-4" />

        <h2 className="text-[15px] font-medium text-[#F8FAFC] mb-4">
          {mode === "subject" ? "Add subject" : mode === "add" ? "Add topic" : "Rename topic"}
        </h2>

        {mode === "subject" ? (
          <div className="mb-[14px]">
            <label className="block text-[12px] text-[#94A3B8] mb-[6px]">Subject name</label>
            <input
              className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-[10px] text-sm text-[#F8FAFC] outline-none focus:border-indigo-500 transition-colors"
              placeholder="e.g. Biology"
              value={subjectValue}
              onChange={(event) => onSubjectChange(event.target.value)}
            />
            {subject.length > 0 && (
          <div className="mt-4 space-y-2">
      <p className="text-xs text-[#94A3B8]">Current Subjects</p>

      {subject.map((subject) => (
        <div
          key={subject.id}
          className="flex items-center justify-between bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2"
        >
          <span className="text-sm text-[#F8FAFC]">{subject.name}</span>

          <button
            type="button"
            onClick={() => onDeleteSubject(subject.id)}
            className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  )}
          </div>
        ) : (
          <>
            <div className="mb-[14px]">
              <label className="block text-[12px] text-[#94A3B8] mb-[6px]">Topic name</label>
              <input
                className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-[10px] text-sm text-[#F8FAFC] outline-none focus:border-indigo-500 transition-colors"
                placeholder="e.g. Newton's Laws"
                value={form.topic}
                onChange={(event) => onChange("topic", event.target.value)}
              />
            </div>

            <div className="mb-[14px]">
              <label className="block text-[12px] text-[#94A3B8] mb-[6px]">Chapter</label>
              <input
                className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-[10px] text-sm text-[#F8FAFC] outline-none focus:border-indigo-500 transition-colors"
                placeholder="e.g. Mechanics"
                value={form.chapter}
                onChange={(event) => onChange("chapter", event.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-[10px] mb-[14px]">
              <div>
                <label className="block text-[12px] text-[#94A3B8] mb-[6px]">Subject</label>
                <select
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-[10px] text-sm text-[#F8FAFC] outline-none focus:border-indigo-500 appearance-none"
                  value={form.subject}
                  onChange={(event) => onChange("subject", event.target.value)}
                >
                  <option value="">

                    {subject.length === 0
      ? "No subjects available"
      : "Select Subject"}
                
                </option>

{subject.map((subject) => (
  <option key={subject.id} value={subject.name}>
    {subject.name}
  </option>
))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] text-[#94A3B8] mb-[6px]">Difficulty</label>
                <select
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-[10px] text-sm text-[#F8FAFC] outline-none focus:border-indigo-500 appearance-none"
                  value={form.difficulty}
                  onChange={(event) => onChange("difficulty", event.target.value)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-[12px] text-[#94A3B8] mb-[6px]">Weightage</label>
              <select
                className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-[10px] text-sm text-[#F8FAFC] outline-none focus:border-indigo-500 appearance-none"
                value={form.weightage}
                onChange={(event) => onChange("weightage", event.target.value)}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="flex gap-[10px]">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-lg border border-[#334155] text-sm text-[#94A3B8] hover:bg-[#334155] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                className="flex-[2] py-3 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors"
              >
                Save topic
              </button>
            </div>
          </>
        )}

        {mode === "subject" && (
          <div className="flex gap-[10px]">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-lg border border-[#334155] text-sm text-[#94A3B8] hover:bg-[#334155] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="flex-[2] py-3 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors"
            >
              Save subject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
