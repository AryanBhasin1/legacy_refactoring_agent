import { useEffect, useRef, useState } from "react";
import ChatWindow from "./ChatWindow";
import ResultsPanel from "./ResultsPanel";

const DASHBOARD_SPLIT_KEY = "legacy-refactoring-dashboard-split";
const DEFAULT_CHAT_WIDTH = 58;
const MIN_CHAT_WIDTH = 30;
const MAX_CHAT_WIDTH = 70;

function clampWidth(value) {
  return Math.min(MAX_CHAT_WIDTH, Math.max(MIN_CHAT_WIDTH, value));
}

export default function Dashboard({
  session,
  addMessage,
  setSessionStatus,
  onSelectCluster,
}) {
  const containerRef = useRef(null);
  const [chatWidth, setChatWidth] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_CHAT_WIDTH;

    const stored = Number(window.localStorage.getItem(DASHBOARD_SPLIT_KEY));
    if (Number.isNaN(stored)) return DEFAULT_CHAT_WIDTH;

    return clampWidth(stored);
  });
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(DASHBOARD_SPLIT_KEY, String(chatWidth));
  }, [chatWidth]);

  useEffect(() => {
    if (!isResizing) return undefined;

    const handlePointerMove = (event) => {
      const container = containerRef.current;
      if (!container) return;

      const bounds = container.getBoundingClientRect();
      const nextWidth = ((event.clientX - bounds.left) / bounds.width) * 100;
      setChatWidth(clampWidth(nextWidth));
    };

    const handlePointerUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isResizing]);

  return (
    <div
      id="dashboard"
      ref={containerRef}
      className={`min-h-0 flex-1 p-6 ${isResizing ? "select-none" : ""}`}
    >
      <div className="flex h-full flex-col gap-6 xl:flex-row xl:items-stretch xl:gap-4">
        <div
          className="min-h-0 xl:shrink-0"
          style={{
            width: "100%",
            flexBasis: `calc(${chatWidth}% - 8px)`,
          }}
        >
          <div className="flex h-full min-h-0 flex-col gap-6">
            <div className="min-h-0 flex-1">
              <ChatWindow
                session={session}
                addMessage={addMessage}
                setSessionStatus={setSessionStatus}
              />
            </div>
          </div>
        </div>

        <button
          id="dashboard-resize-handle"
          type="button"
          onPointerDown={(event) => {
            event.preventDefault();
            setIsResizing(true);
          }}
          className="hidden xl:flex xl:w-4 xl:shrink-0 xl:cursor-col-resize xl:items-center xl:justify-center"
          aria-label="Resize dashboard panels"
          title="Resize dashboard panels"
        >
          <span className="h-full w-px bg-zinc-300 dark:bg-zinc-700" />
        </button>

        <div
          className="min-h-0 min-w-0 xl:flex-1"
          style={{
            width: "100%",
            flexBasis: `calc(${100 - chatWidth}% - 8px)`,
          }}
        >
          <ResultsPanel
            session={session}
            onSelectCluster={onSelectCluster}
          />
        </div>
      </div>
    </div>
  );
}
