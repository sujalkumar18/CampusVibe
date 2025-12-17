import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import multer from "multer";
import * as path from "path";
import * as fs from "fs";
import { storage } from "./storage";
import { insertPostSchema, insertCommentSchema, insertStorySchema, insertPollSchema } from "../shared/schema";
import type { Category } from "../shared/schema";

const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|webm/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error("Only images and videos are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/uploads", (req: Request, res: Response, next) => {
    res.setHeader("Cache-Control", "public, max-age=31536000");
    next();
  }, require("express").static(uploadsDir));

  app.post("/api/upload", upload.single("file"), (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const protocol = req.header("x-forwarded-proto") || req.protocol || "https";
      const host = req.header("x-forwarded-host") || req.get("host");
      const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
      res.json({ url: fileUrl, filename: req.file.filename });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  app.post("/api/auth", async (req, res) => {
    try {
      const { deviceId } = req.body;
      if (!deviceId) {
        return res.status(400).json({ error: "deviceId is required" });
      }
      const user = await storage.getOrCreateUser(deviceId);
      res.json({ user });
    } catch (error) {
      console.error("Auth error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/posts", async (req, res) => {
    try {
      const category = req.query.category as Category | undefined;
      const posts = await storage.getPosts(category);
      res.json({ posts });
    } catch (error) {
      console.error("Get posts error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const post = await storage.getPostById(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json({ post });
    } catch (error) {
      console.error("Get post error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/users/:userId/posts", async (req, res) => {
    try {
      const posts = await storage.getUserPosts(req.params.userId);
      res.json({ posts });
    } catch (error) {
      console.error("Get user posts error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const { userId, expiresInHours, ...postData } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const parsed = insertPostSchema.safeParse({ ...postData, expiresInHours });
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const post = await storage.createPost(userId, parsed.data, expiresInHours);
      res.json({ post });
    } catch (error) {
      console.error("Create post error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const userId = req.body?.userId || req.query.userId;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const deleted = await storage.deletePost(req.params.id, userId as string);
      if (!deleted) {
        return res.status(404).json({ error: "Post not found or unauthorized" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete post error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/posts/:postId/comments", async (req, res) => {
    try {
      const comments = await storage.getComments(req.params.postId);
      res.json({ comments });
    } catch (error) {
      console.error("Get comments error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      const { userId, ...commentData } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const parsed = insertCommentSchema.safeParse(commentData);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const comment = await storage.createComment(userId, parsed.data);
      res.json({ comment });
    } catch (error) {
      console.error("Create comment error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/comments/:id", async (req, res) => {
    try {
      const userId = req.body?.userId || req.query.userId;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const deleted = await storage.deleteComment(req.params.id, userId as string);
      if (!deleted) {
        return res.status(404).json({ error: "Comment not found or unauthorized" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete comment error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/vote", async (req, res) => {
    try {
      const { userId, postId, commentId, voteType } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      if (!postId && !commentId) {
        return res.status(400).json({ error: "postId or commentId is required" });
      }
      if (voteType !== 1 && voteType !== -1) {
        return res.status(400).json({ error: "voteType must be 1 or -1" });
      }
      const result = await storage.vote(userId, postId || null, commentId || null, voteType);
      res.json(result);
    } catch (error) {
      console.error("Vote error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/votes", async (req, res) => {
    try {
      const { userId, postId, commentId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const vote = await storage.getUserVote(
        userId as string, 
        (postId as string) || null, 
        (commentId as string) || null
      );
      res.json({ vote: vote || null });
    } catch (error) {
      console.error("Get vote error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/stories", async (req, res) => {
    try {
      const stories = await storage.getActiveStories();
      res.json({ stories });
    } catch (error) {
      console.error("Get stories error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/stories", async (req, res) => {
    try {
      const { userId, ...storyData } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const parsed = insertStorySchema.safeParse(storyData);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const story = await storage.createStory(userId, parsed.data);
      res.json({ story });
    } catch (error) {
      console.error("Create story error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/stories/:id/view", async (req, res) => {
    try {
      await storage.viewStory(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("View story error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/stories/:id", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const deleted = await storage.deleteStory(req.params.id, userId);
      if (!deleted) {
        return res.status(404).json({ error: "Story not found or unauthorized" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete story error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/users/:userId/polls", async (req, res) => {
    try {
      const polls = await storage.getUserPolls(req.params.userId);
      res.json({ polls });
    } catch (error) {
      console.error("Get user polls error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/users/:userId/stories", async (req, res) => {
    try {
      const stories = await storage.getUserStories(req.params.userId);
      res.json({ stories });
    } catch (error) {
      console.error("Get user stories error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/polls", async (req, res) => {
    try {
      const category = req.query.category as Category | undefined;
      const userId = req.query.userId as string | undefined;
      const pollsList = await storage.getPolls(category, userId);
      res.json({ polls: pollsList });
    } catch (error) {
      console.error("Get polls error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/polls", async (req, res) => {
    try {
      const { userId, ...pollData } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const parsed = insertPollSchema.safeParse(pollData);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const poll = await storage.createPoll(userId, parsed.data);
      res.json({ poll });
    } catch (error) {
      console.error("Create poll error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/polls/vote", async (req, res) => {
    try {
      const { pollId, optionId, userId } = req.body;
      if (!pollId || !optionId || !userId) {
        return res.status(400).json({ error: "pollId, optionId, and userId are required" });
      }
      const result = await storage.votePoll(userId, pollId, optionId);
      if (!result.success) {
        return res.status(400).json({ error: "You have already voted on this poll" });
      }
      res.json(result);
    } catch (error) {
      console.error("Vote poll error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/polls/:id", async (req, res) => {
    try {
      const userId = req.body?.userId || req.query.userId;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const deleted = await storage.deletePoll(req.params.id, userId as string);
      if (!deleted) {
        return res.status(404).json({ error: "Poll not found or unauthorized" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete poll error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
