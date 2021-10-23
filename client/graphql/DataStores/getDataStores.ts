import gql from "graphql-tag";

export const getDataStoresQuery = gql`
  query GetDataStores {
    getDataStores {
      id
      name
      userId
      localHostNodeId
      localNodeId
      basePath
      smbEnabled
      sizeInMB
      size {
        usedSize
        usedPercent
      }
      status
      owner {
        id
        userName
        isAdmin
      }
      sharedUsers {
        userName
        isAdmin
        id
      }
    }
  }
`;
