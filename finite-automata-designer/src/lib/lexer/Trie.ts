import { Token } from "./Token.js";

export class TrieNode{
    children = new Map<string, TrieNode>;
    token?: Token;
}