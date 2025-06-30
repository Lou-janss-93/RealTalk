## **REALTALK**

## Inspiration
Social platforms are more connected than ever — yet people feel less *heard*.  
I wanted to create a space where people could express raw thoughts, free from judgment, algorithms, or dopamine traps.

Thus, **Real Talk** was born: an anonymous, real-time conversation platform for those who just want to be heard.

## What it does
Real Talk lets users join a live conversation board with no profiles, no likes, no filters. Just authentic talk.  
It features real-time posting, simple UI, and optional guided prompts to help users start a conversation when they don't know how.

## How I built it
The frontend was built using **Bolt** and **React**, with **Supabase** as the backend for authentication and data storage.  
Supabase's Auth and RLS features power the anonymous login and database policies.  
For real-time features, I relied on Bolt's fast deploy pipeline and built-in components.

## Challenges I ran into
Setting up Supabase with Bolt's stack gave me some initial hiccups — especially around authentication and securing user input.  
I also had to balance speed (time was short!) with UX clarity, given the platform’s minimalist goal.

## Accomplishments I'm proud of
- Got the base system running in under 24 hours
- Learned to integrate Supabase securely with a modern frontend
- Designed a tool I’d actually want to use myself

## What's next
I’m planning to expand Real Talk with:
- Optional emotion-tagging for posts
- Light moderation tools (for safety)
- Mobile responsiveness and offline caching

If you want to join or contribute to the vision — feel free to reach out.
