const DB="chromebook-static-runner", STORE="files", PREFIX="/__local__/";
function openDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE);if(!db.objectStoreNames.contains("meta"))db.createObjectStore("meta")};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function getFile(path){const db=await openDb();return new Promise((resolve,reject)=>{const r=db.transaction(STORE,"readonly").objectStore(STORE).get(path);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",event=>{
  const u=new URL(event.request.url); if(!u.pathname.startsWith(PREFIX))return;
  event.respondWith((async()=>{
    let path=decodeURIComponent(u.pathname.slice(PREFIX.length)); if(!path||path.endsWith("/"))path+="index.html";
    const r=await getFile(path); if(!r)return new Response("File not found: "+path,{status:404,headers:{"content-type":"text/plain; charset=utf-8"}});
    return new Response(r.data,{status:200,headers:{"content-type":r.type||"application/octet-stream","cache-control":"no-store"}});
  })());
});
