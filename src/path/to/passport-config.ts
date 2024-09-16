/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import config from '../../app/config'
import { authServices } from '../../app/modules/auth/auth.service'
// import prisma from '../../shared/prisma'

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google_client_id!, //process.env.GOOGLE_CLIENT_ID!,
      clientSecret: config.google_client_secret!, // process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:3000/api/v1/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, callback) => {
      try {
        const user = await authServices.findOrCreateUser(profile)

        callback(null, user)
      } catch (err) {
        callback(err, false)
      }
    },
  ),
)

passport.serializeUser((user: any, done) => {
  done(null, user)
})

passport.deserializeUser(async (user, done) => {
  //   try {
  //     if (typeof id === 'string') {
  //       const user = await prisma.user.findUnique({ where: { id } })
  //       done(null, user)
  //     }
  //   } catch (err) {
  // }
  done(null, user || null)
})
