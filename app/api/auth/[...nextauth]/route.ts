import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        await dbConnect();
        
        // Find if user already exists
        const existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          // If first time, create a teacher account
          // Generate a random password since they use Google
          const crypto = await import("crypto");
          const randomPassword = crypto.randomBytes(16).toString("hex");
          const bcrypt = await import("bcryptjs");
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          await User.create({
            name: user.name,
            email: user.email,
            avatar: user.image,
            password: hashedPassword,
            role: "teacher",
            isAdmin: false,
          });
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        await dbConnect();
        const dbUser = await User.findOne({ email: session.user.email });
        if (dbUser) {
          (session.user as any).id = dbUser._id.toString();
          (session.user as any).role = dbUser.role;
          (session.user as any).isAdmin = dbUser.isAdmin;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/teacher/login",
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
});

export { handler as GET, handler as POST };
