import React from 'react';
import {
  Layers,
  Upload,
  Sparkles,
  Download,
  Undo2,
  Redo2,
  Building2,
  Sun,
  Moon,
  FolderOpen,
} from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { useFloorPlanStore } from '../../stores/floorplanStore';
import { useViewerStore } from '../../stores/viewerStore';

export const Header: React.FC = () => {
  const { currentProject, backendConnected, setShowProjectsDrawer } = useProjectStore();
  const { undo, redo, historyIndex, history, loadSamplePlan, plan } = useFloorPlanStore();
  const {
    viewMode,
    setViewMode,
    lightingPreset,
    setLightingPreset,
    setShowUploadModal,
    setShowAiAssistant,
    setShowLayerManager,
    showLayerManager,
  } = useViewerStore();

  const handleExportJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(plan, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `${currentProject?.name || 'floorplan'}_semantic.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <header className="h-14 bg-studio-850 border-b border-studio-750 px-4 flex items-center justify-between select-none z-30">
      {/* Brand & Project Info */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2.5 py-1.5 rounded-lg shadow-md shadow-blue-500/20 font-bold tracking-tight">
          <Building2 className="w-5 h-5" />
          <span className="text-sm font-semibold tracking-wide">Plan2Build AI</span>
        </div>

        <div className="h-4 w-px bg-studio-700" />

        {/* Project Selector Button */}
        <button
          onClick={() => setShowProjectsDrawer(true)}
          className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-studio-800 hover:bg-studio-750 border border-studio-700 hover:border-slate-600 transition group"
          title="Open Project Manager"
        >
          <FolderOpen className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
          <span className="text-xs font-semibold text-slate-200 truncate max-w-xs group-hover:text-white">
            {currentProject?.name || 'Untitled Floor Plan'}
          </span>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              currentProject?.status === 'READY'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            }`}
          >
            {currentProject?.status || 'CREATED'}
          </span>
          {backendConnected && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Database Connected" />
          )}
        </button>
      </div>

      {/* Viewport Modes */}
      <div className="flex items-center bg-studio-800 p-1 rounded-lg border border-studio-700">
        {(['2D', '3D', 'split', 'walkthrough'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              viewMode === mode
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-studio-750'
            }`}
          >
            {mode === '2D' && '2D CAD'}
            {mode === '3D' && '3D Realistic'}
            {mode === 'split' && 'Dual Split'}
            {mode === 'walkthrough' && 'Walkthrough'}
          </button>
        ))}
      </div>

      {/* Action Center */}
      <div className="flex items-center space-x-2">
        {/* Sample Plan Switcher */}
        <div className="flex items-center space-x-1 mr-1">
          <button
            onClick={() => loadSamplePlan('studio')}
            className="text-xs px-2.5 py-1 rounded bg-studio-800 hover:bg-studio-750 text-slate-300 border border-studio-700 transition"
            title="Load 1-Bedroom Studio Sample"
          >
            Studio
          </button>
          <button
            onClick={() => loadSamplePlan('2bed')}
            className="text-xs px-2.5 py-1 rounded bg-studio-800 hover:bg-studio-750 text-slate-300 border border-studio-700 transition"
            title="Load 2-Bedroom Apartment Sample"
          >
            2-Bed Apt
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center bg-studio-800 rounded-lg border border-studio-700 p-0.5">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-studio-750 transition"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-studio-750 transition"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Lighting preset */}
        <button
          onClick={() =>
            setLightingPreset(lightingPreset === 'day' ? 'night' : lightingPreset === 'night' ? 'golden_hour' : 'day')
          }
          className="p-2 text-slate-300 bg-studio-800 hover:bg-studio-750 border border-studio-700 rounded-lg transition"
          title={`Lighting: ${lightingPreset}`}
        >
          {lightingPreset === 'day' && <Sun className="w-4 h-4 text-amber-400" />}
          {lightingPreset === 'golden_hour' && <Sun className="w-4 h-4 text-orange-500" />}
          {lightingPreset === 'night' && <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Layer Manager Toggle */}
        <button
          onClick={() => setShowLayerManager(!showLayerManager)}
          className={`p-2 rounded-lg border transition ${
            showLayerManager
              ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
              : 'bg-studio-800 text-slate-300 hover:bg-studio-750 border-studio-700'
          }`}
          title="Layer Manager"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* AI Architect Assistant */}
        <button
          onClick={() => setShowAiAssistant(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-600/80 to-purple-600/80 hover:from-indigo-600 hover:to-purple-600 text-white border border-indigo-400/30 shadow-sm transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>AI Architect</span>
        </button>

        {/* Upload Button */}
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-studio-800 hover:bg-studio-750 text-slate-200 border border-studio-700 transition"
        >
          <Upload className="w-3.5 h-3.5 text-blue-400" />
          <span>Upload Plan</span>
        </button>

        {/* Export JSON / GLB */}
        <button
          onClick={handleExportJson}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
