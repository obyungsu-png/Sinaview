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

    const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
    
    if (!apiKey) {
      return c.json({
        success: false,
        error: "DeepSeek API 키가 설정되지 않았습니다. 관리자에게 문의하세요."
      }, 500);
    }

    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: apiKey
    });

    const messages = [
      { role: "system", content: "당신은 한국-중국 포털 사이트 '차이나 View'의 친절하고 똑똑한 AI 어시스턴트입니다. 사용자의 질문에 대해 정확하고 도움이 되는 답변을 한국어로 제공해주세요. 이모지를 적절히 사용하여 친근하게 대화하세요." },
      ...(history || []),
      { role: "user", content: message }
    ];

    const completion = await openai.chat.completions.create({
      messages: messages,
      model: "deepseek-chat",
    });

    return c.json({
      success: true,
      reply: completion.choices[0].message.content
    });

  } catch (error) {
     console.error(`AI Error: ${error.message}`);
     return c.json({ success: false, error: "AI 답변 생성 중 오류가 발생했습니다: " + error.message }, 500);
  }
});

Deno.serve(app.fetch);