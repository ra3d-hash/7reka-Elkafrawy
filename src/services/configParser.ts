import { TunnelConfig, ConfigLockOptions } from '../types/tunnel';

const PRIMARY_HAT_HEADER = 'ELARB_TUNNEL_PLUS_V2';
const LEGACY_HAT_HEADER = 'HAMO_TUNNEL_PLUS_V2';
const SECRET_SALT = 'ElarbTunnel_DPI_Secret_2026';

// Get or generate consistent Hardware ID (HWID)
export function getDeviceHWID(): string {
  const existing = localStorage.getItem('elarb_device_hwid') || localStorage.getItem('hamo_device_hwid');
  if (existing) return existing;

  const userAgent = navigator.userAgent;
  const screenRes = `${window.screen.width}x${window.screen.height}`;
  const cores = navigator.hardwareConcurrency || 8;
  const rawId = `${userAgent}-${screenRes}-${cores}-${Date.now().toString(36)}`;
  
  // Simple deterministic hash
  let hash = 0;
  for (let i = 0; i < rawId.length; i++) {
    hash = (hash << 5) - hash + rawId.charCodeAt(i);
    hash |= 0;
  }
  const hwid = 'ELARB-' + Math.abs(hash).toString(16).toUpperCase().padStart(8, '0') + '-' + Math.floor(1000 + Math.random() * 9000);
  localStorage.setItem('elarb_device_hwid', hwid);
  return hwid;
}

// Simple reversible XOR + Base64 cipher for .hat representation
function encryptPayload(text: string, pass: string = SECRET_SALT): string {
  const key = pass + SECRET_SALT;
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(unescape(encodeURIComponent(result)));
}

function decryptPayload(encoded: string, pass: string = SECRET_SALT): string {
  try {
    const text = decodeURIComponent(escape(atob(encoded)));
    const key = pass + SECRET_SALT;
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch {
    throw new Error('Failed to decrypt config. Invalid password or corrupted .hat file.');
  }
}

export interface ParseResult {
  success: boolean;
  config?: TunnelConfig;
  error?: string;
  isPasswordRequired?: boolean;
}

export function parseConfigFile(content: string, passwordAttempt?: string): ParseResult {
  const trimmed = content.trim();

  // 1. Try Direct JSON
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      return validateAndReturnConfig(parsed);
    } catch {
      // not direct json, proceed
    }
  }

  // 2. Check for .hat format (Supports both ELARB and legacy HAMO headers)
  if (trimmed.startsWith(PRIMARY_HAT_HEADER) || trimmed.startsWith(LEGACY_HAT_HEADER)) {
    const parts = trimmed.split('::');
    if (parts.length < 3) {
      return { success: false, error: 'الملف تالف أو غير صالح (Corrupted .hat file format)' };
    }

    const [, metaBase64, encryptedBody] = parts;
    let meta: { isPasswordProtected?: boolean; lockHWID?: string; expiryDate?: string; name?: string } = {};
    try {
      meta = JSON.parse(decodeURIComponent(escape(atob(metaBase64))));
    } catch {
      return { success: false, error: 'تعذر قراءة بيانات ترويسة الكونفج (Header parse failure)' };
    }

    // Check HWID Lock
    const myHWID = getDeviceHWID();
    if (meta.lockHWID && meta.lockHWID !== myHWID) {
      return {
        success: false,
        error: `الكونفج مقفول على جهاز آخر فقط!\nHWID المطلوب: ${meta.lockHWID}\nمعرف جهازك: ${myHWID}`
      };
    }

    // Check Expiration
    if (meta.expiryDate) {
      const expTime = new Date(meta.expiryDate).getTime();
      if (Date.now() > expTime) {
        return {
          success: false,
          error: `انتهت صلاحية هذا الكونفج في: ${new Date(meta.expiryDate).toLocaleDateString()}`
        };
      }
    }

    // Check Password Protection
    if (meta.isPasswordProtected && !passwordAttempt) {
      return {
        success: false,
        isPasswordRequired: true,
        error: 'هذا الكونفج محمي بكلمة سر. الرجاء إدخال كلمة المرور لفك التشفير.'
      };
    }

    try {
      const decryptedJsonStr = decryptPayload(encryptedBody, passwordAttempt || SECRET_SALT);
      const parsedConfig = JSON.parse(decryptedJsonStr);
      return validateAndReturnConfig(parsedConfig);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid password or decryption failed';
      return {
        success: false,
        error: message.includes('password')
          ? 'كلمة المرور غير صحيحة!'
          : 'فشل فك تشفير الكونفج.'
      };
    }
  }

  // 3. Fallback: try raw base64 or vmess:// or vless:// or trojan:// URI format
  if (trimmed.startsWith('vmess://') || trimmed.startsWith('vless://') || trimmed.startsWith('trojan://')) {
    return parseV2RayUri(trimmed);
  }

  return {
    success: false,
    error: 'صيغة غير مدعومة. الرجاء اختيار ملف .hat صالح أو كونفج JSON أو رابط V2Ray'
  };
}

