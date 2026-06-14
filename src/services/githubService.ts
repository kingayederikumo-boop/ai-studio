import axios, { AxiosError } from "axios";
import type {
  GitHubRepository,
  GitHubFile,
  GitHubCommit,
} from "@/src/types/index";

export type GitHubResponse<T = unknown> = {
  ok: boolean;
  payload?: T;
  error?: string;
};

const GITHUB_API_BASE = "https://api.github.com";

function getAuthToken(): string | null {
  // Read tokens at request time for Vercel environment
  const GITHUB_TOKEN_CLASSIC = process.env.GITHUB_TOKEN_CLASSIC;
  const GITHUB_TOKEN_FINE_GRAINED = process.env.GITHUB_TOKEN_FINE_GRAINED;
  return GITHUB_TOKEN_CLASSIC || GITHUB_TOKEN_FINE_GRAINED || null;
}

function getHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  };

  if (token) {
    headers.Authorization = `token ${token}`;
  }

  return headers;
}

function validateGitHubParams(owner: string, repo: string): string[] {
  const errors: string[] = [];
  if (!owner || typeof owner !== 'string') errors.push('Invalid owner: must be non-empty string');
  if (!/^[a-zA-Z0-9_-]+$/.test(owner)) errors.push('Invalid owner format: alphanumeric, underscore, hyphen only');
  if (!repo || typeof repo !== 'string') errors.push('Invalid repo: must be non-empty string');
  if (!/^[a-zA-Z0-9_.-]+$/.test(repo)) errors.push('Invalid repo format: alphanumeric, underscore, hyphen, dot only');
  return errors;
}

async function makeRequest<T>(
  url: string
): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const response = await axios.get<T>(url, {
      headers: getHeaders(),
      timeout: 30000,
    });
    return { ok: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error instanceof AxiosError
        ? error.response?.data?.message || error.message || "Unknown error"
        : error instanceof Error
        ? error.message
        : String(error);
    return { ok: false, error: `GitHub API error: ${errorMessage}` };
  }
}

async function makeRequestWithMethod<T>(
  url: string,
  method: "PUT" | "POST" | "DELETE",
  body?: any
): Promise<{ ok: boolean; data?: T; error?: string; status?: number }> {
  try {
    const response = await axios.request<T>({
      url,
      method,
      headers: getHeaders(),
      timeout: 30000,
      data: body,
    });
    return { ok: true, data: response.data, status: response.status };
  } catch (error) {
    const errorMessage =
      error instanceof AxiosError
        ? error.response?.data?.message || error.message || "Unknown error"
        : error instanceof Error
        ? error.message
        : String(error);
    const status = error instanceof AxiosError ? error.response?.status : undefined;
    return { ok: false, error: `GitHub API error: ${errorMessage}`, status };
  }
}

