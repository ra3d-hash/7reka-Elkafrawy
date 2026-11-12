export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended';
  plan: 'Free' | 'VIP Pro' | 'Enterprise';
  hwid: string;
  createdAt: string;
  lastLogin: string;
  bandwidthUsedBytes: number;
  activeTunnels: number;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface ServerNodeStats {
  id: string;
  name: string;
  operator: string;
  location: string;
  ip: string;
  port: number;
  protocol: string;
  cpuPercent: number;
  ramPercent: number;
  onlineTunnels: number;
  status: 'online' | 'degraded' | 'maintenance';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  action: string;
  ip: string;
  status: 'success' | 'warn' | 'error';
}
