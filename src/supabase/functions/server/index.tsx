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
        model: "glm-4-flash",
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

    if (!response.ok) {
      console.error(`GLM API HTTP ${response.status}:`, JSON.stringify(data));
      throw new Error(data?.error?.message || `GLM API error: ${response.status}`);
    }

    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      console.error(`GLM API returned no content:`, JSON.stringify(data));
      throw new Error("GLM 응답에 답변 내용이 없습니다.");
    }

    return c.json({ success: true, reply });

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
// 중국·홍콩 증시만 (type: 지수/종목, market: 표시용 시장, currency: 표시 통화)
const QUOTE_SYMBOLS = [
  { code: "sh000001", name: "상하이종합", type: "index", market: "상하이", currency: "" },
  { code: "sz399001", name: "선전성분", type: "index", market: "선전", currency: "" },
  { code: "sh000300", name: "CSI300", type: "index", market: "상하이·선전", currency: "" },
  { code: "sz399006", name: "창업판", type: "index", market: "선전", currency: "" },
  { code: "hkHSI", name: "항셍지수", type: "index", market: "홍콩", currency: "" },
  { code: "hkHSTECH", name: "항셍테크", type: "index", market: "홍콩", currency: "" },
  { code: "hk00700", name: "텐센트", type: "stock", market: "홍콩", currency: "HK$" },
  { code: "hk09988", name: "알리바바", type: "stock", market: "홍콩", currency: "HK$" },
  { code: "hk01211", name: "BYD", type: "stock", market: "홍콩", currency: "HK$" },
  { code: "hk01810", name: "샤오미", type: "stock", market: "홍콩", currency: "HK$" },
  { code: "hk03690", name: "메이퇀", type: "stock", market: "홍콩", currency: "HK$" },
  { code: "hk09618", name: "징둥닷컴", type: "stock", market: "홍콩", currency: "HK$" },
  { code: "hk09888", name: "바이두", type: "stock", market: "홍콩", currency: "HK$" },
  { code: "sh600519", name: "구이저우마오타이", type: "stock", market: "상하이", currency: "¥" },
  { code: "sz300750", name: "CATL(닝더스다이)", type: "stock", market: "선전", currency: "¥" },
  { code: "sh601318", name: "핑안보험", type: "stock", market: "상하이", currency: "¥" },
];
const QUOTES_KEY = "market:quotes";
const QUOTES_TTL_MS = 5 * 60 * 1000;

// 응답 형식: v_sh000001="1~이름~코드~현재가~전일종가~시가~...";
export function parseTencentQuotes(text: string) {
  const quotes = [];
  for (const { code, name, type, market, currency } of QUOTE_SYMBOLS) {
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
      type,
      market,
      currency,
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
// 시나 목록 중 중국 증시 뉴스가 나오는 곳 (2516·2517은 해외 시장 뉴스가 많아 아래 키워드로 거름)
const NEWS_SOURCES = [
  "https://feed.mix.sina.com.cn/api/roll/get?pageid=186&lid=1746&num=30&page=1", // A주·증권사
  "https://feed.mix.sina.com.cn/api/roll/get?pageid=153&lid=2517&num=30&page=1", // 股市
  "https://feed.mix.sina.com.cn/api/roll/get?pageid=153&lid=2516&num=30&page=1", // 财经
];
const NEWS_KEY = "market:news";
const NEWS_LOCK_KEY = "market:news:lock";
const NEWS_TTL_MS = 60 * 60 * 1000;
const NEWS_LOCK_MS = 10 * 60 * 1000;
const NEWS_MAX_STORED = 40;     // 사이트에 쌓아 두는 AI 기사 수
const NEWS_NEW_PER_RUN = 4;     // 한 번 갱신할 때 새로 쓰는 기사 수 (시간 제한 때문에 적게)
const NEWS_CATEGORIES = ["상하이증시", "홍콩증시", "A주", "중국펀드"];
// 원문 제목에 이런 단어가 있어야 증권 기사 후보로 본다 (해외 시장·무관한 기사 제외)
const CHINA_MARKET_RE = /A股|沪指|上证|深成|深证|创业板|科创|北交所|港股|恒指|恒生|中概|证监会|央行|人民币/;
const GENERIC_MARKET_RE = /券商|基金|板块|涨停|跌停|IPO|股市|股价|市值|证券|上市公司|牛市|熊市/;
const FOREIGN_MARKET_RE = /欧洲|欧股|美股|美国|日本|日股|韩国|德国|英国|法国|印度|纳斯达克|道指|标普/;
export const MARKET_TITLE_RE = {
  test: (title: string) => CHINA_MARKET_RE.test(title) || (GENERIC_MARKET_RE.test(title) && !FOREIGN_MARKET_RE.test(title)),
};
const NEWS_MAX_AGE_MS = 3 * 24 * 3600 * 1000; // 3일 넘은 원문은 쓰지 않음

// 여러 목록을 모두 모아 중복·오래된 원문을 뺀다
async function fetchChineseNews(sources: string[] = NEWS_SOURCES) {
  const all: any[] = [];
  const seen = new Set<string>();
  for (const url of sources) {
    try {
      const res = await fetchWithTimeout(url, { headers: { Referer: "https://finance.sina.com.cn/" } });
      if (!res.ok) continue;
      const json = await res.json();
      for (const d of json?.result?.data || []) {
        if (!d.title || !d.url || seen.has(d.title)) continue;
        const publishedAt = d.ctime ? new Date(Number(d.ctime) * 1000) : new Date();
        if (Date.now() - publishedAt.getTime() > NEWS_MAX_AGE_MS) continue;
        seen.add(d.title);
        all.push({
          title: String(d.title),
          intro: String(d.intro || d.summary || "").slice(0, 300),
          url: String(d.url),
          source: String(d.media_name || "新浪财经"),
          publishedAt: publishedAt.toISOString(),
        });
      }
    } catch (e) {
      console.error(`News source failed (${url}): ${e.message}`);
    }
  }
  if (!all.length) throw new Error("모든 뉴스 소스 실패");
  return all.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

// GLM 호출 - 자동 기사·브리핑은 빠르고 형식을 잘 지키는 glm-4-flash 사용
// (AI 채팅도 동일하게 glm-4-flash 사용). 모델이 없다는 오류면 glm-z1-flash 로 한 번 더 시도.
const GLM_CONTENT_MODEL = Deno.env.get("GLM_CONTENT_MODEL") || "glm-4-flash";
const GLM_FALLBACK_MODEL = "glm-z1-flash";

// GLM 이 민감한 내용이라며 거부한 경우 (해당 원문은 건너뜀)
export class GLMBlockedError extends Error {}
const isBlockedMessage = (msg = "") => /不安全|敏感|1301/.test(msg);

async function callGLM(system: string, user: string, maxTokens = 4000, opts: { json?: boolean } = {}) {
  const apiKey = Deno.env.get("GLM_API_KEY");
  if (!apiKey) throw new Error("GLM_API_KEY 미설정");
  const request = async (model: string) => {
    const res = await fetchWithTimeout("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
        max_tokens: maxTokens,
        temperature: 0.3,
        ...(opts.json && model !== GLM_FALLBACK_MODEL ? { response_format: { type: "json_object" } } : {}),
      }),
    }, 90000);
    const data = await res.json().catch(() => ({}));
    const content = data.choices?.[0]?.message?.content;
    const message = data.error?.message || `GLM API error: ${res.status}`;
    if (!res.ok || !content) {
      if (!res.ok) console.error(`GLM API HTTP ${res.status} (${model}):`, JSON.stringify(data));
      else console.error(`GLM API returned no content (${model}):`, JSON.stringify(data));
      if (isBlockedMessage(message) || data.choices?.[0]?.finish_reason === "sensitive") throw new GLMBlockedError(message);
      const err = new Error(message) as Error & { code?: string };
      err.code = String(data.error?.code || "");
      throw err;
    }
    return content as string;
  };
  try {
    return await request(GLM_CONTENT_MODEL);
  } catch (e: any) {
    // 모델 이름 오류(1211 등)일 때만 예비 모델로
    if (!(e instanceof GLMBlockedError) && (e.code === "1211" || /模型|model/i.test(e.message))) {
      return await request(GLM_FALLBACK_MODEL);
    }
    throw e;
  }
}

