"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
class SimpleRyverAPIRequest {
    constructor(org, authorization) {
        this._headers = {};
        this._parameters = {};
        this._method = 'GET';
        this._timeout = 150000;
        this._retry = false;
        this._retryCount = 0;
        this._retryMax = 1;
        this._baseUrl = `https://${org}.ryver.com/api/1/odata.svc/`;
        this._authorization = authorization;
    }
    build() {
        const request = {
            url: `${this._baseUrl}${this._path}`,
            method: this._method.toUpperCase(),
            headers: Object.assign({ 'Accept': 'application/json', 'Authorization': this._authorization }, this._headers),
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
    headers(headers) {
        this._headers = Object.assign({}, headers);
        return this;
    }
    timeout(value) {
        this._timeout = value;
        return this;
    }
    progress(callback) {
        this._progress = callback;
        return this;
    }
    retry(enable) {
        this._retry = enable;
        return this;
    }
    cancelable(source) {
        this._cancelSource = source;
        return this;
    }
    get(path, params = {}) {
        this._path = path;
        this._parameters = params;
        return this.execute();
    }
    post(path, params = {}, data) {
        this._method = 'POST';
        this._path = path;
        this._parameters = params;
        this._data = data;
        return this.execute();
    }
    request(method, path, params = {}, data) {
        this._method = method.toUpperCase();
        this._path = path;
        this._parameters = params;
        this._data = data;
        return this.execute();
    }
    execute() {
        const request = this.build();
        return axios_1.default(request).then((res) => {
            const data = res.data && res.data.d || res.data;
            return (data && data.results) ? data.results : data;
        }).catch((err) => {
            const { response: { headers, data, status, statusText } = {} } = err;
            if (headers && headers['Retry-After'] && this._retry && this._retryCount < this._retryMax) {
                this._retryCount++;
                setTimeout(this.execute.bind(this), 1000);
            }
            else {
                throw { data, status, statusText };
            }
        });
    }
}
exports.SimpleRyverAPIRequest = SimpleRyverAPIRequest;
//# sourceMappingURL=api.js.map