export const GitHubService = {
  async listRepositories(): Promise<GitHubResponse<GitHubRepository[]>> {
    const token = getAuthToken();
    if (!token) {
      return {
        ok: false,
        error: "GitHub API token not configured",
        payload: [],
      };
    }

    const result = await makeRequest<
      Array<{
        id: number;
        name: string;
        full_name: string;
        description: string | null;
        private: boolean;
      }>
    >(`${GITHUB_API_BASE}/user/repos?per_page=100`);

    if (!result.ok) {
      return {
        ok: false,
        error: result.error,
        payload: [],
      };
    }

    const repos: GitHubRepository[] = (result.data || []).map((r) => ({
      id: String(r.id),
      name: r.name,
      fullName: r.full_name,
      description: r.description || undefined,
      private: r.private,
    }));

    return { ok: true, payload: repos };
  },

  async getRepositoryDetails(
    owner: string,
    repo: string
  ): Promise<GitHubResponse<GitHubRepository | null>> {
    const token = getAuthToken();
    if (!token) {
      return {
        ok: false,
        error: "GitHub API token not configured",
        payload: null,
      };
    }

    const errors = validateGitHubParams(owner, repo);
    if (errors.length > 0) {
      return {
        ok: false,
        error: `Invalid parameters: ${errors.join('; ')}`,
        payload: null,
      };
    }

    const result = await makeRequest<{
      id: number;
      name: string;
      full_name: string;
      description: string | null;
      private: boolean;
    }>(`${GITHUB_API_BASE}/repos/${owner}/${repo}`);

    if (!result.ok) {
      return {
        ok: false,
        error: result.error,
        payload: null,
      };
    }

    if (!result.data) {
      return {
        ok: false,
        error: "Repository not found",
        payload: null,
      };
    }

    const repo_data: GitHubRepository = {
      id: String(result.data.id),
      name: result.data.name,
      fullName: result.data.full_name,
      description: result.data.description || undefined,
      private: result.data.private,
    };

    return { ok: true, payload: repo_data };
  },

  async listFiles(
    owner: string,
    repo: string,
    path = ""
  ): Promise<GitHubResponse<GitHubFile[]>> {
    const token = getAuthToken();
    if (!token) {
      return {
        ok: false,
        error: "GitHub API token not configured",
        payload: [],
      };
    }

    const errors = validateGitHubParams(owner, repo);
    if (errors.length > 0) {
      return {
        ok: false,
        error: `Invalid parameters: ${errors.join('; ')}`,
        payload: [],
      };
    }

    const filePath = path ? `/${path}` : "";
    const result = await makeRequest<
      Array<{
        name: string;
        path: string;
        type: "file" | "dir";
        size?: number;
      }>
    >(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents${filePath}`);

    if (!result.ok) {
      return {
        ok: false,
        error: result.error,
        payload: [],
      };
    }

    const files: GitHubFile[] = (result.data || []).map((f) => ({
      path: f.path,
      name: f.name,
      type: f.type,
      size: f.size,
    }));

    return { ok: true, payload: files };
  },

  async listCommits(
    owner: string,
    repo: string
  ): Promise<GitHubResponse<GitHubCommit[]>> {
    const token = getAuthToken();
    if (!token) {
      return {
        ok: false,
        error: "GitHub API token not configured",
        payload: [],
      };
    }

    const errors = validateGitHubParams(owner, repo);
    if (errors.length > 0) {
      return {
        ok: false,
        error: `Invalid parameters: ${errors.join('; ')}`,
        payload: [],
      };
    }

    const result = await makeRequest<
      Array<{
        sha: string;
        commit: {
          message: string;
          author?: {
            name: string;
            date: string;
          };
        };
      }>
    >(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=100`
    );

    if (!result.ok) {
      return {
        ok: false,
        error: result.error,
        payload: [],
      };
    }

    const commits: GitHubCommit[] = (result.data || []).map((c) => ({
      sha: c.sha,
      message: c.commit.message,
      author: c.commit.author?.name,
      date: c.commit.author?.date || new Date().toISOString(),
    }));

    return { ok: true, payload: commits };
  },

  // === New write methods ===
  async getFileSha(
    owner: string,
    repo: string,
    path: string
  ): Promise<{ ok: boolean; sha?: string; error?: string }> {
    const errors = validateGitHubParams(owner, repo);
    if (errors.length > 0) {
      return { ok: false, error: `Invalid parameters: ${errors.join('; ')}` };
    }

    const res = await makeRequest<any>(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodeURIComponent(
        path
      )}`
    );
    if (!res.ok) return { ok: false, error: res.error };
    if (!res.data) return { ok: false, error: "no data" };
    return { ok: true, sha: res.data.sha };
  },

  async createOrUpdateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch = "main"
  ): Promise<GitHubResponse<{ commitUrl?: string }>> {
    const token = getAuthToken();
    if (!token) return { ok: false, error: "GitHub API token not configured" };

    const errors = validateGitHubParams(owner, repo);
    if (errors.length > 0) {
      return { ok: false, error: `Invalid parameters: ${errors.join('; ')}` };
    }

    try {
      // Try to get existing file sha
      const getRes = await makeRequest<any>(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodeURIComponent(
          path
        )}`
      );

      const sha = getRes.ok && getRes.data?.sha ? getRes.data.sha : undefined;
      const encoded = Buffer.from(content).toString("base64");

      const body: any = {
        message,
        content: encoded,
        branch,
      };
      if (sha) body.sha = sha;

      const putRes = await makeRequestWithMethod<any>(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodeURIComponent(
          path
        )}`,
        "PUT",
        body
      );

      if (!putRes.ok) return { ok: false, error: putRes.error };
      return { ok: true, payload: { commitUrl: putRes.data?.content?.html_url } };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      return { ok: false, error: errMsg };
    }
  },

  async deleteFile(
    owner: string,
    repo: string,
    path: string,
    message: string,
    branch = "main"
  ): Promise<GitHubResponse<{}>> {
    const token = getAuthToken();
    if (!token) return { ok: false, error: "GitHub API token not configured" };

    const errors = validateGitHubParams(owner, repo);
    if (errors.length > 0) {
      return { ok: false, error: `Invalid parameters: ${errors.join('; ')}` };
    }

    try {
      const getRes = await makeRequest<any>(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodeURIComponent(
          path
        )}`
      );
      if (!getRes.ok) return { ok: false, error: getRes.error };
      const sha = getRes.data?.sha;
      if (!sha) return { ok: false, error: "file sha not found" };

      const delRes = await makeRequestWithMethod<any>(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodeURIComponent(
          path
        )}`,
        "DELETE",
        { message, sha, branch }
      );

      if (!delRes.ok) return { ok: false, error: delRes.error };
      return { ok: true };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      return { ok: false, error: errMsg };
    }
  },

  async createBranch(
    owner: string,
    repo: string,
    branchName: string,
    from = "main"
  ): Promise<GitHubResponse<{ ref?: string }>> {
    const token = getAuthToken();
    if (!token) return { ok: false, error: "GitHub API token not configured" };

    const errors = validateGitHubParams(owner, repo);
    if (errors.length > 0) {
      return { ok: false, error: `Invalid parameters: ${errors.join('; ')}` };
    }

    try {
      // get ref for base
      const refRes = await makeRequest<any>(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(
          from
        )}`
      );
      if (!refRes.ok) return { ok: false, error: refRes.error };
      const sha = refRes.data?.object?.sha || refRes.data?.sha;
      if (!sha) return { ok: false, error: "base sha not found" };

      const postRes = await makeRequestWithMethod<any>(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/refs`,
        "POST",
        { ref: `refs/heads/${branchName}`, sha }
      );

      if (!postRes.ok) return { ok: false, error: postRes.error };
      return { ok: true, payload: { ref: postRes.data?.ref } };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      return { ok: false, error: errMsg };
    }
  },

  async createPullRequest(
    owner: string,
    repo: string,
    head: string,
    base = "main",
    title?: string,
    body?: string
  ): Promise<GitHubResponse<{ url?: string }>> {
    const token = getAuthToken();
    if (!token) return { ok: false, error: "GitHub API token not configured" };

    const errors = validateGitHubParams(owner, repo);
    if (errors.length > 0) {
      return { ok: false, error: `Invalid parameters: ${errors.join('; ')}` };
    }

    try {
      const postRes = await makeRequestWithMethod<any>(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls`,
        "POST",
        { title: title || `Automated PR: ${head} -> ${base}`, head, base, body }
      );

      if (!postRes.ok) return { ok: false, error: postRes.error };
      return { ok: true, payload: { url: postRes.data?.html_url } };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      return { ok: false, error: errMsg };
    }
  },
};