// Claude Sonnet 5 호출 (apiclaude.cc 중계, OpenAI 호환 형식)
// 키는 Supabase 비밀값 SINAVIEW_CLAUDE_KEY 에만 저장 (다른 곳에서 쓰는 Claude 키들과 구분, 코드·저장소에 넣지 않음). 키가 없으면 GLM 만 사용.
const CLAUDE_API_URL = Deno.env.get("CLAUDE_API_URL") || "https://apiclaude.cc/v1/chat/completions";
const CLAUDE_MODEL = Deno.env.get("CLAUDE_MODEL") || "claude-sonnet-5";

async function callClaude(system: string, user: string, maxTokens = 4000) {
  const apiKey = Deno.env.get("SINAVIEW_CLAUDE_KEY");
  if (!apiKey) throw new Error("SINAVIEW_CLAUDE_KEY 미설정");
  const res = await fetchWithTimeout(CLAUDE_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "OBS", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      max_tokens: maxTokens,
      temperature: 0.3,
      stream: false,
    }),
  }, 90000);
  const text = await res.text();
  if (!res.ok) throw new Error(`Claude 오류 (${res.status}): ${text.slice(0, 200)}`);
  const content = JSON.parse(text).choices?.[0]?.message?.content;
  if (!content) throw new Error(`Claude 응답에 내용 없음: ${text.slice(0, 200)}`);
  return content as string;
}

// 자동화용 AI 호출: GLM 먼저, 오류·검열 거부면 Claude (AI 채팅은 별도로 GLM 사용)
const hasClaude = () => !!Deno.env.get("SINAVIEW_CLAUDE_KEY");

async function viaClaude<T>(reason: string, run: () => Promise<T>): Promise<T> {
  console.warn(`GLM 실패 → Claude 로 재시도: ${reason}`);
  try {
    const result = await run();
    await kv.set("automation:last:claude", { ok: true, reason, at: new Date().toISOString() }).catch(() => {});
    return result;
  } catch (e) {
    await kv.set("automation:last:claude", { ok: false, reason, error: e.message, at: new Date().toISOString() }).catch(() => {});
    throw e;
  }
}

async function callAI(system: string, user: string, maxTokens = 4000, opts: { json?: boolean } = {}) {
  try {
    return await callGLM(system, user, maxTokens, opts);
  } catch (e) {
    if (!hasClaude()) throw e;
    return viaClaude(e.message, () => callClaude(system, user, maxTokens));
  }
}

// JSON 응답: GLM 응답의 형식이 깨져도 Claude 로 다시 시도
async function callAIJson(system: string, user: string, maxTokens = 4000) {
  try {
    return extractJsonObject(await callGLM(system, user, maxTokens, { json: true }));
  } catch (e) {
    if (!hasClaude()) throw e;
    return viaClaude(e.message, async () => extractJsonObject(await callClaude(system, user, maxTokens)));
  }
}

