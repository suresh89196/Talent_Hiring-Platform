"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Mail,
  User,
  Clock,
  MessageSquare,
  Plus,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { api } from "../../../lib/api";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

const STAGES = [
  { id: "applied", name: "Applied", color: "bg-blue-100 text-blue-800" },
  { id: "screen", name: "Screening", color: "bg-yellow-100 text-yellow-800" },
  { id: "tech", name: "Technical", color: "bg-purple-100 text-purple-800" },
  { id: "offer", name: "Offer", color: "bg-orange-100 text-orange-800" },
  { id: "hired", name: "Hired", color: "bg-green-100 text-green-800" },
  { id: "rejected", name: "Rejected", color: "bg-red-100 text-red-800" },
];

// Simple @mention component
function MentionTextarea({ value, onChange, placeholder }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");

  // Mock team members for @mentions
  const teamMembers = [
    "John Smith",
    "Sarah Johnson",
    "Mike Chen",
    "Emily Davis",
    "Alex Wilson",
  ];

  const handleTextChange = (e) => {
    const text = e.target.value;
    onChange(text);

    // Simple @mention detection
    const lastAtIndex = text.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const afterAt = text.slice(lastAtIndex + 1);
      if (!afterAt.includes(" ") && afterAt.length > 0) {
        setMentionQuery(afterAt);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const insertMention = (name) => {
    const lastAtIndex = value.lastIndexOf("@");
    const beforeAt = value.slice(0, lastAtIndex);
    const newValue = beforeAt + `@${name} `;
    onChange(newValue);
    setShowSuggestions(false);
  };

  const filteredMembers = teamMembers.filter((member) =>
    member.toLowerCase().includes(mentionQuery.toLowerCase()),
  );

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={handleTextChange}
        placeholder={placeholder}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />

      {showSuggestions && filteredMembers.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {filteredMembers.map((member) => (
            <button
              key={member}
              onClick={() => insertMention(member)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
            >
              @{member}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CandidateDetailPage({ params }) {
  const { id } = params;
  const [newNote, setNewNote] = useState("");
  const [selectedStage, setSelectedStage] = useState("");

  const queryClient = useQueryClient();

  // Initialize API
  useEffect(() => {
    api.init();
  }, []);

  // Fetch candidate details
  const {
    data: candidate,
    isLoading: candidateLoading,
    error: candidateError,
  } = useQuery({
    queryKey: ["candidate", id],
    queryFn: () => api.getCandidate(id),
    enabled: !!id,
  });

  // Fetch candidate timeline
  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ["candidateTimeline", id],
    queryFn: () => api.getCandidateTimeline(id),
    enabled: !!id,
  });

  // Set initial stage when candidate loads
  useEffect(() => {
    if (candidate && !selectedStage) {
      setSelectedStage(candidate.stage);
    }
  }, [candidate, selectedStage]);

  // Stage change mutation
  const stageChangeMutation = useMutation({
    mutationFn: ({ candidateId, newStage }) =>
      api.updateCandidate(candidateId, { stage: newStage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate", id] });
      queryClient.invalidateQueries({ queryKey: ["candidateTimeline", id] });
    },
    onError: (error) => {
      console.error("Failed to update candidate stage:", error);
    },
  });

  const handleStageChange = () => {
    if (selectedStage !== candidate.stage) {
      stageChangeMutation.mutate({ candidateId: id, newStage: selectedStage });
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      // In a real app, this would be an API call to add a note
      console.log("Adding note:", newNote);
      setNewNote("");
    }
  };

  if (candidateLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading candidate details...</span>
      </div>
    );
  }

  if (candidateError || !candidate) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Candidate not found or failed to load.</p>
        <a
          href="/candidates"
          className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
        >
          ← Back to Candidates
        </a>
      </div>
    );
  }

  const currentStage = STAGES.find((s) => s.id === candidate.stage);
  const sortedTimeline = timeline
    ? [...timeline].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      )
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <div>
        <a
          href="/candidates"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Candidates
        </a>
      </div>

      {/* Candidate Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xl font-medium text-gray-600">
                {candidate.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {candidate.name}
              </h1>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <Mail size={16} className="mr-1" />
                  {candidate.email}
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1" />
                  Applied {format(new Date(candidate.appliedAt), "MMM d, yyyy")}
                </div>
              </div>

              <div className="mt-3">
                <span
                  className={twMerge(
                    "px-3 py-1 text-sm font-medium rounded-full",
                    currentStage?.color,
                  )}
                >
                  {currentStage?.name}
                </span>
              </div>
            </div>
          </div>

          {/* Stage Change */}
          <div className="flex items-center space-x-3">
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {STAGES.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>

            {selectedStage !== candidate.stage && (
              <button
                onClick={handleStageChange}
                disabled={stageChangeMutation.isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {stageChangeMutation.isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Update Stage"
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resume/Profile */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resume</h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700">{candidate.resume}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock size={18} className="mr-2" />
              Timeline
            </h2>

            {timelineLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading timeline...</span>
              </div>
            ) : sortedTimeline.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No timeline events found.
              </p>
            ) : (
              <div className="space-y-4">
                {sortedTimeline.map((event, index) => {
                  const stage = STAGES.find((s) => s.id === event.stage);

                  return (
                    <div
                      key={event.id || index}
                      className="flex items-start space-x-3"
                    >
                      <div
                        className={twMerge(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                          stage?.color || "bg-gray-100 text-gray-800",
                        )}
                      >
                        {stage?.name.charAt(0) || "?"}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {event.action === "applied"
                              ? "Applied for position"
                              : event.action === "stage_change"
                                ? `Moved to ${stage?.name}`
                                : event.action}
                          </p>
                          <span className="text-xs text-gray-500">
                            {format(new Date(event.timestamp), "MMM d, h:mm a")}
                          </span>
                        </div>
                        {event.notes && (
                          <p className="text-sm text-gray-600 mt-1">
                            {event.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Add Note */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageSquare size={18} className="mr-2" />
              Add Note
            </h3>

            <div className="space-y-3">
              <MentionTextarea
                value={newNote}
                onChange={setNewNote}
                placeholder="Add a note about this candidate... Use @name to mention team members"
              />

              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <Plus size={16} className="mr-2" />
                Add Note
              </button>
            </div>
          </div>

          {/* Candidate Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Candidate Information
            </h3>
            <div className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Candidate ID
                </dt>
                <dd className="text-sm text-gray-900 font-mono">
                  {candidate.id}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Job Applied For
                </dt>
                <dd className="text-sm text-gray-900">{candidate.jobId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Current Stage
                </dt>
                <dd className="text-sm text-gray-900 capitalize">
                  {candidate.stage}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Last Updated
                </dt>
                <dd className="text-sm text-gray-900">
                  {format(new Date(candidate.updatedAt), "MMM d, yyyy h:mm a")}
                </dd>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="block w-full px-4 py-2 text-center bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                Schedule Interview
              </button>
              <button className="block w-full px-4 py-2 text-center bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                Send Assessment
              </button>
              <button className="block w-full px-4 py-2 text-center bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors">
                Request References
              </button>
              <button className="block w-full px-4 py-2 text-center bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                Reject Candidate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
