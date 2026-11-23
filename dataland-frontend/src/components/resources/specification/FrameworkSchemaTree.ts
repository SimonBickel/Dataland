import type { TreeNode } from 'primevue/treenode';

export interface DataPointLeafData {
  dataPointTypeId: string;
  aliasExport?: string | null;
}

interface SchemaLeaf {
  id: string;
  aliasExport?: string | null;
}

/**
 * Checks whether a parsed schema value is a data point leaf, i.e. an object with a string id and a string ref.
 * @param value the parsed JSON value
 * @returns true if the value is a leaf
 */
function isSchemaLeaf(value: unknown): value is SchemaLeaf {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === 'string' && typeof candidate.ref === 'string';
}

/**
 * Recursively converts a schema object into PrimeVue tree nodes.
 * @param schema the (sub-)schema object
 * @param parentKey the key path of the parent node
 * @returns the tree nodes for this level
 */
function buildNodes(schema: Record<string, unknown>, parentKey: string): TreeNode[] {
  return Object.entries(schema).map(([name, value]) => {
    const key = parentKey ? `${parentKey}.${name}` : name;
    if (isSchemaLeaf(value)) {
      const data: DataPointLeafData = { dataPointTypeId: value.id, aliasExport: value.aliasExport };
      return { key, label: name, leaf: true, data, children: [] };
    }
    const children =
      typeof value === 'object' && value !== null ? buildNodes(value as Record<string, unknown>, key) : [];
    return { key, label: name, leaf: false, children };
  });
}

/**
 * Parses the schema string of a framework specification into tree nodes.
 * @param schemaJson the schema as JSON string
 * @returns the tree nodes; leaves carry DataPointLeafData in their data property
 * @throws Error if the string is not a valid JSON object
 */
export function parseFrameworkSchema(schemaJson: string): TreeNode[] {
  const parsed: unknown = JSON.parse(schemaJson);
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('The framework schema is not a JSON object.');
  }
  return buildNodes(parsed as Record<string, unknown>, '');
}
