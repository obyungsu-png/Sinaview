import { Hono } from "npm:hono@4";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "npm:@aws-sdk/client-s3@3";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3";
import OpenAI from "npm:openai";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono();

// S3 클라이언트 초기화
const s3Client = new S3Client({
  region: Deno.env.get("AWS_REGION") || "ap-northeast-2",
  credentials: {
    accessKeyId: Deno.env.get("AWS_ACCESS_KEY_ID") || "",
    secretAccessKey: Deno.env.get("AWS_SECRET_ACCESS_KEY") || "",
  },
});

const S3_BUCKET = Deno.env.get("AWS_S3_BUCKET") || "china-up-storage";

// Logger
app.use('*', logger(console.log));

// CORS configuration
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

// Health check endpoint
app.get("/make-server-c6687586/health", (c) => {
  return c.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Korea Up Portal"
  });
});

// Test endpoint
app.get("/make-server-c6687586/test", (c) => {
  return c.json({ 
    message: "Server is working!",
    endpoints: [
      "/make-server-c6687586/health",
      "/make-server-c6687586/test"
    ]
  });
});

// ===== 댓글 API =====

// 댓글 목록 조회 (특정 페이지/아이템)
app.get("/make-server-c6687586/comments/:pageType/:itemId", async (c) => {
  try {
    const pageType = c.req.param("pageType"); // 'market', 'community', 'driver-license' 등
    const itemId = c.req.param("itemId");
    const key = `comments:${pageType}:${itemId}`;
    
    const comments = await kv.get(key) || [];
    
    return c.json({ 
      success: true,
      comments: comments,
      count: comments.length 
    });
  } catch (error) {
    console.error(`Error fetching comments: ${error.message}`);
    return c.json({ 
      success: false,
      error: error.message 
    }, 500);
  }
});

// 댓글 작성 (회원만 가능)
app.post("/make-server-c6687586/comments/:pageType/:itemId", async (c) => {
  try {
    const pageType = c.req.param("pageType");
    const itemId = c.req.param("itemId");
    const body = await c.req.json();
    
    const { content, author, userId } = body;
    
    // 회원 확인 (간단한 체크)
    if (!userId || !author) {
      return c.json({ 
        success: false,
        error: "로그인이 필요합니다." 
      }, 401);
    }
    
    const key = `comments:${pageType}:${itemId}`;
    const comments = await kv.get(key) || [];
    
    const newComment = {
      id: Date.now().toString(),
      author,
      userId,
      content,
      date: new Date().toISOString(),
      likes: 0,
      replies: [],
      createdAt: Date.now()
    };
    
    comments.push(newComment);
    await kv.set(key, comments);
    
    return c.json({ 
      success: true,
      comment: newComment 
    });
  } catch (error) {
    console.error(`Error creating comment: ${error.message}`);
    return c.json({ 
      success: false,
      error: error.message 
    }, 500);
  }
});

// 대댓글 작성
app.post("/make-server-c6687586/comments/:pageType/:itemId/:commentId/reply", async (c) => {
  try {
    const pageType = c.req.param("pageType");
    const itemId = c.req.param("itemId");
    const commentId = c.req.param("commentId");
    const body = await c.req.json();
    
    const { content, author, userId } = body;
    
    if (!userId || !author) {
      return c.json({ 
        success: false,
        error: "로그인이 필요합니다." 
      }, 401);
    }
    
    const key = `comments:${pageType}:${itemId}`;
    const comments = await kv.get(key) || [];
    
    const newReply = {
      id: Date.now().toString(),
      author,
      userId,
      content,
      date: new Date().toISOString(),
      likes: 0,
      createdAt: Date.now()
    };
    
    const updatedComments = comments.map((comment: any) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply]
        };
      }
      return comment;
    });
    
    await kv.set(key, updatedComments);
    
    return c.json({ 
      success: true,
      reply: newReply 
    });
  } catch (error) {
    console.error(`Error creating reply: ${error.message}`);
    return c.json({ 
      success: false,
      error: error.message 
    }, 500);
  }
});

