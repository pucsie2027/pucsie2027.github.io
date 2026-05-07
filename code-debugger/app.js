// =====================================================
// 題庫（之後由後端 API 提供，目前先 mock）
// =====================================================
const PROBLEMS = {
  aplusb: {
    title: 'A + B Problem',
    description: '輸入兩個整數 a 和 b，輸出它們的和。',
    inputFormat: '一行兩個整數 a, b，以空白分隔。(-10^9 ≤ a, b ≤ 10^9)',
    outputFormat: '一行一個整數，表示 a + b。',
    samples: [
      { input: '3 5', output: '8' },
      { input: '10 20', output: '30' }
    ],
    starterCode:
`#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}
`
  },
  factorial: {
    title: '階乘計算',
    description: '輸入一個非負整數 n，輸出 n! (n 階乘)。',
    inputFormat: '一行一個整數 n。(0 ≤ n ≤ 12)',
    outputFormat: '一行一個整數，表示 n!。',
    samples: [
      { input: '5', output: '120' },
      { input: '0', output: '1' }
    ],
    starterCode:
`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    // TODO: 計算 n!
    return 0;
}
`
  },
  prime: {
    title: '質數判定',
    description: '輸入一個正整數 n，判斷其是否為質數。',
    inputFormat: '一行一個整數 n。(2 ≤ n ≤ 10^6)',
    outputFormat: '若為質數輸出 Yes，否則輸出 No。',
    samples: [
      { input: '7', output: 'Yes' },
      { input: '10', output: 'No' }
    ],
    starterCode:
`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    // TODO: 判斷 n 是否為質數
    return 0;
}
`
  }
};

// =====================================================
// SVG icons
// =====================================================
const ICONS = {
  error: '<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5"/><path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  warning: '<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 2.2L14.5 13.3H1.5L8 2.2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 6.5V9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="11.5" r="0.7" fill="currentColor"/></svg>',
  info: '<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5"/><path d="M8 7.5V11.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="5" r="0.7" fill="currentColor"/></svg>',
  success: '<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5"/><path d="M5 8.3L7.2 10.5L11 6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

const SEVERITY_LABEL = {
  error: '錯誤',
  warning: '注意',
  info: '提示',
  success: '通過'
};

// =====================================================
// localStorage 儲存 keys
// =====================================================
const LS_CODE = (id) => `cpe-code-${id}`;
const LS_SETTINGS = 'cpe-settings';

function loadSettings() {
  try { return JSON.parse(localStorage.getItem(LS_SETTINGS) || '{}'); }
  catch { return {}; }
}
function saveSettings(s) {
  localStorage.setItem(LS_SETTINGS, JSON.stringify(s));
}

// =====================================================
// Editor 初始化
// =====================================================
let editor;
let currentProblemId = 'aplusb';
let saveTimer = null;

require.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' }
});

