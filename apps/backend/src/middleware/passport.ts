import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '@reviewsphere/db';

// GitHub Strategy configuration
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL ?? 'http://localhost:5000/api/auth/github/callback',
        scope: ['user:email'],
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in GitHub profile'), null);
          }

          const oauthId = profile.id;
          const name = profile.displayName || profile.username || email.split('@')[0];

          // Find or create user by email
          let user = await prisma.user.findUnique({
            where: { email },
            include: { studentProfile: true, mentorProfile: true },
          });

          if (user) {
            // If email already exists, link the OAuth provider details if not already present
            if (!user.oauthProvider) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: {
                  oauthProvider: 'github',
                  oauthId: oauthId,
                },
                include: { studentProfile: true, mentorProfile: true },
              });
            }
          } else {
            // Create user as a STUDENT by default
            user = await prisma.user.create({
              data: {
                email,
                role: 'STUDENT',
                oauthProvider: 'github',
                oauthId: oauthId,
                studentProfile: {
                  create: { name },
                },
              },
              include: { studentProfile: true, mentorProfile: true },
            });
          }

          if (user.status === 'BLOCKED') {
            return done(null, false, { message: 'Your account has been blocked.' });
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

// Google Strategy configuration
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:5000/api/auth/google/callback',
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Google profile'), null);
          }

          const oauthId = profile.id;
          const name = profile.displayName || email.split('@')[0];

          // Find or create user by email
          let user = await prisma.user.findUnique({
            where: { email },
            include: { studentProfile: true, mentorProfile: true },
          });

          if (user) {
            // Link provider details
            if (!user.oauthProvider) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: {
                  oauthProvider: 'google',
                  oauthId: oauthId,
                },
                include: { studentProfile: true, mentorProfile: true },
              });
            }
          } else {
            // Create user as a STUDENT by default
            user = await prisma.user.create({
              data: {
                email,
                role: 'STUDENT',
                oauthProvider: 'google',
                oauthId: oauthId,
                studentProfile: {
                  create: { name },
                },
              },
              include: { studentProfile: true, mentorProfile: true },
            });
          }

          if (user.status === 'BLOCKED') {
            return done(null, false, { message: 'Your account has been blocked.' });
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

export default passport;
