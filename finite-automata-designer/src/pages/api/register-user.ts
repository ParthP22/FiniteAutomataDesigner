import type { NextApiRequest, NextApiResponse } from "next";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "@/lib/dynamodb"; // adjust path as needed
import { TableNotFoundException } from "@aws-sdk/client-dynamodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { userID, name, email, password } = req.body;

  try {
    const getCommand = new GetCommand({
        TableName: "Users",
        Key:{
            userID: userID,
        }
    });

    const {Item} = await ddbDocClient.send(getCommand);

    if(Item){
        return res.status(409).json({ message: "User already exists!" });
    }
    

    const putCommand = new PutCommand({
      TableName: "Users",
      Item: { userID, name, email, password },
    });

    const result = await ddbDocClient.send(putCommand);
    res.status(200).json({ success: true, result });
  } catch (err) {
    console.error("DynamoDB error:", err);
    res.status(500).json({ success: false, error: "Failed to write to database." });
  }
}