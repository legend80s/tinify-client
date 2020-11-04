import http from 'http';
import https from 'https';

export const getRequest = (url: string) => /https:\/\//.test(url) ? https : http;
