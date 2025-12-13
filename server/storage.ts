import { db } from "./db";
import { users, posts, comments, votes, stories, reels } from "../shared/schema";
import type { User, Post, Comment, Vote, Story, Reel, InsertPost, InsertComment, InsertStory, InsertReel, Category } from "../shared/schema";
import { eq, desc, and, sql, gt } from "drizzle-orm";

export interface IStorage {
  getOrCreateUser(deviceId: string): Promise<User>;
  
  getPosts(category?: Category): Promise<Post[]>;
  getPostById(id: string): Promise<Post | undefined>;
  getUserPosts(userId: string): Promise<Post[]>;
  createPost(userId: string, post: InsertPost): Promise<Post>;
  deletePost(id: string, userId: string): Promise<boolean>;
  
  getComments(postId: string): Promise<Comment[]>;
  createComment(userId: string, comment: InsertComment): Promise<Comment>;
  deleteComment(id: string, userId: string): Promise<boolean>;
  
  vote(userId: string, postId: string | null, commentId: string | null, voteType: number): Promise<{ upvotes: number; downvotes: number }>;
  getUserVote(userId: string, postId: string | null, commentId: string | null): Promise<Vote | undefined>;
  
  getActiveStories(): Promise<Story[]>;
  createStory(userId: string, story: InsertStory): Promise<Story>;
  viewStory(storyId: string): Promise<void>;
  
  getReels(category?: Category): Promise<Reel[]>;
  getReelById(id: string): Promise<Reel | undefined>;
  createReel(userId: string, reel: InsertReel): Promise<Reel>;
  deleteReel(id: string, userId: string): Promise<boolean>;
  viewReel(reelId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getOrCreateUser(deviceId: string): Promise<User> {
    const existing = await db.select().from(users).where(eq(users.deviceId, deviceId)).limit(1);
    if (existing.length > 0) {
      return existing[0];
    }
    const [newUser] = await db.insert(users).values({ deviceId }).returning();
    return newUser;
  }

  async getPosts(category?: Category): Promise<Post[]> {
    if (category) {
      return db.select().from(posts).where(eq(posts.category, category)).orderBy(desc(posts.createdAt));
    }
    return db.select().from(posts).orderBy(desc(posts.createdAt));
  }

  async getPostById(id: string): Promise<Post | undefined> {
    const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return result[0];
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    return db.select().from(posts).where(eq(posts.userId, userId)).orderBy(desc(posts.createdAt));
  }

  async createPost(userId: string, post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values({
      userId,
      content: post.content,
      category: post.category,
      imageUrl: post.imageUrl,
    }).returning();
    return newPost;
  }

  async deletePost(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(posts).where(and(eq(posts.id, id), eq(posts.userId, userId))).returning();
    return result.length > 0;
  }

  async getComments(postId: string): Promise<Comment[]> {
    return db.select().from(comments).where(eq(comments.postId, postId)).orderBy(desc(comments.createdAt));
  }

  async createComment(userId: string, comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values({
      userId,
      postId: comment.postId,
      content: comment.content,
    }).returning();
    
    await db.update(posts)
      .set({ commentCount: sql`${posts.commentCount} + 1` })
      .where(eq(posts.id, comment.postId));
    
    return newComment;
  }

  async deleteComment(id: string, userId: string): Promise<boolean> {
    const comment = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
    if (comment.length === 0 || comment[0].userId !== userId) {
      return false;
    }
    
    await db.delete(comments).where(eq(comments.id, id));
    await db.update(posts)
      .set({ commentCount: sql`${posts.commentCount} - 1` })
      .where(eq(posts.id, comment[0].postId));
    
    return true;
  }

  async vote(userId: string, postId: string | null, commentId: string | null, voteType: number): Promise<{ upvotes: number; downvotes: number }> {
    const existingVote = await this.getUserVote(userId, postId, commentId);
    
    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await db.delete(votes).where(eq(votes.id, existingVote.id));
        if (postId) {
          if (voteType === 1) {
            await db.update(posts).set({ upvotes: sql`${posts.upvotes} - 1` }).where(eq(posts.id, postId));
          } else {
            await db.update(posts).set({ downvotes: sql`${posts.downvotes} - 1` }).where(eq(posts.id, postId));
          }
        }
        if (commentId) {
          if (voteType === 1) {
            await db.update(comments).set({ upvotes: sql`${comments.upvotes} - 1` }).where(eq(comments.id, commentId));
          } else {
            await db.update(comments).set({ downvotes: sql`${comments.downvotes} - 1` }).where(eq(comments.id, commentId));
          }
        }
      } else {
        await db.update(votes).set({ voteType }).where(eq(votes.id, existingVote.id));
        if (postId) {
          if (voteType === 1) {
            await db.update(posts).set({ 
              upvotes: sql`${posts.upvotes} + 1`,
              downvotes: sql`${posts.downvotes} - 1`
            }).where(eq(posts.id, postId));
          } else {
            await db.update(posts).set({ 
              upvotes: sql`${posts.upvotes} - 1`,
              downvotes: sql`${posts.downvotes} + 1`
            }).where(eq(posts.id, postId));
          }
        }
        if (commentId) {
          if (voteType === 1) {
            await db.update(comments).set({ 
              upvotes: sql`${comments.upvotes} + 1`,
              downvotes: sql`${comments.downvotes} - 1`
            }).where(eq(comments.id, commentId));
          } else {
            await db.update(comments).set({ 
              upvotes: sql`${comments.upvotes} - 1`,
              downvotes: sql`${comments.downvotes} + 1`
            }).where(eq(comments.id, commentId));
          }
        }
      }
    } else {
      await db.insert(votes).values({ userId, postId, commentId, voteType });
      if (postId) {
        if (voteType === 1) {
          await db.update(posts).set({ upvotes: sql`${posts.upvotes} + 1` }).where(eq(posts.id, postId));
        } else {
          await db.update(posts).set({ downvotes: sql`${posts.downvotes} + 1` }).where(eq(posts.id, postId));
        }
      }
      if (commentId) {
        if (voteType === 1) {
          await db.update(comments).set({ upvotes: sql`${comments.upvotes} + 1` }).where(eq(comments.id, commentId));
        } else {
          await db.update(comments).set({ downvotes: sql`${comments.downvotes} + 1` }).where(eq(comments.id, commentId));
        }
      }
    }

