export interface SubDistrictsResponse {
  ref: string;
  code: number;
  message: string;
  data: SubDistrictsInfo[];
}

export interface SubDistrictsInfo {
  code: string;
  nameTH: string;
  nameEN: string;
  districtCode: string;
  postalCode: string;
}

export interface SearchSubDistrictsRequest {
  code?: string;
  name?: string;
  districtCode?: string;
  postalCode?: string;
}
