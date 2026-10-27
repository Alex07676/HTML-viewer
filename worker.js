// Cloudflare Worker: serverar HTML-visaren
const HTML = `<!DOCTYPE html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>HTML-visaren</title>
<style>
:root{--bg:#f6f5f1;--card:#fff;--text:#1d1d1b;--muted:#6b6a65;--accent:#4f46e5;--border:#dcdad3;
box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#17171a;--card:#222226;--text:#f0efea;--muted:#a09f99;--accent:#8b85ff;--border:#3a3a40}}
:root[data-theme="dark"]{--bg:#17171a;--card:#222226;--text:#f0efea;--muted:#a09f99;--accent:#8b85ff;--border:#3a3a40}
*{box-sizing:border-box}
html,body{margin:0}
body{background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,"Segoe UI",sans-serif;min-height:100vh}
main{max-width:1000px;margin:0 auto;padding:20px 16px 40px}
h1{font-size:1.6rem;margin:0 0 4px}
p.sub{color:var(--muted);margin:0 0 18px}
#drop{border:2px dashed var(--border);border-radius:16px;background:var(--card);padding:28px 16px;text-align:center;cursor:pointer;transition:.15s}
#drop.over{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 10%,var(--card))}
#drop strong{display:block;font-size:1.05rem;margin-bottom:4px}
#drop span{color:var(--muted);font-size:.9rem}
button{font:inherit;cursor:pointer;border:1px solid var(--border);background:var(--card);color:var(--text);border-radius:10px;padding:8px 14px}
button.primary{background:var(--accent);color:#fff;border-color:var(--accent)}
#tabs{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0 10px}
.tab{display:flex;align-items:center;gap:8px;padding:6px 6px 6px 12px;border-radius:999px;border:1px solid var(--border);background:var(--card);cursor:pointer;font-size:.9rem}
.tab.active{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 14%,var(--card))}
.tab .x{border:none;background:none;padding:2px 8px;color:var(--muted);border-radius:999px;font-size:1rem}
.tab .x:hover{background:var(--border)}
#bar{display:none;gap:8px;margin-bottom:10px;flex-wrap:wrap}
#viewer{display:none;border:1px solid var(--border);border-radius:14px;overflow:hidden;background:#fff}
iframe{width:100%;height:70vh;border:0;display:block;background:#fff}
#viewer.full{position:fixed;inset:0;z-index:50;border-radius:0;border:0;padding-top:env(safe-area-inset-top,0px);background:#fff}
#viewer.full iframe{height:100%}
#close{display:none;position:fixed;right:12px;top:calc(env(safe-area-inset-top,0px) + 10px);z-index:60;box-shadow:0 2px 10px rgba(0,0,0,.3)}
#note{color:var(--muted);font-size:.82rem;margin-top:16px}
</style>
</head>
<body>
<main>
  <h1>HTML-visaren</h1>
  <p class="sub">Ladda upp en eller flera HTML-filer så visas de direkt här.</p>

  <div id="drop" role="button" tabindex="0">
    <strong>Dra och släpp filer här</strong>
    <span>eller tryck för att välja (.html, .htm)</span>
  </div>
  <input id="file" type="file" accept=".html,.htm,text/html" multiple hidden>

  <div id="tabs"></div>
  <div id="bar">
    <button id="full" class="primary">Helskärm</button>
    <button id="reload">Ladda om</button>
  </div>
  <div id="viewer"><iframe id="frame" sandbox="allow-scripts allow-forms allow-modals allow-popups allow-pointer-lock"></iframe></div>
  <button id="close">Stäng helskärm</button>

  <p id="note">Filerna läses bara i din webbläsare och laddas inte upp någonstans. Allt i filen måste vara inbäddat, så separata CSS-, JS- och bildfiler fungerar inte.</p>
</main>

<script>
var files = [];   // {name, html}
var current = -1;

var drop = document.getElementById("drop");
var input = document.getElementById("file");
var tabs = document.getElementById("tabs");
var bar = document.getElementById("bar");
var viewer = document.getElementById("viewer");
var frame = document.getElementById("frame");
var closeBtn = document.getElementById("close");

drop.addEventListener("click", function(){ input.click(); });
drop.addEventListener("keydown", function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); input.click(); } });
input.addEventListener("change", function(){ addFiles(input.files); input.value = ""; });

["dragenter","dragover"].forEach(function(ev){
  drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.add("over"); });
});
["dragleave","drop"].forEach(function(ev){
  drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.remove("over"); });
});
drop.addEventListener("drop", function(e){ addFiles(e.dataTransfer.files); });

function addFiles(list){
  Array.prototype.forEach.call(list, function(f){
    if(!/\\.(html?|xhtml)$/i.test(f.name) && f.type !== "text/html"){
      alert(f.name + " är inte en HTML-fil.");
      return;
    }
    var reader = new FileReader();
    reader.onload = function(){
      files.push({name: f.name, html: reader.result});
      show(files.length - 1);
    };
    reader.readAsText(f);
  });
}

function show(i){
  current = i;
  frame.srcdoc = files[i].html;
  render();
}

function render(){
  tabs.innerHTML = "";
  files.forEach(function(f, i){
    var t = document.createElement("div");
    t.className = "tab" + (i === current ? " active" : "");
    var label = document.createElement("span");
    label.textContent = f.name;
    var x = document.createElement("button");
    x.className = "x";
    x.textContent = "×";
    x.title = "Ta bort";
    x.addEventListener("click", function(e){ e.stopPropagation(); removeFile(i); });
    t.appendChild(label);
    t.appendChild(x);
    t.addEventListener("click", function(){ show(i); });
    tabs.appendChild(t);
  });
  var has = current >= 0;
  bar.style.display = has ? "flex" : "none";
  viewer.style.display = has ? "block" : "none";
}

function removeFile(i){
  files.splice(i, 1);
  if(files.length === 0){ current = -1; frame.srcdoc = ""; exitFull(); }
  else { show(Math.min(i, files.length - 1)); return; }
  render();
}

document.getElementById("reload").addEventListener("click", function(){
  if(current >= 0){ frame.srcdoc = ""; setTimeout(function(){ frame.srcdoc = files[current].html; }, 30); }
});

function enterFull(){ viewer.classList.add("full"); closeBtn.style.display = "block"; }
function exitFull(){ viewer.classList.remove("full"); closeBtn.style.display = "none"; }
document.getElementById("full").addEventListener("click", enterFull);
closeBtn.addEventListener("click", exitFull);
document.addEventListener("keydown", function(e){ if(e.key === "Escape") exitFull(); });
</script>
</body>
</html>
`;

export default {
  async fetch(request) {
    return new Response(HTML, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  },
};
