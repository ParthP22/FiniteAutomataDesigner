import type { NextApiRequest, NextApiResponse } from "next";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "@/lib/dynamodb"; // adjust path as needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { userID, name, email, password } = req.body;

  try {
    const command = new PutCommand({
      TableName: "Users",
      Item: { userID, name, email, password },
    });

    const result = await ddbDocClient.send(command);
    res.status(200).json({ success: true, result });
  } catch (err) {
    console.error("DynamoDB error:", err);
    res.status(500).json({ success: false, error: "Failed to write to database." });
  }
}