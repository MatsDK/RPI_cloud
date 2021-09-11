import {
  TreeItem,
  useGetDirectoryTreeQueryQuery,
} from "generated/apolloComponents";
import { ArrowButton, ArrowButtonProps } from "src/ui/ArrowButton";
import Icon from "src/ui/Icon";
import { useRouter } from "next/dist/client/router";
import React, { useContext, useEffect, useState } from "react";
import { useApolloClient } from "react-apollo";
import { FolderContext } from "src/providers/folderState";
import styled from "styled-components";

interface Props {
  item: TreeItem;
  dataStoreId?: number | null;
  showNested?: boolean;
}

const DataStoreFolderItem = styled.div`
  display: flex;
  align-items: center;

  p {
    margin-left: 7px;
    font-weight: 500;
    font-size: 20px;
    line-height: 23px;

    color: ${(props) => props.theme.textColors[0]};
  }
`;

const DataStoreItemWrapper = styled.div<ArrowButtonProps>`
  display: flex;

  > div > svg {
    padding-right: ${(props) => (props.active ? 0 : 6)}px;
    padding-top: ${(props) => (props.active ? 6 : 0)}px;
  }
`;

const NestedFolderItemsWrapper = styled.div`
  width: fit-content;
  margin-left: 10px;
  padding-left: 10px;
  border-left: 1px solid ${(props) => props.theme.textColors[3]};
`;

const TreeFolder = styled.div`
  color: ${(props) => props.theme.textColors[1]};
`;

const Item: React.FC<Props> = ({ item, dataStoreId, showNested = false }) => {
  const [nestedItems, setNestedItems] = useState<TreeItem[] | null>(null);
  const [showNestedItems, setShowNestedItems] = useState(false);

  const router = useRouter();
  const client: any = useApolloClient();
  const FolderCtx = useContext(FolderContext);

  const {
    loading,
    data,
    error,
    refetch: fetchTree,
  } = useGetDirectoryTreeQueryQuery({
    client: client,
    skip: !showNested,
    variables: {
      depth: 1,
      path: item.relativePath,
      dataStoreId,
    },
  });

  useEffect(() => {
    if (!showNestedItems) setShowNestedItems(showNested);
    // setShowNestedItems(showNested);
    if (showNested) {
      if (loading) return;

      if (error || !data?.directoryTree.tree) {
        console.log(error);
        return;
      }

      setNestedItems(() => data.directoryTree.tree || null);
    }
  }, [loading, error, data, showNested]);

  return item.isDirectory ? (
    <div
      style={{
        width: "fit-content",
        height: "100%",
      }}
    >
      <DataStoreItemWrapper
        style={{ padding: item.dataStoreId !== null ? "6px 0" : "2px 0" }}
        active={showNestedItems}
      >
        <ArrowButton
          active={showNestedItems}
          onClick={async () => {
            if (!nestedItems) {
              const { error, loading, data } = await fetchTree();

              if (loading) return console.log("loading");

              if (error) return console.log(error);

              setNestedItems((data?.directoryTree?.tree as TreeItem[]) || []);
            }

            setShowNestedItems((showNestedItems) => !showNestedItems);
          }}
        >
          <Icon
            width={18}
            height={18}
            name="folderArrow"
            color={{ idx: 1, propName: "textColors" }}
          />
        </ArrowButton>
        <div
          onClick={() => {
            router.push(`/path/${item.relativePath}?d=${dataStoreId}`);
          }}
        >
          {item.dataStoreId != null ? (
            <DataStoreFolderItem style={{ display: "flex" }}>
              <Icon
                width={24}
                height={24}
                viewPort={28}
                name={"dataStoreIcon"}
                color={{ propName: "bgColors", idx: 2 }}
              />
              <p>{item.name}</p>
            </DataStoreFolderItem>
          ) : (
            <TreeFolder>{item.name}</TreeFolder>
          )}
        </div>
      </DataStoreItemWrapper>
      <NestedFolderItemsWrapper>
        {showNestedItems &&
          nestedItems &&
          nestedItems.map((i, idx) => {
            const show =
              !!FolderCtx?.currentFolderPath?.folderPath.path?.startsWith(
                i.relativePath.replace(/\\/g, "/")
              ) &&
              FolderCtx.currentFolderPath.folderPath.path !=
                i.relativePath.replace(/\\/g, "/");

            return (
              <Item
                dataStoreId={dataStoreId}
                showNested={show}
                item={i}
                key={idx}
              />
            );
          })}
      </NestedFolderItemsWrapper>
    </div>
  ) : null;
};

export default Item;
