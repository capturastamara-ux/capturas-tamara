export type WithParent = {
  id: string;
  parentId: string | null;
};

export type TreeNode<T extends WithParent> = T & {
  children: Array<TreeNode<T>>;
};

export function nestByParent<T extends WithParent>(items: T[]): Array<TreeNode<T>> {
  const nodes: Array<TreeNode<T>> = items.map((item) => ({
    ...item,
    children: [],
  }));
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const roots: Array<TreeNode<T>> = [];

  for (const node of nodes) {
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function flattenTree<T extends WithParent>(
  nodes: Array<TreeNode<T>>,
  depth = 0,
): Array<T & { depth: number }> {
  const rows: Array<T & { depth: number }> = [];

  for (const node of nodes) {
    const { children, ...rest } = node;
    rows.push({ ...rest, depth } as unknown as T & { depth: number });
    rows.push(...flattenTree(children, depth + 1));
  }

  return rows;
}

export function descendantIdSet<T extends WithParent>(
  items: T[],
  rootId: string,
): Set<string> {
  const ids = new Set<string>();
  const childrenOf = new Map<string, string[]>();

  for (const item of items) {
    if (!item.parentId) continue;
    const current = childrenOf.get(item.parentId) ?? [];
    current.push(item.id);
    childrenOf.set(item.parentId, current);
  }

  const visit = (id: string) => {
    for (const childId of childrenOf.get(id) ?? []) {
      ids.add(childId);
      visit(childId);
    }
  };

  visit(rootId);
  return ids;
}

export function pathLabelMap<T extends { id: string; title: string; parentId: string | null }>(
  items: T[],
): Map<string, string> {
  const byId = new Map(items.map((item) => [item.id, item]));
  const labels = new Map<string, string>();

  const labelFor = (id: string): string => {
    const cached = labels.get(id);
    if (cached) return cached;

    const item = byId.get(id);
    if (!item) return "";

    const parentLabel = item.parentId ? labelFor(item.parentId) : "";
    const label = parentLabel ? `${parentLabel} / ${item.title}` : item.title;
    labels.set(id, label);
    return label;
  };

  for (const item of items) {
    labelFor(item.id);
  }

  return labels;
}

export function withPathLabels<
  T extends { id: string; title: string; parentId: string | null },
>(items: T[]): Array<T & { label: string }> {
  const labels = pathLabelMap(items);
  return items.map((item) => ({
    ...item,
    label: labels.get(item.id) ?? item.title,
  }));
}