// GLM 응답에서 JSON 배열만 꺼내기 (<think> 등 제거)
export function extractJsonArray(text: string) {
  const cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, "");
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start < 0 || end <= start) throw new Error("GLM 응답에 JSON 배열 없음");
  return JSON.parse(cleaned.slice(start, end + 1));
}

// 원문 페이지에서 본문 문단만 뽑기 (실패하면 빈 문자열 → 목록의 요약문 사용)
async function fetchArticleText(url: string) {
  try {
    const res = await fetchWithTimeout(url, { headers: { Referer: "https://finance.sina.com.cn/" } }, 8000);
    if (!res.ok) return "";
    const html = await res.text();
    const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((m) => m[1].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&[a-z]+;/g, "").trim())
      .filter((t) => t.length >= 20 && /[一-鿿]/.test(t));
    return paragraphs.join("\n").slice(0, 3000);
  } catch {
    return "";
  }
}

// 응답에서 첫 번째 JSON 객체만 정확히 꺼내기 (<think>·코드블록·뒤에 붙은 말 무시)
export function extractJsonObject(text: string) {
  const cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, "");
  const start = cleaned.indexOf("{");
  if (start < 0) throw new Error("GLM 응답에 JSON 없음");
  let depth = 0, inString = false, escaped = false;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
    } else if (ch === '"') inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) return JSON.parse(cleaned.slice(start, i + 1));
  }
  throw new Error("GLM 응답의 JSON 이 끝나지 않음");
}

// 괄호 안 한자 병기 "상하이종합지수(上证指数)" 는 지우고 정리
export function stripHanzi(text: string) {
  return text
    .replace(/\s*[（(][^()（）]*[\u3040-\u30ff\u4e00-\u9fff][^()（）]*[)）]/g, "")
    .replace(/[“”]/g, '"')
    .trim();
}

// 한국어 기사에 한자·일본어 글자가 남아 있으면 번역 실패로 본다
export const hasForeignScript = (text: string) => /[぀-ヿ一-鿿]/.test(text);

const newsId = (url: string) => url.replace(/^https?:\/\//, "").replace(/[^a-zA-Z0-9]/g, "").slice(-40);

// 기사 주제별 설정 (증권 / 중국소식 / 비자 공지)
interface ArticleTopic {
  writer: string;            // AI 역할
  relevance: string;         // 관련 있는 기사 기준
  categories: string[];
  extraRule?: string;
}
const MARKET_TOPIC: ArticleTopic = {
  writer: "한국어 경제 기자",
  relevance: "중국 본토·홍콩 증시, 중국 기업, 중국 경제·금융 정책과 관련 있으면 true, 미국 등 다른 나라 증시가 주제이면 false",
  categories: NEWS_CATEGORIES,
  extraRule: "매수·매도 권유나 가격 예측을 하지 마세요.",
};

// 기사 1건 → AI 한국어 기사 (주제와 관련 없으면 null)
async function writeKoreanArticle(raw: any, topic: ArticleTopic = MARKET_TOPIC) {
  const body = raw.body || (await fetchArticleText(raw.url)) || raw.intro;
  const system =
    `당신은 재중 한인을 위한 ${topic.writer}입니다. 기사를 읽고 한국 독자를 위한 한국어 기사로 다시 씁니다. ` +
    "규칙: 1) 모든 문장은 한국어로만 쓰고 한자·일본어 글자를 쓰지 마세요(인명·지명·기업명은 한글 표기). " +
    `2) 원문에 없는 사실·숫자를 지어내지 마세요. ${topic.extraRule ? `3) ${topic.extraRule} ` : ""}` +
    "반드시 JSON 객체 하나만 출력하세요.";
  const user =
    `relevant 기준: ${topic.relevance}\n` +
    `형식: {"relevant":true,"category":"${topic.categories.join("|")} 중 하나","title":"한국어 제목(40자 이내)",` +
    `"summary":"한국어 2문장 요약","content":"한국어 본문 4~6문단(문단 사이는 빈 줄), 600~1000자",` +
    `"source":"언론사·기관 이름 한글 표기"}\n\n` +
    `출처: ${raw.source}\n제목: ${raw.title}\n본문:\n${body}`;

  // 결과 검사: 문제가 있으면 이유를 돌려줌
  const problem = (r: any) => {
    if (!r.relevant) return r.blocked ? "blocked" : "irrelevant";
    const t = stripHanzi(String(r.title || "")), c = stripHanzi(String(r.content || ""));
    if (!t || c.length < 100) return "short";
    if (hasForeignScript(t) || hasForeignScript(c)) return "foreign";
    return null;
  };

  // GLM 먼저 (오류·검열이면 callAIJson 안에서 Claude 로 넘어감)
  let result: any = await callAIJson(system, user, 4000).catch((e) => {
    if (e instanceof GLMBlockedError) return { relevant: false, blocked: true }; // Claude 키가 없을 때 검열 거부
    throw e;
  });
  // GLM 글이 너무 짧거나 한자가 남았으면 Claude 로 한 번 더
  const first = problem(result);
  if ((first === "short" || first === "foreign") && hasClaude()) {
    result = await viaClaude(`기사 품질 문제(${first})`, async () => extractJsonObject(await callClaude(system, user, 4000)))
      .catch(() => result);
  }

  // 버린 이유를 원문에 표시 (상태 기록·재시도 판단용)
  const reason = problem(result);
  if (reason) { raw._reason = reason; return null; }
  return {
    id: newsId(raw.url),
    title: stripHanzi(String(result.title)),
    summary: stripHanzi(String(result.summary || "")),
    content: stripHanzi(String(result.content)),
    category: topic.categories.includes(result.category) ? result.category : topic.categories[0],
    originalTitle: raw.title,
    source: result.source && !hasForeignScript(String(result.source)) ? String(result.source) : "중국 현지 언론",
    url: raw.url,
    publishedAt: raw.publishedAt,
  };
}

