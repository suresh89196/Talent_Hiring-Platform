import { db } from "./db";

// Utility functions
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = () => delay(Math.random() * 1000 + 200); // 200-1200ms
const shouldFail = () => Math.random() < 0.08; // 8% failure rate

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

// Seed data generators
const jobTitles = [
  "Senior Frontend Developer",
  "Backend Engineer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Product Manager",
  "UX Designer",
  "Data Scientist",
  "Mobile Developer",
  "QA Engineer",
  "Technical Lead",
  "Software Architect",
  "Marketing Manager",
  "Sales Representative",
  "Customer Success Manager",
  "HR Specialist",
  "Financial Analyst",
  "Business Analyst",
  "Project Manager",
  "Content Writer",
  "Graphic Designer",
  "SEO Specialist",
  "Social Media Manager",
  "Operations Manager",
  "Legal Counsel",
  "Security Engineer",
];

const tags = [
  "React",
  "Node.js",
  "Python",
  "JavaScript",
  "TypeScript",
  "AWS",
  "Docker",
  "Kubernetes",
  "MongoDB",
  "PostgreSQL",
  "Redis",
  "GraphQL",
  "REST API",
  "Microservices",
  "Agile",
  "Scrum",
  "Remote",
  "Full-time",
  "Contract",
  "Senior",
  "Junior",
  "Mid-level",
  "Leadership",
  "Startup",
  "Enterprise",
];

const firstNames = [
  "Alex",
  "Jordan",
  "Taylor",
  "Morgan",
  "Casey",
  "Riley",
  "Avery",
  "Quinn",
  "Sage",
  "River",
  "Phoenix",
  "Rowan",
  "Skylar",
  "Cameron",
  "Drew",
  "Emery",
  "Finley",
  "Harper",
  "Hayden",
  "Indigo",
  "Jamie",
  "Kai",
  "Lane",
  "Marley",
  "Nova",
  "Oakley",
  "Parker",
  "Reese",
  "Sage",
  "Tatum",
  "Blake",
  "Charlie",
  "Dakota",
  "Ellis",
  "Frankie",
  "Gray",
  "Hunter",
  "Jesse",
  "Kendall",
  "Logan",
];

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores",
];

const stages = ["applied", "screen", "tech", "offer", "hired", "rejected"];

