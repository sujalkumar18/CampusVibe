# CampusVibe - Anonymous College Social App

## Overview
CampusVibe is an anonymous social media platform designed specifically for Indian college students. Users can share confessions, crushes, memes, rants, and compliments anonymously with their campus community. The app features a modern dark mode UI with Instagram-inspired design elements.

## Current State
**Version**: MVP (Design Prototype)
**Status**: Frontend complete, ready for testing

## Key Features
- **Anonymous Posts**: Share text posts with category tags (Confession, Crush, Meme, Rant, Compliment)
- **Reels**: Short video feed similar to Instagram/TikTok
- **Stories**: 24-hour disappearing content
- **Photo Posts**: Add images to your anonymous posts
- **Upvote/Downvote System**: Reddit-style voting on content
- **Comments**: Engage with posts anonymously
- **Profile**: View and manage your own anonymous posts
- **Delete Posts**: Remove your content anytime

## Tech Stack
- **Frontend**: React Native with Expo SDK 54
- **Navigation**: React Navigation 7 (Bottom Tabs + Stack)
- **Styling**: StyleSheet with custom theme
- **Animations**: React Native Reanimated
- **Icons**: @expo/vector-icons (Feather)
- **State**: React useState (in-memory)
- **Backend**: Express.js (API ready)
- **Database**: PostgreSQL with Drizzle ORM (not connected yet)

## Project Structure
```
client/
├── screens/
│   ├── HomeScreen.tsx      # Main feed with posts
│   ├── ReelsScreen.tsx     # Short video feed
│   ├── StoriesScreen.tsx   # 24-hour stories
│   ├── ProfileScreen.tsx   # User's post history
│   ├── CreatePostScreen.tsx    # Create new post modal
│   ├── CreateReelScreen.tsx    # Record/upload reel
│   ├── CreateStoryScreen.tsx   # Create story
│   └── PostDetailScreen.tsx    # Single post with comments
├── navigation/
│   ├── RootStackNavigator.tsx  # Root navigation
│   └── MainTabNavigator.tsx    # 5-tab bottom navigator
├── components/
│   └── (Shared UI components)
└── constants/
    └── theme.ts            # CampusVibe color palette
```

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
- **Web**: Open the Replit webview
- **Mobile**: Scan QR code with Expo Go app

## Next Steps (Backend Implementation)
1. Connect PostgreSQL database
2. Implement user authentication with college email verification
3. Create REST API endpoints for posts, reels, stories
4. Add file upload for images/videos
5. Implement content moderation

## User Preferences
- Hindi-speaking Indian college student target audience
- Dark mode preferred
- Instagram-inspired UI
- Focus on anonymity and privacy