// 대댓글 삭제
app.delete("/make-server-c6687586/comments/:pageType/:itemId/:commentId/reply/:replyId", async (c) => {
  try {
    const pageType = c.req.param("pageType");
    const itemId = c.req.param("itemId");
    const commentId = c.req.param("commentId");
    const replyId = c.req.param("replyId");
    
    const key = `comments:${pageType}:${itemId}`;
    const comments = await kv.get(key) || [];
    
    const updatedComments = comments.map((comment: any) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: (comment.replies || []).filter((reply: any) => reply.id !== replyId)
        };
      }
      return comment;
    });
    
    await kv.set(key, updatedComments);
    
    return c.json({ 
      success: true,
      message: "답글이 삭제되었습니다." 
    });
  } catch (error) {
    console.error(`Error deleting reply: ${error.message}`);
    return c.json({ 
      success: false,
      error: error.message 
    }, 500);
  }
});

// 대댓글 좋아요
app.post("/make-server-c6687586/comments/:pageType/:itemId/:commentId/reply/:replyId/like", async (c) => {
  try {
    const pageType = c.req.param("pageType");
    const itemId = c.req.param("itemId");
    const commentId = c.req.param("commentId");
    const replyId = c.req.param("replyId");
    
    const key = `comments:${pageType}:${itemId}`;
    const comments = await kv.get(key) || [];
    
    const updatedComments = comments.map((comment: any) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: (comment.replies || []).map((reply: any) => {
            if (reply.id === replyId) {
              return { ...reply, likes: (reply.likes || 0) + 1 };
            }
            return reply;
          })
        };
      }
      return comment;
    });
    
    await kv.set(key, updatedComments);
    
    return c.json({ 
      success: true,
      message: "좋아요가 반영되었습니다." 
    });
  } catch (error) {
    console.error(`Error liking reply: ${error.message}`);
    return c.json({ 
      success: false,
      error: error.message 
    }, 500);
  }
});

// 댓글 삭제 (운영자 전용 - CMS에서 사용)
app.delete("/make-server-c6687586/comments/:pageType/:itemId/:commentId", async (c) => {
  try {
    const pageType = c.req.param("pageType");
    const itemId = c.req.param("itemId");
    const commentId = c.req.param("commentId");
    
    const key = `comments:${pageType}:${itemId}`;
    const comments = await kv.get(key) || [];
    
    const filteredComments = comments.filter((comment: any) => comment.id !== commentId);
    await kv.set(key, filteredComments);
    
    return c.json({ 
      success: true,
      message: "댓글이 삭제되었습니다." 
    });
  } catch (error) {
    console.error(`Error deleting comment: ${error.message}`);
    return c.json({ 
      success: false,
      error: error.message 
    }, 500);
  }
});

// 모든 댓글 조회 (CMS 관리용)
app.get("/make-server-c6687586/comments/all", async (c) => {
  try {
    const allComments = await kv.getByPrefix("comments:");
    
    const formattedComments = allComments.map((item: any) => {
      const [_, pageType, itemId] = item.key.split(":");
      return {
        key: item.key,
        pageType,
        itemId,
        comments: item.value,
        count: item.value.length
      };
    });
    
    return c.json({ 
      success: true,
      data: formattedComments,
      total: formattedComments.length
    });
  } catch (error) {
    console.error(`Error fetching all comments: ${error.message}`);
    return c.json({ 
      success: false,
      error: error.message 
    }, 500);
  }
});

// 댓글 좋아요
app.post("/make-server-c6687586/comments/:pageType/:itemId/:commentId/like", async (c) => {
  try {
    const pageType = c.req.param("pageType");
    const itemId = c.req.param("itemId");
    const commentId = c.req.param("commentId");
    
    const key = `comments:${pageType}:${itemId}`;
    const comments = await kv.get(key) || [];
    
    const updatedComments = comments.map((comment: any) => {
      if (comment.id === commentId) {
        return { ...comment, likes: (comment.likes || 0) + 1 };
      }
      return comment;
    });
    
    await kv.set(key, updatedComments);
    
    return c.json({ 
      success: true,
      message: "좋아요가 반영되었습니다." 
    });
  } catch (error) {
    console.error(`Error liking comment: ${error.message}`);
    return c.json({ 
      success: false,
      error: error.message 
    }, 500);
  }
});

// ===== S3 파일 업로드 API =====

