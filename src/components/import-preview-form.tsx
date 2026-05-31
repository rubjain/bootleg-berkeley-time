"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/badge";

type PreviewResponse =
  | {
      preview: {
        status: string;
        importer?: string;
        message?: string;
        parsed?: {
          parserStatus: string;
          confidence: string;
          notes?: string;
          categories: Array<{
            title: string;
            description?: string;
            rules: Array<{
              title: string;
              description?: string;
              courseCodes: string[];
              minSelect?: number;
              allowedDepartmentCodes?: string[];
              allowedTags?: string[];
              sourceRefText?: string;
            }>;
          }>;
        };
      };
    }
  | { error: string };

function hasPreview(
  result: PreviewResponse | null
): result is Extract<PreviewResponse, { preview: unknown }> {
  return Boolean(result && "preview" in result);
}

export function ImportPreviewForm() {
  const [sourceUrl, setSourceUrl] = useState("https://guide.berkeley.edu/undergraduate/degree-programs/data-science/");
  const [html, setHtml] = useState("");
  const [result, setResult] = useState<PreviewResponse | null>(null);
  const [pending, startTransition] = useTransition();

  const preview = hasPreview(result) ? result.preview : undefined;
  const parsed = preview?.parsed;

  return (
    <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-[#19212f]">Preview requirement importer</h2>
      <p className="mt-2 text-sm leading-6 text-[#4b5668]">
        Test whether a source URL resolves to a known parser before running a reviewed import workflow.
      </p>
      <div className="mt-5 flex flex-col gap-3">
        <input
          value={sourceUrl}
          onChange={(event) => setSourceUrl(event.target.value)}
          className="w-full rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(247,243,235,0.7)] px-4 py-3 text-sm outline-none focus:border-[#2f6f6a]"
        />
        <textarea
          value={html}
          onChange={(event) => setHtml(event.target.value)}
          placeholder="Optional: paste Berkeley requirement page HTML to preview structured parsing."
          className="min-h-44 w-full rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(247,243,235,0.7)] px-4 py-3 text-sm outline-none focus:border-[#2f6f6a]"
        />
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() =>
              startTransition(async () => {
                const response = await fetch("/api/admin/imports/preview", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    sourceUrl,
                    html: html.trim() ? html : undefined
                  })
                });
                const payload = (await response.json()) as PreviewResponse;
                setResult(payload);
              })
            }
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            disabled={pending}
          >
            {pending ? "Previewing..." : "Preview"}
          </button>
        </div>
      </div>
      {preview ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-2xl bg-[rgba(36,48,71,0.05)] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{preview.status}</Badge>
              {preview.importer ? <Badge tone="official">{preview.importer}</Badge> : null}
              {parsed?.parserStatus ? <Badge>{parsed.parserStatus}</Badge> : null}
              {parsed?.confidence ? <Badge tone="official">{parsed.confidence}</Badge> : null}
              {parsed ? <Badge>{parsed.categories.length} categories</Badge> : null}
            </div>
            {preview.message ? <p className="mt-3 text-sm text-[#4b5668]">{preview.message}</p> : null}
            {parsed?.notes ? <p className="mt-3 text-sm leading-6 text-[#4b5668]">{parsed.notes}</p> : null}
          </div>

          {parsed?.categories.length ? (
            <div className="grid gap-4">
              {parsed.categories.map((category) => (
                <div key={category.title} className="rounded-2xl border border-[rgba(39,50,71,0.12)] bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-semibold text-[#19212f]">{category.title}</h3>
                    <Badge>{category.rules.length} rules</Badge>
                  </div>
                  {category.description ? <p className="mt-2 text-sm leading-6 text-[#4b5668]">{category.description}</p> : null}
                  <div className="mt-4 space-y-3">
                    {category.rules.map((rule) => (
                      <div key={`${category.title}-${rule.title}`} className="rounded-2xl bg-[rgba(36,48,71,0.05)] p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-[#19212f]">{rule.title}</p>
                          {rule.minSelect ? <Badge>Choose {rule.minSelect}</Badge> : null}
                        </div>
                        {rule.description ? <p className="mt-2 text-sm leading-6 text-[#4b5668]">{rule.description}</p> : null}
                        {rule.courseCodes.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {rule.courseCodes.map((courseCode) => (
                              <Badge key={courseCode}>{courseCode}</Badge>
                            ))}
                          </div>
                        ) : null}
                        {rule.allowedDepartmentCodes?.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {rule.allowedDepartmentCodes.map((departmentCode) => (
                              <Badge key={departmentCode} tone="official">
                                Dept {departmentCode}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                        {rule.allowedTags?.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {rule.allowedTags.map((tag) => (
                              <Badge key={tag}>{tag}</Badge>
                            ))}
                          </div>
                        ) : null}
                        {rule.sourceRefText ? <p className="mt-3 text-xs text-[#6a7383]">{rule.sourceRefText}</p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      {!preview && result ? (
        <pre className="mt-5 overflow-x-auto rounded-2xl bg-[#243047] p-4 text-xs leading-6 text-[#f7f3eb]">
          {JSON.stringify(result, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
