export interface MapperTreeNodeType {
  /**
   * Data type of the element represented by this node
   */
  dataType?: string;
  /**
   * Only applicable to arrays or collections.
   * Data type of the elements inside the array or collection represent by this node.
   * For example, for an array of strings
   * dataType: "array"
   * memberType: "string"
   */
  memberType?: string;
}
