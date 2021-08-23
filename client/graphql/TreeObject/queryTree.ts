import gql from "graphql-tag";

export const getTreeQuery = gql`
  query getTreeQuery($path: String!, $depth: Float!) {
    tree(path: $path, depth: $depth) {
      path
      __typename
      tree {
        name
        path
        __typename
      }
    }
  }
`;