// Presigned URL 생성 (클라이언트가 직접 S3에 업로드하도록)
app.post("/make-server-c6687586/s3/presigned-url", async (c) => {
  try {
    const body = await c.req.json();
    const { filename, contentType } = body;
    
    if (!filename) {
      return c.json({ 
        success: false,
        error: "파일명이 필요합니다." 
      }, 400);
    }
    
    const key = `uploads/${filename}`;
    
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: contentType || 'application/octet-stream',
    });
    
    // Presigned URL 생성 (15분 유효)
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    
    return c.json({ 
      success: true,
      presignedUrl,
      key,
      bucket: S3_BUCKET
    });
  } catch (error) {
    console.error(`Error generating presigned URL: ${error.message}`);
    return c.json({ 
      success: false,
      error: error.message 
    }, 500);
  }
});

// S3 파일 삭제
app.delete("/make-server-c6687586/s3/delete", async (c) => {
  try {
    const body = await c.req.json();
    const { key } = body;
    
    if (!key) {
      return c.json({ 
        success: false,
        error: "파일 키가 필요합니다." 
      }, 400);
    }
    
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });
    
    await s3Client.send(command);
    
    return c.json({ 
      success: true,
      message: "파일이 삭제되었습니다." 
    });
  } catch (error) {
    console.error(`Error deleting file from S3: ${error.message}`);
    return c.json({ 
      success: false,
      error: error.message 
    }, 500);
  }
});

// ===== CSM (Content System Management) API =====

// CSM 컨텐츠 조회
app.get("/make-server-c6687586/csm/contents", async (c) => {
  try {
    const key = "csm:contents";
    const contents = await kv.get(key) || [];
    
    return c.json({ 
      success: true,
      contents: contents,
      count: contents.length 
    });
  } catch (error) {
    console.error(`Error fetching CSM contents: ${error.message}`);
    return c.json({ 
      success: false,
      error: error.message 
    }, 500);
  }
});

// CSM 컨텐츠 저장 (전체 덮어쓰기)
app.post("/make-server-c6687586/csm/contents", async (c) => {
  try {
    const body = await c.req.json();
    const { contents } = body;
    
    if (!contents) {
      return c.json({ 
        success: false,
        error: "컨텐츠 데이터가 필요합니다." 
      }, 400);
    }
    
    const key = "csm:contents";
    await kv.set(key, contents);
    
    return c.json({ 
      success: true,
      message: "컨텐츠가 저장되었습니다.",
      count: contents.length
    });
  } catch (error) {
    console.error(`Error saving CSM contents: ${error.message}`);
    return c.json({ 
      success: false,
      error: error.message 
    }, 500);
  }
});

