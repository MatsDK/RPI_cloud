import { TreeItem } from "generated/apolloComponents";
import React from "react";

export type FolderContextType = FolderContext | null;

export type CurrentFolderType = {
  path: string | null;
  datastoreId: number | null;
  datastoreName: string | null;
};

interface FolderContext {
  currentFolderPath?: {
    folderPath: CurrentFolderType;
    setFolderPath: React.Dispatch<React.SetStateAction<CurrentFolderType>>;
  };
  newFolderInput?: {
    showNewFolderInput: boolean;
    setShowNewFolderInput: React.Dispatch<React.SetStateAction<boolean>>;
  };
  selected: {
    selectedItems: Map<string, TreeItem>;
    setSelected?: React.Dispatch<React.SetStateAction<Map<string, TreeItem>>>;
  };
}

export let FolderContextValue: FolderContext = {
  selected: {
    selectedItems: new Map(),
  },
};
export const FolderContext = React.createContext<FolderContextType>(null);
