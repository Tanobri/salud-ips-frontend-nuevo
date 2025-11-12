// src/config.js — lee la URL base del API Gateway en runtime
window.APP_CFG = window.APP_CFG || {};
export const API_BASE = (window.APP_CFG.API_BASE || '').toString();
