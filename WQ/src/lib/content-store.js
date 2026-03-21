import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const APP_ROOT = existsSync(path.join(process.cwd(), "src", "content"))
  ? process.cwd()
  : path.join(process.cwd(), "WQ");
const CONTENT_PATH = path.join(APP_ROOT, "src", "content", "landing-content.json");

const DEFAULT_CONTENT = {
  tryDemoUrl: "https://writequest.netlify.app",
  heroImage: "/assets/Web-Hero.jpg",
  topSection1Image: "/assets/Top-section1.jpg",
  topSection2Image: "/assets/Top-section2.jpg",
  storyImage1: "/assets/story1.jpg",
  storyImage2: "/assets/story2.jpg",
  beforeImage: "/assets/before.jpg",
  afterImage: "/assets/after.jpg",
  gallery1Image: "/assets/gallery1.jpg",
  gallery2Image: "/assets/gallery2.jpg",
  gallery3Image: "/assets/gallery3.jpg",
  gallery4Image: "/assets/gallery4.jpg",
  gallery5Image: "/assets/gallery5.jpg",
  gallery6Image: "/assets/gallery6.jpg",
  bottomImage: "/assets/bottom.jpg",
  woodNavImage: "/assets/wood-nav.jpg",
  heroSubtitle: "A puzzle game to learn Chinese.",
  storyTag: "STORY",
  storyTitleLine1: "Meet Zhongzhong",
  storyTitleLine2: "and Wenywen",
  storyParagraph1:
    "Once a living paradise, the island is now buried in smog, waste, and silence. Rivers clog, forests fall silent, and its sky no longer remembers its glow.",
  storyParagraph2:
    "When all seems lost, two young dragon siblings armed with wit, courage, and the power of puzzles begin a mission to heal a broken world piece by piece.",
  previewTitle: "Game Preview",
  previewPrompt: "Will you help them twist their way to victory?",
  learnSectionText:
    "Learn new skills, every solved puzzle restores life, and every choice brings the island one step closer to rebirth.",
  signupHeadline: "Join the next update",
  signupSubheadline: "Sign up for chapter drops, and launch rewards",
  signupPrivacy: "We respect your privacy. Unsubscribe anytime.",
  footerText: "2026 Write Quest, all rights reserved.",
};

const FIELD_RULES = {
  tryDemoUrl: { maxLength: 2048 },
  heroImage: { maxLength: 2048, multiline: false },
  topSection1Image: { maxLength: 2048, multiline: false },
  topSection2Image: { maxLength: 2048, multiline: false },
  storyImage1: { maxLength: 2048, multiline: false },
  storyImage2: { maxLength: 2048, multiline: false },
  beforeImage: { maxLength: 2048, multiline: false },
  afterImage: { maxLength: 2048, multiline: false },
  gallery1Image: { maxLength: 2048, multiline: false },
  gallery2Image: { maxLength: 2048, multiline: false },
  gallery3Image: { maxLength: 2048, multiline: false },
  gallery4Image: { maxLength: 2048, multiline: false },
  gallery5Image: { maxLength: 2048, multiline: false },
  gallery6Image: { maxLength: 2048, multiline: false },
  bottomImage: { maxLength: 2048, multiline: false },
  woodNavImage: { maxLength: 2048, multiline: false },
  heroSubtitle: { maxLength: 90, multiline: false },
  storyTag: { maxLength: 24, multiline: false },
  storyTitleLine1: { maxLength: 48, multiline: false },
  storyTitleLine2: { maxLength: 48, multiline: false },
  storyParagraph1: { maxLength: 320, multiline: true },
  storyParagraph2: { maxLength: 320, multiline: true },
  previewTitle: { maxLength: 48, multiline: false },
  previewPrompt: { maxLength: 100, multiline: true, maxLines: 3 },
  learnSectionText: { maxLength: 180, multiline: true, maxLines: 3 },
  signupHeadline: { maxLength: 60, multiline: false },
  signupSubheadline: { maxLength: 120, multiline: false },
  signupPrivacy: { maxLength: 120, multiline: false },
  footerText: { maxLength: 90, multiline: false },
};

function isUrlLike(value) {
  if (typeof value !== "string") return false;
  const v = value.trim();
  return v.startsWith("/") || v.startsWith("http://") || v.startsWith("https://");
}

function normalizeText(value, rules = {}) {
  const normalizedLineEndings = value.replace(/\r\n?/g, "\n");
  const trimmed = normalizedLineEndings.trim();

  if (!rules.multiline) {
    return trimmed.replace(/\s+/g, " ");
  }

  const compactLines = trimmed
    .split("\n")
    .map((line) => line.trim().replace(/\s+/g, " "))
    .filter(Boolean);

  const slicedLines = typeof rules.maxLines === "number" ? compactLines.slice(0, rules.maxLines) : compactLines;
  return slicedLines.join("\n");
}

function sanitizeLandingContent(content) {
  const source = content && typeof content === "object" ? content : {};
  const normalized = {};
  const warnings = [];

  for (const [key, fallback] of Object.entries(DEFAULT_CONTENT)) {
    const rules = FIELD_RULES[key] || {};
    const raw = source[key];
    if (typeof raw !== "string") {
      normalized[key] = fallback;
      if (raw != null) warnings.push(`${key}: invalid type, reverted to default.`);
      continue;
    }

    let value = normalizeText(raw, rules);
    if (!value) {
      normalized[key] = fallback;
      warnings.push(`${key}: empty value, reverted to default.`);
      continue;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      value = value.slice(0, rules.maxLength).trim();
      warnings.push(`${key}: trimmed to ${rules.maxLength} characters.`);
    }

    if (key === "tryDemoUrl" && !/^https?:\/\//i.test(value)) {
      normalized[key] = fallback;
      warnings.push(`${key}: must be http/https URL, reverted to default.`);
      continue;
    }

    if (key.toLowerCase().includes("image") && !isUrlLike(value)) {
      normalized[key] = fallback;
      warnings.push(`${key}: invalid image URL, reverted to default.`);
      continue;
    }

    normalized[key] = value;
  }

  return { content: normalized, warnings };
}

export async function readLandingContent() {
  try {
    const raw = await fs.readFile(CONTENT_PATH, "utf8");
    return sanitizeLandingContent(JSON.parse(raw || "{}")).content;
  } catch {
    return sanitizeLandingContent({}).content;
  }
}

export async function writeLandingContent(content) {
  const sanitized = sanitizeLandingContent(content);
  await fs.writeFile(CONTENT_PATH, JSON.stringify(sanitized.content, null, 2), "utf8");
  return sanitized;
}
