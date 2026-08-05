import type { RoadmapTopic } from "@/types/roadmap";

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: "bg-emerald-500/15 text-emerald-400",
  medium: "bg-amber-500/15 text-amber-400",
  hard: "bg-rose-500/15 text-rose-400",
};

const WEIGHTAGE_STYLES: Record<string, string> = {
  high: "bg-indigo-500/15 text-indigo-400",
  medium: "bg-slate-500/15 text-slate-400",
  low: "bg-slate-700/40 text-slate-500",
};

interface TopicCardProps {
  topic: RoadmapTopic;
  onToggle: (id: string) => void;
  onEdit: (topic: RoadmapTopic) => void;
  onDelete: (id: string) => void;
}

export function TopicCard({ topic, onToggle, onEdit, onDelete }: TopicCardProps) {
  return (
    <div
      className={`
        rounded-xl border border-[#334155] bg-[#1E293B] p-[14px] mb-2
        transition-all duration-150
        hover:border-indigo-500 hover:bg-[#334155]
        ${topic.completed ? "opacity-55" : ""}
      `}
    >
      <div className="flex items-start gap-[10px]">
        <button
          onClick={() => onToggle(topic.id)}
          aria-label={topic.completed ? "Mark incomplete" : "Mark complete"}
          className={`
            mt-[2px] flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center
            transition-all duration-150
            ${topic.completed ? "bg-emerald-500 border-emerald-500" : "border-[#334155] bg-transparent hover:border-indigo-400"}
          `}
        >
          {topic.completed && <CheckIcon />}
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-[#94A3B8] mb-[3px]">{topic.chapter}</p>
          <p className={`text-sm font-medium leading-snug ${topic.completed ? "line-through text-[#94A3B8]" : "text-[#F8FAFC]"}`}>
            {topic.topic}
          </p>

          <div className="flex items-center gap-[6px] mt-[10px] flex-wrap">
            <span className={`text-[10px] px-2 py-[3px] rounded-full font-medium capitalize ${DIFFICULTY_STYLES[topic.difficulty]}`}>
              {topic.difficulty}
            </span>
            <span className={`text-[10px] px-2 py-[3px] rounded-full font-medium capitalize ${WEIGHTAGE_STYLES[topic.weightage]}`}>
              {topic.weightage} weight
            </span>

            <div className="flex gap-1 ml-auto">
              <button
                onClick={() => onEdit(topic)}
                aria-label="Rename topic"
                className="w-7 h-7 rounded-md flex items-center justify-center text-[#94A3B8]
                  transition-all duration-150 hover:bg-indigo-500/15 hover:text-indigo-400"
              >
                <PencilIcon />
              </button>
              <button
                onClick={() => onDelete(topic.id)}
                aria-label="Delete topic"
                className="w-7 h-7 rounded-md flex items-center justify-center text-[#94A3B8]
                  transition-all duration-150 hover:bg-rose-500/15 hover:text-rose-400"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
