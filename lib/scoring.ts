import { ChallengeRequest, IpIntelReport, MotionPoint, ScoreResult } from "@/lib/types";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function safeDiv(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

function analyzeMotion(points: MotionPoint[]) {
  if (points.length < 2) {
    return {
      averageSpeed: 0,
      jitter: 0,
      directionChanges: 0,
      idlePauses: 0,
    };
  }

  const speeds: number[] = [];
  const headings: number[] = [];
  let idlePauses = 0;

  for (let index = 1; index < points.length; index += 1) {
    const prev = points[index - 1];
    const curr = points[index];
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    const dt = Math.max(curr.t - prev.t, 1);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speed = distance / dt;
    speeds.push(speed);
    headings.push(Math.atan2(dy, dx));
    if (dt > 140) {
      idlePauses += 1;
    }
  }

  let directionChanges = 0;
  for (let index = 1; index < headings.length; index += 1) {
    const delta = Math.abs(headings[index] - headings[index - 1]);
    if (delta > 0.55) {
      directionChanges += 1;
    }
  }

  const averageSpeed = speeds.reduce((sum, value) => sum + value, 0) / speeds.length;
  const mean = averageSpeed;
  const variance =
    speeds.reduce((sum, value) => sum + (value - mean) ** 2, 0) / speeds.length;
  const jitter = Math.sqrt(variance);

  return {
    averageSpeed,
    jitter,
    directionChanges,
    idlePauses,
  };
}

export function scoreTelemetry(
  input: ChallengeRequest,
  ipIntel?: IpIntelReport,
): ScoreResult {
  const reasons: string[] = [];
  const motion = analyzeMotion(input.motion);
  const { fingerprint, behavior, interaction } = input;
  const suspiciousUserAgent = /bot|spider|crawler|curl|python/i.test(fingerprint.userAgent);
  let score = 0.18;

  if (fingerprint.webdriver) {
    score += 0.55;
    reasons.push("webdriver flag detected");
  }

  if (suspiciousUserAgent) {
    score += 0.4;
    reasons.push("suspicious user-agent");
  }

  if (!fingerprint.canvas) {
    score += 0.06;
    reasons.push("canvas fingerprint missing");
  }

  if (!fingerprint.webglVendor || !fingerprint.webglRenderer) {
    score += 0.08;
    reasons.push("webgl metadata incomplete");
  }

  if (
    fingerprint.screen.width <= 0 ||
    fingerprint.screen.height <= 0 ||
    fingerprint.screen.pixelRatio <= 0
  ) {
    score += 0.16;
    reasons.push("screen metadata invalid");
  }

  if (input.motion.length < 5) {
    score += 0.16;
    reasons.push("insufficient pointer telemetry");
  }

  if (motion.jitter < 0.015 && input.motion.length >= 6) {
    score += 0.12;
    reasons.push("trajectory too smooth");
  }

  if (motion.directionChanges <= 1 && input.motion.length >= 8) {
    score += 0.08;
    reasons.push("low direction variability");
  }

  if (motion.averageSpeed > 3.8) {
    score += 0.09;
    reasons.push("pointer speed abnormally high");
  }

  if (behavior.dwellMs < 450) {
    score += 0.18;
    reasons.push("interaction dwell too short");
  }

  if (behavior.pointerMoves === 0) {
    score += 0.12;
    reasons.push("no pointer movement");
  }

  if (behavior.focusChanges > 7) {
    score += 0.05;
    reasons.push("frequent focus switching");
  }

  if (behavior.keyPresses > 18 && behavior.dwellMs < 1000) {
    score += 0.07;
    reasons.push("key cadence unusually fast");
  }

  if (interaction?.confirmed) {
    score -= 0.14;
    reasons.push("visual confirmation lowered risk");
  }

  if (ipIntel) {
    score += ipIntel.risk;
    reasons.push(...ipIntel.reasons);

    if (ipIntel.classification === "residential") {
      score -= 0.04;
    }
  }

  const requiresExtendedPhysicalChallenge = Boolean(
    ipIntel &&
      (
        ipIntel.classification === "hosting" ||
        ipIntel.classification === "mobile" ||
        ipIntel.classification === "unknown" ||
        ipIntel.staticLikelihood === "unlikely_home" ||
        ipIntel.flags.proxy ||
        ipIntel.flags.vpn ||
        ipIntel.flags.tor ||
        ipIntel.flags.hosting ||
        ipIntel.flags.datacenter
      ),
  );

  score = clamp(score, 0, 1);

  let decision: ScoreResult["decision"] = "allow";
  if (score >= 0.7) {
    decision = "deny";
  } else if (score >= 0.38) {
    decision = "challenge";
  }

  if (decision === "deny" && requiresExtendedPhysicalChallenge && !fingerprint.webdriver && !suspiciousUserAgent) {
    decision = "challenge";
    reasons.push("non-residential ip downgraded to extended physical challenge");
  }

  if (decision === "allow" && reasons.length === 0) {
    reasons.push("low-risk passive profile");
  }

  const challenge =
    decision === "challenge"
      ? {
          type: requiresExtendedPhysicalChallenge ? ("press_hold" as const) : ("confirm" as const),
          requiredHoldMs: requiresExtendedPhysicalChallenge ? 3200 : 0,
          reason: requiresExtendedPhysicalChallenge
            ? ("non_residential_ip" as const)
            : ("standard" as const),
        }
      : {
          type: "confirm" as const,
          requiredHoldMs: 0,
          reason: "standard" as const,
        };

  return {
    score: Number(score.toFixed(2)),
    decision,
    reasons,
    motion: {
      averageSpeed: Number(motion.averageSpeed.toFixed(3)),
      jitter: Number(motion.jitter.toFixed(3)),
      directionChanges: motion.directionChanges,
      idlePauses: motion.idlePauses,
    },
    ipIntel,
    challenge,
  };
}

export function fingerprintSummary(input: ChallengeRequest): string {
  const { fingerprint } = input;
  return [
    fingerprint.userAgent,
    fingerprint.language,
    fingerprint.timezone,
    fingerprint.platform,
    fingerprint.webdriver ? "webdriver" : "human",
    `${fingerprint.screen.width}x${fingerprint.screen.height}@${fingerprint.screen.pixelRatio}`,
    fingerprint.canvas,
    fingerprint.webglVendor,
    fingerprint.webglRenderer,
  ].join("|");
}

export function humanConfidence(score: number): number {
  return Number((1 - clamp(score, 0, 1)).toFixed(2));
}

export function completionRatio(stats: { passed: number; challenged: number; failed: number }): number {
  const total = stats.passed + stats.challenged + stats.failed;
  return Number(safeDiv(stats.passed + stats.challenged * 0.5, total).toFixed(2));
}
