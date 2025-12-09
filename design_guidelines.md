# CampusVibe - Anonymous College Social App Design Guidelines

## Authentication Architecture
**Auth Required**: Yes - College email verification is mandatory
- **Signup Flow**: 
  - College email input (.edu/.ac.in domains only)
  - Verification code sent to email
  - Username creation (display name, no profile photo needed for anonymity)
  - Welcome screen explaining anonymity rules
- **Login**: Email + password OR email magic link
- **Profile**: Minimal profile showing only username and post history (visible only to user)
- **Account Management**: Settings → Account → Delete Account (double confirmation required)

## Navigation Architecture
**Root Navigation**: Tab Navigation (5 tabs)

**Tab Bar Structure**:
1. **Home** (Feed) - Main content discovery
2. **Reels** - Short video feed
3. **Create** (Center FAB) - Post creation action
4. **Stories** - 24-hour disappearing content
5. **Profile** - User's anonymous post history and settings

**Modal Screens**: 
- Create Post (full-screen modal)
- Create Reel (full-screen camera modal)
- Create Story (full-screen camera modal)
- Post Details
- Report Content
- Category Filter

## Screen Specifications

### 1. Home Feed Screen
**Purpose**: Discover and interact with anonymous college posts
**Layout**:
- Header: Transparent with college name/logo (left), category filter icon (right)
- Top inset: `headerHeight + Spacing.xl`
- Bottom inset: `tabBarHeight + Spacing.xl`
- Main content: Scrollable feed (FlatList) with pull-to-refresh
- Floating elements: None

**Components**:
- Post cards (text, photo, or mixed)
- Upvote/downvote buttons with count
- Category tags (Confession, Crush, Meme, Rant, Compliment)
- Timestamp ("2h ago")
- Comment count
- Anonymous user indicator

### 2. Reels Screen
**Purpose**: Vertical short-form video feed
**Layout**:
- No header
- Full-screen vertical scrolling video feed
- Top inset: `insets.top + Spacing.xl`
- Bottom inset: `tabBarHeight + Spacing.xl`
- Floating elements: Engagement buttons (right side)

**Components**:
- Video player (auto-play on view)
- Upvote/downvote buttons (vertical stack, right side)
- Category tag (top overlay)
- Anonymous username overlay (bottom left)
- Progress indicator for video

### 3. Create Post Modal
**Purpose**: Create anonymous text, photo, or mixed posts
**Layout**:
- Header: "New Post" title, Cancel (left), Post button (right, disabled until content added)
- Non-transparent header
- Top inset: `Spacing.xl`
- Bottom inset: `insets.bottom + Spacing.xl`
- Scrollable form

**Components**:
- Category selector (horizontal chips)
- Text input (multiline, expandable)
- Photo upload button with preview grid
- Character count (500 limit)
- "Post Anonymously" toggle (always on, visual indicator)
- Delete draft button

### 4. Create Reel Modal
**Purpose**: Record or upload short videos
**Layout**:
- Full-screen camera view
- Top overlay: Close button (left), Flash toggle (right)
- Bottom overlay: Record button (center), Gallery button (left), Flip camera (right)
- Top inset: `insets.top + Spacing.md`
- Bottom inset: `insets.bottom + Spacing.md`

**Components**:
- Camera preview
- Recording timer (max 60s)
- Category selector (after recording)
- Trim/edit tools
- Post button

### 5. Stories Screen
**Purpose**: View 24-hour disappearing content from college
**Layout**:
- Header: Transparent with "Stories" title
- Top inset: `headerHeight + Spacing.xl`
- Bottom inset: `tabBarHeight + Spacing.xl`
- Horizontal scrollable story rings at top
- Feed of expired stories below (if user wants to check their own)

**Components**:
- Story rings (circular avatars with color ring indicating unread)
- Story viewer (full-screen tap-to-advance)
- Progress bars (top)
- Time remaining indicator

### 6. Profile Screen
**Purpose**: View own anonymous posts and app settings
**Layout**:
- Header: Non-transparent with "Your Posts" title, Settings icon (right)
- Top inset: `Spacing.xl`
- Bottom inset: `tabBarHeight + Spacing.xl`
- Scrollable list

**Components**:
- Anonymous username display
- Post count stats
- Segmented control: My Posts | My Reels | My Stories
- Post grid/list
- Delete post action (swipe or long-press)
- Settings button leading to preferences

### 7. Post Details Screen
**Purpose**: View single post with comments
**Layout**:
- Header: Default navigation with back button
- Top inset: `Spacing.xl`
- Bottom inset: `insets.bottom + Spacing.xl`
- Scrollable content

**Components**:
- Full post content
- Upvote/downvote section
- Comment input (bottom sticky)
- Comments list
- Report button (header right)

