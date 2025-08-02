import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "@/lib/dynamodb";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ user, profile }: { user: any; profile?: any }) {
      try {
        await ddbDocClient.send(
          new PutCommand({
            TableName: "Users",
            Item: {
              userID: user.id, // or user.email if you prefer
              name: user.name,
              email: user.email,
            },
          })
        );
      } catch (err) {
        console.error("Failed to save user to DynamoDB:", err);
        // Optionally, return false to block sign-in if DB write fails
      }
      return true;
    },
  },
};

export default NextAuth(authOptions);