require(['vs/editor/editor.main'], () => {
  monaco.editor.defineTheme('cozy', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: 'a89880', fontStyle: 'italic' },
      { token: 'keyword', foreground: '6f50c4' },
      { token: 'string',  foreground: 'a86a3a' },
      { token: 'number',  foreground: '5fa978' }
    ],
    colors: {
      'editor.background':            '#fdfaf5',
      'editor.foreground':            '#3d3530',
      'editorLineNumber.foreground':  '#c8bfb1',
      'editorLineNumber.activeForeground': '#8a7f73',
      'editor.selectionBackground':   '#ece1f7',
      'editor.lineHighlightBackground':'#f7f1e6',
      'editorCursor.foreground':      '#8b6fd6',
      'editorIndentGuide.background': '#f0e8db',
      'editorIndentGuide.activeBackground': '#d8cfbe'
    }
  });

  const settings = loadSettings();

  editor = monaco.editor.create(document.getElementById('editor'), {
    value: PROBLEMS.aplusb.starterCode,
    language: 'cpp',
    theme: 'cozy',
    fontSize: settings.fontSize || 14,
    tabSize:  settings.tabSize  || 4,
    wordWrap: settings.wordWrap ? 'on' : 'off',
    minimap:  { enabled: !!settings.minimap },
    automaticLayout: true,
    scrollBeyondLastLine: false,
    renderWhitespace: 'selection',
    padding: { top: 16, bottom: 16 }
  });

  loadProblem('aplusb');

  // 編輯器內容變動 → 自動保存
  editor.onDidChangeModelContent(() => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      localStorage.setItem(LS_CODE(currentProblemId), editor.getValue());
    }, 400);
  });

  // 題目切換
  document.getElementById('problem-select').addEventListener('change', (e) => {
    loadProblem(e.target.value);
  });

  // 主要按鈕
  document.getElementById('btn-run').addEventListener('click', runCode);
  document.getElementById('btn-submit').addEventListener('click', submitCode);
  document.getElementById('btn-reset').addEventListener('click', resetCode);
  document.getElementById('btn-run-custom').addEventListener('click', runCustomInput);

  // 快捷鍵：Ctrl/Cmd + Enter 執行
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, runCode);

  // 點診錯項目 → 跳到對應行
  document.getElementById('output-body').addEventListener('click', (e) => {
    // 1. 測資展開
    const sum = e.target.closest('.test-summary');
    if (sum) {
      sum.parentElement.classList.toggle('expanded');
      return;
    }
    // 2. 診錯訊息點擊跳行
    const item = e.target.closest('.diag-item[data-line]');
    if (!item) return;
    const line = parseInt(item.dataset.line, 10);
    const col  = parseInt(item.dataset.col, 10) || 1;
    if (line > 0) {
      editor.revealLineInCenter(line);
      editor.setPosition({ lineNumber: line, column: col });
      editor.focus();
    }
  });

  // 分頁切換
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.remove('hidden');
    });
  });

  // 設定面板
  setupSettingsPanel(settings);
});

// =====================================================
// 題目讀取
// =====================================================
function loadProblem(id) {
  currentProblemId = id;
  const p = PROBLEMS[id];
  const html = `
    <h2>${p.title}</h2>
    <p>${p.description}</p>
    <h3>輸入格式</h3>
    <p>${p.inputFormat}</p>
    <h3>輸出格式</h3>
    <p>${p.outputFormat}</p>
    <h3>範例測資</h3>
    ${p.samples.map((s, i) => `
      <div class="sample-label">範例 ${i + 1} 輸入</div>
      <pre>${escapeHtml(s.input)}</pre>
      <div class="sample-label">範例 ${i + 1} 輸出</div>
      <pre>${escapeHtml(s.output)}</pre>
    `).join('')}
  `;
  document.getElementById('problem-body').innerHTML = html;

  if (editor) {
    const saved = localStorage.getItem(LS_CODE(id));
    editor.setValue(saved !== null ? saved : p.starterCode);
    monaco.editor.setModelMarkers(editor.getModel(), 'cpe-diagnostic', []);
  }

  // 清空輸出區
  document.getElementById('output-body').innerHTML =
    '<div class="output-empty">寫好程式後，按「試跑一下」或「送出評測」開始</div>';
  document.getElementById('output-summary').textContent = '';
  document.getElementById('custom-output').innerHTML = '';
}

function resetCode() {
  if (!confirm('要把這題的程式還原成初始版本嗎？目前寫的內容會清掉喔。')) return;
  localStorage.removeItem(LS_CODE(currentProblemId));
  editor.setValue(PROBLEMS[currentProblemId].starterCode);
}

// =====================================================
// 模擬診錯後端（之後接真實後端 API）
// =====================================================
function runCode() {
  const code = editor.getValue();
  const diagnostics = analyzeCode(code);
  const hasError = diagnostics.some(d => d.severity === 'error');

  setMarkers(diagnostics);
  renderOutput({
    diagnostics,
    stdout: hasError ? null : mockExecute(code, PROBLEMS[currentProblemId].samples[0].input),
    stdoutLabel: '範例 1 輸入',
    stdoutInput: PROBLEMS[currentProblemId].samples[0].input,
    summary: hasError ? '編譯沒過' : '已執行範例 1'
  });
  switchTab('output');
}

