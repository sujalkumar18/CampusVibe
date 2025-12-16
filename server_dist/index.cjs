"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server/index.ts
var import_express = __toESM(require("express"));

// server/routes.ts
var import_node_http = require("node:http");
var import_multer = __toESM(require("multer"));
var path = __toESM(require("path"));
var fs = __toESM(require("fs"));

// server/db.ts
var import_node_postgres = require("drizzle-orm/node-postgres");
var import_pg = __toESM(require("pg"));

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  categoryEnum: () => categoryEnum,
  comments: () => comments,
  insertCommentSchema: () => insertCommentSchema,
  insertPollSchema: () => insertPollSchema,
  insertPostSchema: () => insertPostSchema,
  insertStorySchema: () => insertStorySchema,
  insertUserSchema: () => insertUserSchema,
  pollOptions: () => pollOptions,
  pollVotes: () => pollVotes,
  polls: () => polls,
  posts: () => posts,
  stories: () => stories,
  users: () => users,
  votes: () => votes
});
var import_drizzle_orm = require("drizzle-orm");
var import_pg_core = require("drizzle-orm/pg-core");
var import_drizzle_zod = require("drizzle-zod");
var import_zod = require("zod");
var categoryEnum = (0, import_pg_core.pgEnum)("category", ["confession", "crush", "meme", "rant", "compliment"]);
var users = (0, import_pg_core.pgTable)("users", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  deviceId: (0, import_pg_core.text)("device_id").notNull().unique(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var posts = (0, import_pg_core.pgTable)("posts", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  userId: (0, import_pg_core.varchar)("user_id").references(() => users.id).notNull(),
  content: (0, import_pg_core.text)("content").notNull(),
  category: categoryEnum("category").notNull(),
  imageUrl: (0, import_pg_core.text)("image_url"),
  videoUrl: (0, import_pg_core.text)("video_url"),
  upvotes: (0, import_pg_core.integer)("upvotes").default(0).notNull(),
  downvotes: (0, import_pg_core.integer)("downvotes").default(0).notNull(),
  commentCount: (0, import_pg_core.integer)("comment_count").default(0).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  expiresAt: (0, import_pg_core.timestamp)("expires_at")
});
var comments = (0, import_pg_core.pgTable)("comments", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  postId: (0, import_pg_core.varchar)("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  userId: (0, import_pg_core.varchar)("user_id").references(() => users.id).notNull(),
  content: (0, import_pg_core.text)("content").notNull(),
  upvotes: (0, import_pg_core.integer)("upvotes").default(0).notNull(),
  downvotes: (0, import_pg_core.integer)("downvotes").default(0).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var votes = (0, import_pg_core.pgTable)("votes", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  userId: (0, import_pg_core.varchar)("user_id").references(() => users.id).notNull(),
  postId: (0, import_pg_core.varchar)("post_id").references(() => posts.id, { onDelete: "cascade" }),
  commentId: (0, import_pg_core.varchar)("comment_id").references(() => comments.id, { onDelete: "cascade" }),
  voteType: (0, import_pg_core.integer)("vote_type").notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var stories = (0, import_pg_core.pgTable)("stories", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  userId: (0, import_pg_core.varchar)("user_id").references(() => users.id).notNull(),
  imageUrl: (0, import_pg_core.text)("image_url").notNull(),
  caption: (0, import_pg_core.text)("caption"),
  viewCount: (0, import_pg_core.integer)("view_count").default(0).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  expiresAt: (0, import_pg_core.timestamp)("expires_at").notNull()
});
var polls = (0, import_pg_core.pgTable)("polls", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  userId: (0, import_pg_core.varchar)("user_id").references(() => users.id).notNull(),
  question: (0, import_pg_core.text)("question").notNull(),
  category: categoryEnum("category").notNull(),
  totalVotes: (0, import_pg_core.integer)("total_votes").default(0).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  expiresAt: (0, import_pg_core.timestamp)("expires_at")
});
var pollOptions = (0, import_pg_core.pgTable)("poll_options", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  pollId: (0, import_pg_core.varchar)("poll_id").references(() => polls.id, { onDelete: "cascade" }).notNull(),
  optionText: (0, import_pg_core.text)("option_text").notNull(),
  voteCount: (0, import_pg_core.integer)("vote_count").default(0).notNull()
});
var pollVotes = (0, import_pg_core.pgTable)("poll_votes", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  pollId: (0, import_pg_core.varchar)("poll_id").references(() => polls.id, { onDelete: "cascade" }).notNull(),
  optionId: (0, import_pg_core.varchar)("option_id").references(() => pollOptions.id, { onDelete: "cascade" }).notNull(),
  userId: (0, import_pg_core.varchar)("user_id").references(() => users.id).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var insertUserSchema = (0, import_drizzle_zod.createInsertSchema)(users).pick({
  deviceId: true
});
var insertPostSchema = (0, import_drizzle_zod.createInsertSchema)(posts).pick({
  content: true,
  category: true,
  imageUrl: true,
  videoUrl: true
}).extend({
  expiresInHours: import_zod.z.number().optional()
});
var insertCommentSchema = (0, import_drizzle_zod.createInsertSchema)(comments).pick({
  postId: true,
  content: true
});
var insertStorySchema = (0, import_drizzle_zod.createInsertSchema)(stories).pick({
  imageUrl: true,
  caption: true
});
var insertPollSchema = import_zod.z.object({
  question: import_zod.z.string().min(1),
  category: import_zod.z.enum(["confession", "crush", "meme", "rant", "compliment"]),
  options: import_zod.z.array(import_zod.z.string().min(1)).min(2).max(6),
  expiresInHours: import_zod.z.number().optional()
});

// server/db.ts
var { Pool } = import_pg.default;
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
var db = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });

