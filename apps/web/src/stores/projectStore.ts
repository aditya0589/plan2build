import { create } from 'zustand';
import { ProjectMetadata, ProjectStatus } from '../types';
import { api } from '../lib/api';

interface ProjectState {
  currentProject: ProjectMetadata | null;
  projectsList: ProjectMetadata[];
  totalProjects: number;
  isLoading: boolean;
  error: string | null;
  backendConnected: boolean;
  showProjectsDrawer: boolean;
  searchQuery: string;

  // Actions
  checkBackend: () => Promise<void>;
  createProject: (name?: string) => Promise<ProjectMetadata>;
  loadProject: (id: string) => Promise<void>;
  fetchProjects: (search?: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: ProjectMetadata | null) => void;
  updateStatus: (status: ProjectStatus) => void;
  setShowProjectsDrawer: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  setError: (error: string | null) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProject: {
    id: 'sample_studio',
    name: 'Modern Studio Apartment',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'READY',
    original_filename: 'sample_studio_plan.png',
  },
  projectsList: [],
  totalProjects: 0,
  isLoading: false,
  error: null,
  backendConnected: false,
  showProjectsDrawer: false,
  searchQuery: '',

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
        totalProjects: state.totalProjects + 1,
        isLoading: false,
      }));
      return newProj;
    } catch {
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
        totalProjects: state.totalProjects + 1,
        isLoading: false,
      }));
      return fallback;
    }
  },

  loadProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const proj = await api.getProject(id);
      set({ currentProject: proj, isLoading: false, showProjectsDrawer: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchProjects: async (search?: string) => {
    try {
      const res = await api.listProjects(search);
      set({ projectsList: res.items, totalProjects: res.total, backendConnected: true });
    } catch {
      // Keep existing list if backend is launching
    }
  },

  deleteProject: async (id: string) => {
    try {
      await api.deleteProject(id);
      set((state) => ({
        projectsList: state.projectsList.filter((p) => p.id !== id),
        totalProjects: Math.max(state.totalProjects - 1, 0),
        currentProject:
          state.currentProject?.id === id
            ? state.projectsList.find((p) => p.id !== id) || null
            : state.currentProject,
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  setCurrentProject: (project) => set({ currentProject: project }),

  updateStatus: (status: ProjectStatus) => {
    set((state) => ({
      currentProject: state.currentProject ? { ...state.currentProject, status } : null,
    }));
  },

  setShowProjectsDrawer: (show) => set({ showProjectsDrawer: show }),
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().fetchProjects(query);
  },
  setError: (error) => set({ error }),
}));
