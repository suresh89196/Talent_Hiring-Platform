"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Eye, Plus, Loader2 } from "lucide-react";
import { api } from "../../../lib/api";
import AssessmentBuilder from "../../../components/AssessmentBuilder";
import AssessmentPreview from "../../../components/AssessmentPreview";

export default function AssessmentBuilderPage({ params }) {
  const { jobId } = params;
  const [activeTab, setActiveTab] = useState("builder");
  const [assessment, setAssessment] = useState({
    title: "",
    sections: [],
  });

  const queryClient = useQueryClient();

  // Initialize API
  useEffect(() => {
    api.init();
  }, []);

  // Fetch job details
  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => api.getJob(jobId),
    enabled: !!jobId,
  });

  // Fetch existing assessment
  const { data: existingAssessment, isLoading: assessmentLoading } = useQuery({
    queryKey: ["assessment", jobId],
    queryFn: () => api.getAssessment(jobId),
    enabled: !!jobId,
  });

  // Load existing assessment data
  useEffect(() => {
    if (existingAssessment) {
      setAssessment(existingAssessment);
    } else if (job) {
      setAssessment({
        title: `${job.title} Assessment`,
        sections: [],
      });
    }
  }, [existingAssessment, job]);

  // Save assessment mutation
  const saveMutation = useMutation({
    mutationFn: () => api.saveAssessment(jobId, assessment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment", jobId] });
    },
    onError: (error) => {
      console.error("Failed to save assessment:", error);
    },
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  if (jobLoading || assessmentLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">
          Loading assessment builder...
        </span>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Job not found.</p>
        <a
          href="/assessments"
          className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
        >
          ← Back to Assessments
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <a
            href="/assessments"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Assessments
          </a>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Assessment Builder
            </h1>
            <p className="text-gray-600">{job.title}</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saveMutation.isLoading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saveMutation.isLoading ? (
            <Loader2 size={20} className="mr-2 animate-spin" />
          ) : (
            <Save size={20} className="mr-2" />
          )}
          Save Assessment
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("builder")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "builder"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Builder
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "preview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Eye size={16} className="mr-2 inline" />
            Preview
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-[600px]">
        {activeTab === "builder" ? (
          <AssessmentBuilder assessment={assessment} onChange={setAssessment} />
        ) : (
          <AssessmentPreview assessment={assessment} />
        )}
      </div>

      {/* Save Status */}
      {saveMutation.error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">
            Failed to save assessment. Please try again.
          </p>
        </div>
      )}

      {saveMutation.isSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600">
            Assessment saved successfully!
          </p>
        </div>
      )}
    </div>
  );
}
