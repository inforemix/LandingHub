"use client";

import { useEffect, useMemo, useState } from "react";

const FIELDS = [
  { key: "tryDemoUrl", label: "Try Demo Link", section: "Hero & CTA", type: "url", placeholder: "https://writequest.netlify.app" },
  { key: "heroSubtitle", label: "Hero Subtitle", section: "Hero & CTA", type: "text", placeholder: "A puzzle game to learn Chinese." },
  { key: "previewTitle", label: "Preview Title", section: "Hero & CTA", type: "text", placeholder: "Game Preview" },
  { key: "previewPrompt", label: "Preview Prompt", section: "Hero & CTA", type: "textarea", rows: 3, placeholder: "Will you help them twist their way to victory?", helpText: "Keep this short. The page is designed for up to 3 compact lines." },

  { key: "storyTag", label: "Story Tag", section: "Story", type: "text", placeholder: "STORY" },
  { key: "storyTitleLine1", label: "Story Title Line 1", section: "Story", type: "text", placeholder: "Meet Zhongzhong" },
  { key: "storyTitleLine2", label: "Story Title Line 2", section: "Story", type: "text", placeholder: "and Wenywen" },
  { key: "storyParagraph1", label: "Story Paragraph 1", section: "Story", type: "textarea", rows: 4 },
  { key: "storyParagraph2", label: "Story Paragraph 2", section: "Story", type: "textarea", rows: 4 },
  { key: "learnSectionText", label: "Learning Section Text", section: "Story", type: "textarea", rows: 3 },

  { key: "signupHeadline", label: "Signup Headline", section: "Signup", type: "text", placeholder: "Join the next update" },
  { key: "signupSubheadline", label: "Signup Subheadline", section: "Signup", type: "text", placeholder: "Sign up for chapter drops, and launch rewards" },
  { key: "signupPrivacy", label: "Signup Privacy Text", section: "Signup", type: "text", placeholder: "We respect your privacy. Unsubscribe anytime." },

  { key: "footerText", label: "Footer Text", section: "Footer", type: "text", placeholder: "2026 Write Quest, all rights reserved." },

  { key: "heroImage", label: "Hero Image URL", section: "Images", type: "image", placeholder: "/assets/Web-Hero.jpg" },
  { key: "topSection1Image", label: "Top Section Image 1", section: "Images", type: "image", placeholder: "/assets/Top-section1.jpg" },
  { key: "topSection2Image", label: "Top Section Image 2", section: "Images", type: "image", placeholder: "/assets/Top-section2.jpg" },
  { key: "storyImage1", label: "Story Image 1", section: "Images", type: "image", placeholder: "/assets/story1.jpg" },
  { key: "storyImage2", label: "Story Image 2", section: "Images", type: "image", placeholder: "/assets/story2.jpg" },
  { key: "beforeImage", label: "Before Image", section: "Images", type: "image", placeholder: "/assets/before.jpg" },
  { key: "afterImage", label: "After Image", section: "Images", type: "image", placeholder: "/assets/after.jpg" },
  { key: "gallery1Image", label: "Gallery Image 1", section: "Images", type: "image", placeholder: "/assets/gallery1.jpg" },
  { key: "gallery2Image", label: "Gallery Image 2", section: "Images", type: "image", placeholder: "/assets/gallery2.jpg" },
  { key: "gallery3Image", label: "Gallery Image 3", section: "Images", type: "image", placeholder: "/assets/gallery3.jpg" },
  { key: "gallery4Image", label: "Gallery Image 4", section: "Images", type: "image", placeholder: "/assets/gallery4.jpg" },
  { key: "gallery5Image", label: "Gallery Image 5", section: "Images", type: "image", placeholder: "/assets/gallery5.jpg" },
  { key: "gallery6Image", label: "Gallery Image 6", section: "Images", type: "image", placeholder: "/assets/gallery6.jpg" },
  { key: "bottomImage", label: "Bottom Section Image", section: "Images", type: "image", placeholder: "/assets/bottom.jpg" },
  { key: "woodNavImage", label: "Footer Wood Image", section: "Images", type: "image", placeholder: "/assets/wood-nav.jpg" },
];

