import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

const GITHUB_API_URL = 'https://api.github.com';

app.get('/api/github/users/:username', async (req, res) => {
  try {
    const headers: Record<string, string> = {};
    if (process.env.GITHUB_TOKEN) {
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
    if (process.env.GITHUB_TOKEN) {
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

export default app;
