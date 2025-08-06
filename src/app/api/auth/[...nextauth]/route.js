import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/app/models/user";

export const authOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error("Email không tồn tại");

        // CHẶN ĐĂNG NHẬP KHI CHƯA XÁC THỰC
        if (!user.isVerified) {
          throw new Error("Tài khoản chưa được xác thực. Vui lòng kiểm tra email để nhập mã OTP.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Sai mật khẩu");

        return { id: user._id, name: user.name, email: user.email, role: user.role };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    // Khi login bằng Google
    async signIn({ user, account }) {
      try {
        await connectDB();

        let existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          // Nếu user chưa tồn tại => tạo mới nhưng chưa xác thực
          existingUser = await User.create({
            name: user.name || "No Name",
            email: user.email,
            password: null,
            role: "Customer",
            isVerified: true, // Với Google => coi như đã xác thực
          });
        } else {
          // Nếu user đã tồn tại nhưng chưa xác thực => vẫn không cho login
          if (!existingUser.isVerified && account.provider === "credentials") {
            throw new Error("Tài khoản chưa được xác thực. Kiểm tra email để nhập mã OTP.");
          }
        }

        return true;
      } catch (err) {
        console.error("Error in signIn callback:", err);
        return false;
      }
    },

    async jwt({ token, user }) {
      try {
        if (user) {
          await connectDB();
          const dbUser = await User.findOne({ email: user.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role || "Customer";
          }
        }
      } catch (err) {
        console.error("Error in jwt callback:", err);
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role || "Customer";
      return session;
    },
  },

  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
