import express from "express";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { createServer as createViteServer } from "vite";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  const GITHUB_API_URL = 'https://api.github.com';
  
  // OAuth Implementation
  const getRedirectUri = (req: any) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers.host || `localhost:${PORT}`;
    return `${protocol}://${host}/auth/callback`;
  };

  app.get('/api/auth/url', (req, res) => {
    const redirectUri = getRedirectUri(req);
    
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID || '',
      redirect_uri: redirectUri,
      scope: 'read:user',
    });
    
    res.json({ url: `https://github.com/login/oauth/authorize?${params}` });
  });

  app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).send("No code provided");
    }

    try {
      const redirectUri = getRedirectUri(req);
      
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenRes.json();
      
      if (tokenData.error) {
        throw new Error(tokenData.error_description || tokenData.error);
      }

      const accessToken = tokenData.access_token;
      
      // Fetch user profile
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });
      
      const userData = await userRes.json();
      
      if (!userData.login) {
         throw new Error("GitHub payload is invalid: " + JSON.stringify(userData));
      }

      // Create session
      const token = jwt.sign(
        { login: userData.login, name: userData.name, avatar_url: userData.avatar_url, access_token: accessToken },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: '${token}', user: ${JSON.stringify({ login: userData.login, name: userData.name, avatar_url: userData.avatar_url })} }, '*');
                window.close();
              } else {
                document.write('Authentication successful, but could not find original window.');
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (e: any) {
      console.error('OAuth error:', e);
      res.status(500).send(`
        <html><body>
          <h2>Authentication failed</h2>
          <p>${e.message || String(e)}</p>
        </body></html>
      `);
    }
  });

  const extractToken = (req: express.Request) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return req.cookies?.auth_token; // Fallback
  };

  app.get('/api/auth/me', (req, res) => {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      res.json({
        login: decoded.login,
        name: decoded.name,
        avatar_url: decoded.avatar_url
      });
    } catch (e) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true });
  });

  app.get('/api/github/users/:username', async (req, res) => {
    try {
      const headers: Record<string, string> = {};
      if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
      } else {
        console.warn("GITHUB_TOKEN is not set in environment.");
      }
      
      const { username } = req.params;
      const response = await fetch(`${GITHUB_API_URL}/users/${username}`, { headers });
      
      if (!response.ok) {
        let errData;
        try { errData = await response.json(); } catch(e){}
        if (response.status === 404) {
          return res.status(404).json({ error: "해당 유저를 찾을 수 없습니다!", details: errData });
        }
        if (response.status === 403 || response.status === 401) {
          return res.status(response.status).json({ error: "GitHub API 권한 오류 또는 일일 요청 한도 초과입니다. GitHub Token을 확인해주세요.", details: errData });
        }
        return res.status(500).json({ error: "데이터를 불러오는데 실패했습니다.", details: errData });
      }
      
      const data = await response.json();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: "서버 처리 중 오류가 발생했습니다.", details: e.message });
    }
  });

  app.get('/api/github/users/:username/repos', async (req, res) => {
    try {
      const headers: Record<string, string> = {};
      if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
      }
      
      const { username } = req.params;
      const perPage = Number(req.query.per_page) || 100;
      const page = Number(req.query.page) || 1;
      
      const response = await fetch(`${GITHUB_API_URL}/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated`, { headers });
      
      if (!response.ok) {
        let errData;
        try { errData = await response.json(); } catch(e){}
        if (response.status === 403 || response.status === 401) {
          return res.status(response.status).json({ error: "GitHub API 권한 오류 또는 일일 요청 한도 초과입니다.", details: errData });
        }
        return res.status(500).json({ error: "저장소 데이터를 불러오는데 실패했습니다.", details: errData });
      }
      
      const data = await response.json();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: "서버 처리 중 오류가 발생했습니다.", details: e.message });
    }
  });

  // In-memory bookmark store mapping user's GitHub login -> array of bookmarked users
  const userBookmarks = new Map<string, any[]>();

  app.get('/api/bookmarks', (req, res) => {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const bookmarks = userBookmarks.get(decoded.login) || [];
      res.json(bookmarks);
    } catch (e) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  app.post('/api/bookmarks', (req, res) => {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const { bookmark } = req.body;
      const bookmarks = userBookmarks.get(decoded.login) || [];
      
      // Check if already bookmarked
      if (!bookmarks.find((b: any) => b.login === bookmark.login)) {
        bookmarks.push(bookmark);
        userBookmarks.set(decoded.login, bookmarks);
      }
      res.json(bookmarks);
    } catch (e) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  app.delete('/api/bookmarks/:username', (req, res) => {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const { username } = req.params;
      let bookmarks = userBookmarks.get(decoded.login) || [];
      
      bookmarks = bookmarks.filter((b: any) => b.login !== username);
      userBookmarks.set(decoded.login, bookmarks);
      res.json(bookmarks);
    } catch (e) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  app.put('/api/bookmarks', (req, res) => {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const { bookmarks } = req.body;
      userBookmarks.set(decoded.login, bookmarks);
      res.json(bookmarks);
    } catch (e) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
