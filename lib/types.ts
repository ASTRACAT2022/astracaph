export type MotionPoint = {
  x: number;
  y: number;
  t: number;
};

export type Fingerprint = {
  userAgent: string;
  language: string;
  timezone: string;
  platform: string;
  webdriver: boolean;
  canvas: string;
  webglVendor: string;
  webglRenderer: string;
  screen: {
    width: number;
    height: number;
    pixelRatio: number;
  };
  hardwareConcurrency?: number;
  deviceMemory?: number;
};

export type BehaviorSignal = {
  dwellMs: number;
  keyPresses: number;
  pointerMoves: number;
  focusChanges: number;
  clickCount: number;
  submitLatencyMs?: number;
};

export type ChallengeInteraction = {
  confirmed?: boolean;
  challengeId?: string;
};

export type ChallengeRequest = {
  siteKey: string;
  fingerprint: Fingerprint;
  motion: MotionPoint[];
  behavior: BehaviorSignal;
  page?: string;
  referrer?: string;
  interaction?: ChallengeInteraction;
};

export type RiskDecision = "allow" | "challenge" | "deny";

export type IpIntelClassification =
  | "local"
  | "hosting"
  | "residential"
  | "mobile"
  | "unknown";

export type IpIntelSource = {
  source: string;
  org?: string;
  asn?: string;
  type?: string;
  hosting: boolean;
  proxy: boolean;
  vpn: boolean;
  tor: boolean;
  mobile: boolean;
  datacenter: boolean;
};

export type IpIntelReport = {
  classification: IpIntelClassification;
  staticLikelihood: "likely_home_or_small_office" | "unlikely_home" | "unknown";
  risk: number;
  reasons: string[];
  sources: IpIntelSource[];
  flags: {
    hosting: boolean;
    proxy: boolean;
    vpn: boolean;
    tor: boolean;
    mobile: boolean;
    datacenter: boolean;
  };
};

export type ScoreResult = {
  score: number;
  decision: RiskDecision;
  reasons: string[];
  motion: {
    averageSpeed: number;
    jitter: number;
    directionChanges: number;
    idlePauses: number;
  };
  ipIntel?: IpIntelReport;
};

export type SiteConfig = {
  name: string;
  siteKey: string;
  secret: string;
  origins: string[];
  createdAt: number;
};

export type ChallengeRecord = {
  id: string;
  siteKey: string;
  ip: string;
  createdAt: number;
  fingerprintHash: string;
  score: number;
};

export type IssuedTokenRecord = {
  jti: string;
  siteKey: string;
  score: number;
  challengeId: string;
  fingerprintHash: string;
  issuedAt: number;
  expiresAt: number;
  used: boolean;
};

export type SiteStats = {
  total: number;
  passed: number;
  challenged: number;
  failed: number;
  verified: number;
};

export type DebugLogEntry = {
  id: string;
  createdAt: number;
  route: string;
  method: string;
  siteKey?: string;
  ip?: string;
  status: number;
  summary: string;
  request?: Record<string, unknown>;
  response?: Record<string, unknown>;
};