function submitCode() {
  const code = editor.getValue();
  const diagnostics = analyzeCode(code);
  const hasError = diagnostics.some(d => d.severity === 'error');

  setMarkers(diagnostics);

  let tests = [];
  let summary = '';
  let verdict = null;

  if (hasError) {
    summary = '編譯沒過，先把上面的錯誤修一下';
  } else {
    tests = mockJudge(code);
    const ac = tests.filter(t => t.status === 'AC').length;
    summary = `通過 ${ac} / ${tests.length} 筆測資`;
    verdict = ac === tests.length
      ? { kind: 'pass', text: '太棒了！全部測資通過' }
      : { kind: 'fail', text: `還差一點：通過 ${ac} / ${tests.length}，看看哪幾筆 WA` };
  }

  renderOutput({ diagnostics, tests, verdict, summary });
  switchTab('output');
}

function runCustomInput() {
  const code = editor.getValue();
  const input = document.getElementById('custom-input').value;
  const diagnostics = analyzeCode(code);
  const hasError = diagnostics.some(d => d.severity === 'error');

  setMarkers(diagnostics);

  const out = document.getElementById('custom-output');
  if (hasError) {
    out.innerHTML = `
      <div class="diag-item error">
        <div class="diag-message">編譯沒過喔，先看「輸出 / 診錯」分頁的錯誤訊息再試一次。</div>
      </div>
    `;
    return;
  }

  const result = mockExecute(code, input);
  out.innerHTML = `
    <div class="custom-result">
      <div class="custom-result-label">你給的輸入</div>
      <pre>${escapeHtml(input || '(空)')}</pre>
      <div class="custom-result-label">程式輸出（模擬）</div>
      <pre>${escapeHtml(result)}</pre>
    </div>
  `;
}

// =====================================================
// 模擬執行 / 判題
// 真實後端會回傳真實的 stdout、AC/WA 等
// =====================================================
function mockExecute(code, input) {
  const tokens = (input || '').trim().split(/\s+/).filter(Boolean).map(s => Number(s));

  // 對 A + B 題模擬合理輸出
  if (currentProblemId === 'aplusb' && /cout\s*<<\s*a\s*\+\s*b/.test(code)) {
    if (tokens.length >= 2 && !isNaN(tokens[0]) && !isNaN(tokens[1])) {
      return String(tokens[0] + tokens[1]) + '\n';
    }
    return '0\n';
  }
  // 其他題沒實作邏輯，給一個提示
  if (/\/\/\s*TODO/i.test(code)) {
    return '(沒輸出，因為 // TODO 還沒實作)';
  }
  return '(模擬執行結果，接後端後會看到真實 stdout)';
}

function mockJudge(code) {
  const hasIO = /\bcin\s*>>|\bcout\s*<</.test(code);
  const noStd = hasIO && !/using\s+namespace\s+std\s*;|std\s*::/.test(code);
  const buggy = /\/\/\s*TODO/i.test(code) || noStd;

  const pid = currentProblemId;
  const samples = PROBLEMS[pid].samples;

  const make = (name, input, expected, time, willFail) => ({
    name,
    status: willFail ? 'WA' : 'AC',
    time,
    input,
    expected,
    actual: willFail ? '(輸出不正確)' : expected
  });

  return [
    make('範例 1', samples[0].input, samples[0].output, '8ms',  buggy),
    make('範例 2', samples[1].input, samples[1].output, '7ms',  buggy),
    make('隱藏 1', '(隱藏)', '(隱藏)', '10ms', buggy),
    make('隱藏 2', '(隱藏)', '(隱藏)', '9ms',  false),
    make('隱藏 3 (大數據)', '(隱藏)', '(隱藏)', '95ms', false)
  ];
}

