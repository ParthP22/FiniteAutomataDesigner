import { Token } from "./Token.js";

export class TrieNode{
    children = new Map<string, TrieNode>;
    token?: Token;
}

export class Trie{
    root = new TrieNode();

    insert(word: string, token: Token){
        let node = this.root;
        for(const char of word){
            if(!node.children.has(char)){
                node.children.set(char, new TrieNode());
            }
            node = node.children.get(char)!;
        }
        node.token = token;
    }
}