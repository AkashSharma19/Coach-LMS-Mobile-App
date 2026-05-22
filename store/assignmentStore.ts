import { useState, useEffect } from 'react';

export interface SubmissionState {
  status: 'submitted';
  fileName: string;
  submittedAt: string;
}

// Module-level global store
const submissionsStore: Record<string, SubmissionState> = {};
const listeners = new Set<() => void>();

export const assignmentStore = {
  getSubmissions: () => ({ ...submissionsStore }),
  getSubmission: (key: string) => submissionsStore[key] || null,
  submit: (key: string, fileName: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    
    submissionsStore[key] = {
      status: 'submitted',
      fileName,
      submittedAt: `${dateStr} at ${timeStr}`
    };
    listeners.forEach(l => l());
  },
  removeSubmission: (key: string) => {
    delete submissionsStore[key];
    listeners.forEach(l => l());
  }
};

export function useAssignmentSubmissions() {
  const [state, setState] = useState<Record<string, SubmissionState>>(assignmentStore.getSubmissions());

  useEffect(() => {
    const handler = () => setState(assignmentStore.getSubmissions());
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return state;
}
