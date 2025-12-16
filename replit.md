# CampusVibe - Anonymous College Social App

## Overview
CampusVibe is an anonymous social media platform designed specifically for Indian college students. Users can share confessions, crushes, memes, rants, and compliments anonymously with their campus community. The app features a modern dark mode UI with Instagram-inspired design elements.

## Current State
**Version**: MVP (Fully Functional)
**Status**: Backend API complete, frontend integrated with real data

## Recent Changes (December 2025)
- Implemented complete PostgreSQL database with Drizzle ORM
- Added user authentication via device ID (anonymous)
- Created full CRUD API for posts, comments, and votes
- Integrated frontend screens with real API data
- Added delete functionality for posts and polls (user's own content only)
- Added auto-delete option for text posts (1h, 6h, 12h, 24h expiry)
- **Removed Stories feature** - Simplified app to focus on text-based posts
- **Added video upload support to posts** - Twitter-style posts with photo/video attachments

## Key Features
- **Anonymous Posts**: Share text posts with category tags (Confession, Crush, Meme, Rant, Compliment)
- **Reels**: Short video feed similar to Instagram/TikTok
- **Polls**: Create polls and vote anonymously
- **Photo Posts**: Add images to your anonymous posts
- **Video Posts**: Add videos to your anonymous posts (Twitter-style)
- **Upvote/Downvote System**: Reddit-style voting on content
- **Comments**: Engage with posts anonymously
- **Profile**: View and manage your own anonymous posts
- **Delete Content**: Remove your posts and polls anytime
- **Auto-Delete**: Set posts to automatically expire after 1h, 6h, 12h, or 24h

## Tech Stack
- **Frontend**: React Native with Expo SDK 54
- **Navigation**: React Navigation 7 (Bottom Tabs + Stack)
- **Styling**: StyleSheet with custom theme
- **Animations**: React Native Reanimated
- **Icons**: @expo/vector-icons (Feather)
- **State**: TanStack React Query (data fetching & caching)
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM

## Project Structure
```
client/
├── screens/
│   ├── HomeScreen.tsx          # Main feed with posts (API integrated)
│   ├── ReelsScreen.tsx         # Short video feed
│   ├── ProfileScreen.tsx       # User's post history (API integrated)
│   ├── CreatePostScreen.tsx    # Create new post modal (API integrated)
│   ├── CreateReelScreen.tsx    # Record/upload reel
│   └── PostDetailScreen.tsx    # Single post with comments (API integrated)
├── navigation/
│   ├── RootStackNavigator.tsx  # Root navigation
│   └── MainTabNavigator.tsx    # 4-tab bottom navigator
├── hooks/
│   ├── useAuth.ts              # Device-based anonymous auth
│   ├── usePosts.ts             # Posts CRUD operations
│   └── useComments.ts          # Comments CRUD operations
├── components/
│   └── (Shared UI components)
└── constants/
    └── theme.ts                # CampusVibe color palette

server/
├── index.ts                    # Express server entry
├── routes.ts                   # API route handlers
├── storage.ts                  # Database operations
└── db.ts                       # Drizzle database connection

shared/
└── schema.ts                   # Drizzle schema definitions
```

## Database Schema
- **users**: Anonymous users with device ID
- **posts**: Text posts with categories and vote counts
- **comments**: Post comments with vote counts
- **votes**: User votes on posts and comments
- **stories**: 24-hour disappearing content

## API Endpoints
- `POST /api/auth` - Authenticate/create user by device ID
- `GET /api/posts` - Get all posts (optional category filter)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post
- `DELETE /api/posts/:id` - Delete post (owner only)
- `GET /api/users/:userId/posts` - Get user's posts
- `GET /api/posts/:postId/comments` - Get post comments
- `POST /api/comments` - Create comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/vote` - Vote on post/comment
- `GET /api/stories` - Get active stories
- `POST /api/stories` - Create story

## Design System
- **Primary Color**: #6C5CE7 (Purple)
- **Background**: #0D0D0D (Dark mode)
- **Surface**: #1A1A1A (Card backgrounds)
- **Category Colors**:
  - Confession: Pink (#FF6B9D)
  - Crush: Red (#FF3E4D)
  - Meme: Orange (#FFA502)
  - Rant: Light Purple (#A29BFE)
  - Compliment: Cyan (#00D2D3)

## Running the App
- **Development**: `npm run all:dev` (starts Expo + Express)
- **Web**: Open the Replit webview
- **Mobile**: Scan QR code with Expo Go app

## User Preferences
- Hindi-speaking Indian college student target audience
- Dark mode preferred
- Instagram-inspired UI
- Focus on anonymity and privacy
