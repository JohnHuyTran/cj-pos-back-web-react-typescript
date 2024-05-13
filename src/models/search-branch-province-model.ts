export interface ItemProps {
  label: string;
  onDelete: any;
}
export interface ListBranches {
  branches: Object[];
  provinces: Object[];
}

export interface ListAllBranches {
  branches: Object[];
  provinces: Object[];
  excludeBranches: Object[];
  excludeProvinces: Object[];
}

export interface Payload {
  name: string;
  province: string;
}

export type Params = { [key: string]: string };

export interface BranchResponse {
  ref: string;
  code: number;
  message: string;
  data: Object[];
}

export interface ProvinceResponse {
  ref: string;
  code: number;
  message: string;
  data: ProvinceInfo[];
}

export interface ProvinceInfo {
  code: string;
  name: string;
}
