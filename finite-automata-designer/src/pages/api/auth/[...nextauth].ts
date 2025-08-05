import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
// import CredentialsProvider from "next-auth/providers/credentials";
import { DynamoDB, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "@/lib/dynamodb";
import { DynamoDBAdapter } from '@auth/dynamodb-adapter';
import { adapter } from "next/dist/server/web/adapter";

const config: DynamoDBClientConfig = {
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: process.env.AWS_REGION!,
}

const client = DynamoDBDocument.from(new DynamoDB(config), {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  }
})

// export const { handlers, auth, signIn, signOut } = NextAuth({
//   providers: [
//     Google({
//       authorization: {
//         params: {
//           prompt: "consent",
//           access_type: "offline",
//           response_type: "code",
//         },
//       },
//     })
//   ],
// })

// export const { handers, auth, signIn, signOut } = NextAuth({
//   providers: [
//     Google({
//       authorization: {
//         params: {
//           prompt: "consent",
//           access_type: "offline",
//           response_type: "code",
//         },
//       },
//     })
//   ],
//   adapter: DynamoDBAdapter(client),
// })

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  //adapter: DynamoDBAdapter(client),
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