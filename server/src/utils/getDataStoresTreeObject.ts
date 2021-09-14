import fsPath from "path";
import { SharedDataStore } from "../entity/SharedDataStore";
import { TreeItem } from "../modules/Tree/TreeItem";
import { getUserDataStores } from "./getUserDataStores";

export const getDataStoresTreeObject = async (
  userOptions: any,
  depth: number,
  path: string,
  directoryTree: boolean
): Promise<TreeItem[]> => {
  const { userId } = userOptions;

  const userDataStores = await getUserDataStores(userId),
    items: TreeItem[] = [];

  for (const { basePath, name, id } of userDataStores) {
    const newItem = new TreeItem(
      depth,
      fsPath.join(basePath, path),
      directoryTree,
      basePath
    );

    const isShared = !!(await SharedDataStore.count({
      where: { dataStoreId: id },
    }));

    newItem.name = name;
    newItem.path = basePath;
    newItem.dataStoreId = id;
    newItem.relativePath = "";
    newItem.isDirectory = true;
    newItem.sharedDataStore = isShared;

    items.push(newItem);
  }

  return items;
};
