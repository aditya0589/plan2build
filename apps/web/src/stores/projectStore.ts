import { create } from 'zustand';
import { ProjectMetadata, ProjectStatus } from '../types';
import { api } from '../lib/api';

interface ProjectState {
  currentProject: ProjectMetadata | null;
  projectsList: ProjectMetadata[];
  isLoading: boolean;
  error: string | null;
  backendConnected: boolean;

  // Actions
  checkBackend: () => Promise<void>;
  createProject: (name?: string) => Promise<ProjectMetadata>;
  loadProject: (id: string) => Promise<void>;
  fetchProjects: () => Promise<void>;
  setCurrentProject: (project: ProjectMetadata | null) => void;
  updateStatus: (status: ProjectStatus) => void;
  setError: (error: string | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentProject: {
    id: 'sample_studio',
    name: 'Modern Studio Apartment',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'READY',
    original_filename: 'sample_studio_plan.png',
  },
  projectsList: [],
  isLoading: false,
  error: null,
  backendConnected: false,

  checkBackend: async () => {
    try {
      await api.checkHealth();
      set({ backendConnected: true });
    } catch {
      set({ backendConnected: false });
    }
  },

  createProject: async (name: string = 'Untitled Floor Plan') => {
    set({ isLoading: true, error: null });
    try {
      const newProj = await api.createProject(name);
      set((state) => ({
        currentProject: newProj,
        projectsList: [newProj, ...state.projectsList],
        isLoading: false,
      }));
      return newProj;
    } catch {
      // Fallback local project
      const fallback: ProjectMetadata = {
        id: 'proj_' + Math.random().toString(36).substring(2, 9),
        name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'CREATED',
      };
      set((state) => ({
        currentProject: fallback,
        projectsList: [fallback, ...state.projectsList],
        isLoading: false,
      }));
      return fallback;
    }
  },

  loadProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const proj = await api.getProject(id);
      set({ currentProject: proj, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchProjects: async () => {
    try {
      const list = await api.listProjects();
      set({ projectsList: list });
    } catch {
      // ignore silently if backend is launching
    }
  },

  setCurrentProject: (project) => set({ currentProject: project }),

  updateStatus: (status: ProjectStatus) => {
    set((state) => ({
      currentProject: state.currentProject ? { ...state.currentProject, status } : null,
    }));
  },

  setError: (error) => set({ error }),
}));
