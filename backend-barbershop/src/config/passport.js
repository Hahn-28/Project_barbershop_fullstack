import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "./prisma.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Buscar si el usuario ya existe
        let user = await prisma.user.findUnique({
          where: { email: profile.emails[0].value },
        });

        if (user) {
          // Usuario existe, devolver usuario
          return done(null, user);
        } else {
          // Usuario no existe, crear nuevo
          const newUser = await prisma.user.create({
            data: {
              name: profile.displayName,
              email: profile.emails[0].value,
              password: "google_oauth", // Contraseña placeholder para OAuth users
              role: "CLIENT", // Role por defecto para usuarios de Google
            },
          });
          return done(null, newUser);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serializar usuario para la sesión
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserializar usuario de la sesión
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
