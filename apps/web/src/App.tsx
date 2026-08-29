import React, { useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Toolbar } from './components/layout/Toolbar';
import { PropertiesPanel } from './components/layout/PropertiesPanel';
import { StatusBar } from './components/layout/StatusBar';
import { LayerManager } from './components/layout/LayerManager';
import { UploadModal } from './features/upload/UploadModal';
import { ArchitectAssistantModal } from './features/ai/ArchitectAssistantModal';
import { FloorPlan2D } from './features/floorplan/FloorPlan2D';
import { Viewer3D } from './features/viewer/Viewer3D';
import { useViewerStore } from './stores/viewerStore';
import { useProjectStore } from './stores/projectStore';

export const App: React.FC = () => {
  const { viewMode, isPresentationMode } = useViewerStore();
  const { checkBackend, fetchProjects } = useProjectStore();

  useEffect(() => {
    checkBackend();
    fetchProjects();
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-studio-900 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Studio Header */}
      {!isPresentationMode && <Header />}

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left CAD Toolbar */}
        {!isPresentationMode && <Toolbar />}

        {/* Central Viewport Area (2D / 3D / Split) */}
        <main className="flex-1 flex overflow-hidden relative">
          {viewMode === '2D' && <FloorPlan2D />}

          {viewMode === '3D' && <Viewer3D />}

          {viewMode === 'walkthrough' && <Viewer3D />}

          {viewMode === 'split' && (
            <div className="flex-1 flex w-full h-full">
              <div className="w-1/2 h-full border-r border-studio-750 relative">
                <FloorPlan2D />
                <div className="absolute top-3 left-3 px-2 py-1 bg-studio-850/80 backdrop-blur rounded text-[10px] font-mono text-slate-300 border border-studio-700">
                  2D CAD Viewport
                </div>
              </div>
              <div className="w-1/2 h-full relative">
                <Viewer3D />
                <div className="absolute top-3 left-3 px-2 py-1 bg-studio-850/80 backdrop-blur rounded text-[10px] font-mono text-slate-300 border border-studio-700">
                  3D Render Viewport
                </div>
              </div>
            </div>
          )}

          {/* Floating Layer Manager */}
          <LayerManager />
        </main>

        {/* Right Properties Inspector */}
        {!isPresentationMode && <PropertiesPanel />}
      </div>

      {/* Bottom Status Bar */}
      {!isPresentationMode && <StatusBar />}

      {/* Modals & Overlays */}
      <UploadModal />
      <ArchitectAssistantModal />
    </div>
  );
};

export default App;
