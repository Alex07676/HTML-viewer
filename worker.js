// Cloudflare Worker: serves the HTML viewer
const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>HTML viewer</title>
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
#tap{display:none;position:fixed;inset:0;z-index:30;background:rgba(0,0,0,.75);color:#fff;align-items:center;justify-content:center;text-align:center;font-size:1.2rem;cursor:pointer;padding:20px}
</style>
</head>
<body>
<div id="upload">
<main>
  <h1>HTML-viewer</h1>
  <p class="sub">Upload an HTML file to view it in fullscreen.</p>

  <div id="drop" role="button" tabindex="0">
    <strong>Drag and drop a file here</strong>
    <span>or click to select (.html, .htm)</span>
  </div>
  <input id="file" type="file" accept=".html,.htm,text/html" hidden>

  <p id="note">The file is only read in your browser and is not uploaded anywhere. While a file is open, it will go fullscreen and the browser will ask before closing the tab (for example with Ctrl+W). Reload the page (F5) to come back here. Everything must be embedded in the file, so separate CSS, JS, and image files do not work.</p>
</main>
</div>

<div id="stage">
  <iframe id="frame" allow="fullscreen; autoplay; gamepad; clipboard-read; clipboard-write"
    sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-pointer-lock allow-downloads"></iframe>
</div>
<div id="tap">Click wherever to enter fullscreen, I know it's a pain that it takes a moment. But in the end, it's worth it!</div>

<script>
var drop = document.getElementById("drop");
var input = document.getElementById("file");
var upload = document.getElementById("upload");
var stage = document.getElementById("stage");
var frame = document.getElementById("frame");
var tap = document.getElementById("tap");
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

// Asks before closing the tab if a file is open, so you don't accidentally lose your work
window.addEventListener("beforeunload", function(e){
  if(active){ e.preventDefault(); e.returnValue = ""; }
});

function goFullscreen(){
  var el = document.documentElement;
  if(el.requestFullscreen && !document.fullscreenElement){
    el.requestFullscreen().then(function(){
      // Tries to capture keys in fullscreen (only supported by some browsers)
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

// Fallback: if the browser did not allow automatic fullscreen, one click is enough
tap.addEventListener("click", function(){
  goFullscreen();
  tap.style.display = "none";
  frame.focus();
});

function openFile(f){
  if(!/\\.(html?|xhtml)$/i.test(f.name) && f.type !== "text/html"){
    alert(f.name + " is not an HTML file. Ugh...");
    return;
  }
  goFullscreen();   // Must happen directly after the click
  var reader = new FileReader();
  reader.onload = function(){
    frame.srcdoc = reader.result;
    upload.style.display = "none";
    stage.style.display = "block";
    active = true;
    document.title = f.name;
    setTimeout(function(){
      frame.focus();
      if(!document.fullscreenElement){ tap.style.display = "flex"; }
    }, 500);
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
