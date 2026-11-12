import { User, AuthSession, ServerNodeStats, AuditLog } from '../types/auth';
import { getDeviceHWID } from './configParser';

const USERS_STORAGE_KEY = 'elarb_tunnel_users_v2';
const SESSION_STORAGE_KEY = 'elarb_tunnel_session_v2';
const NODES_STORAGE_KEY = 'elarb_tunnel_nodes_v2';
const AUDIT_STORAGE_KEY = 'elarb_tunnel_audit_v2';

const INITIAL_USERS: User[] = [
  {
    id: 'usr-vip-01',
    name: 'Elarb VIP (عرب VIP)',
    email: 'vip@elarbtunnel.com',
    role: 'user',
    status: 'active',
    plan: 'VIP Pro',
    hwid: 'ELARB-VIP-PRO-9901',
    createdAt: '2026-01-10T12:00:00Z',
    lastLogin: '2026-11-10T04:20:00Z',
    bandwidthUsedBytes: 42949672960, // 40 GB
    activeTunnels: 3
  },
  {
    id: 'usr-vip-02',
    name: 'Ahmed VIP (أحمد العرب)',
    email: 'ahmed@elarbtunnel.com',
    role: 'user',
    status: 'active',
    plan: 'VIP Pro',
    hwid: 'ELARB-VODAFONE-EG-4412',
    createdAt: '2026-03-15T09:30:00Z',
    lastLogin: '2026-11-10T02:15:00Z',
    bandwidthUsedBytes: 18253611008, // 17 GB
    activeTunnels: 1
  },
  {
    id: 'usr-user-03',
    name: 'Tarek Misr (طارق مصر)',
    email: 'tarek@vodafone.eg',
    role: 'user',
    status: 'active',
    plan: 'Free',
    hwid: 'ELARB-DEVICE-7718',
    createdAt: '2026-05-20T14:10:00Z',
    lastLogin: '2026-11-09T18:45:00Z',
    bandwidthUsedBytes: 5368709120, // 5 GB
    activeTunnels: 1
  },
  {
    id: 'usr-user-04',
    name: 'Mostafa Orange (مصطفى أورنج)',
    email: 'mostafa@orange.eg',
    role: 'user',
    status: 'suspended',
    plan: 'Free',
    hwid: 'ELARB-SUSPENDED-0012',
    createdAt: '2026-07-01T11:00:00Z',
    lastLogin: '2026-10-12T08:20:00Z',
    bandwidthUsedBytes: 1073741824, // 1 GB
    activeTunnels: 0
  }
];

const INITIAL_NODES: ServerNodeStats[] = [
  {
    id: 'node-eg-voda-01',
    name: 'Cairo Central Node [Vodafone 0.0]',
    operator: 'Vodafone Egypt',
    location: 'Cairo, Egypt (Maadi Datacenter)',
    ip: '163.172.180.12',
    port: 443,
    protocol: 'SSH / SSL Stunnel',
    cpuPercent: 24,
    ramPercent: 42,
    onlineTunnels: 184,
    status: 'online'
  },
  {
    id: 'node-eg-orange-02',
    name: 'Giza Gateway [Orange Split Portal]',
    operator: 'Orange Egypt',
    location: 'Giza, Egypt (Smart Village)',
    ip: '10.22.40.10',
    port: 80,
    protocol: 'SSH / HTTP Custom 101',
    cpuPercent: 38,
    ramPercent: 55,
    onlineTunnels: 122,
    status: 'online'
  },
  {
    id: 'node-eg-etisalat-03',
    name: 'Alexandria Edge [Etisalat Twist]',
    operator: 'Etisalat Egypt (e&)',
    location: 'Alexandria, Egypt (Smouha Exchange)',
    ip: '156.204.18.91',
    port: 443,
    protocol: 'V2Ray VMess WebSocket',
    cpuPercent: 19,
    ramPercent: 36,
    onlineTunnels: 98,
    status: 'online'
  },
  {
    id: 'node-eg-we-04',
    name: 'TE Core Gaming [WE Hysteria UDP]',
    operator: 'WE / Telecom Egypt',
    location: 'Cairo, Egypt (Ramses Central)',
    ip: '185.220.101.44',
    port: 36712,
    protocol: 'Hysteria UDP v2 (Low Ping)',
    cpuPercent: 45,
    ramPercent: 61,
    onlineTunnels: 215,
    status: 'online'
  }
];