// 새 원문 목록 → AI 기사 작성 → 기존 기사와 합쳐 저장 (중복 원문은 건너뜀)
// 서버 함수는 한 번에 쓸 수 있는 시간이 정해져 있어서(약 2.5~6분), 이 안에서만 새 기사를 시작하고 한 건씩 바로 저장한다
const ARTICLE_TIME_BUDGET_MS = 110_000;

async function writeAndStoreArticles(key: string, raws: any[], topic: ArticleTopic, maxNew: number, maxStored = 40) {
  const started = Date.now();
  const cached = (await kv.get(key).catch(() => null)) || {};
  let items: any[] = (cached.items || []).filter((i: any) => i.content);
  // 관련 없음·검열로 버린 원문 (skippedUrls; 예전 skipped 는 시험 중 잘못 쌓인 것이라 쓰지 않음)
  let skipped: string[] = cached.skippedUrls || [];
  const reasons: Record<string, number> = {};
  const known = new Set([...items.map((i: any) => i.url), ...skipped]);
  const candidates = raws.filter((r) => !known.has(r.url)).slice(0, maxNew * 3);
  let added = 0;
  const failures: string[] = [];

  const save = () => kv.set(key, {
    ...cached,
    items: items
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, maxStored),
    skipped: undefined,
    skippedUrls: skipped.slice(0, 300),
    updatedAt: new Date().toISOString(),
  });

  // 동시에 2건씩, 시간 안에서만
  for (let k = 0; k < candidates.length && added < maxNew && Date.now() - started < ARTICLE_TIME_BUDGET_MS; k += 2) {
    const batch = candidates.slice(k, k + 2);
    const results = await Promise.allSettled(batch.map((r) => writeKoreanArticle(r, topic)));
    results.forEach((r, n) => {
      if (r.status === "fulfilled" && r.value) {
        items = [r.value, ...items];
        added++;
      } else if (r.status === "fulfilled") {
        const reason = batch[n]._reason || "unknown";
        reasons[reason] = (reasons[reason] || 0) + 1;
        // 관련 없음·검열 거부는 다시 보지 않고, 번역 품질 문제는 다음에 다시 시도
        if (reason === "irrelevant" || reason === "blocked") skipped = [batch[n].url, ...skipped];
      } else {
        failures.push(r.reason?.message || "unknown"); // 일시적 오류는 다음 실행 때 다시 시도
        console.error(`Article failed: ${r.reason?.message}`);
      }
    });
    await save();
  }
  if (!candidates.length) await save();
  return { items, added, candidates: candidates.length, reasons, failures: failures.slice(0, 3), seconds: Math.round((Date.now() - started) / 1000) };
}

// withBriefing: 매일 오전 9:30 예약 실행 때만 '개장 브리핑'을 새로 쓴다 (평소 1시간 갱신은 기사만)
async function refreshNews({ withBriefing: forceBriefing = false } = {}) {
  let withBriefing = forceBriefing;
  const cached = (await kv.get(NEWS_KEY).catch(() => null)) || {};
  // 예전 방식(링크만 있는) 뉴스와 증시와 무관한 원문으로 쓴 기사는 버린다
  const before = (cached.items || []).length;
  const kept = (cached.items || []).filter((i: any) => i.content && MARKET_TITLE_RE.test(i.originalTitle || ""));
  if (kept.length < before) {
    withBriefing = true; // 걸러낸 기사가 있으면 브리핑도 새로 씀
    await kv.set(NEWS_KEY, { ...cached, items: kept });
  }
  const raws = (await fetchChineseNews()).filter((r: any) => MARKET_TITLE_RE.test(r.title));
  const result = await writeAndStoreArticles(NEWS_KEY, raws, MARKET_TOPIC, NEWS_NEW_PER_RUN, NEWS_MAX_STORED);
  await kv.set("automation:last:market-news", { ok: true, ...result, items: undefined, at: new Date().toISOString() });
  const items = result.items;
  if (items.length === 0) {
    throw new Error(`작성된 기사 없음 (원문 ${raws.length}건, 후보 ${result.candidates}건, 버린 이유: ${JSON.stringify(result.reasons)}, 오류: ${result.failures.join(" / ") || "없음"})`);
  }
  const latest = (await kv.get(NEWS_KEY).catch(() => null)) || {};

  // AI 개장 브리핑: 지수 + 뉴스 제목으로 3~5줄 요약 (실패해도 뉴스는 저장)
  let briefing = "";
  if (withBriefing || !cached.briefing) try {
    const quotes = (await kv.get(QUOTES_KEY))?.quotes || [];
    const indexes = quotes.filter((q: any) => q.type === "index")
      .map((q: any) => `${q.name} ${q.price.toFixed(2)} (${q.percent >= 0 ? "+" : ""}${q.percent.toFixed(2)}%)`);
    briefing = (await callAI(
      "당신은 재중 한인을 위한 중국 증시 브리핑 작성자입니다. 사실만 간결하게 한국어로만 씁니다(한자·일본어 글자 금지). " +
      "특정 종목의 매수·매도를 권하거나 가격을 예측하지 마세요.",
      `중국 증시 개장(오전 9시 30분)을 앞둔 재중 한인을 위해, 직전 거래일 지수와 최근 뉴스를 바탕으로 ` +
      `오늘 눈여겨볼 중국·홍콩 증시 흐름을 '- '로 시작하는 3~5줄로 정리해 주세요. 다른 말은 쓰지 마세요.\n\n` +
      `지수: ${indexes.join(", ") || "정보 없음"}\n뉴스: ${items.slice(0, 10).map((i: any) => i.title).join(" / ")}`,
      1500,
    )).replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  } catch (e) {
    console.error(`Briefing failed: ${e.message}`);
  }

  const now = new Date().toISOString();
  const data = {
    ...latest,
    briefing: briefing || cached.briefing || "",
    briefingAt: briefing ? now : cached.briefingAt || null,
    updatedAt: now,
  };
  await kv.set(NEWS_KEY, data);
  return data;
}

