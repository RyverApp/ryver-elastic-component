import axios, { AxiosRequestConfig, CancelTokenSource, AxiosResponse, AxiosError } from 'axios';

export class SimpleRyverAPIRequest {
    _baseUrl: string;
    _path: string;
    _authorization: string;
    _headers: { [name: string]: any } = {};
    _parameters: { [name: string]: any } = {};
    _method: string = 'GET';
    _timeout: number = 150000;
    _data: any;
    _progress: (progressEvent: any) => void;
    _retry: boolean = false;
    _retryCount: number = 0;
    _retryMax: number = 1;
    _cancelSource: CancelTokenSource;

    constructor(org: string, authorization: string) {
        this._baseUrl = `https://${org}.ryver.com/api/1/odata.svc/`;
        this._authorization = authorization;
    }

    protected build() {
        const request: AxiosRequestConfig = {
            url: `${this._baseUrl}${this._path}`,
            method: this._method.toUpperCase(),
            headers: {
                'Accept': 'application/json',
                'Authorization': this._authorization,
                ...this._headers
            },
            params: this._parameters,
            timeout: this._timeout,
            data: this._data,
            onUploadProgress: this._progress
        };

        if (request.method !== 'GET' && !request.headers['Content-Type']) {
            request.headers['Content-Type'] = 'application/json';
        }

        if (this._cancelSource) {
            request.cancelToken = this._cancelSource.token;
        }

        return request;
    }

    headers(headers: { [name: string]: any }): this {
        this._headers = { ...headers };
        return this;
    }

    timeout(value: number): this {
        this._timeout = value;
        return this;
    }

    progress(callback: (progressEvent: any) => void): this {
        this._progress = callback;
        return this;
    }

    retry(enable: boolean): this {
        this._retry = enable;
        return this;
    }

    cancelable(source: CancelTokenSource) {
        this._cancelSource = source;
        return this;
    }

    get(path: string, params: { [name: string]: any } = {}) {
        this._path = path;
        this._parameters = params;
        return this.execute();
    }

    post(path: string, params: { [name: string]: any } = {}, data: any) {
        this._method = 'POST';
        this._path = path;
        this._parameters = params;
        this._data = data;
        return this.execute();
    }

    request(method: string, path: string, params: { [name: string]: any } = {}, data?: any) {
        this._method = method.toUpperCase();
        this._path = path;
        this._parameters = params;
        this._data = data;
        return this.execute();
    }

    execute(): Promise<any> {
        const request = this.build();
        
        return axios(request).then((res: AxiosResponse) => {
            const data = res.data && res.data.d || res.data;
            return (data && data.results /*&& !data.__metadata*/) ? data.results : data;
        }).catch((err: AxiosError) => {
            const { response: { headers, data, status, statusText } = {} as AxiosResponse } = err;
            if (headers && headers['Retry-After'] && this._retry && this._retryCount < this._retryMax) {
                this._retryCount++;
                setTimeout(this.execute.bind(this), 1000);
            } else {
                throw { data, status, statusText };
            }
        })
    }
}
