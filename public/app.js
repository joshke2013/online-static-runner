const DB="chromebook-static-runner", STORE="files", META="meta", PREFIX="/__local__/";
const $=id=>document.getElementById(id);
const input=$("folderInput"), launchBtn=$("launchBtn"), replaceBtn=$("replaceBtn"), clearBtn=$("clearBtn"),
openTabBtn=$("openTabBtn"), statusText=$("statusText"), fileCount=$("fileCount"), fileList=$("fileList"),
entryText=$("entryText"), preview=$("preview");

function openDb(){
  return new Promise((resolve,reject)=>{
    const r=indexedDB.open(DB,1);
    r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE);if(!db.objectStoreNames.contains(META))db.createObjectStore(META)};
    r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error);
  });
}
async function get(store,key){const db=await openDb();return new Promise((resolve,reject)=>{const r=db.transaction(store,"readonly").objectStore(store).get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function put(store,key,val){const db=await openDb();return new Promise((resolve,reject)=>{const t=db.transaction(store,"readwrite");t.objectStore(store).put(val,key);t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error)})}
async function clearAll(){const db=await openDb();await Promise.all([STORE,META].map(s=>new Promise((resolve,reject)=>{const t=db.transaction(s,"readwrite");t.objectStore(s).clear();t.oncomplete=resolve;t.onerror=()=>reject(t.error)})))}
function mime(path){const e=path.split(".").pop().toLowerCase();return({html:"text/html; charset=utf-8",htm:"text/html; charset=utf-8",css:"text/css; charset=utf-8",js:"text/javascript; charset=utf-8",mjs:"text/javascript; charset=utf-8",json:"application/json; charset=utf-8",svg:"image/svg+xml",png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",gif:"image/gif",webp:"image/webp",ico:"image/x-icon",wasm:"application/wasm",woff:"font/woff",woff2:"font/woff2",ttf:"font/ttf"})[e]||"application/octet-stream"}
function norm(files){const a=[...files];if(!a.length)return[];const p=(a[0].webkitRelativePath||a[0].name).split("/"),top=p.length>1?p[0]:"";return a.map(file=>{let path=file.webkitRelativePath||file.name;if(top&&path.startsWith(top+"/"))path=path.slice(top.length+1);return{file,path}})}
async function importFolder(files){
  const items=norm(files); if(!items.length)return;
  await clearAll(); statusText.textContent="Importing…";
  for(let i=0;i<items.length;i++){const {file,path}=items[i];await put(STORE,path,{path,type:file.type||mime(path),data:await file.arrayBuffer()});statusText.textContent=`Importing ${i+1}/${items.length}`}
  const paths=items.map(x=>x.path);
  const entry=paths.includes("index.html")?"index.html":(paths.find(p=>p.endsWith("/index.html"))||paths.find(p=>/\.html?$/i.test(p))||"");
  await put(META,"paths",paths); await put(META,"entry",entry); render(paths,entry);
}
function render(paths,entry){fileCount.textContent=paths.length;fileList.textContent=paths.join("\n");entryText.textContent=entry||"(none)";statusText.textContent=entry?"Ready":"No HTML entry found";launchBtn.disabled=!entry;openTabBtn.disabled=!entry}
async function launch(newTab=false){const entry=await get(META,"entry");if(!entry)return;const u=`${PREFIX}${entry}?v=${Date.now()}`;newTab?window.open(u,"_blank"):preview.src=u}
input.onchange=()=>importFolder(input.files);
replaceBtn.onclick=()=>input.click();
clearBtn.onclick=async()=>{await clearAll();preview.src="about:blank";render([],"");statusText.textContent="Cleared"};
launchBtn.onclick=()=>launch(false);openTabBtn.onclick=()=>launch(true);

(async()=>{
  if(!("serviceWorker"in navigator))throw new Error("Service Worker not supported");
  await navigator.serviceWorker.register("/sw.js",{scope:"/"});
  await navigator.serviceWorker.ready;
  const paths=await get(META,"paths")||[], entry=await get(META,"entry")||"";
  render(paths,entry);
})().catch(e=>{console.error(e);statusText.textContent=e.message||String(e)});
