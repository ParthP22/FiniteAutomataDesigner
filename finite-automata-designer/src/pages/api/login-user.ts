import type { NextApiRequest, NextApiResponse } from "next";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "@/lib/dynamodb"; // adjust path as needed
import { TableNotFoundException } from "@aws-sdk/client-dynamodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { userID, password } = req.body;

  try {
    const getCommand = new GetCommand({
        TableName: "Users",
        Key:{
            userID: userID,
        }
    });

    const result = await ddbDocClient.send(getCommand);

    if(!result.Item){
        return res.status(409).json({ message: "Wrong username!" });
    }

    const user = result.Item;
    
    if(user.password !== password){
        return res.status(409).json({ message: "Wrong password!" });
    }
    console.log("Username: " + user.userID);
    console.log("Password: " + user.password);

    res.status(200).json({ success: true});
  } catch (err) {
    console.error("DynamoDB error:", err);
    res.status(500).json({ success: false, error: "Failed to write to database." });
  }
}