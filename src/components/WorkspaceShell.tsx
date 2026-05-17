"use client";

import { useState } from "react";

interface WorkspaceShellProps {
  sidebar: React.ReactNode;
  notesList: React.ReactNode;
  editor: React.ReactNode;
}

export function WorkspaceShell({ sidebar, notesList, editor }: WorkspaceShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Controls the single-column mobile view (either the list or the editor)
  const [activeMobileView, setActiveMobileView] = useState<"list" | "editor">("list");

  return (
    <div className="flex h-full w-full overflow-hidden bg-zinc-50">
      {/* 1. Mobile Sidebar Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* 2. Responsive Main Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 transform flex-col border-r border-zinc-200 bg-zinc-50 transition-transform duration-300 ease-in-out 
          md:static md:flex md:translate-x-0 md:flex-shrink-0
          ${isMobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
        `}
      >
        {/* Mobile Close Button */}
        <div className="flex h-14 items-center justify-end px-4 md:hidden">
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-200"
            aria-label="Close sidebar"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sidebar}
        </div>
      </aside>

      {/* 3. Main Workspace Area */}
      <main className="flex flex-1 flex-col overflow-hidden md:flex-row">
        
        {/* Mobile Sticky Top Header */}
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-md md:hidden">
          <div className="flex items-center gap-2">
            {activeMobileView === "editor" ? (
              <button 
                onClick={() => setActiveMobileView("list")} 
                className="flex items-center text-sm font-medium text-purple-600 hover:text-purple-700"
              >
                 <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M15 18l-6-6 6-6"/></svg>
                 Notes
              </button>
            ) : (
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-md text-zinc-700 hover:bg-zinc-200"
                aria-label="Open sidebar"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
              </button>
            )}
          </div>
          <span className="text-sm font-medium text-zinc-900">
            {activeMobileView === "list" ? "All Notes" : "Editor"}
          </span>
          <div className="w-10" /> {/* Spacer to center the title */}
        </header>

        {/* Notes List Column */}
        <section
          className={`
            flex-shrink-0 border-r border-zinc-200 bg-zinc-50/50 md:block md:w-80 lg:w-96
            ${activeMobileView === "list" ? "block h-full w-full" : "hidden"}
          `}
          onClick={() => {
            // When on mobile, tapping a note switches the view to the editor
            if (window.innerWidth < 768) setActiveMobileView("editor");
          }}
        >
          <div className="h-full overflow-y-auto">
            {notesList}
          </div>
        </section>

        {/* Editor Column */}
        <section
          className={`
            flex-1 bg-white md:block
            ${activeMobileView === "editor" ? "block h-full w-full" : "hidden"}
          `}
        >
          {/* Max-w-3xl clamps the line length for ultrawide screens */}
          <div className="mx-auto h-full max-w-3xl overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            {editor}
          </div>
        </section>

      </main>
    </div>
  );
}