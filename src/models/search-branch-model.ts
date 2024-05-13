export interface BranchResponse {
  ref: string;
  code: number;
  message: string;
  data: BranchInfo[];
}

export interface BranchInfo {
  code: string;
  name: string;
  isDC: boolean;
}

export interface AuthorizedBranchResponse {
  timestamp: string;
  ref: string;
  code: number;
  message: string;
  data: Data | null;
}

export interface Data {
  branches: BranchInfo[];
}

export interface SuperviseBranchRequest {
  role?: string;
  branchCode?: string;
  isDC?: boolean;
}

export interface SuperviseBranchResponse {
  timestamp: string;
  ref: string;
  code: number;
  message: string;
  data: Data | null;
}
