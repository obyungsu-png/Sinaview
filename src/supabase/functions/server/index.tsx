import { Hono } from "npm:hono@4";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "npm:@aws-sdk/client-s3@3";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3";
import OpenAI from "npm:openai";

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

Deno.serve(app.fetch);