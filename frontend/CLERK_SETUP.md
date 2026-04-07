# Next.js 16 + Clerk Authentication

This is a Next.js 16 application with Clerk authentication setup using the App Router.

## Features

- ✅ Next.js 16 with App Router
- ✅ Clerk Authentication (@clerk/nextjs v7.0.11)
- ✅ TypeScript support
- ✅ Tailwind CSS
- ✅ Latest Clerk components (Show, SignInButton, SignUpButton, UserButton)
- ✅ Proper middleware configuration (proxy.ts)

## Setup

### 1. Install dependencies
```bash
pnpm install
```

### 2. Configure Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Copy your keys to `.env.local`:

```bash
# Required
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Optional: Customize sign-in/sign-up URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

### 3. Start development server
```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app.

## Architecture

### Files Structure
```
├── app/
│   ├── layout.tsx          # Root layout with ClerkProvider
│   ├── page.tsx           # Home page with auth state
│   └── globals.css        # Global styles
├── proxy.ts               # Clerk middleware
├── .env.local            # Environment variables
└── package.json
```

### Key Components

- **ClerkProvider**: Wraps the entire app in `app/layout.tsx`
- **Show**: Conditionally renders content based on auth state
- **SignInButton/SignUpButton**: Authentication buttons for signed-out users
- **UserButton**: Profile menu for signed-in users
- **clerkMiddleware**: Handles authentication state in `proxy.ts`

## Authentication Flow

1. **Signed Out**: Users see Sign In and Sign Up buttons
2. **Sign Up**: Click Sign Up → Clerk handles registration flow
3. **Signed In**: Users see UserButton with profile menu
4. **Protected Routes**: Add route protection as needed

## Next Steps

1. **Test the setup**: Sign up as your first user to verify everything works
2. **Explore Clerk features**:
   - [Organizations](https://clerk.com/docs/guides/organizations/overview)
   - [Components](https://clerk.com/docs/reference/components/overview)  
   - [Dashboard](https://dashboard.clerk.com/)
3. **Add protected routes**: Use Clerk's auth helpers to protect specific pages
4. **Customize UI**: Style the authentication components to match your design

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## Resources

- [Clerk Next.js Documentation](https://clerk.com/docs/nextjs)
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Clerk Dashboard](https://dashboard.clerk.com/)