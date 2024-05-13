export interface ReasonType {
  nameTH: string;
  code: string;
}

export interface FileType {
  branchCode: string;
  fileKey: string;
  fileName: string;
  mimeType: string;
  status?: string;
}

export interface AuditLog {
  activity: string;
  editBy: string;
  editByName: string;
  editDate: string;
  comment: AuditLogComment | "";
}

export interface AuditLogComment {
  by: string;
  detail: string;
}
