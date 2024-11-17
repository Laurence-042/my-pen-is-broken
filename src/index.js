import pinyin from "pinyin";

const APP_ID = "YanYueJi"
const CONTAINER_ID = APP_ID + "-container"
const CHAR_CLASS = APP_ID + "-char"

const autoMode = false

let lastAlarm = 0

/**
 *
 * @param {string[]} text
 */
function alarm(text) {
    clearTimeout(lastAlarm)
    const container = document.getElementById(CONTAINER_ID);
    container.innerHTML = ''; // 清空容器内容

    let delay = 0
    text.forEach(entry => {
        const p = document.createElement('p');
        container.appendChild(p);
        entry.split('').forEach((char) => {
            delay += 0.1
            const span = document.createElement('span');
            span.textContent = char;
            span.classList.add(CHAR_CLASS);
            span.style.animationDelay = `${delay}s`;
            p.appendChild(span);
        })
    })

    lastAlarm = setTimeout(() => {
        container.innerHTML = ''
    }, 1000 * (delay + 3))
}

function toPinyin(text) {
    return text.split("").flatMap(char => pinyin(char, {style: pinyin.STYLE_TONE}).map(arr => arr[0]).flatMap(textPinyin => {
        // （+15）会被pinyin返回为`（`和`+15）`
        if (!/[a-z]+/.test(textPinyin)) {
            return textPinyin.split("")
        }
        return [textPinyin]
    }))
}

function uniqueRows(array) {
    const seen = new Set();
    return array.filter(row => {
        const rowString = JSON.stringify(row);
        if (seen.has(rowString)) {
            return false;
        } else {
            seen.add(rowString);
            return true;
        }
    });
}

/**
 *
 * @returns {Promise<{pinyin:string[],text:string}[]>}
 */
async function getAllSensitiveWords() {
    // return [
    //     ["cao", "bi"],
    //     ["ji", "ke"],
    //     ["xing", "jiao"],
    //     ["si", "chu"],
    //     ["quan", "jiao"],
    //     ["yan", "she"],
    //     ["she", "jing"],
    // ]

    const request = new Request("https://raw.githubusercontent.com/57ing/Sensitive-word/master/%E8%89%B2%E6%83%85%E8%AF%8D%E5%BA%93.txt",)

    const decoder = new TextDecoder('gbk');

    /** @type{{pinyin: *, world: *}[]} **/
    let res = await fetch(request)
        .then((response) => response.arrayBuffer())
        .then((buffer) => decoder.decode(buffer).split("\n"))
    res = res.map(item => {
        return {pinyin: toPinyin(item), text: item}
    })
    res = res.filter(item => item.pinyin.length > 1)
    return uniqueRows(res)

}


const chineseReg = new RegExp("[\\u4E00-\\u9FFF]+");

function getAllSusLeafNodesWIthText() {
    return [...document.querySelectorAll("body *:not(script):not(style)")].filter(item => !item.children.length && item.innerText && chineseReg.test(item.innerText))
}

/**
 *
 * @param {string[]} text
 * @param {{pinyin:string[],text:string}} sensitiveWord
 * @returns {{pos:[number,number],world:{pinyin:string[],text:string}}[]}
 */
function findSensitiveWordPositions(text, sensitiveWord) {
    /** @type{{pos:[number,number],world:{pinyin:string[],text:string}}[]} **/
    const positions = [];
    const sensitiveLength = sensitiveWord.pinyin.length;

    for (let i = 0; i <= text.length - sensitiveLength; i++) {
        let nonPinyinCount = 0
        let j = 0;
        while (j < sensitiveLength) {
            const textPinyin = text[i + j + nonPinyinCount]
            if (!/[a-z]+/.test(textPinyin)) {
                if (j === 0) {
                    break
                }
                nonPinyinCount++
                continue
            }
            if (textPinyin !== sensitiveWord.pinyin[j]) {
                break
            }
            j++
        }
        if (j === sensitiveLength) {
            positions.push({
                pos: [i, i + sensitiveLength + nonPinyinCount],
                world: sensitiveWord
            });
        }
    }

    return positions;
}


/**\
 * @param {Element} element - 要处理的DOM元素。
 * @param {{pinyin:string[],text:string}[]} sensitiveWords - 需要被替换的字符串数组。
 * @param autoMode
 */
function susTextClickHandler(element, sensitiveWords, autoMode = false) {
    let position = window.getSelection().focusOffset;

    if (element.childElementCount > 0) {
        return;
    }

    // 获取元素的文本内容
    const rawText = element.textContent

    /** @type{string[]} **/
    const text = toPinyin(rawText);


    const findRes = sensitiveWords.flatMap(sensitiveWord => findSensitiveWordPositions(text, sensitiveWord))
    if (findRes.length === 0) {
        return;
    }
    console.log(findRes)

    /** @type{{pos:[number,number],world:{pinyin:string[],text:string}}[]} **/
    const matchedWithClick = []
    findRes.forEach(({pos, world}) => {
        if (!autoMode) {
            if (position < pos[0] || position > pos[1]) {
                return
            }
        }
        matchedWithClick.push({pos, world})
    })

    if (matchedWithClick.length === 0) {
        return
    }

    if (autoMode) {
        matchedWithClick.splice(1, matchedWithClick.length - 1)
    }

    // 创建一个文档片段，用于构建新的节点结构
    const fragment = document.createDocumentFragment();
    const matchedRange = [Math.min(...matchedWithClick.map(item => item.pos[0])), Math.max(...matchedWithClick.map(item => item.pos[1]))]

    fragment.appendChild(document.createTextNode(rawText.slice(0, matchedRange[0])));

    let newNode = document.createElement('span');
    newNode.textContent = rawText.slice(matchedRange[0], matchedRange[1])
    newNode.style.color = "red"
    fragment.appendChild(newNode);

    fragment.appendChild(document.createTextNode(rawText.slice(matchedRange[1])));

    // 清空原始元素并添加新的节点结构
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    element.appendChild(fragment);

    if (!autoMode) {
        alarm(matchedWithClick.map(entry => entry.world.pinyin.join("").toUpperCase()))
    }
}

async function main() {
    const sensitiveWords = await getAllSensitiveWords();

    const container = document.createElement('div');
    container.id = CONTAINER_ID;
    document.body.appendChild(container);

    alert("言阅姬已上线")
    getAllSusLeafNodesWIthText().forEach((ele) => {
        if (autoMode) {
            susTextClickHandler(ele, sensitiveWords, true)
        }

        ele.addEventListener("click", _ => susTextClickHandler(ele, sensitiveWords));
    })
}

main().then()


const styles = `
#${CONTAINER_ID} {
    position: fixed;
    top: 20%;
    transform: translateX(-50%);
    left: 50%;
    font-size: 2em;
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

const styleSheet = document.createElement("style")
styleSheet.textContent = styles
document.head.appendChild(styleSheet)

// window.addEventListener('DOMContentLoaded', () => {
//
//     document.querySelectorAll('.charPosition').forEach(el => {
//         let characters = el['innerText'].split('');
//         el.innerHTML = '';
//         characters.forEach(char => {
//             let span = document.createElement('span');
//             span.innerText = char;
//             span.addEventListener('click', function () {
//                 let position = 0;
//                 let el = this;
//                 while (el.previousSibling !== null) {
//                     position++;
//                     el = el.previousSibling;
//                 }
//                 console.log(this.innerHTML + ':' + position);
//             });
//             el.appendChild(span);
//         });
//     });
// });