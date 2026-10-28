// Cloudflare Worker: serverar HTML-visaren
const HTML = `<!DOCTYPE html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>HTML-visaren</title>
<style>
:root{--bg:#f6f5f1;--card:#fff;--text:#1d1d1b;--muted:#6b6a65;--accent:#4f46e5;--border:#dcdad3}
@media (prefers-color-scheme:dark){:root{--bg:#17171a;--card:#222226;--text:#f0efea;--muted:#a09f99;--accent:#8b85ff;--border:#3a3a40}}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
#upload{min-height:100%;display:flex;align-items:center;justify-content:center;padding:16px}
main{width:100%;max-width:560px}
h1{font-size:1.7rem;margin:0 0 6px}
p.sub{color:var(--muted);margin:0 0 20px}
#drop{border:2px dashed var(--border);border-radius:18px;background:var(--card);padding:44px 16px;text-align:center;cursor:pointer;transition:.15s}
#drop.over{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 10%,var(--card))}
#drop strong{display:block;font-size:1.1rem;margin-bottom:6px}
#drop span{color:var(--muted);font-size:.9rem}
#note{color:var(--muted);font-size:.82rem;margin-top:16px;line-height:1.5}
#stage{display:none;position:fixed;inset:0;background:#000;z-index:10}
#stage iframe{width:100%;height:100%;border:0;display:block;background:#fff}
.ctl{position:fixed;top:calc(env(safe-area-inset-top,0px) + 6px);z-index:20;width:30px;height:30px;border-radius:8px;border:0;background:rgba(0,0,0,.55);color:#fff;font-size:15px;line-height:1;cursor:pointer;opacity:.18;transition:opacity .15s}
.ctl:hover,.ctl:focus{opacity:1}
#exit{left:6px}
#fs{left:42px}
</style>
</head>
<body>
<div id="upload">
<main>
  <h1>HTML-visaren</h1>
  <p class="sub">Ladda upp en HTML-fil så tar den över hela skärmen.</p>

  <div id="drop" role="button" tabindex="0">
    <strong>Dra och släpp en fil här</strong>
    <span>eller tryck för att välja (.html, .htm)</span>
  </div>
  <input id="file" type="file" accept=".html,.htm,text/html" hidden>

  <p id="note">Filen läses bara i din webbläsare och laddas inte upp någonstans. Medan en fil är öppen går den i helskärm och webbläsaren frågar innan fliken stängs (till exempel med Ctrl+W). Allt måste vara inbäddat i filen, så separata CSS-, JS- och bildfiler fungerar inte.</p>
</main>
</div>

<div id="stage">
  <iframe id="frame" allow="fullscreen; autoplay; gamepad; clipboard-read; clipboard-write"
    sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-pointer-lock allow-downloads"></iframe>
</div>
<button id="exit" class="ctl" title="Stäng filen" style="display:none">✕</button>
<button id="fs" class="ctl" title="Helskärm" style="display:none">⛶</button>

<script>
var drop = document.getElementById("drop");
var input = document.getElementById("file");
var upload = document.getElementById("upload");
var stage = document.getElementById("stage");
var frame = document.getElementById("frame");
var exitBtn = document.getElementById("exit");
var fsBtn = document.getElementById("fs");
var active = false;

drop.addEventListener("click", function(){ input.click(); });
drop.addEventListener("keydown", function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); input.click(); } });
input.addEventListener("change", function(){ if(input.files[0]) openFile(input.files[0]); input.value = ""; });

["dragenter","dragover"].forEach(function(ev){
  drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.add("over"); });
});
["dragleave","drop"].forEach(function(ev){
  drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.remove("over"); });
});
drop.addEventListener("drop", function(e){ if(e.dataTransfer.files[0]) openFile(e.dataTransfer.files[0]); });

// Frågar innan fliken stängs medan en fil är öppen
window.addEventListener("beforeunload", function(e){
  if(active){ e.preventDefault(); e.returnValue = ""; }
});

function goFullscreen(){
  var el = document.documentElement;
  if(el.requestFullscreen && !document.fullscreenElement){
    el.requestFullscreen().then(function(){
      // Försöker fånga tangenter i helskärm (stöds bara av vissa webbläsare)
      if(navigator.keyboard && navigator.keyboard.lock){
        navigator.keyboard.lock(["KeyW","KeyT","KeyN","ControlLeft","ControlRight"]).catch(function(){});
      }
    }).catch(function(){});
  }
}

document.addEventListener("fullscreenchange", function(){
  if(!document.fullscreenElement && navigator.keyboard && navigator.keyboard.unlock){
    navigator.keyboard.unlock();
  }
});

fsBtn.addEventListener("click", function(){
  if(document.fullscreenElement){ document.exitFullscreen(); } else { goFullscreen(); }
});

exitBtn.addEventListener("click", function(){
  if(!confirm("Stänga filen och gå tillbaka?")) return;
  active = false;
  frame.srcdoc = "";
  stage.style.display = "none";
  exitBtn.style.display = "none";
  fsBtn.style.display = "none";
  upload.style.display = "flex";
  if(document.fullscreenElement){ document.exitFullscreen(); }
  document.title = "HTML-visaren";
});

function openFile(f){
  if(!/\\.(html?|xhtml)$/i.test(f.name) && f.type !== "text/html"){
    alert(f.name + " är inte en HTML-fil.");
    return;
  }
  goFullscreen();   // måste ske direkt efter klicket
  var reader = new FileReader();
  reader.onload = function(){
    frame.srcdoc = reader.result;
    upload.style.display = "none";
    stage.style.display = "block";
    exitBtn.style.display = "block";
    fsBtn.style.display = "block";
    active = true;
    document.title = f.name;
    setTimeout(function(){ frame.focus(); }, 100);
  };
  reader.readAsText(f);
}
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
