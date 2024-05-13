export interface TransferReasonsResponse {
  ref: string;
  code: number;
  message: string;
  data: TransferReasonsInfo[];
}

export interface TransferReasonsInfo {
  id: string;
  code: string;
  name: string;
}
