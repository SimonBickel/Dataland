import type { FrameworkSpecification } from '@clients/specificationservice';
import { parseFrameworkSchema, type DataPointLeafData } from '@/components/resources/specification/FrameworkSchemaTree';
import type { TreeNode } from 'primevue/treenode';

export interface DataPointSearchEntry {
  kind: 'dataPoint';
  frameworkId: string;
  frameworkName: string;
  path: string;
  label: string;
  dataPointTypeId: string;
  aliasExport?: string | null;
}

export interface FrameworkSearchEntry {
  kind: 'framework';
  frameworkId: string;
  frameworkName: string;
}

export interface SearchGroup {
  label: string;
  items: Array<FrameworkSearchEntry | DataPointSearchEntry>;
}

/**
 * Collects all leaves of a tree as flat search entries.
 * @param nodes the tree nodes of one framework
 * @param specification the framework the nodes belong to
 * @returns one entry per data point
 */
function collectLeaves(nodes: TreeNode[], specification: FrameworkSpecification): DataPointSearchEntry[] {
  return nodes.flatMap((node) => {
    if (node.leaf) {
      const data = node.data as DataPointLeafData;
      return [
        {
          kind: 'dataPoint' as const,
          frameworkId: specification.framework.id,
          frameworkName: specification.name,
          path: node.key ?? node.label ?? '',
          label: node.label ?? '',
          dataPointTypeId: data.dataPointTypeId,
          aliasExport: data.aliasExport,
        },
      ];
    }
    return collectLeaves(node.children ?? [], specification);
  });
}

/**
 * Builds the flat list of data points of the given frameworks. Frameworks with an unreadable schema are skipped.
 * @param specifications the loaded framework specifications
 * @returns all data points of all frameworks
 */
export function buildDataPointIndex(specifications: FrameworkSpecification[]): DataPointSearchEntry[] {
  return specifications.flatMap((specification) => {
    try {
      return collectLeaves(parseFrameworkSchema(specification.schema), specification);
    } catch {
      return [];
    }
  });
}

/**
 * Scores how well a text matches a term. Higher is better, 0 means no match.
 * @param text the text to inspect
 * @param term the lower-cased search term
 * @returns the score
 */
function score(text: string | null | undefined, term: string): number {
  if (!text) return 0;
  const lower = text.toLowerCase();
  if (lower === term) return 4;
  if (lower.startsWith(term)) return 3;
  if (lower.split(/[.\-_\s]/).some((part) => part.startsWith(term))) return 2;
  return lower.includes(term) ? 1 : 0;
}

/**
 * Searches frameworks and data points by name, id, path and export alias.
 * @param term the user input
 * @param frameworks the known frameworks
 * @param dataPoints the flat data point index
 * @param limit the maximum number of data point hits
 * @returns non-empty groups, best matches first
 */
export function searchDocumentation(
  term: string,
  frameworks: Array<{ id: string; name: string }>,
  dataPoints: DataPointSearchEntry[],
  limit = 15
): SearchGroup[] {
  const normalized = term.trim().toLowerCase();
  if (normalized.length === 0) return [];
  const frameworkHits = frameworks
    .map((framework) => ({
      entry: { kind: 'framework' as const, frameworkId: framework.id, frameworkName: framework.name },
      score: Math.max(score(framework.name, normalized), score(framework.id, normalized)),
    }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((hit) => hit.entry);
  const dataPointHits = dataPoints
    .map((entry) => ({
      entry,
      score: Math.max(
        score(entry.label, normalized),
        score(entry.path, normalized),
        score(entry.dataPointTypeId, normalized),
        score(entry.aliasExport, normalized)
      ),
    }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((hit) => hit.entry);
  const groups: SearchGroup[] = [];
  if (frameworkHits.length > 0) groups.push({ label: 'Frameworks', items: frameworkHits });
  if (dataPointHits.length > 0) groups.push({ label: 'Data points', items: dataPointHits });
  return groups;
}
