"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";
import { twMerge } from "tailwind-merge";

export default function AssessmentPreview({ assessment }) {
  const [responses, setResponses] = useState({});
  const [errors, setErrors] = useState({});
  const [currentSection, setCurrentSection] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors: formErrors },
  } = useForm();

  if (!assessment.sections || assessment.sections.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Questions Yet
        </h3>
        <p className="text-gray-600">
          Add sections and questions in the builder to see the preview.
        </p>
      </div>
    );
  }

  const updateResponse = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const validateQuestion = (question) => {
    const response = responses[question.id];

    if (
      question.required &&
      (!response ||
        response === "" ||
        (Array.isArray(response) && response.length === 0))
    ) {
      return "This field is required";
    }

    if (
      question.type === "numeric" &&
      response !== undefined &&
      response !== ""
    ) {
      const num = parseFloat(response);
      if (isNaN(num)) {
        return "Please enter a valid number";
      }
      if (question.min !== undefined && num < question.min) {
        return `Value must be at least ${question.min}`;
      }
      if (question.max !== undefined && num > question.max) {
        return `Value must be at most ${question.max}`;
      }
    }

    if (
      (question.type === "short-text" || question.type === "long-text") &&
      response &&
      question.maxLength
    ) {
      if (response.length > question.maxLength) {
        return `Text must be ${question.maxLength} characters or less`;
      }
    }

    return null;
  };

  const onSubmit = (data) => {
    const newErrors = {};
    let hasErrors = false;

    assessment.sections.forEach((section) => {
      section.questions.forEach((question) => {
        const error = validateQuestion(question);
        if (error) {
          newErrors[question.id] = error;
          hasErrors = true;
        }
      });
    });

    setErrors(newErrors);

    if (!hasErrors) {
      console.log("Assessment submitted:", responses);
      alert("Assessment submitted successfully! (This is just a preview)");
    }
  };

  const section = assessment.sections[currentSection];

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Assessment Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {assessment.title}
          </h1>
          <p className="text-gray-600">
            Please complete all sections of this assessment. Required fields are
            marked with an asterisk (*).
          </p>
        </div>

        {/* Section Navigation */}
        {assessment.sections.length > 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Sections</h2>
              <span className="text-sm text-gray-500">
                {currentSection + 1} of {assessment.sections.length}
              </span>
            </div>

            <div className="flex space-x-2 overflow-x-auto">
              {assessment.sections.map((sec, index) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setCurrentSection(index)}
                  className={twMerge(
                    "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                    index === currentSection
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                  )}
                >
                  {sec.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Current Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {section.title}
          </h2>

          <div className="space-y-6">
            {section.questions.map((question) => (
              <QuestionPreview
                key={question.id}
                question={question}
                value={responses[question.id]}
                onChange={(value) => updateResponse(question.id, value)}
                error={errors[question.id]}
              />
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            disabled={currentSection === 0}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous Section
          </button>

          <div className="flex space-x-3">
            {currentSection < assessment.sections.length - 1 ? (
              <button
                type="button"
                onClick={() =>
                  setCurrentSection(
                    Math.min(
                      assessment.sections.length - 1,
                      currentSection + 1,
                    ),
                  )
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next Section
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <CheckCircle size={20} className="mr-2" />
                Submit Assessment
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

function QuestionPreview({ question, value, onChange, error }) {
  const renderInput = () => {
    switch (question.type) {
      case "single-choice":
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case "multi-choice":
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      onChange([...currentValues, option]);
                    } else {
                      onChange(currentValues.filter((v) => v !== option));
                    }
                  }}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case "short-text":
        return (
          <div>
            <input
              type="text"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              maxLength={question.maxLength}
              className={twMerge(
                "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                error ? "border-red-300" : "border-gray-300",
              )}
              placeholder="Enter your answer..."
            />
            {question.maxLength && (
              <div className="mt-1 text-sm text-gray-500 text-right">
                {(value || "").length} / {question.maxLength} characters
              </div>
            )}
          </div>
        );

      case "long-text":
        return (
          <div>
            <textarea
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              maxLength={question.maxLength}
              rows={4}
              className={twMerge(
                "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none",
                error ? "border-red-300" : "border-gray-300",
              )}
              placeholder="Enter your detailed answer..."
            />
            {question.maxLength && (
              <div className="mt-1 text-sm text-gray-500 text-right">
                {(value || "").length} / {question.maxLength} characters
              </div>
            )}
          </div>
        );

      case "numeric":
        return (
          <input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            min={question.min}
            max={question.max}
            step="any"
            className={twMerge(
              "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              error ? "border-red-300" : "border-gray-300",
            )}
            placeholder="Enter a number..."
          />
        );

      case "file-upload":
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-gray-500">PDF, DOC, DOCX up to 10MB</p>
            <input
              type="file"
              onChange={(e) => onChange(e.target.files?.[0])}
              className="hidden"
              accept=".pdf,.doc,.docx"
            />
            <button
              type="button"
              onClick={() =>
                document.querySelector(`input[type="file"]`).click()
              }
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Choose File
            </button>
            {value && (
              <p className="mt-2 text-sm text-gray-700">
                Selected: {value.name || "File selected"}
              </p>
            )}
          </div>
        );

      default:
        return (
          <div className="text-gray-500 italic">
            Unsupported question type: {question.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <label className="block text-sm font-medium text-gray-900">
          {question.question}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>

      {renderInput()}

      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle size={16} className="mr-2" />
          {error}
        </div>
      )}

      {question.type === "numeric" &&
        (question.min !== undefined || question.max !== undefined) && (
          <div className="text-sm text-gray-500">
            {question.min !== undefined && question.max !== undefined
              ? `Value must be between ${question.min} and ${question.max}`
              : question.min !== undefined
                ? `Minimum value: ${question.min}`
                : `Maximum value: ${question.max}`}
          </div>
        )}
    </div>
  );
}
