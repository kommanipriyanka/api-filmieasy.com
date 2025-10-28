export interface IResp {
  status: number;
  success: boolean;
  message: string;
}

export interface IRespWithData<T = unknown> extends IResp {
  data: T;
}

export interface IRespWithErrors extends IResp {
  errors: Record<string, string> | null;
}
export interface JWTUserPayload {
  sub: number;
  iat: number;
}