app.get("/make-server-c6687586/market/news", async (c) => {
  const cached = await kv.get(NEWS_KEY).catch(() => null);
  // AI 기사(본문 포함)만 보여 준다. 예전 형식만 있으면 바로 새로 만든다.
  const articles = (cached?.items || []).filter((i: any) => i.content && MARKET_TITLE_RE.test(i.originalTitle || ""));
  const stale = !cached || articles.length === 0 || Date.now() - new Date(cached.updatedAt).getTime() > NEWS_TTL_MS;
  if (stale) {
    // 동시에 여러 번 갱신하지 않도록 잠금
    const lock = await kv.get(NEWS_LOCK_KEY).catch(() => null);
    if (!lock || Date.now() - lock.at > NEWS_LOCK_MS) {
      await kv.set(NEWS_LOCK_KEY, { at: Date.now() });
      runInBackground(
        refreshNews()
          .catch((e) => kv.set("automation:last:market-news", { ok: false, error: e.message, at: new Date().toISOString() }))
          .finally(() => kv.del(NEWS_LOCK_KEY)),
      );
    }
  }
  // AI 요약은 시간이 걸리므로 저장된 뉴스를 바로 돌려준다
  return c.json({
    success: true,
    items: articles,
    briefing: cached?.briefing || "",
    briefingAt: cached?.briefingAt || null,
    updatedAt: cached?.updatedAt || null,
    refreshing: stale,
  });
});

// 매일 오전 9:30(중국 시간) 예약 실행 - Supabase Cron 이 호출
// 비밀값 CRON_SECRET 과 같은 값을 x-cron-secret 헤더로 보내야 실행된다
app.post("/make-server-c6687586/market/refresh", async (c) => {
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret || c.req.header("x-cron-secret") !== secret) {
    return c.json({ success: false, error: "권한이 없습니다." }, 403);
  }
  await kv.set(NEWS_LOCK_KEY, { at: Date.now() });
  runInBackground(
    refreshQuotes()
      .catch((e) => console.error(`Scheduled quotes failed: ${e.message}`))
      .then(() => refreshNews({ withBriefing: true }))
      .then((d) => console.log(`Scheduled refresh done: ${d.items.length} articles`))
      .finally(() => kv.del(NEWS_LOCK_KEY)),
  );
  return c.json({ success: true, started: true });
});

// ===== AI 자동화: 아침 브리핑 · 중국소식 · 오늘의 질문 · 비자 공지 =====
// Supabase Cron 이 /automation/run/:job 을 정해진 시간에 호출한다 (설정: SERVER_DEPLOY_GUIDE.md)

// --- 아침 브리핑 (08:00): 원/위안 환율 + 도시별 날씨 + 오늘의 소식 3줄 ---
const MORNING_KEY = "daily:morning";
const WEATHER_CITIES = [
  { name: "북경", lat: 39.90, lon: 116.40 },
  { name: "상해", lat: 31.23, lon: 121.47 },
  { name: "대련", lat: 38.91, lon: 121.61 },
  { name: "청도", lat: 36.07, lon: 120.38 },
  { name: "심양", lat: 41.80, lon: 123.43 },
  { name: "광저우", lat: 23.13, lon: 113.26 },
  { name: "심천", lat: 22.54, lon: 114.06 },
];

// WMO 날씨 코드 → 한국어
export function weatherText(code: number) {
  if (code === 0) return "맑음";
  if (code <= 3) return "구름";
  if (code === 45 || code === 48) return "안개";
  if (code >= 51 && code <= 57) return "이슬비";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "비";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "눈";
  if (code >= 95) return "뇌우";
  return "흐림";
}

async function fetchCnyKrw() {
  const res = await fetchWithTimeout("https://open.er-api.com/v6/latest/CNY", {}, 8000);
  const json = await res.json();
  const rate = Number(json?.rates?.KRW);
  if (!isFinite(rate) || rate <= 0) throw new Error("환율 정보 없음");
  return rate;
}

