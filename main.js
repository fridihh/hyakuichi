// SVGファイルを非同期で読み込んで挿入
fetch('svg.html')
.then(response => response.text())
.then(data => {
    const div = document.createElement('div');
    div.style.display = 'none';
    div.innerHTML = data;
    document.body.insertBefore(div, document.body.firstChild);
});

let cards = [];

// JSONを読み込む
fetch("cards.json")
  .then(res => res.json())
  .then(data => {
    // "cards" テーブルの data 部分を取り出す
    const table = data.find(item => item.type === "table" && item.name === "cards");
    cards = table.data;
  })
  .catch(err => console.error("JSON読み込み失敗:", err));

const input = document.getElementById("inpot");   // ← input の id="inpot"
const btn = document.getElementById("spot");      // ← button の id="spot"
const results = document.getElementById("results");

function normalizeText(text) {
  if (!text) return "";

  // 1. 漢字だけのバージョン（ふりがな削除）
  const kanjiOnly = text.replace(/<<.*?>>/g, "");

  // 2. 漢字＋ふりがなバージョン（例: 奥<<おく>>山 → 奥おく山）
  const withFurigana = text.replace(/(.)<<(.+?)>>/g, (match, kanji, hira) => kanji + hira);

  // 両方を結合して検索対象にする
  return kanjiOnly + " " + withFurigana;
}
// 🔑 表示用にふりがなを削除する関数（漢字だけ表示）
function stripFurigana(text) {
  if (!text) return "";
  return text.replace(/<<.*?>>/g, "");
}

// 🔑 和歌をスペースで分割して <br> を入れる関数
function formatPoem(poem) {
  const clean = stripFurigana(poem); // 表示用にふりがな削除
  const parts = clean.split(/\s+/);  // 空白で分割
  return parts.join("<br>");
}

btn.addEventListener("click", () => {
  const keyword = input.value.trim();
  results.innerHTML = "";
  if (keyword === "") return;

  // 🔑 全フィールドを対象に部分一致検索
  const filtered = cards.filter(item => {
    return Object.entries(item).some(([key, value]) => {
      const str = String(value);
      if (key === "poem") {
        // poem はふりがな展開して検索
        return normalizeText(str).includes(keyword);
      }
      return str.includes(keyword);
    });
  });

  if (filtered.length === 0) {
    results.innerHTML = "<p>該当する結果がありません。</p>";
  } else {
    filtered.forEach(item => {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        ${formatPoem(item.poem)}
        <br><br>
        <small>　${item.poet}<br>　決まり字…　${item.kimariji}</small>`;
      results.appendChild(div);
    });
  }
});
