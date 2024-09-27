/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createPhotoTag = /* GraphQL */ `
  mutation CreatePhotoTag(
    $input: CreatePhotoTagInput!
    $condition: ModelPhotoTagConditionInput
  ) {
    createPhotoTag(input: $input, condition: $condition) {
      PhotoID
      Tags
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updatePhotoTag = /* GraphQL */ `
  mutation UpdatePhotoTag(
    $input: UpdatePhotoTagInput!
    $condition: ModelPhotoTagConditionInput
  ) {
    updatePhotoTag(input: $input, condition: $condition) {
      PhotoID
      Tags
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deletePhotoTag = /* GraphQL */ `
  mutation DeletePhotoTag(
    $input: DeletePhotoTagInput!
    $condition: ModelPhotoTagConditionInput
  ) {
    deletePhotoTag(input: $input, condition: $condition) {
      PhotoID
      Tags
      createdAt
      updatedAt
      __typename
    }
  }
`;