// Error handling
app.onError((err, c) => {
  console.error(`Error: ${err.message}`);
  return c.json({ 
    error: err.message,
    status: 'error'
  }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({ 
    error: "Not Found",
    path: c.req.path
  }, 404);
});

// ===== AI API =====

// AI 채팅/답글 생성
app.post("/make-server-c6687586/api/ai-chat", async (c) => {
  try {
    const body = await c.req.json();
    const { message, history } = body;
    
    if (!message) {
      return c.json({ 
        success: false,
        error: "메시지 내용이 필요합니다." 
      }, 400);
    }

    const apiKey = Deno.env.get("GLM_API_KEY");
    
    if (!apiKey) {
      return c.json({
        success: false,
        error: "GLM API 키가 설정되지 않았습니다. 관리자에게 문의하세요."
      }, 500);
    }

    const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "glm-z1-flash",
        reasoning_effort: "high",
        messages: [
          {
            role: "system",
            content: "당신은 중국에 거주하는 한국인(재중 한인)을 위한 생활 도우미 AI입니다. 비자, 거류증, 생활정보, 병원, 부동산, 교육, 교통 등 중국 생활 전반에 대해 한국어로 친절하고 정확하게 답변해주세요. 답변은 간결하고 실용적으로 해주세요."
          },
          ...(history || []),
          { role: "user", content: message }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.choices?.[0]?.message?.content) {
      throw new Error(data.error?.message || `GLM API error: ${response.status}`);
    }

    return c.json({
      success: true,
      reply: data.choices[0].message.content
    });

  } catch (error) {
     console.error(`AI Error: ${error.message}`);
     return c.json({ success: false, error: "AI 답변 생성 중 오류가 발생했습니다: " + error.message }, 500);
  }
});

// ===== 증권: 시세·뉴스 자동 갱신 =====
// 방문자 요청 시 KV 캐시를 먼저 돌려주고, 오래됐으면 새로 가져온다 (별도 cron 불필요)

// 응답을 보낸 뒤에도 백그라운드 작업이 끝까지 돌도록
function runInBackground(task: Promise<unknown>) {
  const p = task.catch((e) => console.error(`Background task error: ${e.message}`));
  try { (globalThis as any).EdgeRuntime?.waitUntil(p); } catch { /* 로컬 실행 등 */ }
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, ms = 8000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

// --- 1) 지수·주가 (텐센트 증권 공개 시세) ---
const QUOTE_SYMBOLS = [
  { code: "sh000001", name: "상하이종합" },
  { code: "sz399001", name: "선전성분" },
  { code: "hkHSI", name: "항셍지수" },
  { code: "hk09988", name: "알리바바" },
  { code: "hk00700", name: "텐센트" },
  { code: "hk09888", name: "바이두" },
  { code: "hk01810", name: "샤오미" },
  { code: "hk01211", name: "BYD" },
];
const QUOTES_KEY = "market:quotes";
const QUOTES_TTL_MS = 5 * 60 * 1000;

// 응답 형식: v_sh000001="1~이름~코드~현재가~전일종가~시가~...";
export function parseTencentQuotes(text: string) {
  const quotes = [];
  for (const { code, name } of QUOTE_SYMBOLS) {
    const m = text.match(new RegExp(`v_${code}="([^"]*)"`));
    if (!m) continue;
    const f = m[1].split("~");
    const price = parseFloat(f[3]);
    const prevClose = parseFloat(f[4]);
    if (!isFinite(price) || !isFinite(prevClose) || prevClose === 0) continue;
    const change = price - prevClose;
    quotes.push({
      code,
      name,
      price,
      change,
      percent: (change / prevClose) * 100,
    });
  }
  return quotes;
}

async function refreshQuotes() {
  const url = `https://qt.gtimg.cn/q=${QUOTE_SYMBOLS.map((s) => s.code).join(",")}`;
  const res = await fetchWithTimeout(url, {}, 5000);
  if (!res.ok) throw new Error(`quotes HTTP ${res.status}`);
  const quotes = parseTencentQuotes(await res.text());
  if (quotes.length === 0) throw new Error("quotes: 파싱된 종목 없음");
  const data = { quotes, updatedAt: new Date().toISOString() };
  await kv.set(QUOTES_KEY, data);
  return data;
}

app.get("/make-server-c6687586/market/quotes", async (c) => {
  const cached = await kv.get(QUOTES_KEY).catch(() => null);
  const fresh = cached && Date.now() - new Date(cached.updatedAt).getTime() < QUOTES_TTL_MS;
  if (fresh) return c.json({ success: true, ...cached });
  try {
    return c.json({ success: true, ...(await refreshQuotes()) });
  } catch (error) {
    console.error(`Quotes refresh failed: ${error.message}`);
    // 실패하면 마지막으로 저장된 값을 그대로 사용
    if (cached) return c.json({ success: true, stale: true, ...cached });
    return c.json({ success: false, error: error.message }, 502);
  }
});

// --- 2) 중국 증권 뉴스 → GLM 한국어 요약 ---
// 시나 재경 실시간 뉴스 목록 (여러 개 중 되는 것 사용)
const NEWS_SOURCES = [
  "https://feed.mix.sina.com.cn/api/roll/get?pageid=153&lid=2516&num=20&page=1",
  "https://feed.mix.sina.com.cn/api/roll/get?pageid=155&lid=1686&num=20&page=1",
];
const NEWS_KEY = "market:news";
const NEWS_LOCK_KEY = "market:news:lock";
const NEWS_TTL_MS = 60 * 60 * 1000;
const NEWS_LOCK_MS = 5 * 60 * 1000;
const NEWS_CATEGORIES = ["상하이증시", "홍콩증시", "A주", "중국펀드"];

async function fetchChineseNews() {
  for (const url of NEWS_SOURCES) {
    try {
      const res = await fetchWithTimeout(url, { headers: { Referer: "https://finance.sina.com.cn/" } });
      if (!res.ok) continue;
      const json = await res.json();
      const items = (json?.result?.data || [])
        .filter((d: any) => d.title && d.url)
        .slice(0, 10)
        .map((d: any) => ({
          title: String(d.title),
          intro: String(d.intro || d.summary || "").slice(0, 300),
          url: String(d.url),
          source: String(d.media_name || "新浪财经"),
          publishedAt: d.ctime ? new Date(Number(d.ctime) * 1000).toISOString() : new Date().toISOString(),
        }));
      if (items.length) return items;
    } catch (e) {
      console.error(`News source failed (${url}): ${e.message}`);
    }
  }
  throw new Error("모든 뉴스 소스 실패");
}

// 기존 AI 채팅과 같은 GLM 모델 사용
async function callGLM(system: string, user: string, maxTokens = 4000) {
  const apiKey = Deno.env.get("GLM_API_KEY");
  if (!apiKey) throw new Error("GLM_API_KEY 미설정");
  const res = await fetchWithTimeout("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "glm-z1-flash",
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      max_tokens: maxTokens,
      temperature: 0.3,
    }),
  }, 90000);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!res.ok || !content) throw new Error(data.error?.message || `GLM API error: ${res.status}`);
  return content as string;
}

