export interface ProvincesResponse {
  ref: string;
  code: number;
  message: string;
  data: ProvincesInfo[];
}

export interface ProvincesInfo {
  code: string;
  nameTH: string;
  nameEN: string;
}

export interface SearchProvincesRequest {
  code?: string;
  name?: string;
}
