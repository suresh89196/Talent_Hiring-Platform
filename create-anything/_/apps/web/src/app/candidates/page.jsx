"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Filter,
  Users,
  Eye,
  MoreVertical,
  Loader2,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { api } from "../../lib/api";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

const STAGES = [
  { id: "applied", name: "Applied", color: "bg-blue-100 text-blue-800" },
  { id: "screen", name: "Screening", color: "bg-yellow-100 text-yellow-800" },
  { id: "tech", name: "Technical", color: "bg-purple-100 text-purple-800" },
  { id: "offer", name: "Offer", color: "bg-orange-100 text-orange-800" },
  { id: "hired", name: "Hired", color: "bg-green-100 text-green-800" },
  { id: "rejected", name: "Rejected", color: "bg-red-100 text-red-800" },
];

// Simple virtualized list component
function VirtualizedCandidateList({ candidates, onCandidateClick }) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const itemHeight = 80;
  const containerHeight = 600;

  const visibleCandidates = candidates.slice(
    visibleRange.start,
    visibleRange.end,
  );

  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + 5,
      candidates.length,
    );
    setVisibleRange({ start, end });
  };

  return (
    <div
      className="h-[600px] overflow-y-auto border border-gray-200 rounded-lg bg-white"
      onScroll={handleScroll}
    >
      <div
        style={{ height: candidates.length * itemHeight, position: "relative" }}
      >
        {visibleCandidates.map((candidate, index) => {
          const actualIndex = visibleRange.start + index;
          const stage = STAGES.find((s) => s.id === candidate.stage);

          return (
            <div
              key={candidate.id}
              style={{
                position: "absolute",
                top: actualIndex * itemHeight,
                left: 0,
                right: 0,
                height: itemHeight,
              }}
              className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onCandidateClick(candidate)}
            >
              <div className="flex items-center justify-between h-full">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {candidate.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {candidate.name}
                      </h3>
                      <p className="text-sm text-gray-500">{candidate.email}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={twMerge(
                      "px-2 py-1 text-xs font-medium rounded-full",
                      stage?.color,
                    )}
                  >
                    {stage?.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(candidate.appliedAt), "MMM d")}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Kanban Board Component
function KanbanBoard({ candidates, onStageChange }) {
  const [draggedCandidate, setDraggedCandidate] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  const candidatesByStage = useMemo(() => {
    const grouped = {};
    STAGES.forEach((stage) => {
      grouped[stage.id] = candidates.filter((c) => c.stage === stage.id);
    });
    return grouped;
  }, [candidates]);

  const handleDragStart = (e, candidate) => {
    setDraggedCandidate(candidate);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e, stageId) => {
    e.preventDefault();

    if (draggedCandidate && stageId !== draggedCandidate.stage) {
      onStageChange(draggedCandidate.id, stageId);
    }

    setDraggedCandidate(null);
    setDragOverStage(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {STAGES.map((stage) => (
        <div
          key={stage.id}
          className={twMerge(
            "bg-gray-50 rounded-lg p-4 min-h-[500px]",
            dragOverStage === stage.id && "bg-blue-50 ring-2 ring-blue-200",
          )}
          onDragOver={(e) => handleDragOver(e, stage.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, stage.id)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">{stage.name}</h3>
            <span className="text-sm text-gray-500">
              {candidatesByStage[stage.id]?.length || 0}
            </span>
          </div>

          <div className="space-y-3">
            {candidatesByStage[stage.id]?.map((candidate) => (
              <div
                key={candidate.id}
                draggable
                onDragStart={(e) => handleDragStart(e, candidate)}
                className={twMerge(
                  "bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow",
                  draggedCandidate?.id === candidate.id && "opacity-50",
                )}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {candidate.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {candidate.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {candidate.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {format(new Date(candidate.appliedAt), "MMM d")}
                  </span>
                  <button
                    onClick={() =>
                      (window.location.href = `/candidates/${candidate.id}`)
                    }
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CandidatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'kanban'

  const queryClient = useQueryClient();

  // Initialize API
  useEffect(() => {
    api.init();
  }, []);

  // Get URL params for job filter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobParam = urlParams.get("job");
    if (jobParam) {
      // Could filter by job here if needed
    }
  }, []);

  // Fetch candidates
  const {
    data: candidatesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["candidates", searchTerm, stageFilter, currentPage, viewMode],
    queryFn: () =>
      api.getCandidates({
        search: searchTerm,
        stage: stageFilter,
        page: currentPage,
        pageSize: viewMode === "kanban" ? 1000 : 50, // Load more for kanban
      }),
    enabled: true,
  });

  // Stage change mutation
  const stageChangeMutation = useMutation({
    mutationFn: ({ candidateId, newStage }) =>
      api.updateCandidate(candidateId, { stage: newStage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
    onError: (error) => {
      console.error("Failed to update candidate stage:", error);
    },
  });

  const handleStageChange = (candidateId, newStage) => {
    stageChangeMutation.mutate({ candidateId, newStage });
  };

  const handleCandidateClick = (candidate) => {
    window.location.href = `/candidates/${candidate.id}`;
  };

  const candidates = candidatesData?.data || [];
  const pagination = candidatesData?.pagination;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">
          Failed to load candidates. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-600">
            Manage candidate applications and progress
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("list")}
            className={twMerge(
              "px-3 py-2 rounded-md text-sm font-medium transition-colors",
              viewMode === "list"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900",
            )}
          >
            <List size={16} className="mr-2 inline" />
            List
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={twMerge(
              "px-3 py-2 rounded-md text-sm font-medium transition-colors",
              viewMode === "kanban"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900",
            )}
          >
            <Grid size={16} className="mr-2 inline" />
            Kanban
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search candidates by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Stage Filter */}
          <div className="relative">
            <Filter
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Stages</option>
              {STAGES.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading candidates...</span>
        </div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No candidates found.</p>
        </div>
      ) : viewMode === "list" ? (
        <div className="space-y-4">
          <VirtualizedCandidateList
            candidates={candidates}
            onCandidateClick={handleCandidateClick}
          />

          {/* Pagination for list view */}
          {pagination && pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 border border-gray-200 rounded-lg flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
                {Math.min(
                  pagination.page * pagination.pageSize,
                  pagination.total,
                )}{" "}
                of {pagination.total} results
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>

                <span className="px-3 py-1 text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <KanbanBoard
          candidates={candidates}
          onStageChange={handleStageChange}
        />
      )}
    </div>
  );
}
