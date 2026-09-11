export type SourceType = "postgres" | "mysql" | "csv" | "gsheets";

export interface Connection {
  id: string;
  name: string;
  source_type: SourceType;
  is_active: boolean;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
}

export interface TableListResponse {
  tables: string[];
}

export interface ColumnInfo {
  name: string;
  data_type: string;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  references: string | null;
  nullable: boolean;
}

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
}

export interface SchemaResponse {
  tables: TableInfo[];
}
export interface ERDNode {
  id: string;
  name: string;
  columns: ColumnInfo[];
  [key: string]: unknown;   // satisfies @xyflow/react's Node<T> data constraint
}

export interface ERDEdge {
  from_table: string;
  from_column: string;
  to_table: string;
  to_column: string;
}

export interface ERDResponse {
  nodes: ERDNode[];
  edges: ERDEdge[];
}

export interface TableSelectionResponse {
  table_names: string[];
}

export interface ChatRequest {
  connection_id: string;
  question: string;
}

export interface Visualization {
  type: "bar" | "line" | "pie" | "scatter" | "area";  // widened from "bar" | "line"
  x: string;
  y: string;
  title: string;  // new
}

export interface ChatResponse {
  answer: string | null;
  query: string | null;
  columns: string[] | null;
  rows: Record<string, unknown>[] | null;
  metadata: { row_count: number; truncated: boolean } | null;
  visualizations: Visualization[] | null;  // was: visualization: Visualization | null
  error: string | null;
}

export interface ERDEdge {
  from_table: string;
  from_column: string;
  to_table: string;
  to_column: string;
  cardinality: "one-to-one" | "many-to-one" | "many-to-many";
  source: "fk" | "semantic";
}

export interface ColumnSemantic {
  original_name: string;
  business_name: string;
  description: string;
}

export interface TableSemantic {
  original_name: string;
  business_name: string;
  description: string;
  columns: Record<string, ColumnSemantic>;
  business_rules: string[];
}

export interface RelationshipSemantic {
  from_table: string;
  from_column: string;
  to_table: string;
  to_column: string;
  cardinality: "one-to-one" | "many-to-one" | "many-to-many";
  description: string;
}

export interface SemanticLayer {
  connection_id: string;
  tables: Record<string, TableSemantic>;
  relationships: RelationshipSemantic[];
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  picture_url: string | null;
  sheets_connected: boolean;
}