function parseV2RayUri(uri: string): ParseResult {
  try {
    if (uri.startsWith('vmess://')) {
      const b64 = uri.replace('vmess://', '');
      const json = JSON.parse(atob(b64));
      return {
        success: true,
        config: {
          id: 'v2ray-' + Date.now(),
          name: json.ps || 'VMess Server',
          protocol: 'V2RAY_VMESS',
          serverHost: json.add || '127.0.0.1',
          serverPort: Number(json.port) || 443,
          password: json.id,
          bugHostSNI: json.sni || json.host || '',
          payload: `GET / HTTP/1.1[crlf]Host: ${json.host || json.add}[crlf]Upgrade: websocket[crlf][crlf]`,
          isEncrypted: false,
        }
      };
    }

    if (uri.startsWith('vless://') || uri.startsWith('trojan://')) {
      const url = new URL(uri);
      const protocol = uri.startsWith('vless://') ? 'V2RAY_VLESS' : 'V2RAY_VMESS';
      return {
        success: true,
        config: {
          id: 'v2ray-' + Date.now(),
          name: decodeURIComponent(url.hash.replace('#', '')) || 'V2Ray Node',
          protocol,
          serverHost: url.hostname,
          serverPort: Number(url.port) || 443,
          password: url.username,
          bugHostSNI: url.searchParams.get('sni') || url.hostname,
          isEncrypted: false,
        }
      };
    }
  } catch {
    return { success: false, error: 'تعذر تحليل رابط V2Ray' };
  }

  return { success: false, error: 'Unknown URI scheme' };
}

function validateAndReturnConfig(data: Partial<TunnelConfig>): ParseResult {
  if (!data.serverHost && !data.bugHostSNI) {
    return { success: false, error: 'بيانات الكونفج غير مكتملة (سيرفر أو هوست مفقود)' };
  }

  const config: TunnelConfig = {
    id: data.id || 'cfg-' + Date.now().toString(36),
    name: data.name || 'Elarb Tunnel Config',
    protocol: data.protocol || 'SSH_SSL',
    serverHost: data.serverHost || 'eg.elarbtunnel.net',
    serverPort: Number(data.serverPort) || 443,
    username: data.username || 'elarb_vip',
    password: data.password || '123456',
    bugHostSNI: data.bugHostSNI || '',
    payload: data.payload || 'CONNECT [host_port] [protocol][crlf]Host: [host][crlf]Connection: Keep-Alive[crlf][crlf]',
    proxyHost: data.proxyHost || '',
    proxyPort: data.proxyPort || 8080,
    udpgwPort: data.udpgwPort || 7300,
    dnsPrimary: data.dnsPrimary || '1.1.1.1',
    dnsSecondary: data.dnsSecondary || '1.0.0.1',
    isEncrypted: Boolean(data.isEncrypted),
    isLocked: Boolean(data.isLocked),
    lockHWID: data.lockHWID,
    expiryDate: data.expiryDate,
    configNote: data.configNote || '',
    countryCode: data.countryCode || 'EG',
    operatorName: data.operatorName || 'Custom'
  };

  return { success: true, config };
}

// Export encrypted .hat file
export function exportEncryptedHat(config: TunnelConfig, options: ConfigLockOptions): { filename: string; content: string } {
  const metadata = {
    name: options.name || config.name,
    isPasswordProtected: Boolean(options.password),
    lockHWID: options.lockHWID || undefined,
    expiryDate: options.expiryDate || undefined,
    preventRoot: options.preventRoot,
    timestamp: new Date().toISOString()
  };

  const cleanConfigToSave: TunnelConfig = {
    ...config,
    name: options.name || config.name,
    configNote: options.note || config.configNote,
    isEncrypted: true,
    isLocked: Boolean(options.lockHWID || options.password || options.expiryDate),
    lockHWID: options.lockHWID,
    expiryDate: options.expiryDate,
    payload: options.hidePayload ? '/* PAYLOAD LOCKED BY CREATOR */' : config.payload
  };

  const metaBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(metadata))));
  const passKey = options.password || SECRET_SALT;
  const encryptedBody = encryptPayload(JSON.stringify(cleanConfigToSave), passKey);

  const fileBody = `${PRIMARY_HAT_HEADER}::${metaBase64}::${encryptedBody}`;
  const safeName = (options.name || 'Elarb_Config').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${safeName}.hat`;

  return { filename, content: fileBody };
}
