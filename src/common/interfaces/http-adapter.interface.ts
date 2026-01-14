interface AxiosResponse<T> {
  data: T;
}

export interface HttpAdapter {
  get<T>(url: string): Promise<AxiosResponse<T>>;
}