// =====================================================
// 靜態分析規則（C++ 導向）
// =====================================================
function analyzeCode(code) {
  const diags = [];
  const lines = code.split('\n');
  const usesCin     = /\bcin\s*>>/.test(code);
  const usesCout    = /\bcout\s*<</.test(code);
  const usesEndl    = /\bendl\b/.test(code);
  const hasStdNs    = /using\s+namespace\s+std\s*;|std\s*::/.test(code);
  const hasIostream = /#include\s*<iostream>/.test(code);

  let endlCount = 0;

  lines.forEach((line, i) => {
    const lineNum = i + 1;
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;

    const m1 = line.match(/cin\s*>>\s*&\s*([a-zA-Z_]\w*)/);
    if (m1) {
      diags.push({
        severity: 'warning',
        line: lineNum,
        col: line.indexOf('&') + 1,
        message: 'cin >> 後面不用加 & 啦',
        hint: `這應該是從 C 的 <strong>scanf("%d", &n)</strong> 帶過來的習慣。C++ 的 cin 已經幫你處理好變數位址了，直接寫 <strong>cin >> ${m1[1]}</strong> 就好，加了 & 反而會型別錯誤。`
      });
    }

    const m2 = line.match(/scanf\s*\(\s*"[^"]*"\s*,\s*([a-zA-Z_]\w*)\s*\)/);
    if (m2) {
      diags.push({
        severity: 'warning',
        line: lineNum,
        col: line.indexOf(m2[1]) + 1,
        message: `scanf 的 <strong>${m2[1]}</strong> 前面好像忘了加 & 喔`,
        hint: `跟 cin 不一樣，scanf 是 C 的函式，沒辦法自己拿到變數位址，所以你得用 & 告訴它「資料要塞去哪」。改成 <strong>scanf("%d", &${m2[1]})</strong>。話說既然你寫 C++，直接用 cin 比較不會出這種錯。`
      });
    }

    if (/if\s*\(\s*\w+\s*=\s*[^=]/.test(line) && !line.includes('==')) {
      diags.push({
        severity: 'warning',
        line: lineNum,
        col: 1,
        message: '這邊你是想「比較」吧？但打成「賦值」了',
        hint: '一個 <strong>=</strong> 是「把右邊塞給左邊」，兩個 <strong>==</strong> 才是「兩邊到底相不相等」。這個小手滑很常讓 if 永遠成立或永遠不成立，debug 起來會很頭痛，記得改成 ==。'
      });
    }

    if (/\bgets\s*\(/.test(line)) {
      diags.push({
        severity: 'error',
        line: lineNum,
        col: line.indexOf('gets') + 1,
        message: 'gets() 這個函式已經被官方淘汰啦',
        hint: 'gets() 不檢查使用者輸入多長，太長會直接撐爆記憶體，C11 之後就被移除了。C++ 建議用 <strong>getline(cin, str)</strong> 讀一整行。'
      });
    }

    if (/strcmp\s*\(/.test(line)) {
      diags.push({
        severity: 'info',
        line: lineNum,
        col: line.indexOf('strcmp') + 1,
        message: '如果你用的是 C++ 的 string，直接 == 就可以比了',
        hint: 'strcmp 是給 C 的 char[] 用的。C++ 的 <strong>string</strong> 物件已經 overload 了 ==、!=、< 這些運算子，可以直接 <strong>if (a == b)</strong>，語意更直觀。'
      });
    }

    if (/\bendl\b/.test(line)) endlCount++;
  });

  if ((usesCin || usesCout) && !hasIostream) {
    diags.push({
      severity: 'error',
      line: 1, col: 1,
      message: '你用了 cin / cout，但忘了把 iostream 叫進來',
      hint: 'cin、cout、endl 這些都住在 <strong>iostream</strong> 標頭檔裡。最上面加一行 <strong>#include &lt;iostream&gt;</strong>，編譯器才找得到它們。'
    });
  }

  if ((usesCin || usesCout || usesEndl) && !hasStdNs) {
    diags.push({
      severity: 'error',
      line: 1, col: 1,
      message: 'cin / cout / endl 編譯器找不到，因為它們住在 std 裡面',
      hint: 'C++ 把標準函式庫塞在 <strong>std</strong> 命名空間。最簡單的方式：在 #include 後面加一行 <strong>using namespace std;</strong>，不然就要每次寫 <strong>std::cin</strong>、<strong>std::cout</strong>。'
    });
  }

  if (/#include\s*<bits\/stdc\+\+\.h>/.test(code)) {
    diags.push({
      severity: 'info',
      line: 1, col: 1,
      message: '看到你用了 <bits/stdc++.h> 萬用標頭',
      hint: '這個會把整個標準函式庫一次抓進來，是 GCC 才有的偷懶寫法。CPE 用 g++ 評測所以可以用，但平常寫專案還是建議只 include 你真的會用到的。'
    });
  }

  if (endlCount >= 5) {
    diags.push({
      severity: 'info',
      line: 0, col: 0,
      message: `你用了 ${endlCount} 次 endl，大量輸出時會拖慢速度`,
      hint: '<strong>endl</strong> 除了換行還會強制清空輸出緩衝區（flush），在大數據題每次都 flush 會超慢。換成 <strong>"\\n"</strong> 只換行不 flush，通常可以快好幾倍。'
    });
  }

  if (!/\bint\s+main\s*\(/.test(code)) {
    diags.push({
      severity: 'error',
      line: 1, col: 1,
      message: '咦？你的 main 函式呢？',
      hint: '每個 C++ 程式都要有一個 main 函式當「起跑點」。補上 <strong>int main() { ... return 0; }</strong>。'
    });
  }

  if (/\bint\s+main\s*\(/.test(code) && !/return\s+\d+\s*;/.test(code)) {
    diags.push({
      severity: 'info',
      line: lines.length, col: 1,
      message: 'main 結尾建議補上 return 0;',
      hint: '不寫其實也能跑（C++ 標準會幫你補 0），但寫出來等於明確告訴別人「我的程式正常結束」。'
    });
  }

  if (diags.length === 0) {
    diags.push({
      severity: 'success',
      line: 0, col: 0,
      message: '掃過一遍，看起來沒什麼大問題，可以送出試試看'
    });
  }

  return diags;
}

// =====================================================
// 把診錯結果同步到 Monaco editor 的左側 gutter
// =====================================================
function setMarkers(diagnostics) {
  const model = editor && editor.getModel();
  if (!model) return;

  const markers = diagnostics
    .filter(d => d.line && d.line > 0)
    .map(d => {
      const line = Math.min(d.line, model.getLineCount());
      return {
        severity: severityToMonaco(d.severity),
        startLineNumber: line,
        endLineNumber:   line,
        startColumn: d.col || 1,
        endColumn:   model.getLineMaxColumn(line),
        message: stripHtml(d.message + (d.hint ? '\n\n' + d.hint : ''))
      };
    });

  monaco.editor.setModelMarkers(model, 'cpe-diagnostic', markers);
}

function severityToMonaco(s) {
  if (s === 'error')   return monaco.MarkerSeverity.Error;
  if (s === 'warning') return monaco.MarkerSeverity.Warning;
  return monaco.MarkerSeverity.Info;
}

// =====================================================
// 渲染輸出
// =====================================================
function renderOutput({ diagnostics, stdout, stdoutLabel, stdoutInput, tests, verdict, summary }) {
  const out = document.getElementById('output-body');
  document.getElementById('output-summary').textContent = summary || '';

  let html = '';

  if (diagnostics && diagnostics.length) {
    diagnostics.forEach(d => {
      const hasLoc = d.line && d.line > 0;
      const loc = hasLoc
        ? `第 ${d.line} 行${d.col ? `, 第 ${d.col} 欄` : ''}`
        : '';
      const icon = ICONS[d.severity] || '';
      const dataAttr = hasLoc ? `data-line="${d.line}" data-col="${d.col || 1}"` : '';
      const jumpHint = hasLoc ? '<span class="jump-hint">點擊跳到該行</span>' : '';
      html += `
        <div class="diag-item ${d.severity}" ${dataAttr}>
          <div class="diag-location">
            <span class="diag-loc-left">
              <span class="diag-icon">${icon}</span>
              <span>${SEVERITY_LABEL[d.severity] || d.severity}${loc ? ' · ' + loc : ''}</span>
            </span>
            ${jumpHint}
          </div>
          <div class="diag-message">${d.message}</div>
          ${d.hint ? `<div class="diag-hint">${d.hint}</div>` : ''}
        </div>
      `;
    });
  }

  if (stdout) {
    html += `
      <div class="diag-item info">
        <div class="diag-location">
          <span class="diag-loc-left">
            <span class="diag-icon">${ICONS.info}</span>
            <span>標準輸出${stdoutLabel ? ' · ' + stdoutLabel : ''}</span>
          </span>
        </div>
        ${stdoutInput ? `<div class="diag-hint" style="border-top:none;padding-top:0;margin-top:0;">輸入：<code>${escapeHtml(stdoutInput)}</code></div>` : ''}
        <div class="stdout-box">${escapeHtml(stdout)}</div>
      </div>
    `;
  }

  if (tests && tests.length) {
    html += `<div class="test-results">`;
    tests.forEach((t, idx) => {
      html += `
        <div class="test-row">
          <div class="test-summary" data-idx="${idx}">
            <span class="test-status ${t.status}">${t.status}</span>
            <span class="test-name">${escapeHtml(t.name)}</span>
            <span class="test-time">${t.time}</span>
            <span class="test-toggle">▾</span>
          </div>
          <div class="test-detail">
            <div class="detail-row">
              <div class="detail-label">輸入</div>
              <pre class="detail-pre">${escapeHtml(t.input)}</pre>
            </div>
            <div class="detail-row">
              <div class="detail-label">預期輸出</div>
              <pre class="detail-pre expected">${escapeHtml(t.expected)}</pre>
            </div>
            <div class="detail-row">
              <div class="detail-label">你的輸出</div>
              <pre class="detail-pre ${t.status === 'WA' ? 'mismatch' : ''}">${escapeHtml(t.actual)}</pre>
            </div>
          </div>
        </div>
      `;
    });
    html += `</div>`;
  }

  if (verdict) {
    html += `<div class="verdict ${verdict.kind}">${verdict.text}</div>`;
  }

  out.innerHTML = html || '<div class="output-empty">沒有輸出</div>';
}

// =====================================================
// 設定面板
// =====================================================
function setupSettingsPanel(initial) {
  const panel = document.getElementById('settings-panel');
  const backdrop = document.getElementById('settings-backdrop');
  const fontSize = document.getElementById('font-size');
  const fontSizeVal = document.getElementById('font-size-val');
  const tabSize = document.getElementById('tab-size');
  const wordWrap = document.getElementById('word-wrap');
  const minimap = document.getElementById('minimap');

  // 初始化 UI 值
  fontSize.value = initial.fontSize || 14;
  fontSizeVal.textContent = initial.fontSize || 14;
  tabSize.value = String(initial.tabSize || 4);
  wordWrap.checked = !!initial.wordWrap;
  minimap.checked = !!initial.minimap;

  function applyAll() {
    const s = {
      fontSize: parseInt(fontSize.value, 10),
      tabSize:  parseInt(tabSize.value, 10),
      wordWrap: wordWrap.checked,
      minimap:  minimap.checked
    };
    saveSettings(s);
    if (editor) {
      editor.updateOptions({
        fontSize: s.fontSize,
        tabSize:  s.tabSize,
        wordWrap: s.wordWrap ? 'on' : 'off',
        minimap:  { enabled: s.minimap }
      });
    }
  }

  fontSize.addEventListener('input', () => {
    fontSizeVal.textContent = fontSize.value;
    applyAll();
  });
  tabSize.addEventListener('change', applyAll);
  wordWrap.addEventListener('change', applyAll);
  minimap.addEventListener('change', applyAll);

  function open() {
    panel.classList.remove('hidden');
    backdrop.classList.remove('hidden');
  }
  function close() {
    panel.classList.add('hidden');
    backdrop.classList.add('hidden');
  }

  document.getElementById('btn-settings').addEventListener('click', open);
  document.getElementById('btn-close-settings').addEventListener('click', close);
  backdrop.addEventListener('click', close);
}

// =====================================================
// helpers
// =====================================================
function switchTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === name);
  });
  document.querySelectorAll('.tab-content').forEach(c => {
    c.classList.toggle('hidden', c.id !== 'tab-' + name);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function stripHtml(s) {
  return String(s).replace(/<[^>]+>/g, '');
}
