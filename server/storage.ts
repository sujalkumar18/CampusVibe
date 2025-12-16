import { db } from "./db";
import { users, posts, comments, votes, stories, polls, pollOptions, pollVotes } from "../shared/schema";
import type { User, Post, Comment, Vote, Story, Poll, PollOption, PollVote, InsertPost, InsertComment, InsertStory, InsertPoll, Category } from "../shared/schema";
import { eq, desc, and, sql, gt } from "drizzle-orm";

export interface IStorage {
  getOrCreateUser(deviceId: string): Promise<User>;
  
  getPosts(category?: Category): Promise<Post[]>;
  getPostById(id: string): Promise<Post | undefined>;
  getUserPosts(userId: string): Promise<Post[]>;
  getUserPolls(userId: string): Promise<(Poll & { options: PollOption[] })[]>;
  getUserStories(userId: string): Promise<Story[]>;
  createPost(userId: string, post: InsertPost, expiresInHours?: number): Promise<Post>;
  deletePost(id: string, userId: string): Promise<boolean>;
  deleteExpiredPosts(): Promise<number>;
  
  getComments(postId: string): Promise<Comment[]>;
  createComment(userId: string, comment: InsertComment): Promise<Comment>;
  deleteComment(id: string, userId: string): Promise<boolean>;
  
  vote(userId: string, postId: string | null, commentId: string | null, voteType: number): Promise<{ upvotes: number; downvotes: number }>;
  getUserVote(userId: string, postId: string | null, commentId: string | null): Promise<Vote | undefined>;
  
  getActiveStories(): Promise<Story[]>;
  createStory(userId: string, story: InsertStory): Promise<Story>;
  viewStory(storyId: string): Promise<void>;
  deleteStory(id: string, userId: string): Promise<boolean>;
  
  getPolls(category?: Category, userId?: string): Promise<(Poll & { options: PollOption[]; userVotedOptionId?: string | null })[]>;
  createPoll(userId: string, poll: InsertPoll): Promise<Poll & { options: PollOption[] }>;
  votePoll(userId: string, pollId: string, optionId: string): Promise<{ success: boolean }>;
  deletePoll(id: string, userId: string): Promise<boolean>;
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

  async createPost(userId: string, post: InsertPost, expiresInHours?: number): Promise<Post> {
    const expiresAt = expiresInHours ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000) : null;
    const [newPost] = await db.insert(posts).values({
      userId,
      content: post.content,
      category: post.category,
      imageUrl: post.imageUrl,
      videoUrl: post.videoUrl,
      expiresAt,
    }).returning();
    return newPost;
  }

  async deleteExpiredPosts(): Promise<number> {
    const now = new Date();
    const result = await db.delete(posts).where(and(
      sql`${posts.expiresAt} IS NOT NULL`,
      sql`${posts.expiresAt} < ${now}`
    )).returning();
    return result.length;
  }

  async getUserPolls(userId: string): Promise<(Poll & { options: PollOption[] })[]> {
    const pollsList = await db.select().from(polls).where(eq(polls.userId, userId)).orderBy(desc(polls.createdAt));
    const result = await Promise.all(pollsList.map(async (poll) => {
      const options = await db.select().from(pollOptions).where(eq(pollOptions.pollId, poll.id));
      return { ...poll, options };
    }));
    return result;
  }

  async getUserStories(userId: string): Promise<Story[]> {
    return db.select().from(stories).where(eq(stories.userId, userId)).orderBy(desc(stories.createdAt));
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

  async deleteStory(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(stories).where(and(eq(stories.id, id), eq(stories.userId, userId))).returning();
    return result.length > 0;
  }

  async getPolls(category?: Category, userId?: string): Promise<(Poll & { options: PollOption[]; userVotedOptionId?: string | null })[]> {
    let pollsList: Poll[];
    if (category) {
      pollsList = await db.select().from(polls).where(eq(polls.category, category)).orderBy(desc(polls.createdAt));
    } else {
      pollsList = await db.select().from(polls).orderBy(desc(polls.createdAt));
    }

    const result = await Promise.all(pollsList.map(async (poll) => {
      const options = await db.select().from(pollOptions).where(eq(pollOptions.pollId, poll.id));
      let userVotedOptionId: string | null = null;
      
      if (userId) {
        const userVote = await db.select().from(pollVotes)
          .where(and(eq(pollVotes.pollId, poll.id), eq(pollVotes.userId, userId)))
          .limit(1);
        if (userVote.length > 0) {
          userVotedOptionId = userVote[0].optionId;
        }
      }
      
      return { ...poll, options, userVotedOptionId };
    }));

    return result;
  }

  async createPoll(userId: string, poll: InsertPoll): Promise<Poll & { options: PollOption[] }> {
    const expiresAt = poll.expiresInHours 
      ? new Date(Date.now() + poll.expiresInHours * 60 * 60 * 1000)
      : null;

    const [newPoll] = await db.insert(polls).values({
      userId,
      question: poll.question,
      category: poll.category,
      expiresAt,
    }).returning();

    const createdOptions: PollOption[] = [];
    for (const optionText of poll.options) {
      const [option] = await db.insert(pollOptions).values({
        pollId: newPoll.id,
        optionText,
      }).returning();
      createdOptions.push(option);
    }

    return { ...newPoll, options: createdOptions };
  }

  async votePoll(userId: string, pollId: string, optionId: string): Promise<{ success: boolean }> {
    const existingVote = await db.select().from(pollVotes)
      .where(and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, userId)))
      .limit(1);

    if (existingVote.length > 0) {
      return { success: false };
    }

    await db.insert(pollVotes).values({
      pollId,
      optionId,
      userId,
    });

    await db.update(pollOptions)
      .set({ voteCount: sql`${pollOptions.voteCount} + 1` })
      .where(eq(pollOptions.id, optionId));

    await db.update(polls)
      .set({ totalVotes: sql`${polls.totalVotes} + 1` })
      .where(eq(polls.id, pollId));

    return { success: true };
  }

  async deletePoll(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(polls).where(and(eq(polls.id, id), eq(polls.userId, userId))).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
