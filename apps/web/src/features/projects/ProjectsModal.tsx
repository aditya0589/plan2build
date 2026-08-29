import React, { useEffect, useState } from 'react';
import {
  FolderOpen,
  Plus,
  Trash2,
  X,
  Search,
  Building2,
  Calendar,
  HardDrive,
} from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { ProjectStatus } from '../../types';

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  CREATED: { label: 'Created', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
  UPLOADED: { label: 'Uploaded', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  PREPROCESSING: { label: 'Preprocessing', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  DETECTING: { label: 'Detecting Walls', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  SEGMENTING: { label: 'Segmenting Rooms', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  RECONSTRUCTING: { label: 'Reconstructing', bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  GENERATING_3D: { label: 'Generating 3D', bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' },
  READY: { label: 'Ready', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  FAILED: { label: 'Failed', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
};

export const ProjectsModal: React.FC = () => {
  const {
    showProjectsDrawer,
    setShowProjectsDrawer,
    projectsList,
    totalProjects,
    fetchProjects,
    createProject,
    loadProject,
    deleteProject,
    currentProject,
    searchQuery,
    setSearchQuery,
  } = useProjectStore();

  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (showProjectsDrawer) {
      fetchProjects();
    }
  }, [showProjectsDrawer]);

  if (!showProjectsDrawer) return null;

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    await createProject(newProjectName.trim());
    setNewProjectName('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-studio-850 border border-studio-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col h-[640px] animate-in fade-in zoom-in-95 duration-200 select-none">
        {/* Header */}
        <div className="px-6 py-4 border-b border-studio-750 flex items-center justify-between bg-studio-800/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Project Manager</h2>
              <p className="text-xs text-slate-400">
                {totalProjects} floor plan {totalProjects === 1 ? 'project' : 'projects'} saved in database
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-500/20 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
            <button
              onClick={() => setShowProjectsDrawer(false)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-studio-750 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar & Create Form */}
        <div className="p-4 border-b border-studio-750 bg-studio-850 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by name..."
              className="w-full bg-studio-900 border border-studio-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {isCreating && (
            <form
              onSubmit={handleCreateNew}
              className="p-3 bg-studio-800 border border-studio-700 rounded-xl flex items-center space-x-2 animate-in fade-in duration-150"
            >
              <input
                type="text"
                autoFocus
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name (e.g. Modern Suburban Residence)..."
                className="flex-1 bg-studio-900 border border-studio-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 bg-studio-750 hover:bg-studio-700 text-slate-300 text-xs rounded-lg transition"
              >
                Cancel
              </button>
            </form>
          )}
        </div>

        {/* Project Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {projectsList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-slate-400">
              <Building2 className="w-10 h-10 text-slate-600" />
              <div>
                <p className="text-sm font-medium text-slate-300">No projects found</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click 'New Project' to create your first architectural floor plan project.
                </p>
              </div>
            </div>
          ) : (
            projectsList.map((proj) => {
              const isCurrent = currentProject?.id === proj.id;
              const statusCfg = STATUS_CONFIG[proj.status] || STATUS_CONFIG.CREATED;

              return (
                <div
                  key={proj.id}
                  onClick={() => loadProject(proj.id)}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer group ${
                    isCurrent
                      ? 'bg-blue-500/10 border-blue-500/40 shadow-sm'
                      : 'bg-studio-800/70 hover:bg-studio-800 border-studio-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : 'bg-studio-750 text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition">
                          {proj.name}
                        </h3>
                        {isCurrent && (
                          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-medium">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{new Date(proj.created_at).toLocaleDateString()}</span>
                        </span>
                        {proj.original_filename && (
                          <span className="flex items-center space-x-1 font-mono text-[10px]">
                            <HardDrive className="w-3 h-3 text-slate-500" />
                            <span className="truncate max-w-[140px]">{proj.original_filename}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                    >
                      {statusCfg.label}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(proj.id);
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-studio-750 transition opacity-0 group-hover:opacity-100"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-studio-800/40 border-t border-studio-750 flex items-center justify-between text-xs text-slate-400">
          <span>PostgreSQL / SQLite Database Persistence Active</span>
          <button
            onClick={() => setShowProjectsDrawer(false)}
            className="text-blue-400 hover:underline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