// API class
class TalentFlowAPI {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    await db.init();
    await this.seedData();
    this.initialized = true;
  }

  async seedData() {
    // Check if data already exists
    const existingJobs = await db.getAll("jobs");
    if (existingJobs.length > 0) return;

    // Seed jobs
    const jobs = [];
    for (let i = 0; i < 25; i++) {
      const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
      const jobTags = tags
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 5) + 2);

      const job = {
        id: `job-${i + 1}`,
        title,
        slug: generateSlug(title) + `-${i + 1}`,
        status: Math.random() > 0.3 ? "active" : "archived",
        tags: jobTags,
        order: i,
        description: `We are looking for a talented ${title} to join our growing team. This is an exciting opportunity to work with cutting-edge technologies and make a real impact.`,
        requirements: [
          "Bachelor's degree in Computer Science or related field",
          "3+ years of relevant experience",
          "Strong problem-solving skills",
          "Excellent communication skills",
        ],
        createdAt: new Date(
          Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        updatedAt: new Date().toISOString(),
      };

      jobs.push(job);
      await db.put("jobs", job);
    }

    // Seed candidates
    const candidates = [];
    for (let i = 0; i < 1000; i++) {
      const firstName =
        firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const jobId = jobs[Math.floor(Math.random() * jobs.length)].id;
      const stage = stages[Math.floor(Math.random() * stages.length)];

      const candidate = {
        id: `candidate-${i + 1}`,
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
        jobId,
        stage,
        appliedAt: new Date(
          Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        updatedAt: new Date().toISOString(),
        resume: `Resume for ${firstName} ${lastName}`,
        notes: [],
      };

      candidates.push(candidate);
      await db.put("candidates", candidate);

      // Add timeline entry for application
      await db.add("timeline", {
        candidateId: candidate.id,
        action: "applied",
        stage: "applied",
        timestamp: candidate.appliedAt,
        notes: `${candidate.name} applied for the position`,
      });

      // Add random timeline entries for stage changes
      if (stage !== "applied") {
        const stageIndex = stages.indexOf(stage);
        for (let j = 1; j <= stageIndex; j++) {
          await db.add("timeline", {
            candidateId: candidate.id,
            action: "stage_change",
            stage: stages[j],
            timestamp: new Date(
              Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            notes: `Moved to ${stages[j]} stage`,
          });
        }
      }
    }

    // Seed sample assessments
    const sampleAssessments = [
      {
        jobId: jobs[0].id,
        title: "Frontend Developer Assessment",
        sections: [
          {
            id: "section-1",
            title: "Technical Skills",
            questions: [
              {
                id: "q1",
                type: "single-choice",
                question: "Which of the following is a JavaScript framework?",
                required: true,
                options: ["React", "HTML", "CSS", "Python"],
                correctAnswer: "React",
              },
              {
                id: "q2",
                type: "multi-choice",
                question: "Select all valid CSS properties:",
                required: true,
                options: [
                  "color",
                  "background-color",
                  "font-weight",
                  "invalid-prop",
                ],
                correctAnswers: ["color", "background-color", "font-weight"],
              },
              {
                id: "q3",
                type: "short-text",
                question: "What is your favorite JavaScript library and why?",
                required: true,
                maxLength: 200,
              },
            ],
          },
          {
            id: "section-2",
            title: "Experience",
            questions: [
              {
                id: "q4",
                type: "long-text",
                question:
                  "Describe a challenging project you worked on and how you overcame the difficulties.",
                required: true,
                maxLength: 1000,
              },
              {
                id: "q5",
                type: "numeric",
                question: "How many years of React experience do you have?",
                required: true,
                min: 0,
                max: 20,
              },
              {
                id: "q6",
                type: "file-upload",
                question: "Please upload your portfolio or code samples",
                required: false,
              },
            ],
          },
        ],
      },
    ];

    for (const assessment of sampleAssessments) {
      await db.put("assessments", assessment);
    }
  }

  // Jobs API
  async getJobs({
    search = "",
    status = "",
    page = 1,
    pageSize = 10,
    sort = "order",
  } = {}) {
    await randomDelay();

    let jobs = await db.getAll("jobs");

    // Filter by search
    if (search) {
      jobs = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(search.toLowerCase()) ||
          job.tags.some((tag) =>
            tag.toLowerCase().includes(search.toLowerCase()),
          ),
      );
    }

    // Filter by status
    if (status) {
      jobs = jobs.filter((job) => job.status === status);
    }

    // Sort
    jobs.sort((a, b) => {
      if (sort === "order") return a.order - b.order;
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "createdAt")
        return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

    // Paginate
    const total = jobs.length;
    const start = (page - 1) * pageSize;
    const paginatedJobs = jobs.slice(start, start + pageSize);

    return {
      data: paginatedJobs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getJob(id) {
    await randomDelay();
    return await db.get("jobs", id);
  }

  async createJob(jobData) {
    await randomDelay();

    if (shouldFail()) {
      throw new Error("Failed to create job");
    }

    const jobs = await db.getAll("jobs");
    const maxOrder = Math.max(...jobs.map((j) => j.order), -1);

    const job = {
      id: `job-${Date.now()}`,
      ...jobData,
      slug: generateSlug(jobData.title),
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.put("jobs", job);
    return job;
  }

  async updateJob(id, updates) {
    await randomDelay();

    if (shouldFail()) {
      throw new Error("Failed to update job");
    }

    const job = await db.get("jobs", id);
    if (!job) throw new Error("Job not found");

    const updatedJob = {
      ...job,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.title && updates.title !== job.title) {
      updatedJob.slug = generateSlug(updates.title);
    }

    await db.put("jobs", updatedJob);
    return updatedJob;
  }

  async reorderJobs({ fromOrder, toOrder }) {
    await randomDelay();

    if (shouldFail()) {
      throw new Error("Failed to reorder jobs");
    }

    const jobs = await db.getAll("jobs");

    // Update order for affected jobs
    for (const job of jobs) {
      if (job.order === fromOrder) {
        job.order = toOrder;
      } else if (
        fromOrder < toOrder &&
        job.order > fromOrder &&
        job.order <= toOrder
      ) {
        job.order -= 1;
      } else if (
        fromOrder > toOrder &&
        job.order >= toOrder &&
        job.order < fromOrder
      ) {
        job.order += 1;
      }

      await db.put("jobs", job);
    }

    return { success: true };
  }

  // Candidates API
  async getCandidates({
    search = "",
    stage = "",
    page = 1,
    pageSize = 50,
  } = {}) {
    await randomDelay();

    let candidates = await db.getAll("candidates");

    // Filter by search
    if (search) {
      candidates = candidates.filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(search.toLowerCase()) ||
          candidate.email.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Filter by stage
    if (stage) {
      candidates = candidates.filter((candidate) => candidate.stage === stage);
    }

    // Sort by most recent
    candidates.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // Paginate
    const total = candidates.length;
    const start = (page - 1) * pageSize;
    const paginatedCandidates = candidates.slice(start, start + pageSize);

    return {
      data: paginatedCandidates,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getCandidate(id) {
    await randomDelay();
    return await db.get("candidates", id);
  }

  async updateCandidate(id, updates) {
    await randomDelay();

    if (shouldFail()) {
      throw new Error("Failed to update candidate");
    }

    const candidate = await db.get("candidates", id);
    if (!candidate) throw new Error("Candidate not found");

    const updatedCandidate = {
      ...candidate,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.put("candidates", updatedCandidate);

    // Add timeline entry for stage change
    if (updates.stage && updates.stage !== candidate.stage) {
      await db.add("timeline", {
        candidateId: id,
        action: "stage_change",
        stage: updates.stage,
        timestamp: new Date().toISOString(),
        notes: `Moved from ${candidate.stage} to ${updates.stage}`,
      });
    }

    return updatedCandidate;
  }

  async getCandidateTimeline(candidateId) {
    await randomDelay();
    return await db.getByIndex("timeline", "candidateId", candidateId);
  }

  // Assessments API
  async getAssessment(jobId) {
    await randomDelay();
    return await db.get("assessments", jobId);
  }

  async saveAssessment(jobId, assessment) {
    await randomDelay();

    if (shouldFail()) {
      throw new Error("Failed to save assessment");
    }

    const assessmentData = {
      jobId,
      ...assessment,
      updatedAt: new Date().toISOString(),
    };

    await db.put("assessments", assessmentData);
    return assessmentData;
  }

  async submitAssessmentResponse(jobId, candidateId, responses) {
    await randomDelay();

    if (shouldFail()) {
      throw new Error("Failed to submit assessment");
    }

    const response = {
      jobId,
      candidateId,
      responses,
      submittedAt: new Date().toISOString(),
    };

    await db.add("assessmentResponses", response);
    return response;
  }
}

export const api = new TalentFlowAPI();
