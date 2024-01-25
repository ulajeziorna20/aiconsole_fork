import { create } from 'zustand';
import { ProjectsAPI } from '@/api/api/ProjectsAPI';
import { useProjectStore } from '@/store/projects/useProjectStore';

export enum ProjectModalMode {
  OPEN_NEW,
  OPEN_EXISTING,
  CLOSED,
}

export type FileManagerStore = {
  projectModalMode: ProjectModalMode;
  tempPath: string;
  isProjectDirectory?: boolean;
  setProjectModalMode: (mode: ProjectModalMode) => void;
  setTempPath: (path: string) => void;
  setIsProjectDirectory: (isDir: boolean) => void;
  initProject: (mode: 'new' | 'existing') => Promise<void>;
  resetIsProjectFlag: () => void;
  openProjectConfirmation: () => void;
  resetProjectOpening: () => void;
};

export const useProjectFileManagerStore = create<FileManagerStore>((set, get) => ({
  projectModalMode: ProjectModalMode.CLOSED,
  tempPath: '',
  isProjectDirectory: undefined,

  setProjectModalMode: (mode) => set({ projectModalMode: mode }),
  setTempPath: (path) => set({ tempPath: path }),
  setIsProjectDirectory: (isProject) => set({ isProjectDirectory: isProject }),

  initProject: async (mode) => {
    let pathFromElectron;
    if (window?.electron?.openDirectoryPicker) {
      pathFromElectron = await window?.electron?.openDirectoryPicker();
      if (!pathFromElectron) return;
    }

    const path = pathFromElectron || (await ProjectsAPI.getInitialPath()).directory;
    const { is_project: isProject } = await ProjectsAPI.isProjectDirectory(path);
    get().setIsProjectDirectory(isProject);
    get().setTempPath(path);
    if (isProject === undefined && !path) {
      await ProjectsAPI.chooseProject(path);
    }
    set({ projectModalMode: mode === 'new' ? ProjectModalMode.OPEN_NEW : ProjectModalMode.OPEN_EXISTING });
  },

  resetIsProjectFlag: () => {
    set({ isProjectDirectory: undefined, tempPath: '' });
  },

  openProjectConfirmation: () => {
    const { tempPath } = get();
    const chooseProject = useProjectStore.getState().chooseProject;
    chooseProject(tempPath);
    get().resetIsProjectFlag();
    set({ projectModalMode: ProjectModalMode.CLOSED });
  },

  resetProjectOpening: () => {
    get().resetIsProjectFlag();
    set({ projectModalMode: ProjectModalMode.CLOSED });
  },
}));
