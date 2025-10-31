"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Plus, Eye, Edit, Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { format } from "date-fns";

export default function AssessmentsPage() {
  // Initialize API
  useEffect(() => {
    api.init();
  }, []);

  // Fetch jobs for assessment list
  const {
    data: jobsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => api.getJobs({ pageSize: 100 }),
    enabled: true,
  });

  const jobs = jobsData?.data || [];

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">
          Failed to load assessments. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
          <p className="text-gray-600">
            Create and manage job-specific assessments
          </p>
        </div>
      </div>

      {/* Assessments Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading assessments...</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">
            No jobs found. Create jobs first to build assessments.
          </p>
          <a
            href="/jobs"
            className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Create Job
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <AssessmentCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}

function AssessmentCard({ job }) {
  // Check if assessment exists for this job
  const { data: assessment, isLoading } = useQuery({
    queryKey: ["assessment", job.id],
    queryFn: () => api.getAssessment(job.id),
    enabled: !!job.id,
  });

  const hasAssessment =
    assessment && assessment.sections && assessment.sections.length > 0;
  const questionCount = hasAssessment
    ? assessment.sections.reduce(
        (total, section) => total + section.questions.length,
        0,
      )
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {job.title}
          </h3>
          <div className="flex items-center space-x-2 mb-3">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                job.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {job.status}
            </span>
            {hasAssessment && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {questionCount} questions
              </span>
            )}
          </div>
        </div>

        <ClipboardList
          size={24}
          className={hasAssessment ? "text-blue-500" : "text-gray-400"}
        />
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {job.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {job.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
          >
            {tag}
          </span>
        ))}
        {job.tags.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
            +{job.tags.length - 3} more
          </span>
        )}
      </div>

      {/* Status */}
      <div className="mb-4">
        {isLoading ? (
          <div className="flex items-center text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin mr-2" />
            Checking assessment...
          </div>
        ) : hasAssessment ? (
          <div className="text-sm text-green-600 font-medium">
            ✓ Assessment configured
          </div>
        ) : (
          <div className="text-sm text-gray-500">No assessment created</div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <a
          href={`/assessments/${job.id}`}
          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors text-center flex items-center justify-center"
        >
          {hasAssessment ? (
            <>
              <Edit size={16} className="mr-2" />
              Edit Assessment
            </>
          ) : (
            <>
              <Plus size={16} className="mr-2" />
              Create Assessment
            </>
          )}
        </a>

        {hasAssessment && (
          <a
            href={`/assessments/${job.id}/preview`}
            className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
            title="Preview Assessment"
          >
            <Eye size={16} />
          </a>
        )}
      </div>

      {/* Last updated */}
      {hasAssessment && assessment.updatedAt && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Last updated {format(new Date(assessment.updatedAt), "MMM d, yyyy")}
          </p>
        </div>
      )}
    </div>
  );
}
