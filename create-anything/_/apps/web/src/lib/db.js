// Simple IndexedDB wrapper for local persistence
class TalentFlowDB {
  constructor() {
    this.dbName = "talentflow";
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Jobs store
        if (!db.objectStoreNames.contains("jobs")) {
          const jobsStore = db.createObjectStore("jobs", { keyPath: "id" });
          jobsStore.createIndex("status", "status", { unique: false });
          jobsStore.createIndex("order", "order", { unique: false });
        }

        // Candidates store
        if (!db.objectStoreNames.contains("candidates")) {
          const candidatesStore = db.createObjectStore("candidates", {
            keyPath: "id",
          });
          candidatesStore.createIndex("stage", "stage", { unique: false });
          candidatesStore.createIndex("jobId", "jobId", { unique: false });
        }

        // Assessments store
        if (!db.objectStoreNames.contains("assessments")) {
          db.createObjectStore("assessments", { keyPath: "jobId" });
        }

        // Timeline store
        if (!db.objectStoreNames.contains("timeline")) {
          const timelineStore = db.createObjectStore("timeline", {
            keyPath: "id",
            autoIncrement: true,
          });
          timelineStore.createIndex("candidateId", "candidateId", {
            unique: false,
          });
        }

        // Assessment responses store
        if (!db.objectStoreNames.contains("assessmentResponses")) {
          const responsesStore = db.createObjectStore("assessmentResponses", {
            keyPath: "id",
            autoIncrement: true,
          });
          responsesStore.createIndex("candidateId", "candidateId", {
            unique: false,
          });
          responsesStore.createIndex("jobId", "jobId", { unique: false });
        }
      };
    });
  }

  async get(storeName, key) {
    const transaction = this.db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName) {
    const transaction = this.db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put(storeName, data) {
    const transaction = this.db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async add(storeName, data) {
    const transaction = this.db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.add(data);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, key) {
    const transaction = this.db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex(storeName, indexName, value) {
    const transaction = this.db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const db = new TalentFlowDB();
