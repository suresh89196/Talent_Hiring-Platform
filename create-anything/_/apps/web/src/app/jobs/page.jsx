"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  Archive,
  ArchiveRestore,
  Edit,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { api } from "../../lib/api";
import { twMerge } from "tailwind-merge";
import JobModal from "../../components/JobModal";

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("order");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [draggedJob, setDraggedJob] = useState(null);
  const [dragOverJob, setDragOverJob] = useState(null);

  const queryClient = useQueryClient();

  // Initialize API
  useEffect(() => {
    api.init();
  }, []);

  // Fetch jobs
  const {
    data: jobsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["jobs", searchTerm, statusFilter, currentPage, sortBy],
    queryFn: () =>
      api.getJobs({
        search: searchTerm,
        status: statusFilter,
        page: currentPage,
        pageSize: 10,
        sort: sortBy,
      }),
    enabled: true,
  });

  // Archive/Unarchive mutation
  const archiveMutation = useMutation({
    mutationFn: ({ id, status }) => api.updateJob(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error) => {
      console.error("Failed to update job status:", error);
    },
  });

  // Reorder mutation with optimistic updates
  const reorderMutation = useMutation({
    mutationFn: ({ fromOrder, toOrder }) =>
      api.reorderJobs({ fromOrder, toOrder }),
    onMutate: async ({ fromOrder, toOrder }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["jobs"] });

      // Snapshot previous value
      const previousJobs = queryClient.getQueryData([
        "jobs",
        searchTerm,
        statusFilter,
        currentPage,
        sortBy,
      ]);

      // Optimistically update
      if (previousJobs) {
        const newJobs = { ...previousJobs };
        const jobs = [...newJobs.data];

        // Find and move the job
        const fromIndex = jobs.findIndex((job) => job.order === fromOrder);
        const toIndex = jobs.findIndex((job) => job.order === toOrder);

        if (fromIndex !== -1 && toIndex !== -1) {
          const [movedJob] = jobs.splice(fromIndex, 1);
          jobs.splice(toIndex, 0, movedJob);

          // Update orders
          jobs.forEach((job, index) => {
            job.order = index;
          });

          newJobs.data = jobs;
          queryClient.setQueryData(
            ["jobs", searchTerm, statusFilter, currentPage, sortBy],
            newJobs,
          );
        }
      }

      return { previousJobs };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousJobs) {
        queryClient.setQueryData(
          ["jobs", searchTerm, statusFilter, currentPage, sortBy],
          context.previousJobs,
        );
      }
      console.error("Failed to reorder jobs:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  const handleDragStart = (e, job) => {
    setDraggedJob(job);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, job) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverJob(job);
  };

  const handleDragLeave = () => {
    setDragOverJob(null);
  };

  const handleDrop = (e, targetJob) => {
    e.preventDefault();

    if (draggedJob && targetJob && draggedJob.id !== targetJob.id) {
      reorderMutation.mutate({
        fromOrder: draggedJob.order,
        toOrder: targetJob.order,
      });
    }

    setDraggedJob(null);
    setDragOverJob(null);
  };

  const handleArchiveToggle = (job) => {
    const newStatus = job.status === "active" ? "archived" : "active";
    archiveMutation.mutate({ id: job.id, status: newStatus });
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleCreateJob = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const jobs = jobsData?.data || [];
  const pagination = jobsData?.pagination;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load jobs. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-600">
            Manage your job postings and requirements
          </p>
        </div>
        <button
          onClick={handleCreateJob}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Create Job
        </button>
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
              placeholder="Search jobs by title or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="order">Order</option>
            <option value="title">Title</option>
            <option value="createdAt">Created Date</option>
          </select>
        </div>
      </div>

      {/* Jobs List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading jobs...</span>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No jobs found. Create your first job to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {jobs.map((job) => (
              <div
                key={job.id}
                draggable={sortBy === "order"}
                onDragStart={(e) => handleDragStart(e, job)}
                onDragOver={(e) => handleDragOver(e, job)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, job)}
                className={twMerge(
                  "p-4 hover:bg-gray-50 transition-colors",
                  dragOverJob?.id === job.id && "bg-blue-50 border-blue-200",
                  draggedJob?.id === job.id && "opacity-50",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Drag Handle */}
                    {sortBy === "order" && (
                      <div className="cursor-move text-gray-400 hover:text-gray-600">
                        <GripVertical size={20} />
                      </div>
                    )}

                    {/* Job Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          <a
                            href={`/jobs/${job.id}`}
                            className="hover:text-blue-600"
                          >
                            {job.title}
                          </a>
                        </h3>
                        <span
                          className={twMerge(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            job.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800",
                          )}
                        >
                          {job.status}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mt-1">
                        {job.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {job.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditJob(job)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title="Edit job"
                    >
                      <Edit size={18} />
                    </button>

                    <button
                      onClick={() => handleArchiveToggle(job)}
                      disabled={archiveMutation.isLoading}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title={
                        job.status === "active"
                          ? "Archive job"
                          : "Unarchive job"
                      }
                    >
                      {job.status === "active" ? (
                        <Archive size={18} />
                      ) : (
                        <ArchiveRestore size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
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

      {/* Job Modal */}
      {isModalOpen && (
        <JobModal
          job={editingJob}
          onClose={handleModalClose}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["jobs"] });
            handleModalClose();
          }}
        />
      )}
    </div>
  );
}