const SECTIONS = ["Hero & CTA", "Story", "Signup", "Footer", "Images"];

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStatus, setAuthStatus] = useState("Checking admin session...");
  const [content, setContent] = useState({});
  const [initialContent, setInitialContent] = useState({});
  const [status, setStatus] = useState("Loading content...");
  const [saveWarnings, setSaveWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState([]);
  const [subscriberStatus, setSubscriberStatus] = useState("Loading subscribers...");

  const hasChanges = useMemo(() => JSON.stringify(content) !== JSON.stringify(initialContent), [content, initialContent]);

  async function loadContent() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/content");
      const data = await response.json();
      if (!response.ok || !data?.ok) {
        setStatus(data?.message || "Unable to load content.");
        return;
      }
      setContent(data.content || {});
      setInitialContent(data.content || {});
      setStatus("Content loaded.");
    } catch {
      setStatus("Network error while loading content.");
    } finally {
      setLoading(false);
    }
  }

  async function loadSubscribers() {
    try {
      const response = await fetch("/api/admin/subscribers");
      const data = await response.json();
      if (!response.ok || !data?.ok) {
        setSubscriberStatus(data?.message || "Unable to load subscribers.");
        return;
      }
      setSubscribers(data.subscribers || []);
      setSubscriberStatus(`Loaded ${data.count || 0} subscribers.`);
    } catch {
      setSubscriberStatus("Network error while loading subscribers.");
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const response = await fetch("/api/admin/session");
        if (!response.ok) {
          setIsAuthenticated(false);
          setAuthStatus("Enter password to access admin.");
          setLoading(false);
          return;
        }
        setIsAuthenticated(true);
        setAuthStatus("Authenticated");
        await Promise.all([loadContent(), loadSubscribers()]);
      } catch {
        setIsAuthenticated(false);
        setAuthStatus("Network error while checking session.");
        setLoading(false);
      }
    }

    init();
  }, []);

  const onFieldChange = (key, value) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const saveContent = async () => {
    setStatus("Saving...");
    setSaveWarnings([]);
    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) {
        setStatus(data?.message || "Unable to save content.");
        return;
      }
      setContent(data.content || content);
      setInitialContent(data.content || content);
      setSaveWarnings(Array.isArray(data.warnings) ? data.warnings : []);
      setStatus(data.message || "Saved successfully. Front page can be refreshed now.");
    } catch {
      setStatus("Network error while saving content.");
    }
  };

  const downloadCsv = async () => {
    setSubscriberStatus("Preparing CSV...");
    try {
      const response = await fetch("/api/admin/subscribers?format=csv");
      if (!response.ok) {
        const maybeJson = await response.json().catch(() => null);
        setSubscriberStatus(maybeJson?.message || "Unable to download CSV.");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setSubscriberStatus("CSV downloaded.");
    } catch {
      setSubscriberStatus("Network error while downloading CSV.");
    }
  };

  const login = async () => {
    setAuthStatus("Signing in...");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        setAuthStatus(data?.message || "Invalid password.");
        return;
      }

      setIsAuthenticated(true);
      setAuthStatus("Authenticated");
      setPassword("");
      await Promise.all([loadContent(), loadSubscribers()]);
    } catch {
      setAuthStatus("Network error while logging in.");
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    setIsAuthenticated(false);
    setAuthStatus("Signed out.");
    setContent({});
    setInitialContent({});
    setSubscribers([]);
    setStatus("Loading content...");
    setSubscriberStatus("Loading subscribers...");
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1320px] bg-[#fdf9f1] px-4 py-8 text-[#53280d] md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Write Quest Admin CMS</h1>
          <p className="mt-2 text-sm text-[#6d5a4a]">Edit content and images with structured fields.</p>
        </div>
        <a href="/" target="_blank" rel="noreferrer" className="rounded border border-[#8f7d6a] px-4 py-2 text-sm">Open Front Page</a>
      </div>

      <section className="mt-6 rounded-xl border border-[#cdbda9] bg-[#fffaf3] p-4">
        <h2 className="text-xl font-semibold">Admin Access</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="h-10 w-[360px] max-w-full rounded border border-[#8f7d6a] bg-white px-3"
          />
          {!isAuthenticated ? (
            <button type="button" onClick={login} className="rounded bg-[#f7931e] px-4 py-2 font-semibold text-[#3d240f]">Sign in</button>
          ) : (
            <>
              <button type="button" onClick={() => { loadContent(); loadSubscribers(); }} className="rounded border border-[#8f7d6a] px-4 py-2">Reload</button>
              <button type="button" onClick={logout} className="rounded bg-[#53280d] px-4 py-2 font-semibold text-[#fff9b9]">Sign out</button>
            </>
          )}
        </div>
        <p className="mt-2 text-sm text-[#6d5a4a]">{authStatus}</p>
      </section>

      {isAuthenticated ? (
        <>
      <section className="mt-6 rounded-xl border border-[#cdbda9] bg-[#fffaf3] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Landing Content</h2>
          <div className="flex items-center gap-3">
            <span className={`text-sm ${hasChanges ? "text-[#a4510f]" : "text-[#5f8a3d]"}`}>{hasChanges ? "Unsaved changes" : "All changes saved"}</span>
            <button
              type="button"
              onClick={saveContent}
              disabled={loading}
              className="rounded bg-[#f7931e] px-4 py-2 font-semibold text-[#3d240f] disabled:opacity-60"
            >
              Save Content
            </button>
          </div>
        </div>
        <p className="mt-2 text-sm text-[#6d5a4a]">{status}</p>
        {saveWarnings.length ? (
          <div className="mt-3 rounded border border-[#e7c69f] bg-[#fff3e3] p-3 text-sm text-[#7b4a19]">
            <p className="font-semibold">Some fields were auto-corrected:</p>
            <ul className="mt-1 list-disc pl-5">
              {saveWarnings.map((warning, idx) => (
                <li key={`${warning}-${idx}`}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-5 space-y-6">
          {SECTIONS.map((section) => {
            const fields = FIELDS.filter((field) => field.section === section);
            return (
              <div key={section} className="rounded-lg border border-[#e0d4c5] bg-[#fffefb] p-4">
                <h3 className="text-lg font-semibold text-[#5f3b22]">{section}</h3>
                <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {fields.map((field) => {
                    const value = content[field.key] || "";
                    const hasImageValue = field.type === "image" && typeof value === "string" && value.trim().length > 0;
                    return (
                      <label key={field.key} className="block">
                        <span className="mb-1 block text-sm font-semibold text-[#5f3b22]">{field.label}</span>
                        {field.type === "textarea" ? (
                          <textarea
                            rows={field.rows || 3}
                            value={value}
                            onChange={(e) => onFieldChange(field.key, e.target.value)}
                            placeholder={field.placeholder || ""}
                            className="w-full rounded border border-[#b6a48f] bg-white p-2 text-sm"
                          />
                        ) : (
                          <input
                            type={field.type === "url" ? "url" : "text"}
                            value={value}
                            onChange={(e) => onFieldChange(field.key, e.target.value)}
                            placeholder={field.placeholder || ""}
                            className="w-full rounded border border-[#b6a48f] bg-white p-2 text-sm"
                          />
                        )}
                        {field.helpText ? <span className="mt-1 block text-xs text-[#8b7b6b]">{field.helpText}</span> : null}
                        {hasImageValue ? (
                          <img
                            src={value}
                            alt={field.label}
                            className="mt-2 h-[120px] w-full rounded object-cover"
                            onError={(e) => {
                              e.currentTarget.style.visibility = "hidden";
                            }}
                            onLoad={(e) => {
                              e.currentTarget.style.visibility = "visible";
                            }}
                          />
                        ) : null}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-[#cdbda9] bg-[#fffaf3] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Subscribers</h2>
          <div className="flex gap-2">
            <button type="button" onClick={() => loadSubscribers()} className="rounded border border-[#8f7d6a] px-4 py-2">Refresh</button>
            <button type="button" onClick={downloadCsv} className="rounded bg-[#f7931e] px-4 py-2 font-semibold text-[#3d240f]">Download CSV</button>
          </div>
        </div>
        <p className="mt-2 text-sm text-[#6d5a4a]">{subscriberStatus}</p>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#d2c2ae]">
                <th className="px-2 py-2">Email</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((row) => (
                <tr key={row.id} className="border-b border-[#eadfd2]">
                  <td className="px-2 py-2">{row.email}</td>
                  <td className="px-2 py-2">{row.status}</td>
                  <td className="px-2 py-2">{row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}</td>
                </tr>
              ))}
              {!subscribers.length ? (
                <tr>
                  <td colSpan={3} className="px-2 py-4 text-[#857261]">No subscribers yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
        </>
      ) : null}
    </main>
  );
}