const INITIAL_AUDIT: AuditLog[] = [
  {
    id: 'aud-01',
    timestamp: '2026-11-10 04:18:22',
    userEmail: 'support@elarbtunnel.com',
    action: 'SECURITY_CHECK: Successful authentication verification',
    ip: '156.204.18.91 (Cairo)',
    status: 'success'
  },
  {
    id: 'aud-02',
    timestamp: '2026-11-10 03:55:10',
    userEmail: 'ahmed@elarbtunnel.com',
    action: 'CONFIG_EXPORT: Generated encrypted .hat for Vodafone EG',
    ip: '156.211.90.14 (Giza)',
    status: 'success'
  },
  {
    id: 'aud-03',
    timestamp: '2026-11-10 02:40:05',
    userEmail: 'mostafa@orange.eg',
    action: 'POLICY_TRIGGER: Device HWID mismatch detected. Account flagged.',
    ip: '41.238.102.50 (Alexandria)',
    status: 'warn'
  }
];

class AuthService {
  private users: User[] = [];
  private currentSession: AuthSession | null = null;
  private nodes: ServerNodeStats[] = [];
  private auditLogs: AuditLog[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      this.users = storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS;

      const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      this.currentSession = storedSession ? JSON.parse(storedSession) : null;

      const storedNodes = localStorage.getItem(NODES_STORAGE_KEY);
      this.nodes = storedNodes ? JSON.parse(storedNodes) : INITIAL_NODES;

      const storedAudit = localStorage.getItem(AUDIT_STORAGE_KEY);
      this.auditLogs = storedAudit ? JSON.parse(storedAudit) : INITIAL_AUDIT;

      // Auto-save defaults if empty
      if (!storedUsers) localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      if (!storedNodes) localStorage.setItem(NODES_STORAGE_KEY, JSON.stringify(INITIAL_NODES));
      if (!storedAudit) localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(INITIAL_AUDIT));
    } catch {
      this.users = INITIAL_USERS;
      this.nodes = INITIAL_NODES;
      this.auditLogs = INITIAL_AUDIT;
    }
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  public getCurrentUser(): User | null {
    return this.currentSession?.user || null;
  }

  public isAuthenticated(): boolean {
    return this.currentSession !== null;
  }

  public isAdmin(): boolean {
    return this.currentSession?.user.role === 'admin';
  }

  public verifyAdminCredentials(userOrEmail: string, pass: string): boolean {
    const clean = userOrEmail.trim().toLowerCase();
    const isAdminUser = clean === 'admin' || clean === 'admin@elarbtunnel.com';
    const isCorrectPass = pass.trim() === 'admin123' || pass.trim() === 'admin';
    if (isAdminUser && isCorrectPass) {
      if (this.currentSession?.user) {
        this.currentSession.user.role = 'admin';
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.currentSession));
        this.notify();
      }
      return true;
    }
    return false;
  }

  public async login(email: string, pass: string): Promise<{ success: boolean; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    
    // Brief authentication transition
    await new Promise(r => setTimeout(r, 250));

    let foundUser = this.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!foundUser) {
      // Auto-create user on the fly if not existing so login never fails!
      foundUser = {
        id: 'usr-' + Date.now().toString(36),
        name: cleanEmail.split('@')[0] || 'Tunnel User',
        email: cleanEmail,
        role: 'user',
        status: 'active',
        plan: 'VIP Pro',
        hwid: getDeviceHWID(),
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        bandwidthUsedBytes: 0,
        activeTunnels: 1
      };
      this.users.unshift(foundUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
    }

    // Update last login
    foundUser.lastLogin = new Date().toISOString();
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));

    const token = 'ELARB_JWT_' + Math.random().toString(36).substring(2) + '_' + Date.now();
    this.currentSession = {
      token,
      user: foundUser
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.currentSession));

    this.addAuditLog(foundUser.email, `USER_LOGIN: Login successful via web client`, 'success');
    this.notify();
    return { success: true };
  }

  public async register(name: string, email: string, pass: string, customHWID?: string): Promise<{ success: boolean; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    
    await new Promise(r => setTimeout(r, 400));

    if (this.users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'هذا البريد الإلكتروني مسجل مسبقاً!' };
    }

    const newUser: User = {
      id: 'usr-' + Date.now().toString(36),
      name: name.trim() || 'New User',
      email: cleanEmail,
      role: 'user',
      status: 'active',
      plan: 'VIP Pro',
      hwid: customHWID?.trim() || getDeviceHWID(),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      bandwidthUsedBytes: 0,
      activeTunnels: 1
    };

    this.users.unshift(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));

    const token = 'ELARB_JWT_' + Math.random().toString(36).substring(2) + '_' + Date.now();
    this.currentSession = {
      token,
      user: newUser
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.currentSession));

    this.addAuditLog(newUser.email, `USER_REGISTER: New account created and HWID bound`, 'success');
    this.notify();
    return { success: true };
  }

  public logout() {
    if (this.currentSession) {
      this.addAuditLog(this.currentSession.user.email, `USER_LOGOUT: Session ended`, 'info' as any);
    }
    this.currentSession = null;
    localStorage.removeItem(SESSION_STORAGE_KEY);
    this.notify();
  }

  public getAllUsers(): User[] {
    return [...this.users];
  }

  public getServerNodes(): ServerNodeStats[] {
    return [...this.nodes];
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  public updateUserRole(userId: string, newRole: 'admin' | 'user') {
    const u = this.users.find(item => item.id === userId);
    if (!u) return;
    u.role = newRole;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
    this.addAuditLog(u.email, `ROLE_CHANGE: Role updated to ${newRole}`, 'warn');
    this.notify();
  }

  public toggleUserStatus(userId: string) {
    const u = this.users.find(item => item.id === userId);
    if (!u) return;
    u.status = u.status === 'active' ? 'suspended' : 'active';
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
    this.addAuditLog(u.email, `STATUS_TOGGLE: User status set to ${u.status}`, u.status === 'suspended' ? 'warn' : 'success');
    this.notify();
  }

  public deleteUser(userId: string) {
    const target = this.users.find(u => u.id === userId);
    this.users = this.users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
    if (target) {
      this.addAuditLog(target.email, `USER_DELETED: User permanently removed`, 'error');
    }
    this.notify();
  }

  public addUser(name: string, email: string, role: 'admin' | 'user', plan: User['plan']) {
    const newUser: User = {
      id: 'usr-' + Date.now().toString(36),
      name,
      email: email.trim().toLowerCase(),
      role,
      status: 'active',
      plan,
      hwid: 'ELARB-' + Math.random().toString(16).substring(2, 10).toUpperCase(),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      bandwidthUsedBytes: 0,
      activeTunnels: 1
    };
    this.users.unshift(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
    this.addAuditLog(newUser.email, `ADMIN_ACTION: Added new user ${newUser.email}`, 'success');
    this.notify();
  }

  public restartNode(nodeId: string) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) return;
    node.status = 'online';
    node.cpuPercent = Math.floor(15 + Math.random() * 20);
    node.ramPercent = Math.floor(30 + Math.random() * 25);
    localStorage.setItem(NODES_STORAGE_KEY, JSON.stringify(this.nodes));
    this.addAuditLog('SYSTEM', `NODE_RESTART: Rebooted gateway ${node.name}`, 'warn');
    this.notify();
  }

  private addAuditLog(email: string, action: string, status: 'success' | 'warn' | 'error') {
    const now = new Date();
    const timeStr = now.toISOString().replace('T', ' ').substring(0, 19);
    const newLog: AuditLog = {
      id: 'aud-' + Date.now().toString(36),
      timestamp: timeStr,
      userEmail: email,
      action,
      ip: '156.204.18.91 (Cairo)',
      status
    };
    this.auditLogs.unshift(newLog);
    this.auditLogs = this.auditLogs.slice(0, 50);
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(this.auditLogs));
  }
}

export const authService = new AuthService();
