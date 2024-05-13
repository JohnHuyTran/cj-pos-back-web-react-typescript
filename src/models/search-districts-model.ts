export interface DistrictsResponse {
  ref: string;
  code: number;
  message: string;
  data: DistrictsInfo[];
}

export interface DistrictsInfo {
  code: string;
  nameTH: string;
  nameEN: string;
  provinceCode: string;
}

export interface SearchDistrictsRequest {
  code?: string;
  name?: string;
  provinceCode?: string;
}