## Visual Design System

### Color Palette
**Primary Brand Colors**:
- Primary: `#6C5CE7` (Vibrant purple for brand identity)
- Primary Dark: `#5B4BC4`
- Primary Light: `#A29BFE`

**Functional Colors**:
- Upvote: `#00B894` (Green)
- Downvote: `#FF7675` (Red)
- Background: `#0D0D0D` (Dark mode primary)
- Surface: `#1A1A1A` (Card background)
- Surface Light: `#2D2D2D` (Elevated elements)

**Text Colors**:
- Text Primary: `#FFFFFF`
- Text Secondary: `#A0A0A0`
- Text Tertiary: `#666666`

**Category Colors** (for tags):
- Confession: `#FF6B9D` (Pink)
- Crush: `#FF3E4D` (Red)
- Meme: `#FFA502` (Orange)
- Rant: `#A29BFE` (Light purple)
- Compliment: `#00D2D3` (Cyan)

### Typography
**Font Family**: System Default (SF Pro for iOS, Roboto for Android)

**Scale**:
- Heading 1: 28px, Bold, 34px line height
- Heading 2: 22px, Bold, 28px line height
- Heading 3: 18px, Semibold, 24px line height
- Body: 16px, Regular, 24px line height
- Body Small: 14px, Regular, 20px line height
- Caption: 12px, Regular, 16px line height

### Spacing Scale
```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
xxl: 48px
```

### Component Specifications

**Post Card**:
- Background: Surface (`#1A1A1A`)
- Border radius: 16px
- Padding: `Spacing.md`
- Margin bottom: `Spacing.md`
- NO drop shadow (flat design)
- Touch feedback: Reduce opacity to 0.8 on press

**Category Chip**:
- Border radius: 20px (pill shape)
- Padding: `Spacing.xs` vertical, `Spacing.md` horizontal
- Background: Category color with 0.2 opacity
- Text: Category color at full opacity
- Font: Body Small, Semibold

**Upvote/Downvote Button**:
- Circular or rounded pill shape
- Icon: Feather "arrow-up" / "arrow-down"
- Active state: Filled with respective color
- Inactive state: Outline only
- Touch feedback: Scale to 1.1 on press

**Floating Action Button (Create)**:
- Size: 56px diameter
- Background: Primary color gradient
- Icon: Feather "plus"
- Position: Center of tab bar (elevated above)
- Shadow specifications:
  - shadowOffset: {width: 0, height: 2}
  - shadowOpacity: 0.10
  - shadowRadius: 2

**Story Ring**:
- Outer ring: 68px diameter
- Inner avatar: 60px diameter
- Ring color: Primary gradient (if unread), gray (if read)
- Ring width: 3px

**Video Player Controls**:
- Play/Pause: Centered overlay, fade out after 2s
- Mute toggle: Top right corner
- Progress bar: Bottom edge, 2px height

### Interaction Design

**Touch Feedback**:
- All touchable elements reduce opacity to 0.7 on press
- Buttons with backgrounds use scale animation (0.95) on press
- Swipe actions have 50px threshold before triggering

**Animations**:
- Screen transitions: Slide from right (300ms, easeInOut)
- Modal presentations: Slide from bottom (350ms, easeInOut)
- Like/upvote: Spring animation with haptic feedback
- Delete confirmation: Shake animation on card
- Story progress: Linear 5-second auto-advance

**Gestures**:
- Swipe left on post: Delete (only on Profile screen)
- Double-tap post: Quick upvote
- Long-press: Report menu
- Pull down on modal: Dismiss
- Vertical scroll on reels: Next/previous video

## Required Assets

**1. Category Icons** (Generate 5 unique icons):
- Confession icon (lock with heart)
- Crush icon (heart with sparkle)
- Meme icon (laughing face)
- Rant icon (megaphone)
- Compliment icon (thumbs up with stars)

**2. Empty State Illustrations** (Generate 3):
- No posts yet (person with question mark)
- No stories available (clock with calendar)
- Post deleted successfully (trash bin with checkmark)

**3. Onboarding Graphics** (Generate 3 slides):
- Welcome slide: College building with anonymous figures
- Features slide: Mix of reels, stories, posts icons
- Safety slide: Shield with moderation symbols

**Style for all assets**: Minimalist, gradient-based, matching the purple-pink brand palette, optimized for dark mode

## Accessibility Requirements
- All interactive elements minimum 44x44px touch target
- Contrast ratio 4.5:1 for all text on backgrounds
- Support for system font scaling up to 200%
- VoiceOver/TalkBack labels for all icons and buttons
- Haptic feedback for all major actions
- Alternative text for all images in posts
- Captions support for video content (future enhancement)