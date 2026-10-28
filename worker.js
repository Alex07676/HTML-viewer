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
@media (prefers-color-scheme:dark){:root{--bg:#17171a;--card:#222226;--text:#f0efea;--muted:#a09f99;--accent:#8b85ff;--border:#3a3a40}}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,"Segoe UI",sans-serif;display:flex;align-items:center;justify-content:center;padding:16px}
main{width:100%;max-width:560px}
h1{font-size:1.7rem;margin:0 0 6px}
p.sub{color:var(--muted);margin:0 0 20px}
#drop{border:2px dashed var(--border);border-radius:18px;background:var(--card);padding:44px 16px;text-align:center;cursor:pointer;transition:.15s}
#drop.over{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 10%,var(--card))}
#drop strong{display:block;font-size:1.1rem;margin-bottom:6px}
#drop span{color:var(--muted);font-size:.9rem}
#note{color:var(--muted);font-size:.82rem;margin-top:16px;line-height:1.5}
</style>
</head>
<body>
<main>
  <h1>HTML-visaren</h1>
  <p class="sub">Ladda upp en HTML-fil så ersätter den hela den här sidan.</p>

  <div id="drop" role="button" tabindex="0">
    <strong>Dra och släpp en fil här</strong>
    <span>eller tryck för att välja (.html, .htm)</span>
  </div>
  <input id="file" type="file" accept=".html,.htm,text/html" hidden>

  <p id="note">Filen läses bara i din webbläsare och laddas inte upp någonstans. Tryck på bakåt-knappen i webbläsaren för att komma tillbaka hit. Allt måste vara inbäddat i filen, så separata CSS-, JS- och bildfiler fungerar inte.</p>
</main>

<script>
var drop = document.getElementById("drop");
var input = document.getElementById("file");

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

function openFile(f){
  if(!/\\.(html?|xhtml)$/i.test(f.name) && f.type !== "text/html"){
    alert(f.name + " är inte en HTML-fil.");
    return;
  }
  var reader = new FileReader();
  reader.onload = function(){
    var blob = new Blob([reader.result], {type: "text/html;charset=utf-8"});
    location.href = URL.createObjectURL(blob);   // ersätter hela sidan
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
