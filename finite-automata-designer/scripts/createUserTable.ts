import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { ddbDocClient } from "../src/lib/dynamodb"

const client = ddbDocClient;
   
async function createTable() {
  try {
    await client.send(
      new CreateTableCommand({
        TableName: "Users",
        AttributeDefinitions: [
          { AttributeName: "userId", AttributeType: "S" },
          { AttributeName: "userName", AttributeType: "S"},
          { AttributeName: "password", AttributeType: "S"}
        ],
        KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
        ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
      })
    );
    console.log("Table created!");
  } catch (err: any) {
    if (err.name === "ResourceInUseException") {
      console.log("Table already exists.");
    } else {
      console.error("Error creating table:", err);
    }
  }
}

createTable();