// server/storage.ts
var import_drizzle_orm2 = require("drizzle-orm");
var DatabaseStorage = class {
  async getOrCreateUser(deviceId) {
    const existing = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.deviceId, deviceId)).limit(1);
    if (existing.length > 0) {
      return existing[0];
    }
    const [newUser] = await db.insert(users).values({ deviceId }).returning();
    return newUser;
  }
  async getPosts(category) {
    if (category) {
      return db.select().from(posts).where((0, import_drizzle_orm2.eq)(posts.category, category)).orderBy((0, import_drizzle_orm2.desc)(posts.createdAt));
    }
    return db.select().from(posts).orderBy((0, import_drizzle_orm2.desc)(posts.createdAt));
  }
  async getPostById(id) {
    const result = await db.select().from(posts).where((0, import_drizzle_orm2.eq)(posts.id, id)).limit(1);
    return result[0];
  }
  async getUserPosts(userId) {
    return db.select().from(posts).where((0, import_drizzle_orm2.eq)(posts.userId, userId)).orderBy((0, import_drizzle_orm2.desc)(posts.createdAt));
  }
  async createPost(userId, post, expiresInHours) {
    const expiresAt = expiresInHours ? new Date(Date.now() + expiresInHours * 60 * 60 * 1e3) : null;
    const [newPost] = await db.insert(posts).values({
      userId,
      content: post.content,
      category: post.category,
      imageUrl: post.imageUrl,
      videoUrl: post.videoUrl,
      expiresAt
    }).returning();
    return newPost;
  }
  async deleteExpiredPosts() {
    const now = /* @__PURE__ */ new Date();
    const result = await db.delete(posts).where((0, import_drizzle_orm2.and)(
      import_drizzle_orm2.sql`${posts.expiresAt} IS NOT NULL`,
      import_drizzle_orm2.sql`${posts.expiresAt} < ${now}`
    )).returning();
    return result.length;
  }
  async getUserPolls(userId) {
    const pollsList = await db.select().from(polls).where((0, import_drizzle_orm2.eq)(polls.userId, userId)).orderBy((0, import_drizzle_orm2.desc)(polls.createdAt));
    const result = await Promise.all(pollsList.map(async (poll) => {
      const options = await db.select().from(pollOptions).where((0, import_drizzle_orm2.eq)(pollOptions.pollId, poll.id));
      return { ...poll, options };
    }));
    return result;
  }
  async getUserStories(userId) {
    return db.select().from(stories).where((0, import_drizzle_orm2.eq)(stories.userId, userId)).orderBy((0, import_drizzle_orm2.desc)(stories.createdAt));
  }
  async deletePost(id, userId) {
    const result = await db.delete(posts).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(posts.id, id), (0, import_drizzle_orm2.eq)(posts.userId, userId))).returning();
    return result.length > 0;
  }
  async getComments(postId) {
    return db.select().from(comments).where((0, import_drizzle_orm2.eq)(comments.postId, postId)).orderBy((0, import_drizzle_orm2.desc)(comments.createdAt));
  }
  async createComment(userId, comment) {
    const [newComment] = await db.insert(comments).values({
      userId,
      postId: comment.postId,
      content: comment.content
    }).returning();
    await db.update(posts).set({ commentCount: import_drizzle_orm2.sql`${posts.commentCount} + 1` }).where((0, import_drizzle_orm2.eq)(posts.id, comment.postId));
    return newComment;
  }
  async deleteComment(id, userId) {
    const comment = await db.select().from(comments).where((0, import_drizzle_orm2.eq)(comments.id, id)).limit(1);
    if (comment.length === 0 || comment[0].userId !== userId) {
      return false;
    }
    await db.delete(comments).where((0, import_drizzle_orm2.eq)(comments.id, id));
    await db.update(posts).set({ commentCount: import_drizzle_orm2.sql`${posts.commentCount} - 1` }).where((0, import_drizzle_orm2.eq)(posts.id, comment[0].postId));
    return true;
  }
  async vote(userId, postId, commentId, voteType) {
    const existingVote = await this.getUserVote(userId, postId, commentId);
    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await db.delete(votes).where((0, import_drizzle_orm2.eq)(votes.id, existingVote.id));
        if (postId) {
          if (voteType === 1) {
            await db.update(posts).set({ upvotes: import_drizzle_orm2.sql`${posts.upvotes} - 1` }).where((0, import_drizzle_orm2.eq)(posts.id, postId));
          } else {
            await db.update(posts).set({ downvotes: import_drizzle_orm2.sql`${posts.downvotes} - 1` }).where((0, import_drizzle_orm2.eq)(posts.id, postId));
          }
        }
        if (commentId) {
          if (voteType === 1) {
            await db.update(comments).set({ upvotes: import_drizzle_orm2.sql`${comments.upvotes} - 1` }).where((0, import_drizzle_orm2.eq)(comments.id, commentId));
          } else {
            await db.update(comments).set({ downvotes: import_drizzle_orm2.sql`${comments.downvotes} - 1` }).where((0, import_drizzle_orm2.eq)(comments.id, commentId));
          }
        }
      } else {
        await db.update(votes).set({ voteType }).where((0, import_drizzle_orm2.eq)(votes.id, existingVote.id));
        if (postId) {
          if (voteType === 1) {
            await db.update(posts).set({
              upvotes: import_drizzle_orm2.sql`${posts.upvotes} + 1`,
              downvotes: import_drizzle_orm2.sql`${posts.downvotes} - 1`
            }).where((0, import_drizzle_orm2.eq)(posts.id, postId));
          } else {
            await db.update(posts).set({
              upvotes: import_drizzle_orm2.sql`${posts.upvotes} - 1`,
              downvotes: import_drizzle_orm2.sql`${posts.downvotes} + 1`
            }).where((0, import_drizzle_orm2.eq)(posts.id, postId));
          }
        }
        if (commentId) {
          if (voteType === 1) {
            await db.update(comments).set({
              upvotes: import_drizzle_orm2.sql`${comments.upvotes} + 1`,
              downvotes: import_drizzle_orm2.sql`${comments.downvotes} - 1`
            }).where((0, import_drizzle_orm2.eq)(comments.id, commentId));
          } else {
            await db.update(comments).set({
              upvotes: import_drizzle_orm2.sql`${comments.upvotes} - 1`,
              downvotes: import_drizzle_orm2.sql`${comments.downvotes} + 1`
            }).where((0, import_drizzle_orm2.eq)(comments.id, commentId));
          }
        }
      }
    } else {
      await db.insert(votes).values({ userId, postId, commentId, voteType });
      if (postId) {
        if (voteType === 1) {
          await db.update(posts).set({ upvotes: import_drizzle_orm2.sql`${posts.upvotes} + 1` }).where((0, import_drizzle_orm2.eq)(posts.id, postId));
        } else {
          await db.update(posts).set({ downvotes: import_drizzle_orm2.sql`${posts.downvotes} + 1` }).where((0, import_drizzle_orm2.eq)(posts.id, postId));
        }
      }
      if (commentId) {
        if (voteType === 1) {
          await db.update(comments).set({ upvotes: import_drizzle_orm2.sql`${comments.upvotes} + 1` }).where((0, import_drizzle_orm2.eq)(comments.id, commentId));
        } else {
          await db.update(comments).set({ downvotes: import_drizzle_orm2.sql`${comments.downvotes} + 1` }).where((0, import_drizzle_orm2.eq)(comments.id, commentId));
        }
      }
    }
    if (postId) {
      const post = await this.getPostById(postId);
      return { upvotes: post?.upvotes || 0, downvotes: post?.downvotes || 0 };
    }
    if (commentId) {
      const comment = await db.select().from(comments).where((0, import_drizzle_orm2.eq)(comments.id, commentId)).limit(1);
      return { upvotes: comment[0]?.upvotes || 0, downvotes: comment[0]?.downvotes || 0 };
    }
    return { upvotes: 0, downvotes: 0 };
  }
  async getUserVote(userId, postId, commentId) {
    if (postId) {
      const result = await db.select().from(votes).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(votes.userId, userId), (0, import_drizzle_orm2.eq)(votes.postId, postId))).limit(1);
      return result[0];
    }
    if (commentId) {
      const result = await db.select().from(votes).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(votes.userId, userId), (0, import_drizzle_orm2.eq)(votes.commentId, commentId))).limit(1);
      return result[0];
    }
    return void 0;
  }
  async getActiveStories() {
    const now = /* @__PURE__ */ new Date();
    return db.select().from(stories).where((0, import_drizzle_orm2.gt)(stories.expiresAt, now)).orderBy((0, import_drizzle_orm2.desc)(stories.createdAt));
  }
  async createStory(userId, story) {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3);
    const [newStory] = await db.insert(stories).values({
      userId,
      imageUrl: story.imageUrl,
      caption: story.caption,
      expiresAt
    }).returning();
    return newStory;
  }
  async viewStory(storyId) {
    await db.update(stories).set({ viewCount: import_drizzle_orm2.sql`${stories.viewCount} + 1` }).where((0, import_drizzle_orm2.eq)(stories.id, storyId));
  }
  async deleteStory(id, userId) {
    const result = await db.delete(stories).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(stories.id, id), (0, import_drizzle_orm2.eq)(stories.userId, userId))).returning();
    return result.length > 0;
  }
  async getPolls(category, userId) {
    let pollsList;
    if (category) {
      pollsList = await db.select().from(polls).where((0, import_drizzle_orm2.eq)(polls.category, category)).orderBy((0, import_drizzle_orm2.desc)(polls.createdAt));
    } else {
      pollsList = await db.select().from(polls).orderBy((0, import_drizzle_orm2.desc)(polls.createdAt));
    }
    const result = await Promise.all(pollsList.map(async (poll) => {
      const options = await db.select().from(pollOptions).where((0, import_drizzle_orm2.eq)(pollOptions.pollId, poll.id));
      let userVotedOptionId = null;
      if (userId) {
        const userVote = await db.select().from(pollVotes).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(pollVotes.pollId, poll.id), (0, import_drizzle_orm2.eq)(pollVotes.userId, userId))).limit(1);
        if (userVote.length > 0) {
          userVotedOptionId = userVote[0].optionId;
        }
      }
      return { ...poll, options, userVotedOptionId };
    }));
    return result;
  }
  async createPoll(userId, poll) {
    const expiresAt = poll.expiresInHours ? new Date(Date.now() + poll.expiresInHours * 60 * 60 * 1e3) : null;
    const [newPoll] = await db.insert(polls).values({
      userId,
      question: poll.question,
      category: poll.category,
      expiresAt
    }).returning();
    const createdOptions = [];
    for (const optionText of poll.options) {
      const [option] = await db.insert(pollOptions).values({
        pollId: newPoll.id,
        optionText
      }).returning();
      createdOptions.push(option);
    }
    return { ...newPoll, options: createdOptions };
  }
  async votePoll(userId, pollId, optionId) {
    const existingVote = await db.select().from(pollVotes).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(pollVotes.pollId, pollId), (0, import_drizzle_orm2.eq)(pollVotes.userId, userId))).limit(1);
    if (existingVote.length > 0) {
      return { success: false };
    }
    await db.insert(pollVotes).values({
      pollId,
      optionId,
      userId
    });
    await db.update(pollOptions).set({ voteCount: import_drizzle_orm2.sql`${pollOptions.voteCount} + 1` }).where((0, import_drizzle_orm2.eq)(pollOptions.id, optionId));
    await db.update(polls).set({ totalVotes: import_drizzle_orm2.sql`${polls.totalVotes} + 1` }).where((0, import_drizzle_orm2.eq)(polls.id, pollId));
    return { success: true };
  }
  async deletePoll(id, userId) {
    const result = await db.delete(polls).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(polls.id, id), (0, import_drizzle_orm2.eq)(polls.userId, userId))).returning();
    return result.length > 0;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
var uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
var multerStorage = import_multer.default.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }
});
var upload = (0, import_multer.default)({
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
  }
});
async function registerRoutes(app2) {
  app2.use("/uploads", (req, res, next) => {
    res.setHeader("Cache-Control", "public, max-age=31536000");
    next();
  }, require("express").static(uploadsDir));
  app2.post("/api/upload", upload.single("file"), (req, res) => {
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
  app2.post("/api/auth", async (req, res) => {
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
  app2.get("/api/posts", async (req, res) => {
    try {
      const category = req.query.category;
      const posts2 = await storage.getPosts(category);
      res.json({ posts: posts2 });
    } catch (error) {
      console.error("Get posts error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/posts/:id", async (req, res) => {
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
  app2.get("/api/users/:userId/posts", async (req, res) => {
    try {
      const posts2 = await storage.getUserPosts(req.params.userId);
      res.json({ posts: posts2 });
    } catch (error) {
      console.error("Get user posts error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/posts", async (req, res) => {
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
  app2.delete("/api/posts/:id", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const deleted = await storage.deletePost(req.params.id, userId);
      if (!deleted) {
        return res.status(404).json({ error: "Post not found or unauthorized" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete post error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/posts/:postId/comments", async (req, res) => {
    try {
      const comments2 = await storage.getComments(req.params.postId);
      res.json({ comments: comments2 });
    } catch (error) {
      console.error("Get comments error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/comments", async (req, res) => {
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
  app2.delete("/api/comments/:id", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const deleted = await storage.deleteComment(req.params.id, userId);
      if (!deleted) {
        return res.status(404).json({ error: "Comment not found or unauthorized" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete comment error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/vote", async (req, res) => {
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
  app2.get("/api/votes", async (req, res) => {
    try {
      const { userId, postId, commentId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const vote = await storage.getUserVote(
        userId,
        postId || null,
        commentId || null
      );
      res.json({ vote: vote || null });
    } catch (error) {
      console.error("Get vote error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/stories", async (req, res) => {
    try {
      const stories2 = await storage.getActiveStories();
      res.json({ stories: stories2 });
    } catch (error) {
      console.error("Get stories error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/stories", async (req, res) => {
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
  app2.post("/api/stories/:id/view", async (req, res) => {
    try {
      await storage.viewStory(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("View story error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/stories/:id", async (req, res) => {
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
  app2.get("/api/users/:userId/polls", async (req, res) => {
    try {
      const polls2 = await storage.getUserPolls(req.params.userId);
      res.json({ polls: polls2 });
    } catch (error) {
      console.error("Get user polls error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/users/:userId/stories", async (req, res) => {
    try {
      const stories2 = await storage.getUserStories(req.params.userId);
      res.json({ stories: stories2 });
    } catch (error) {
      console.error("Get user stories error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/polls", async (req, res) => {
    try {
      const category = req.query.category;
      const userId = req.query.userId;
      const pollsList = await storage.getPolls(category, userId);
      res.json({ polls: pollsList });
    } catch (error) {
      console.error("Get polls error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/polls", async (req, res) => {
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
  app2.post("/api/polls/vote", async (req, res) => {
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
  app2.delete("/api/polls/:id", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const deleted = await storage.deletePoll(req.params.id, userId);
      if (!deleted) {
        return res.status(404).json({ error: "Poll not found or unauthorized" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete poll error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  const httpServer = (0, import_node_http.createServer)(app2);
  return httpServer;
}

// server/index.ts
var fs2 = __toESM(require("fs"));
var path2 = __toESM(require("path"));
var app = (0, import_express.default)();
var log = console.log;
function setupCors(app2) {
  app2.use((req, res, next) => {
    const origins = /* @__PURE__ */ new Set();
    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }
    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
        origins.add(`https://${d.trim()}`);
      });
    }
    if (process.env.ALLOWED_ORIGINS) {
      process.env.ALLOWED_ORIGINS.split(",").forEach((d) => {
        origins.add(d.trim());
      });
    }
    const origin = req.header("origin");
    if (!origin) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    } else if (origins.has(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header("Access-Control-Allow-Headers", "Content-Type");
      res.header("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
}
function setupBodyParsing(app2) {
  app2.use(
    import_express.default.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app2.use(import_express.default.urlencoded({ extended: false }));
}
function setupRequestLogging(app2) {
  app2.use((req, res, next) => {
    const start = Date.now();
    const path3 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      if (!path3.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    });
    next();
  });
}
function getAppName() {
  try {
    const appJsonPath = path2.resolve(process.cwd(), "app.json");
    const appJsonContent = fs2.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}
function serveExpoManifest(platform, res) {
  const manifestPath = path2.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json"
  );
  if (!fs2.existsSync(manifestPath)) {
    return res.status(404).json({ error: `Manifest not found for platform: ${platform}` });
  }
  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");
  const manifest = fs2.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}
function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;
  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);
  const html = landingPageTemplate.replace(/BASE_URL_PLACEHOLDER/g, baseUrl).replace(/EXPS_URL_PLACEHOLDER/g, expsUrl).replace(/APP_NAME_PLACEHOLDER/g, appName);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
function configureExpoAndLanding(app2) {
  const templatePath = path2.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html"
  );
  const landingPageTemplate = fs2.readFileSync(templatePath, "utf-8");
  const appName = getAppName();
  log("Serving static Expo files with dynamic manifest routing");
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }
    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }
    if (req.path === "/") {
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName
      });
    }
    next();
  });
  app2.use("/assets", import_express.default.static(path2.resolve(process.cwd(), "assets")));
  app2.use(import_express.default.static(path2.resolve(process.cwd(), "static-build")));
  log("Expo routing: Checking expo-platform header on / and /manifest");
}
function setupErrorHandler(app2) {
  app2.use((err, _req, res, _next) => {
    const error = err;
    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
}
(async () => {
  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);
  configureExpoAndLanding(app);
  const server = await registerRoutes(app);
  setupErrorHandler(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      log(`express server serving on port ${port}`);
    }
  );
  setInterval(async () => {
    try {
      const deletedCount = await storage.deleteExpiredPosts();
      if (deletedCount > 0) {
        log(`Auto-deleted ${deletedCount} expired posts`);
      }
    } catch (error) {
      console.error("Error deleting expired posts:", error);
    }
  }, 60 * 1e3);
})();