// GLM 응답에서 JSON 배열만 꺼내기 (<think> 등 제거)
export function extractJsonArray(text: string) {
  const cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, "");
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start < 0 || end <= start) throw new Error("GLM 응답에 JSON 배열 없음");
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function refreshNews() {
  const raw = await fetchChineseNews();
  const system =
    "당신은 재중 한인을 위한 중국 증시 뉴스 편집자입니다. 중국어 기사 제목과 요약을 한국어로 번역·요약합니다. " +
    "반드시 JSON 배열만 출력하세요. 설명이나 코드블록 없이.";
  const user =
    `다음 기사들을 각각 한국어로 정리해 주세요.\n` +
    `형식: [{"id":번호,"title":"자연스러운 한국어 제목","summary":"핵심만 2~3문장 한국어 요약","category":"${NEWS_CATEGORIES.join("|")} 중 하나"}]\n` +
    `증시와 관련 없는 기사는 배열에서 빼세요.\n\n` +
    JSON.stringify(raw.map((r, i) => ({ id: i, title: r.title, intro: r.intro })));
  const translated = extractJsonArray(await callGLM(system, user));
  const items = translated
    .filter((t: any) => raw[t.id] && t.title)
    .map((t: any) => ({
      ...raw[t.id],
      originalTitle: raw[t.id].title,
      title: String(t.title),
      summary: String(t.summary || ""),
      category: NEWS_CATEGORIES.includes(t.category) ? t.category : "A주",
    }));
  if (items.length === 0) throw new Error("요약된 뉴스 없음");
  const data = { items, updatedAt: new Date().toISOString() };
  await kv.set(NEWS_KEY, data);
  return data;
}

app.get("/make-server-c6687586/market/news", async (c) => {
  const cached = await kv.get(NEWS_KEY).catch(() => null);
  const stale = !cached || Date.now() - new Date(cached.updatedAt).getTime() > NEWS_TTL_MS;
  if (stale) {
    // 동시에 여러 번 갱신하지 않도록 잠금
    const lock = await kv.get(NEWS_LOCK_KEY).catch(() => null);
    if (!lock || Date.now() - lock.at > NEWS_LOCK_MS) {
      await kv.set(NEWS_LOCK_KEY, { at: Date.now() });
      runInBackground(refreshNews().finally(() => kv.del(NEWS_LOCK_KEY)));
    }
  }
  // AI 요약은 시간이 걸리므로 저장된 뉴스를 바로 돌려준다
  return c.json({ success: true, items: cached?.items || [], updatedAt: cached?.updatedAt || null, refreshing: stale });
});

