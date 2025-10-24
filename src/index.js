import pinyin from 'pinyin'

// 立即执行函数，防止重复运行
;(function () {
  const APP_ID = 'YanYueJi'
  const CONTAINER_ID = APP_ID + '-container'
  const CHAR_CLASS = APP_ID + '-char'

  // 这个值会在构建时被替换
  const autoMode = true

  let lastAlarm = 0

  /**
   *
   * @param {string[]} text
   */
  function alarm(text) {
    clearTimeout(lastAlarm)
    const container = document.getElementById(CONTAINER_ID)
    if (!container) return

    container.innerHTML = '' // 清空容器内容

    let delay = 0
    text.forEach((entry) => {
      const p = document.createElement('p')
      container.appendChild(p)
      entry.split('').forEach((char) => {
        delay += 0.1
        const span = document.createElement('span')
        span.textContent = char
        span.classList.add(CHAR_CLASS)
        span.style.animationDelay = `${delay}s`
        p.appendChild(span)
      })
    })

    lastAlarm = setTimeout(() => {
      if (container) {
        container.innerHTML = ''
      }
    }, 1000 * (delay + 3))
  }

  function withPinyin(text) {
    let pinYinWithTone = text.split('').flatMap((char) =>
      pinyin(char, { style: pinyin.STYLE_TONE })
        .map((arr) => arr[0])
        .flatMap((textPinyin) => {
          // （+15）会被pinyin返回为`（`和`+15）`
          if (!/[a-z]+/.test(textPinyin)) {
            return textPinyin.split('')
          }
          return [textPinyin]
        }),
    )

    let pinYinWithoutTone = text.split('').flatMap((char) =>
      pinyin(char, { style: pinyin.STYLE_NORMAL })
        .map((arr) => arr[0])
        .flatMap((textPinyin) => {
          // （+15）会被pinyin返回为`（`和`+15）`
          if (!/[a-z]+/.test(textPinyin)) {
            return textPinyin.split('')
          }
          return [textPinyin]
        }),
    )


    return {
        pinYinWithTone: pinYinWithTone,
        pinYinWithoutTone: pinYinWithoutTone,
        text: text
    }
  }

  function uniqueRows(array) {
    const seen = new Set()
    return array.filter((row) => {
      const rowString = JSON.stringify(row)
      if (seen.has(rowString)) {
        return false
      } else {
        seen.add(rowString)
        return true
      }
    })
  }

  /**
   *
   * @returns {Promise<{pinyin:string[],text:string}[]>}
   */
  async function getAllSensitiveWords() {
    const request = new Request(
      'https://raw.githubusercontent.com/57ing/Sensitive-word/master/%E8%89%B2%E6%83%85%E8%AF%8D%E5%BA%93.txt',
    )
    const decoder = new TextDecoder('gbk')

    let res = await fetch(request)
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok')
        return response.arrayBuffer()
      })
      .then((buffer) => decoder.decode(buffer).split('\n'))
      .catch((error) => {
        console.warn(
          'Failed to fetch sensitive words from remote, using fallback list:',
          error,
        )
        // 提供一个简单的后备列表
        return ['测试', '示例', '敏感词']
      })

    res = res.map((item) => {
      return withPinyin(item.trim())
    })
    res = res.filter((item) => item.text && item.pinYinWithoutTone.length > 1)
    return uniqueRows(res)
  }

  const chineseReg = new RegExp('[\\u4E00-\\u9FFF]+')

  function getAllSusLeafNodesWithText() {
    return [
      ...document.querySelectorAll('body *:not(script):not(style)'),
    ].filter(
      (item) =>
        !item.children.length &&
        item.innerText &&
        chineseReg.test(item.innerText),
    )
  }

  /**
   *
   * @param {withPinyin:{withTone:string[],withoutTone:string[],text:string}} textWithPinYin
   * @param {withPinyin:{withTone:string[],withoutTone:string[],text:string}} sensitiveWord
   * @param {string} rawText
   * @returns {{pos:[number,number],world:string,sensitiveWord:{pinyin:string[],text:string}}[]}
   */
  function findSensitiveWordPositions(textWithPinYin, sensitiveWord, rawText) {
    /** @type{{pos:[number,number],world:string,sensitiveWord:{pinyin:string[],text:string}}[]} **/
    const positions = []
    const sensitiveLength = sensitiveWord.pinYinWithoutTone.length

    for (let i = 0; i <= textWithPinYin.pinYinWithoutTone.length - sensitiveLength; i++) {
      let nonPinyinCount = 0
      let j = 0
      while (j < sensitiveLength) {
        const textPinyin = textWithPinYin.pinYinWithoutTone[i + j + nonPinyinCount]
        if (!/[a-z]+/.test(textPinyin)) {
          // 第一个字符就是拼音，用户点歪了，跳过
          if (j === 0) {
            break
          }
          nonPinyinCount++
          continue
        }
        if (textPinyin !== sensitiveWord.pinYinWithoutTone[j]) {
            if(sensitiveWord.text==="操逼"){
            console.log('mismatch', {
                textPinyin,
                sensitivePinyin: sensitiveWord.pinYinWithoutTone[j],
                indexInText: i + j + nonPinyinCount,
                sensitiveIndex: j,
            })
            }
          break
        }
        j++
      }
      if (j === sensitiveLength) {
        positions.push({
          pos: [i, i + sensitiveLength + nonPinyinCount],
          sensitiveWord: sensitiveWord,
          world: rawText.slice(i, i + sensitiveLength + nonPinyinCount),
        })
      }
    }

    return positions
  }

  /**
   * @param {Element} element - 要处理的DOM元素。
   * @param {{pinyin:string[],text:string}[]} sensitiveWords - 需要被替换的字符串数组。
   * @param autoMode
   */
  function susTextClickHandler(
    element,
    sensitiveWords,
    autoMode = false,
    statisticsOnly = false,
  ) {
    if (element.childElementCount > 0) {
      return
    }

    // 获取元素的文本内容
    const rawText = element.textContent

    /** @type{string[]} **/
    const textWithPinYin = withPinyin(rawText)

    const findRes = sensitiveWords.flatMap((sensitiveWord) =>
      findSensitiveWordPositions(textWithPinYin, sensitiveWord, rawText),
    )
    if (findRes.length === 0) {
      return
    }

    if(!autoMode && statisticsOnly){
        return findRes.length
    }

    let position = window.getSelection().focusOffset

    /** @type{{pos:[number,number],world:{pinyin:string[],text:string}}[]} **/
    const matchedWithClick = []
    findRes.forEach(({ pos, sensitiveWord, world }) => {
      if (!autoMode) {
        if (position < pos[0] || position > pos[1]) {
          return
        }
      }
      matchedWithClick.push({ pos, sensitiveWord, world })
    })

    if (matchedWithClick.length === 0) {
      return
    }

    if (autoMode) {
      matchedWithClick.splice(1, matchedWithClick.length - 1)
    }

    // 创建一个文档片段，用于构建新的节点结构
    const fragment = document.createDocumentFragment()
    const matchedRange = [
      Math.min(...matchedWithClick.map((item) => item.pos[0])),
      Math.max(...matchedWithClick.map((item) => item.pos[1])),
    ]

    fragment.appendChild(
      document.createTextNode(rawText.slice(0, matchedRange[0])),
    )

    let newNode = document.createElement('span')
    newNode.textContent = rawText.slice(matchedRange[0], matchedRange[1])
    newNode.style.color = 'red'
    newNode.style.backgroundColor = 'yellow'
    newNode.style.fontWeight = 'bold'
    fragment.appendChild(newNode)

    fragment.appendChild(
      document.createTextNode(rawText.slice(matchedRange[1])),
    )

    // 清空原始元素并添加新的节点结构
    while (element.firstChild) {
      element.removeChild(element.firstChild)
    }
    element.appendChild(fragment)

    if (!autoMode) {
      alarm(
        matchedWithClick.map((entry) =>
          entry.sensitiveWord.pinYinWithTone.join('').toUpperCase(),
        ),
      )
    } else {
      // 自动模式下输出汇总到控制台
      matchedWithClick.forEach((entry) => {
        const worldPinyinWithTone = withPinyin(entry.world).pinYinWithTone
          .filter((token) => /[a-z]+/.test(token))
          .join('')
        const worldPinyinWithoutTone = withPinyin(entry.world).pinYinWithoutTone
          .filter((token) => /[a-z]+/.test(token))
          .join('')
        console.log(
          `🚨 ${entry.world}（${worldPinyinWithoutTone}->${worldPinyinWithTone}）：${entry.sensitiveWord.text}`,
        )
      })
    }

    return findRes.length
  }

  async function main() {
    try {
      console.log('🖋️ 言阅姬启动中...')

      const sensitiveWords = await getAllSensitiveWords()
      console.log(`📚 加载了 ${sensitiveWords.length} 个敏感词`)

      // 创建显示容器
      let container = document.getElementById(CONTAINER_ID)
      if (!container) {
        container = document.createElement('div')
        container.id = CONTAINER_ID
        document.body.appendChild(container)
      }

      let susTextElements = getAllSusLeafNodesWithText()
      console.log(`📄 找到 ${susTextElements.length} 个文本节点`)

      let totalSensitiveWords = 0
      susTextElements.forEach((ele) => {
        const count = susTextClickHandler(ele, sensitiveWords, autoMode, true)
        if (count) {
          totalSensitiveWords += count
        }

        // 为手动模式添加点击事件
        if (!autoMode) {
          ele.addEventListener('click', (_) =>
            susTextClickHandler(ele, sensitiveWords, false, false),
          )
          ele.style.cursor = 'pointer'
          ele.title = '点击检测敏感词'
        }
      })

      const message = `🖋️ 言阅姬已上线！
检测到 ${totalSensitiveWords} 处敏感词
分布在 ${susTextElements.length} 个文本节点中
模式: ${autoMode ? '自动检测' : '手动点击'}`

      console.log(message)
      alert(message)

      // 添加样式
      addStyles()
    } catch (error) {
      console.error('🚨 言阅姬启动失败:', error)
      alert('言阅姬启动失败，请查看控制台了解详情。')
    }
  }

  function addStyles() {
    // 检查是否已经添加过样式
    if (document.getElementById(APP_ID + '-styles')) {
      return
    }

    const styles = `
#${CONTAINER_ID} {
    position: fixed;
    top: 20%;
    transform: translateX(-50%);
    left: 50%;
    font-size: 2em;
    z-index: 999999;
    pointer-events: none;
}
        
@keyframes ${APP_ID}-shrink {
    from {
        transform: scale(2);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}

.${CHAR_CLASS} {
    display: inline-block;
    animation: ${APP_ID}-shrink 0.5s forwards;
}
`

    const styleSheet = document.createElement('style')
    styleSheet.id = APP_ID + '-styles'
    styleSheet.textContent = styles
    document.head.appendChild(styleSheet)
  }

  // 自执行
  main().catch((error) => {
    console.error('🚨 言阅姬执行失败:', error)
  })
})() // 闭合IIFE
