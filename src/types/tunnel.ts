export type ProtocolType =
  | 'SSH_DIRECT'
  | 'SSH_PAYLOAD'
  | 'SSH_SSL'
  | 'OPENVPN'
  | 'V2RAY_VMESS'
  | 'V2RAY_VLESS'
  | 'HYSTERIA_UDP'
  | 'WIREGUARD'
  | 'SLOWDNS';

export type ConnectionState =
  | 'DISCONNECTED'
  | 'RESOLVING'
  | 'SPOOFING_TLS'
  | 'INJECTING_PAYLOAD'
  | 'HANDSHAKING'
  | 'CONNECTED'
  | 'RECONNECTING';

export interface TunnelConfig {
  id: string;
  name: string;
  protocol: ProtocolType;
  serverHost: string;
  serverPort: number;
  username?: string;
  password?: string;
  bugHostSNI?: string;
  payload?: string;
  proxyHost?: string;
  proxyPort?: number;
  udpgwPort?: number;
  dnsPrimary?: string;
  dnsSecondary?: string;
  isEncrypted?: boolean;
  isLocked?: boolean;
  lockHWID?: string;
  expiryDate?: string;
  configNote?: string;
  countryCode?: string;
  operatorName?: string;
}

export interface TelemetryStats {
  bytesIn: number;
  bytesOut: number;
  speedDown: number; // in KB/s
  speedUp: number;   // in KB/s
  pingMs: number;
  jitterMs: number;
  packetsIn: number;
  packetsOut: number;
  packetLossPercent: number;
  uptimeSeconds: number;
  connectedIp: string;
  realIp: string;
  serverLocation: string;
  cipherSuite: string;
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'TLS' | 'PAYLOAD' | 'DPI' | 'PACKET' | 'SUCCESS' | 'WARN' | 'ERROR';
  message: string;
  details?: string;
}

export interface NetworkPreset {
  id: string;
  title: string;
  titleAr: string;
  operator: string;
  country: string;
  flag: string;
  config: TunnelConfig;
  description: string;
  descriptionAr: string;
}

export interface HostCheckResult {
  host: string;
  method: string;
  statusCode: number;
  statusText: string;
  responseTimeMs: number;
  serverHeader: string;
  protocol: string;
  headers: Record<string, string>;
}

export interface ConfigLockOptions {
  name: string;
  note: string;
  password?: string;
  lockHWID?: string;
  expiryDate?: string;
  preventRoot: boolean;
  hidePayload: boolean;
}