// ===== 회원 로그인 (Supabase Auth) =====
// 아이디로 가입·로그인할 수 있도록 내부적으로 "아이디@도메인" 이메일을 사용한다 (메일은 보내지 않음)
// 가입된 회원이 생긴 뒤에는 바꾸지 말 것 (바꾸면 기존 회원이 로그인할 수 없음)
const LOGIN_EMAIL_DOMAIN = Deno.env.get("LOGIN_EMAIL_DOMAIN") || "users.example.com";
const toLoginEmail = (username: string) => `${username.toLowerCase()}@${LOGIN_EMAIL_DOMAIN}`;
const USERNAME_RE = /^[a-zA-Z0-9_]{4,20}$/;

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// 요청 헤더의 로그인 토큰으로 회원 확인 (없거나 틀리면 null)
async function getAuthUser(c: any) {
  const token = c.req.header("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  const meta = data.user.user_metadata || {};
  return { id: data.user.id, username: String(meta.username || data.user.email?.split("@")[0] || "회원") };
}

app.post("/make-server-c6687586/auth/signup", async (c) => {
  try {
    const { username, password, region } = await c.req.json();
    if (!USERNAME_RE.test(String(username || ""))) {
      return c.json({ success: false, error: "아이디는 영문·숫자·밑줄(_) 4~20자로 만들어 주세요." }, 400);
    }
    if (String(password || "").length < 6) {
      return c.json({ success: false, error: "비밀번호는 6자리 이상이어야 합니다." }, 400);
    }
    const { error } = await supabaseAdmin.auth.admin.createUser({
      email: toLoginEmail(String(username)),
      password: String(password),
      email_confirm: true,
      user_metadata: { username: String(username), region: String(region || "") },
    });
    if (error) {
      const taken = /already|registered|exists/i.test(error.message);
      return c.json({ success: false, error: taken ? "이미 사용 중인 아이디입니다." : error.message }, taken ? 409 : 400);
    }
    return c.json({ success: true });
  } catch (error) {
    console.error(`Signup error: ${error.message}`);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 아이디·비밀번호 로그인 → 브라우저에서 supabase.auth.setSession() 으로 사용할 세션 반환
app.post("/make-server-c6687586/auth/login", async (c) => {
  try {
    const { username, password } = await c.req.json();
    if (!username || !password) return c.json({ success: false, error: "아이디와 비밀번호를 입력해 주세요." }, 400);
    const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client.auth.signInWithPassword({ email: toLoginEmail(String(username)), password: String(password) });
    if (error || !data.session) {
      return c.json({ success: false, error: "아이디 또는 비밀번호가 올바르지 않습니다." }, 401);
    }
    return c.json({
      success: true,
      session: { access_token: data.session.access_token, refresh_token: data.session.refresh_token },
    });
  } catch (error) {
    console.error(`Login error: ${error.message}`);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ===== 커뮤니티 게시판: 글·댓글·좋아요·조회수 =====
const COMMUNITY_POSTS_KEY = "community:posts";
const COMMUNITY_STATS_KEY = "community:stats";          // { [postId]: { views, likes, comments } } - 예시 글 포함 모든 글
const commentsKey = (postId: number) => `community:comments:${postId}`;
const likesKey = (postId: number) => `community:likes:${postId}`; // 좋아요 누른 회원 id 목록
const BOARD_CATEGORIES = ["비자/서류", "교육", "부동산", "자동차", "중고장터", "생활", "자유"];
const MAX_TITLE = 100;
const MAX_CONTENT = 5000;
const MAX_COMMENT = 1000;

function formatDate(d: Date, withTime = false) {
  // 한국/중국 사용자 기준 표시 (UTC+8)
  const t = new Date(d.getTime() + 8 * 3600 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${t.getUTCFullYear()}.${pad(t.getUTCMonth() + 1)}.${pad(t.getUTCDate())}`;
  return withTime ? `${date} ${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())}` : date;
}

async function updateStats(postId: number, change: (s: { views: number; likes: number; comments: number }) => void) {
  const stats = (await kv.get(COMMUNITY_STATS_KEY)) || {};
  const s = stats[postId] || { views: 0, likes: 0, comments: 0 };
  change(s);
  stats[postId] = s;
  await kv.set(COMMUNITY_STATS_KEY, stats);
  return s;
}

const requireLogin = (c: any) => c.json({ success: false, error: "로그인이 필요합니다." }, 401);

app.get("/make-server-c6687586/community/posts", async (c) => {
  try {
    const [posts, stats] = await Promise.all([kv.get(COMMUNITY_POSTS_KEY), kv.get(COMMUNITY_STATS_KEY)]);
    return c.json({ success: true, posts: posts || [], stats: stats || {} });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.post("/make-server-c6687586/community/posts", async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) return requireLogin(c);
    const body = await c.req.json();
    const title = String(body.title || "").trim();
    const content = String(body.content || "").trim();
    const category = String(body.category || "");
    const city = body.city ? String(body.city).slice(0, 20) : undefined;

    if (!title || !content) return c.json({ success: false, error: "제목과 내용을 입력해 주세요." }, 400);
    if (title.length > MAX_TITLE || content.length > MAX_CONTENT) {
      return c.json({ success: false, error: `제목은 ${MAX_TITLE}자, 내용은 ${MAX_CONTENT}자 이내로 써 주세요.` }, 400);
    }
    if (!BOARD_CATEGORIES.includes(category)) return c.json({ success: false, error: "분류를 선택해 주세요." }, 400);

    const posts = (await kv.get(COMMUNITY_POSTS_KEY)) || [];
    // 같은 사람이 30초 안에 연속으로 올리는 것 방지
    const last = posts.find((p: any) => p.authorKey === user.id);
    if (last && Date.now() - last.id < 30_000) {
      return c.json({ success: false, error: "잠시 후 다시 시도해 주세요." }, 429);
    }

    const now = new Date();
    const post = {
      id: now.getTime(),
      title, content, category, city,
      author: user.username,
      authorKey: user.id,
      date: formatDate(now),
      views: 0, likes: 0, comments: 0,
    };
    await kv.set(COMMUNITY_POSTS_KEY, [post, ...posts]);
    return c.json({ success: true, post });
  } catch (error) {
    console.error(`Error creating post: ${error.message}`);
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.delete("/make-server-c6687586/community/posts/:id", async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) return requireLogin(c);
    const id = Number(c.req.param("id"));
    const posts = (await kv.get(COMMUNITY_POSTS_KEY)) || [];
    const target = posts.find((p: any) => p.id === id);
    if (!target) return c.json({ success: false, error: "글을 찾을 수 없습니다." }, 404);
    if (target.authorKey !== user.id) return c.json({ success: false, error: "본인 글만 삭제할 수 있습니다." }, 403);
    await kv.set(COMMUNITY_POSTS_KEY, posts.filter((p: any) => p.id !== id));
    await Promise.all([kv.del(commentsKey(id)), kv.del(likesKey(id))]);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 조회수 +1 (중복 방지는 브라우저에서 세션당 1회)
app.post("/make-server-c6687586/community/posts/:id/view", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (!id) return c.json({ success: false, error: "잘못된 글 번호" }, 400);
    const s = await updateStats(id, (s) => { s.views += 1; });
    return c.json({ success: true, stats: s });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 글 상세: 댓글 목록 + 내가 좋아요 눌렀는지
app.get("/make-server-c6687586/community/posts/:id/detail", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const [comments, likes, user] = await Promise.all([kv.get(commentsKey(id)), kv.get(likesKey(id)), getAuthUser(c)]);
    return c.json({
      success: true,
      comments: comments || [],
      liked: !!user && (likes || []).includes(user.id),
    });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 좋아요 누르기/취소 (회원당 1번)
app.post("/make-server-c6687586/community/posts/:id/like", async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) return requireLogin(c);
    const id = Number(c.req.param("id"));
    const likes: string[] = (await kv.get(likesKey(id))) || [];
    const liked = !likes.includes(user.id);
    const next = liked ? [...likes, user.id] : likes.filter((u) => u !== user.id);
    await kv.set(likesKey(id), next);
    const s = await updateStats(id, (s) => { s.likes = next.length; });
    return c.json({ success: true, liked, stats: s });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.post("/make-server-c6687586/community/posts/:id/comments", async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) return requireLogin(c);
    const id = Number(c.req.param("id"));
    const content = String((await c.req.json()).content || "").trim();
    if (!content) return c.json({ success: false, error: "댓글 내용을 입력해 주세요." }, 400);
    if (content.length > MAX_COMMENT) return c.json({ success: false, error: `댓글은 ${MAX_COMMENT}자 이내로 써 주세요.` }, 400);

    const comments = (await kv.get(commentsKey(id))) || [];
    const now = new Date();
    const comment = { id: now.getTime(), author: user.username, authorKey: user.id, content, date: formatDate(now, true) };
    const next = [...comments, comment];
    await kv.set(commentsKey(id), next);
    const s = await updateStats(id, (s) => { s.comments = next.length; });
    return c.json({ success: true, comment, stats: s });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.delete("/make-server-c6687586/community/posts/:id/comments/:commentId", async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) return requireLogin(c);
    const id = Number(c.req.param("id"));
    const commentId = Number(c.req.param("commentId"));
    const comments = (await kv.get(commentsKey(id))) || [];
    const target = comments.find((cm: any) => cm.id === commentId);
    if (!target) return c.json({ success: false, error: "댓글을 찾을 수 없습니다." }, 404);
    if (target.authorKey !== user.id) return c.json({ success: false, error: "본인 댓글만 삭제할 수 있습니다." }, 403);
    const next = comments.filter((cm: any) => cm.id !== commentId);
    await kv.set(commentsKey(id), next);
    const s = await updateStats(id, (s) => { s.comments = next.length; });
    return c.json({ success: true, stats: s });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

Deno.serve(app.fetch);