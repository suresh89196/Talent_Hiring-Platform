"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { twMerge } from "tailwind-merge";

const QUESTION_TYPES = [
  {
    id: "single-choice",
    name: "Single Choice",
    description: "Select one option",
  },
  {
    id: "multi-choice",
    name: "Multiple Choice",
    description: "Select multiple options",
  },
  { id: "short-text", name: "Short Text", description: "Brief text response" },
  { id: "long-text", name: "Long Text", description: "Detailed text response" },
  { id: "numeric", name: "Numeric", description: "Number input with range" },
  {
    id: "file-upload",
    name: "File Upload",
    description: "Upload documents or files",
  },
];

export default function AssessmentBuilder({ assessment, onChange }) {
  const [expandedSections, setExpandedSections] = useState(new Set());

  const updateAssessment = (updates) => {
    onChange({ ...assessment, ...updates });
  };

  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: "New Section",
      questions: [],
    };

    updateAssessment({
      sections: [...assessment.sections, newSection],
    });

    // Expand the new section
    setExpandedSections((prev) => new Set([...prev, newSection.id]));
  };

  const updateSection = (sectionId, updates) => {
    updateAssessment({
      sections: assessment.sections.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section,
      ),
    });
  };

  const deleteSection = (sectionId) => {
    updateAssessment({
      sections: assessment.sections.filter(
        (section) => section.id !== sectionId,
      ),
    });
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      newSet.delete(sectionId);
      return newSet;
    });
  };

  const addQuestion = (sectionId) => {
    const newQuestion = {
      id: `q-${Date.now()}`,
      type: "single-choice",
      question: "New Question",
      required: false,
      options: ["Option 1", "Option 2"],
    };

    updateSection(sectionId, {
      questions: [
        ...assessment.sections.find((s) => s.id === sectionId).questions,
        newQuestion,
      ],
    });
  };

  const updateQuestion = (sectionId, questionId, updates) => {
    const section = assessment.sections.find((s) => s.id === sectionId);
    const updatedQuestions = section.questions.map((q) =>
      q.id === questionId ? { ...q, ...updates } : q,
    );

    updateSection(sectionId, { questions: updatedQuestions });
  };

  const deleteQuestion = (sectionId, questionId) => {
    const section = assessment.sections.find((s) => s.id === sectionId);
    const updatedQuestions = section.questions.filter(
      (q) => q.id !== questionId,
    );

    updateSection(sectionId, { questions: updatedQuestions });
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {/* Assessment Title */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assessment Title
        </label>
        <input
          type="text"
          value={assessment.title}
          onChange={(e) => updateAssessment({ title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter assessment title..."
        />
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {assessment.sections.map((section, sectionIndex) => (
          <SectionBuilder
            key={section.id}
            section={section}
            isExpanded={expandedSections.has(section.id)}
            onToggle={() => toggleSection(section.id)}
            onUpdate={(updates) => updateSection(section.id, updates)}
            onDelete={() => deleteSection(section.id)}
            onAddQuestion={() => addQuestion(section.id)}
            onUpdateQuestion={(questionId, updates) =>
              updateQuestion(section.id, questionId, updates)
            }
            onDeleteQuestion={(questionId) =>
              deleteQuestion(section.id, questionId)
            }
          />
        ))}
      </div>

      {/* Add Section Button */}
      <button
        onClick={addSection}
        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center"
      >
        <Plus size={20} className="mr-2" />
        Add Section
      </button>
    </div>
  );
}

function SectionBuilder({
  section,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Section Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <button
              onClick={onToggle}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            <input
              type="text"
              value={section.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="flex-1 text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-0"
              placeholder="Section title..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {section.questions.length} questions
            </span>
            <button
              onClick={onDelete}
              className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Section Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Questions */}
          {section.questions.map((question) => (
            <QuestionBuilder
              key={question.id}
              question={question}
              onUpdate={(updates) => onUpdateQuestion(question.id, updates)}
              onDelete={() => onDeleteQuestion(question.id)}
            />
          ))}

          {/* Add Question Button */}
          <button
            onClick={onAddQuestion}
            className="w-full py-3 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center"
          >
            <Plus size={16} className="mr-2" />
            Add Question
          </button>
        </div>
      )}
    </div>
  );
}

function QuestionBuilder({ question, onUpdate, onDelete }) {
  const questionType = QUESTION_TYPES.find((t) => t.id === question.type);

  const addOption = () => {
    const newOptions = [
      ...(question.options || []),
      `Option ${(question.options?.length || 0) + 1}`,
    ];
    onUpdate({ options: newOptions });
  };

  const updateOption = (index, value) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    onUpdate({ options: newOptions });
  };

  const removeOption = (index) => {
    const newOptions = question.options.filter((_, i) => i !== index);
    onUpdate({ options: newOptions });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Question Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-center space-x-3">
            <select
              value={question.type}
              onChange={(e) => onUpdate({ type: e.target.value })}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {QUESTION_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => onUpdate({ required: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Required</span>
            </label>
          </div>

          <input
            type="text"
            value={question.question}
            onChange={(e) => onUpdate({ question: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your question..."
          />
        </div>

        <button
          onClick={onDelete}
          className="ml-4 p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Question Type Specific Fields */}
      {(question.type === "single-choice" ||
        question.type === "multi-choice") && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Options
          </label>
          {question.options?.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Option ${index + 1}`}
              />
              {question.options.length > 2 && (
                <button
                  onClick={() => removeOption(index)}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addOption}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <Plus size={16} className="mr-1" />
            Add Option
          </button>
        </div>
      )}

      {(question.type === "short-text" || question.type === "long-text") && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Length
          </label>
          <input
            type="number"
            value={question.maxLength || ""}
            onChange={(e) =>
              onUpdate({ maxLength: parseInt(e.target.value) || undefined })
            }
            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="No limit"
            min="1"
          />
        </div>
      )}

      {question.type === "numeric" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Value
            </label>
            <input
              type="number"
              value={question.min || ""}
              onChange={(e) =>
                onUpdate({ min: parseFloat(e.target.value) || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="No minimum"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Value
            </label>
            <input
              type="number"
              value={question.max || ""}
              onChange={(e) =>
                onUpdate({ max: parseFloat(e.target.value) || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="No maximum"
            />
          </div>
        </div>
      )}
    </div>
  );
}
