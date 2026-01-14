import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { HttpAdapter } from '../interfaces/http-adapter.interface';

@Injectable()
export class AxiosAdapter implements HttpAdapter {
  private axios: AxiosInstance = axios;

  async get<T>(url: string) {
    try {
      const { data } = await this.axios.get<T>(url);
      return { data };
    } catch (error) {
      throw new Error(`Can't get data from ${url} - Check server logs`);
    }
  }
}
