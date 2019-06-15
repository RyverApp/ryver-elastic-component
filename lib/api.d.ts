import { AxiosRequestConfig, CancelTokenSource } from 'axios';
export declare class SimpleRyverAPIRequest {
    _baseUrl: string;
    _path: string;
    _authorization: string;
    _headers: {
        [name: string]: any;
    };
    _parameters: {
        [name: string]: any;
    };
    _method: string;
    _timeout: number;
    _data: any;
    _progress: (progressEvent: any) => void;
    _retry: boolean;
    _retryCount: number;
    _retryMax: number;
    _cancelSource: CancelTokenSource;
    constructor(org: string, authorization: string);
    protected build(): AxiosRequestConfig;
    headers(headers: {
        [name: string]: any;
    }): this;
    timeout(value: number): this;
    progress(callback: (progressEvent: any) => void): this;
    retry(enable: boolean): this;
    cancelable(source: CancelTokenSource): this;
    get(path: string, params?: {
        [name: string]: any;
    }): Promise<any>;
    post(path: string, params: {
        [name: string]: any;
    } | undefined, data: any): Promise<any>;
    request(method: string, path: string, params?: {
        [name: string]: any;
    }, data?: any): Promise<any>;
    execute(): Promise<any>;
}
