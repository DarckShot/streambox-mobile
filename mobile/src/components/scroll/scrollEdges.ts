export interface ScrollEdges {
  bottom: boolean;
  top: boolean;
}

const EDGE_TOLERANCE = 2;

export const getScrollEdges = (
  offset: number,
  viewportHeight: number,
  contentHeight: number,
): ScrollEdges => {
  if (viewportHeight <= 0 || contentHeight <= viewportHeight + EDGE_TOLERANCE) {
    return { top: false, bottom: false };
  }

  return {
    top: offset > EDGE_TOLERANCE,
    bottom: offset + viewportHeight < contentHeight - EDGE_TOLERANCE,
  };
};
