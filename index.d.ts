// TypeScript 命名空间 命名空间一个最明确的目的就是解决重名问题。
declare namespace Pinyin {
  export function match(input: string, keys: string): [number, number] | boolean;
}

export as namespace Pinyin;
export default Pinyin;