    if (postId) {
      const post = await this.getPostById(postId);
      return { upvotes: post?.upvotes || 0, downvotes: post?.downvotes || 0 };
    }
    if (commentId) {
      const comment = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1);
      return { upvotes: comment[0]?.upvotes || 0, downvotes: comment[0]?.downvotes || 0 };
    }
    return { upvotes: 0, downvotes: 0 };
  }

  async getUserVote(userId: string, postId: string | null, commentId: string | null): Promise<Vote | undefined> {
    if (postId) {
      const result = await db.select().from(votes).where(and(eq(votes.userId, userId), eq(votes.postId, postId))).limit(1);
      return result[0];
    }
    if (commentId) {
      const result = await db.select().from(votes).where(and(eq(votes.userId, userId), eq(votes.commentId, commentId))).limit(1);
      return result[0];
    }
    return undefined;
  }

  async getActiveStories(): Promise<Story[]> {
    const now = new Date();
    return db.select().from(stories).where(gt(stories.expiresAt, now)).orderBy(desc(stories.createdAt));
  }

  async createStory(userId: string, story: InsertStory): Promise<Story> {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const [newStory] = await db.insert(stories).values({
      userId,
      imageUrl: story.imageUrl,
      caption: story.caption,
      expiresAt,
    }).returning();
    return newStory;
  }

  async viewStory(storyId: string): Promise<void> {
    await db.update(stories).set({ viewCount: sql`${stories.viewCount} + 1` }).where(eq(stories.id, storyId));
  }

  async getReels(category?: Category): Promise<Reel[]> {
    if (category) {
      return db.select().from(reels).where(eq(reels.category, category)).orderBy(desc(reels.createdAt));
    }
    return db.select().from(reels).orderBy(desc(reels.createdAt));
  }

  async getReelById(id: string): Promise<Reel | undefined> {
    const result = await db.select().from(reels).where(eq(reels.id, id)).limit(1);
    return result[0];
  }

  async createReel(userId: string, reel: InsertReel): Promise<Reel> {
    const [newReel] = await db.insert(reels).values({
      userId,
      videoUrl: reel.videoUrl,
      thumbnailUrl: reel.thumbnailUrl,
      description: reel.description,
      category: reel.category,
    }).returning();
    return newReel;
  }

  async deleteReel(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(reels).where(and(eq(reels.id, id), eq(reels.userId, userId))).returning();
    return result.length > 0;
  }

  async viewReel(reelId: string): Promise<void> {
    await db.update(reels).set({ viewCount: sql`${reels.viewCount} + 1` }).where(eq(reels.id, reelId));
  }
}

export const storage = new DatabaseStorage();
