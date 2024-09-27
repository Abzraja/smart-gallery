/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getPhotoTag = /* GraphQL */ `
  query GetPhotoTag($PhotoID: ID!) {
    getPhotoTag(PhotoID: $PhotoID) {
      PhotoID
      Tags
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listPhotoTags = /* GraphQL */ `
  query ListPhotoTags(
    $PhotoID: ID
    $filter: ModelPhotoTagFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listPhotoTags(
      PhotoID: $PhotoID
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        PhotoID
        Tags
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