async function fetchWeather() {
  const lat = WEATHER_CITIES.map((c) => c.lat).join(",");
  const lon = WEATHER_CITIES.map((c) => c.lon).join(",");
  const res = await fetchWithTimeout(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=Asia%2FShanghai&forecast_days=1`,
    {}, 8000,
  );
  const json = await res.json();
  const list = Array.isArray(json) ? json : [json];
  return WEATHER_CITIES.map((city, i) => {
    const d = list[i]?.daily;
    return d ? {
      city: city.name,
      max: Math.round(d.temperature_2m_max[0]),
      min: Math.round(d.temperature_2m_min[0]),
      rain: d.precipitation_probability_max?.[0] ?? null,
      desc: weatherText(Number(d.weather_code[0])),
    } : null;
  }).filter(Boolean);
}

async function runMorningBriefing() {
  const prev = (await kv.get(MORNING_KEY).catch(() => null)) || {};
  const [rate, weather] = await Promise.all([
    fetchCnyKrw().catch((e) => { console.error(`Rate failed: ${e.message}`); return null; }),
    fetchWeather().catch((e) => { console.error(`Weather failed: ${e.message}`); return []; }),
  ]);
  // 오늘의 소식 3줄: 최근 중국소식·증권 기사 제목으로만 작성 (없는 소식을 지어내지 않음)
  const recent = [
    ...((await kv.get(CHINA_NEWS_KEY).catch(() => null))?.items || []).slice(0, 5),
    ...((await kv.get(NEWS_KEY).catch(() => null))?.items || []).filter((i: any) => i.content).slice(0, 3),
  ];
  let lines: string[] = [];
  if (recent.length) {
    try {
      const text = (await callAI(
        "당신은 재중 한인을 위한 아침 뉴스 브리핑 작성자입니다. 한국어로만 쓰고 한자·일본어 글자를 쓰지 마세요. 주어진 기사 외의 내용은 쓰지 마세요.",
        `아래 기사 제목·요약 중 재중 한인에게 가장 중요한 3개를 골라, 각각 한 줄(40자 이내)로 정리하세요. ` +
        `'- '로 시작하는 3줄만 출력하세요.\n\n` + recent.map((i: any) => `${i.title}: ${i.summary}`).join("\n"),
        1500,
      )).replace(/<think>[\s\S]*?<\/think>/g, "");
      lines = text.split("\n").map((l) => l.replace(/^[-•\s]+/, "").trim()).filter((l) => l && !hasForeignScript(l)).slice(0, 3);
    } catch (e) {
      console.error(`Morning lines failed: ${e.message}`);
    }
  }
  const data = {
    date: formatDate(new Date()),
    rate: rate ? { krwPerCny: rate, prev: prev.rate?.krwPerCny ?? null } : prev.rate || null,
    weather: weather.length ? weather : prev.weather || [],
    lines: lines.length ? lines : [],
    createdAt: new Date().toISOString(),
  };
  await kv.set(MORNING_KEY, data);
  return data;
}

// --- 중국소식 (12:00): 생활·정책 뉴스 2건 ---
const CHINA_NEWS_KEY = "news:china";
const CHINA_NEWS_SOURCES = [
  "https://feed.mix.sina.com.cn/api/roll/get?pageid=155&lid=1686&num=30&page=1", // 국내 생활 (교통·연휴 등)
  "https://feed.mix.sina.com.cn/api/roll/get?pageid=153&lid=2510&num=30&page=1", // 国内
  "https://feed.mix.sina.com.cn/api/roll/get?pageid=153&lid=2669&num=30&page=1", // 社会
];
const CHINA_TOPIC: ArticleTopic = {
  writer: "한국어 생활 정보 기자",
  relevance: "중국에 사는 외국인의 생활에 실제 영향을 주는 정책·생활 소식(교통, 결제·금융, 물가, 휴일·연휴, 의료, 교육, 출입국, 통신, 날씨 재해)이면 true, " +
    "정치 행사·외교·사건사고·연예·스포츠면 false",
  categories: ["교통", "결제·금융", "물가", "휴일", "의료", "교육", "생활"],
};

async function runChinaNews() {
  const raws = await fetchChineseNews(CHINA_NEWS_SOURCES);
  return writeAndStoreArticles(CHINA_NEWS_KEY, raws, CHINA_TOPIC, 2);
}

// --- 비자/서류 공지 (17:00): 새 공지가 있을 때만 ---
const VISA_NOTICES_KEY = "notices:visa";
const VISA_SOURCES = [
  {
    name: "주중국 대한민국 대사관",
    url: "https://overseas.mofa.go.kr/cn-ko/brd/m_1157/list.do",
    link: /view\.do\?seq=\d+/,
  },
  {
    name: "중국 국가이민관리국",
    url: "https://www.nia.gov.cn/n741440/n741567/index.html",
    link: /\/c\d+\/content\.html/,
  },
];
const VISA_TOPIC: ArticleTopic = {
  writer: "한국어 영사·출입국 안내 담당자",
  relevance: "재중 한인에게 필요한 비자, 거류허가, 출입국, 여권, 영사 서비스, 재외국민 안전 공지이면 true, 기관 행사·인사 소식이면 false",
  categories: ["비자", "출입국", "영사 공지", "안전"],
  extraRule: "공지의 날짜·대상·신청 방법·준비 서류가 있으면 빠짐없이 쓰세요.",
};

// 목록 페이지에서 공지 링크·제목 뽑기
export function extractNoticeLinks(html: string, pageUrl: string, pattern: RegExp) {
  const out: { title: string; url: string }[] = [];
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = m[1].replace(/&amp;/g, "&");
    const title = m[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (!pattern.test(href) || title.length < 6) continue;
    const url = new URL(href, pageUrl).toString();
    if (!out.some((o) => o.url === url)) out.push({ title, url });
  }
  return out.slice(0, 10);
}

async function fetchPageText(url: string) {
  const res = await fetchWithTimeout(url, {}, 10000);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  return html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, "")
    .replace(/<(br|\/p|\/div|\/tr|\/li)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&[a-z]+;/g, "")
    .split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter((l) => l.length > 10)
    .join("\n").slice(0, 4000);
}

async function runVisaNotices() {
  const raws: any[] = [];
  for (const src of VISA_SOURCES) {
    try {
      const res = await fetchWithTimeout(src.url, {}, 10000);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      for (const link of extractNoticeLinks(await res.text(), src.url, src.link)) {
        raws.push({ title: link.title, url: link.url, source: src.name, intro: "", publishedAt: new Date().toISOString() });
      }
    } catch (e) {
      console.error(`Visa source failed (${src.name}): ${e.message}`);
    }
  }
  if (!raws.length) throw new Error("공지 목록을 가져오지 못함");
  // 처음 실행할 때는 기존 공지 중 최신 2건만, 이후에는 새 공지만 작성
  const cached = await kv.get(VISA_NOTICES_KEY).catch(() => null);
  const known = new Set([...(cached?.items || []).map((i: any) => i.url), ...(cached?.skippedUrls || [])]);
  const fresh = raws.filter((r) => !known.has(r.url));
  for (const r of fresh) r.body = await fetchPageText(r.url).catch(() => "");
  return writeAndStoreArticles(VISA_NOTICES_KEY, fresh.filter((r) => r.body), VISA_TOPIC, 2, 30);
}

// --- 오늘의 질문 (10:00): 게시판에 대화 시작 질문 1개 ---
const QUESTION_HISTORY_KEY = "community:ai-questions";

async function runDailyQuestion() {
  const history: string[] = (await kv.get(QUESTION_HISTORY_KEY).catch(() => null)) || [];
  const today = new Date(Date.now() + 8 * 3600 * 1000);
  const result = (await callAIJson(
    "당신은 중국에 사는 한인 커뮤니티의 운영자입니다. 회원들이 부담 없이 댓글로 경험을 나눌 수 있는 질문을 만듭니다. " +
    "한국어로만 쓰고, 정치·종교·민감한 주제는 피하세요. 반드시 JSON 객체 하나만 출력하세요.",
    `오늘은 ${today.getUTCMonth() + 1}월 ${today.getUTCDate()}일(중국 시간)입니다. 계절·다가오는 휴일·중국 생활을 고려해 ` +
    `오늘의 질문 1개를 만드세요. 최근 질문과 겹치지 않게 하세요.\n최근 질문: ${history.slice(0, 14).join(" / ") || "없음"}\n` +
    `형식: {"title":"질문 제목(30자 이내, 물음표로 끝)","content":"2~3문장 안내 + 댓글을 부탁하는 한 문장"}`,
    1500,
  ));
  const title = String(result.title || "").trim();
  const content = String(result.content || "").trim();
  if (!title || !content || hasForeignScript(title + content)) throw new Error("질문 생성 실패");

  const posts = (await kv.get(COMMUNITY_POSTS_KEY)) || [];
  const now = new Date();
  const post = {
    id: now.getTime(),
    title: `[오늘의 질문] ${title}`,
    content: `${content}\n\n※ 차이나뷰 AI가 대화를 위해 올린 질문입니다.`,
    category: "자유",
    author: "차이나뷰 AI",
    authorKey: "ai",
    isAi: true,
    date: formatDate(now),
    views: 0, likes: 0, comments: 0,
  };
  await kv.set(COMMUNITY_POSTS_KEY, [post, ...posts]);
  await kv.set(QUESTION_HISTORY_KEY, [title, ...history].slice(0, 30));
  return { post };
}

// --- 주간 인기글 정리 (일요일 20:00): 지난 7일 회원 글 TOP 5 를 공지로 ---
const DAY_MS = 24 * 3600 * 1000;

async function runWeeklyTop() {
  const [posts, stats] = await Promise.all([kv.get(COMMUNITY_POSTS_KEY), kv.get(COMMUNITY_STATS_KEY)]);
  const all: any[] = posts || [];
  const s = stats || {};
  const since = Date.now() - 7 * DAY_MS;
  // 점수 = 추천×3 + 댓글×2 + 조회÷10 (AI 글·공지는 제외)
  const ranked = all
    .filter((p) => p.id >= since && !p.isAi && !p.badgeType)
    .map((p) => {
      const st = s[p.id] || {};
      return { ...p, likes: st.likes || 0, comments: st.comments || 0, views: st.views || 0 };
    })
    .map((p) => ({ ...p, score: p.likes * 3 + p.comments * 2 + p.views / 10 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  if (ranked.length < 3) return { skipped: "이번 주 회원 글이 3개 미만" };

  const now = new Date(Date.now() + 8 * 3600 * 1000);
  const label = `${now.getUTCMonth() + 1}월 ${Math.ceil(now.getUTCDate() / 7)}째 주`;
  const lines = ranked.map((p, i) => `${i + 1}. ${p.title}\n   ${p.author} · 추천 ${p.likes} · 댓글 ${p.comments} · 조회 ${p.views}`);
  const post = {
    id: Date.now(),
    title: `[주간 인기글] ${label} TOP ${ranked.length}`,
    content: `이번 주 회원님들이 가장 많이 보고 추천한 글입니다.\n\n${lines.join("\n\n")}\n\n` +
      `게시판에서 제목으로 검색하면 바로 볼 수 있어요. 다음 주에도 좋은 글 기다릴게요!`,
    category: "자유",
    badge: "공지",
    badgeType: "notice",
    isWeekly: true,
    isAi: true,
    author: "차이나뷰",
    authorKey: "ai",
    date: formatDate(new Date()),
    views: 0, likes: 0, comments: 0,
  };
  // 지난주 정리 글은 공지 고정을 푼다 (맨 위에는 최신 정리 글만)
  const unpinned = all.map((p) => (p.isWeekly ? { ...p, badge: undefined, badgeType: undefined } : p));
  await kv.set(COMMUNITY_POSTS_KEY, [post, ...unpinned]);
  return { post };
}

// --- AI 첫 답변 (매시간): 24시간 동안 댓글이 없는 질문 글에 참고 답변 ---
const AI_ANSWERED_KEY = "community:ai-answered";
const AI_ANSWER_PER_RUN = 3;

async function runAiAnswers() {
  const [posts, stats, answered] = await Promise.all([
    kv.get(COMMUNITY_POSTS_KEY), kv.get(COMMUNITY_STATS_KEY), kv.get(AI_ANSWERED_KEY),
  ]);
  const done = new Set<number>(answered || []);
  const s = stats || {};
  const now = Date.now();
  const targets = (posts || [])
    .filter((p: any) => !p.isAi && !done.has(p.id))
    .filter((p: any) => now - p.id >= DAY_MS && now - p.id <= 7 * DAY_MS)   // 1~7일 된 글
    .filter((p: any) => !(s[p.id]?.comments > 0))                           // 아직 댓글 없음
    .slice(0, AI_ANSWER_PER_RUN);

  let added = 0;
  for (const p of targets) {
    done.add(p.id); // 답변하지 않기로 한 글도 다시 보지 않음
    try {
      const result = (await callAIJson(
        "당신은 중국에 사는 한인 커뮤니티의 친절한 도우미입니다. 회원의 질문에 한국어로만 답합니다. " +
        "규칙: 1) 확실하지 않은 내용은 추측하지 말고 '확인이 필요하다'고 쓰세요. 2) 전화번호·주소·가격을 지어내지 마세요. " +
        "3) 비자·법률·의료 질문은 공식 기관 확인을 권하세요. 4) 반드시 JSON 객체 하나만 출력하세요.",
        `아래 게시글이 답을 구하는 질문이면 isQuestion을 true로 하고 도움이 되는 답변을 3~6문장으로 쓰세요. ` +
        `질문이 아니면(후기·판매·잡담) isQuestion을 false로 하세요.\n` +
        `형식: {"isQuestion":true,"answer":"답변"}\n\n분류: ${p.category}\n제목: ${p.title}\n내용: ${String(p.content).slice(0, 1500)}`,
        2000,
      ));
      const answer = String(result.answer || "").trim();
      if (!result.isQuestion || answer.length < 20 || hasForeignScript(answer)) continue;

      const comments = (await kv.get(commentsKey(p.id))) || [];
      if (comments.length) continue; // 그사이 회원 댓글이 달렸으면 건너뜀
      const comment = {
        id: Date.now(),
        author: "차이나뷰 AI",
        authorKey: "ai",
        isAi: true,
        content: `🤖 아직 답변이 없어 AI가 참고 답변을 드려요.\n\n${answer}\n\n※ AI 답변은 틀릴 수 있어요. 경험 있는 회원님들의 댓글도 기다립니다!`,
        date: formatDate(new Date(), true),
      };
      await kv.set(commentsKey(p.id), [comment]);
      await updateStats(p.id, (st) => { st.comments = 1; });
      added++;
    } catch (e) {
      console.error(`AI answer failed (${p.id}): ${e.message}`);
    }
  }
  await kv.set(AI_ANSWERED_KEY, [...done].slice(-500));
  return { checked: targets.length, added };
}

// --- 조회용 주소 ---
app.get("/make-server-c6687586/daily/morning", async (c) => {
  const data = await kv.get(MORNING_KEY).catch(() => null);
  return c.json({ success: true, briefing: data || null });
});

for (const [path, key] of [["/news/china", CHINA_NEWS_KEY], ["/notices/visa", VISA_NOTICES_KEY]] as const) {
  app.get(`/make-server-c6687586${path}`, async (c) => {
    const data = await kv.get(key).catch(() => null);
    return c.json({ success: true, items: data?.items || [], updatedAt: data?.updatedAt || null });
  });
}

// --- 예약 실행: POST /automation/run/:job (x-cron-secret 필요) ---
const AUTOMATION_JOBS: Record<string, () => Promise<unknown>> = {
  morning: runMorningBriefing,
  "china-news": runChinaNews,
  question: runDailyQuestion,
  visa: runVisaNotices,
  market: () => refreshQuotes().catch(() => null).then(() => refreshNews({ withBriefing: true })),
  "weekly-top": runWeeklyTop,
  "ai-answer": runAiAnswers,
};

app.post("/make-server-c6687586/automation/run/:job", async (c) => {
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret || c.req.header("x-cron-secret") !== secret) {
    return c.json({ success: false, error: "권한이 없습니다." }, 403);
  }
  const job = c.req.param("job");
  const run = AUTOMATION_JOBS[job];
  if (!run) return c.json({ success: false, error: `알 수 없는 작업: ${job}` }, 404);
  runInBackground(
    run()
      .then(() => kv.set(`automation:last:${job}`, { ok: true, at: new Date().toISOString() }))
      .catch(async (e) => {
        console.error(`Automation ${job} failed: ${e.message}`);
        await kv.set(`automation:last:${job}`, { ok: false, error: e.message, at: new Date().toISOString() });
      }),
  );
  return c.json({ success: true, started: job });
});

// 자동화 상태 확인 (마지막 실행 결과)
app.get("/make-server-c6687586/automation/status", async (c) => {
  const jobs = [...Object.keys(AUTOMATION_JOBS), "market-news", "claude"];
  const results = await Promise.all(jobs.map((j) => kv.get(`automation:last:${j}`).catch(() => null)));
  return c.json({ success: true, status: Object.fromEntries(jobs.map((j, i) => [j, results[i]])) });
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