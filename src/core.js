let allPinyin = []
let notone = {};
let storage = {}

function init(dict) {
  // 拼音数组
  allPinyin = Object.keys(dict)
  notone = parseDict(dict)
  return match
}

// 汉字为key，拼音为value
function parseDict(dict) {

  let parseDict = {}
  // i表示拼音， temp每组拼音汉字
  for (let i in dict) {
    let temp = dict[i]
    for (let j = 0, len = temp.length; j < len; j++) {
      // temp[j] 每个汉字
      // 多音字
      if (!parseDict[temp[j]]) {
        parseDict[temp[j]] = i
      } else {
        parseDict[temp[j]] = parseDict[temp[j]] + ' ' + i
      }
    }
  }
  return parseDict
}
// 获取输入字符的全部拼音
// [" ", " ", " ", "wo", " ", "ai", "ni", " ", "zhong", " ", " ", " ", "guo", " ", " ", " "]
function getPinyin(cn) {
  let result = []
  for (let i = 0, len = cn.length; i < len; i++) {
    let temp = cn.charAt(i)
    result.push(notone[temp] || temp)
  }
  return result
}
// 对输入拼音进行切分
function wordBreak(s) {
  let result = []
  let solutions = []
  let len = s.length
  let possible = []
  for (let i = 0; i <= s.length; i++) {
    possible.push(true)
  }
  getAllSolutions(0, s, result, solutions, possible)
  return solutions
}
// 获取所有的拼音组合
function getAllSolutions(start, s, result, solutions, possible) {
  if (start === s.length) {
    solutions.push(result.join(' '))
    return
  }
  for (let i = start; i < s.length; i++) {
    let piece = s.substring(start, i + 1)
    let match = false
    // 最后一个音特殊处理，不需要全部打完整
    if (allPinyin.some(i => i.indexOf(piece) === 0) && !s[i + 1] && possible[i + 1]) {
      if (piece.length === 1) {
        result.push(piece)
      } else {
        let s = []
        allPinyin.forEach(i => {
          if (i.indexOf(piece) === 0) {
            s.push(i)
          }
        })
        result.push(s)
      }
      match = true
    } else {
      if (allPinyin.indexOf(piece) !== -1 && possible[i + 1]) {
        result.push(piece)
        match = true
      }
    }
    if (match) {
      let beforeChange = solutions.length
      getAllSolutions(i + 1, s, result, solutions, possible)
      if (solutions.length === beforeChange) {
        possible[i + 1] = false
      }
      result.pop()
    }
  }
}
// 获取输入拼音的所有组合（切分 + 首字母）
function getFullKey(key) {
  let result = []
  wordBreak(key).forEach(i => {
    let item = i.split(' ')
    let last = item.length - 1
    if (item[last].indexOf(',')) {
      let keys = item[last].split(',')
      keys.forEach(j => {
        item.splice(last, 1, j)
        result.push(JSON.parse(JSON.stringify(item)))
      })
    } else {
      result.push(item)
    }
  })
  if (result.length === 0 || (result[0].length !== key.length)) {
    result.push(key.split(''))
  }
  // 缓存当前结果 避免重复计算
  storage = { [key]: result }
  return result
}
function point2point(test, key, last, extend) {
  if (!test) return false
  let a = test.split(' ')
  a.forEach(i => {
    if (i.length > 0 && extend) {
      a.push(i.charAt(0))
    }
  })
  if (!last) {
    return a.indexOf(key) !== -1
  }
  return a.some((i) => i.indexOf(key) === 0)
}
// input 目标字符串
// 输入的拼音或其他关键词
function match(input, keys) {
  // 如果二者不存在其一，返回false
  if (!input || !keys) return false
  // 转小写
  input = input.toLowerCase()
  // 去空格转小写
  keys = keys.replace(/\s+/g, '').toLowerCase()
  // 通过indexof判断，如果存在，直接返回
  let indexOf = input.indexOf(keys)
  if (indexOf !== -1) {
    return [indexOf, indexOf + keys.length - 1]
  }
  // 原文匹配(带空格)
  let noPyIndex = getIndex(input.split(''), [keys.split('')], keys)
  if (noPyIndex) return noPyIndex
  // pinyin匹配
  let py = getPinyin(input)
  let fullString = storage[keys] || getFullKey(keys)
  return getIndex(py, fullString, keys)
}
// py  input通过split之后的数组  [" ", " ", " ", "我", " ", "爱", "你", " ", "中", " ", " ", " ", "国", " ", " ", " "]
// fullString  key通过split之后的数组 [["n", "z", "g"]]
// keys key 'nzg'
function getIndex(py, fullString, keys) {
  for (let p = 0; p < py.length; p++) {
    for (let k = 0; k < fullString.length; k++) {
      let key = fullString[k] //  nzg
      let keyLength = key.length  //   3
      let extend = (keyLength === keys.length) // true
      let isMatch = true
      let i = 0
      let preSpaceNum = 0 //记录匹配字符之前的空格
      let spaceNum = 0
      //  key中具体的某一个字符的长度< input通过split之后的数组
      // 1             20
      if (keyLength <= py.length) {
        for (; i < key.length; i++) {
          // 如果为空格，直到匹配到非空格字符
          if (i === 0 && py[p + preSpaceNum] === ' ') {
            preSpaceNum += 1
            i -= 1
          } else {
            if (py[p + i + spaceNum] === ' ') {
              spaceNum += 1
              i -= 1
            } else {
              if (!point2point(py[p + i + spaceNum], key[i], (py[p + i + 1] && key[i + 1]) ? false : true, extend)) {
                isMatch = false
                break
              }
            }
          }
        }
        if (isMatch) {
          return [p + preSpaceNum, spaceNum + p + i - 1]
        }
      }
    }
  }
  return false
}
export default init

