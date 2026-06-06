import express from "express";
import cors from "cors";
import path from "path";
import os from "os";

const app = express();
app.use(cors());
app.use(express.json());

const BOOKMARKS_FILE = path.join(os.tmpdir(), "bookmarks.json");

async function readBookmarks() {
  try {
    const fs = await import("fs/promises");
    const data = await fs.readFile(BOOKMARKS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

async function writeBookmarks(db: any) {
  try {
    const fs = await import("fs/promises");
    await fs.writeFile(BOOKMARKS_FILE, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error("Failed to write bookmarks:", e);
  }
}

const GITHUB_API_URL = 'https://api.github.com';

app.get('/api/github/users/:username', async (req, res) => {
  try {
    const headers: Record<string, string> = {};
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    } else if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    
    const { username } = req.params;
    const response = await fetch(`${GITHUB_API_URL}/users/${username}`, { headers });
    
    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: "해당 유저를 찾을 수 없습니다!" });
      }
      if (response.status === 403) {
        return res.status(403).json({ error: "GitHub API 일일 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요." });
      }
      return res.status(500).json({ error: "데이터를 불러오는데 실패했습니다." });
    }
    
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "서버 처리 중 오류가 발생했습니다." });
  }
});

app.get('/api/github/users/:username/repos', async (req, res) => {
  try {
    const headers: Record<string, string> = {};
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    } else if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    
    const { username } = req.params;
    const perPage = Number(req.query.per_page) || 100;
    const page = Number(req.query.page) || 1;
    
    const response = await fetch(`${GITHUB_API_URL}/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated`, { headers });
    
    if (!response.ok) {
      if (response.status === 403) {
        return res.status(403).json({ error: "GitHub API 일일 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요." });
      }
      return res.status(500).json({ error: "저장소 데이터를 불러오는데 실패했습니다." });
    }
    
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "서버 처리 중 오류가 발생했습니다." });
  }
});

app.get("/api/bookmarks/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const db = await readBookmarks();
    res.json(db[username] || []);
  } catch (e: any) {
    console.error("bookmarks GET err:", e);
    res.status(500).json({ error: e.message || "Internal error" });
  }
});

app.post("/api/bookmarks/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const { bookmarks } = req.body;
    const db = await readBookmarks();
    db[username] = bookmarks || [];
    await writeBookmarks(db);
    res.json({ success: true });
  } catch (e: any) {
    console.error("bookmarks POST err:", e);
    res.status(500).json({ error: e.message || "Internal error" });
  }
});

app.get('/api/auth/url', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const redirectUri = `${protocol}://${host}/api/auth/callback`;

  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  
  if (!clientId || clientId === 'dummy_client_id_for_testing') {
    return res.status(500).json({ error: "환경 변수 설정 오류: GITHUB_CLIENT_ID가 비어있습니다. Vercel 환경 변수를 확인해주세요." });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'repo user',
  });

  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
  res.json({ url: authUrl });
});

app.get('/api/auth/callback', async (req, res) => {
  const code = req.query.code as string;
  if (!code) {
    return res.status(400).send('Missing code');
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.status(401).send('Failed to obtain token');
    }

    res.redirect(`/?token=${accessToken}`);
  } catch (error) {
    console.error('Error exchanging token:', error);
    res.status(500).send('Authentication failed');
  }
});

export default app;
