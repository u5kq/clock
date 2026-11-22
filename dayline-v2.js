/* DAYLINE 2.0 navigation and safe layout migration */
(()=>{
 const main=document.querySelector("main.screen");
 const header=main?.querySelector(".topbar");
 const dashboard=main?.querySelector(".dashboard");
 if(!main||!header||!dashboard||document.getElementById("dayline-nav"))return;
 const by=s=>main.querySelector(s);
 const clock=by(".clock-card"),weather=by(".weather-card"),news=by(".news-card"),calendar=by(".calendar-card"),market=by(".market-card"),disaster=by(".disaster-card"),jalert=by(".jalert-card"),lower=by(".lower-grid");
 if(!clock||!weather||!news||!disaster)return;
 const navItems=[
  ["clock","CLOCK","時刻"],
  ["timeline","TIMELINE","時間軸"],
  ["daily","DAILY","日常情報"],
  ["safety","SAFETY","防災情報"],
  ["world","WORLD","世界時計"],
  ["settings","SETTINGS","設定"]
 ];
 const nav=document.createElement("nav");nav.id="dayline-nav";nav.setAttribute("aria-label","DAYLINE navigation");
 const pages=document.createElement("div");pages.id="dayline-pages";
 const pageMap={};
 const makePage=(id,title,description)=>{
  const page=document.createElement("section");page.className="dayline-page";page.id="dayline-"+id+"-page";page.setAttribute("aria-label",title);
  const head=document.createElement("div");head.className="dayline-page-head";
  head.innerHTML='<div><div class="dayline-page-kicker">DAYLINE / '+id.toUpperCase()+'</div><h1 class="dayline-page-title">'+title+'</h1></div><div class="dayline-page-description">'+description+'</div>';
  page.append(head);pages.append(page);pageMap[id]=page;return page;
 };
 const pClock=makePage("clock","現在時刻","JAPAN STANDARD TIME · ASIA / TOKYO");
 const pTimeline=makePage("timeline","24時間の時間軸","一日の進み具合を、現在位置とともに表示します。");
 const pDaily=makePage("daily","今日の情報","天気・ニュース・カレンダー");
 const pSafety=makePage("safety","防災・安全情報","公開情報の確認用です。緊急時は公式情報とスマートフォンの緊急速報を優先してください。");
 const pWorld=makePage("world","世界時計・今日のメモ","世界の時刻と一日のメモ");
 const pSettings=makePage("settings","設定・連携","通知・音声・テスト・予定URLの設定");
 pClock.append(clock);
 const gridDaily=document.createElement("div");gridDaily.className="dayline-grid";pDaily.append(gridDaily);gridDaily.append(weather,news);if(calendar)gridDaily.append(calendar);if(market)gridDaily.append(market);
 const gridSafety=document.createElement("div");gridSafety.className="dayline-grid";pSafety.append(gridSafety);gridSafety.append(disaster);if(jalert)gridSafety.append(jalert);
 const gridWorld=document.createElement("div");gridWorld.className="dayline-grid";pWorld.append(gridWorld);
 if(lower){[...lower.children].forEach(el=>gridWorld.append(el));lower.remove();}
 const originalTimeline=clock.querySelector(".dayline-timeline");
 if(originalTimeline){
  const large=document.createElement("div");large.className="timeline-large";
  large.innerHTML='<div class="timeline-head"><span>24-HOUR TIMELINE</span><strong data-timeline-now>--:-- JST</strong></div><div class="timeline-rail"><div class="timeline-rail-fill"></div><div class="timeline-rail-dot"></div></div><div class="timeline-marks"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div><div class="timeline-summary"><div><div class="dayline-page-kicker">ELAPSED TODAY</div><strong data-elapsed>--%</strong></div><div><div class="dayline-page-kicker">REMAINING</div><strong data-remaining>--%</strong></div></div>';
  pTimeline.append(large);
  const note=document.createElement("p");note.className="dayline-note";note.textContent="時間軸は日本標準時（JST）を基準に自動更新されます。";pTimeline.append(note);
 }
 const settings=document.createElement("div");settings.className="settings-panel";pSettings.append(settings);
 const actions=document.createElement("div");actions.className="settings-actions";settings.append(actions);
 ["sound-enable","settings-button","notify-button"].forEach(id=>{const el=document.getElementById(id);if(el)actions.append(el);});
 const disasterSettings=document.getElementById("disaster-settings");if(disasterSettings)settings.append(disasterSettings);
 const schedule=gridWorld.querySelector(".schedule-card");if(schedule){const copy=schedule.cloneNode(true);copy.classList.add("world-schedule-copy");settings.append(copy);schedule.remove();wireScheduleCopy(copy);}
 const safetyNote=document.createElement("p");safetyNote.className="dayline-note";safetyNote.textContent="このページは情報確認を補助するもので、緊急速報の受信・配信を保証しません。";pSafety.append(safetyNote);
 const buttons={};
 navItems.forEach(([id,label])=>{
  const b=document.createElement("button");b.type="button";b.textContent=label;b.dataset.page=id;b.setAttribute("aria-label",label);b.addEventListener("click",()=>showPage(id));nav.append(b);buttons[id]=b;
 });
 header.after(nav);nav.after(pages);dashboard.id="dayline-original-dashboard";
 const footer=main.querySelector(".footer");if(footer)pages.after(footer);
 function showPage(id){
  if(!pageMap[id])return;
  Object.entries(pageMap).forEach(([key,page])=>{const active=key===id;page.classList.toggle("is-active",active);page.setAttribute("aria-hidden",String(!active));buttons[key].setAttribute("aria-current",active?"page":"false");});
  try{localStorage.setItem("dayline_active_page",id)}catch(e){}
  if(id==="settings"&&disasterSettings)disasterSettings.hidden=false;
  window.scrollTo({top:0,behavior:"instant"});
 }
 function wireScheduleCopy(copy){
  const input=copy.querySelector("#schedule-url"),save=copy.querySelector("#schedule-save"),load=copy.querySelector("#schedule-load"),result=copy.querySelector("#schedule-result");
  if(!input||!save||!load)return;
  input.id="schedule-url-settings";save.id="schedule-save-settings";load.id="schedule-load-settings";result.id="schedule-result-settings";
  input.value=localStorage.getItem("dayline_schedule_url")||"";
  save.addEventListener("click",()=>{const value=input.value.trim();if(value&&!value.startsWith("https://")){result.textContent="https:// で始まるURLを入力してください。";return;}localStorage.setItem("dayline_schedule_url",value);result.textContent=value?"URLを保存しました。":"登録URLを削除しました。";});
  load.addEventListener("click",async()=>{const url=input.value.trim();if(!url){result.textContent="先に公開ICS URLを登録してください。";return;}result.textContent="予定を取得中…";try{const response=await fetch(url,{cache:"no-store"});if(!response.ok)throw Error("HTTP");const raw=await response.text();if(!raw.includes("BEGIN:VCALENDAR"))throw Error("ICS");const events=raw.split("BEGIN:VEVENT").slice(1,6).map(block=>{const title=(block.match(/^SUMMARY(?:;[^:]*)?:(.*)$/mi)||[])[1]||"（タイトルなし）";const start=(block.match(/^DTSTART(?:;[^:]*)?:(.*)$/mi)||[])[1]||"";return start+" · "+title.replace(/\\n/g," ").replace(/\\,/g,",")});result.textContent=events.length?events.join(" ／ "):"予定が見つかりませんでした。";}catch(e){result.textContent="取得できません。公開ICS URLと配信元のCORS設定を確認してください。";}});
 }
 const settingButton=document.getElementById("settings-button");
 settingButton?.addEventListener("click",()=>{showPage("settings");if(disasterSettings)disasterSettings.hidden=false;});
 const pagesOrder=navItems.map(x=>x[0]);let touchX=0,touchY=0;
 pages.addEventListener("touchstart",e=>{touchX=e.changedTouches[0].clientX;touchY=e.changedTouches[0].clientY},{passive:true});
 pages.addEventListener("touchend",e=>{const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;if(Math.abs(dx)<80||Math.abs(dx)<Math.abs(dy)*1.3)return;const active=pagesOrder.findIndex(id=>pageMap[id].classList.contains("is-active"));const next=Math.max(0,Math.min(pagesOrder.length-1,active+(dx<0?1:-1)));showPage(pagesOrder[next]);},{passive:true});
 document.addEventListener("keydown",e=>{if(e.target.matches("input,textarea,select,button"))return;if(e.key!=="ArrowRight"&&e.key!=="ArrowLeft")return;const active=pagesOrder.findIndex(id=>pageMap[id].classList.contains("is-active"));const next=Math.max(0,Math.min(pagesOrder.length-1,active+(e.key==="ArrowRight"?1:-1)));showPage(pagesOrder[next]);});
 function updateTimeline(){
  const now=new Date(),parts=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Tokyo",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(now),get=k=>parts.find(p=>p.type===k)?.value||"00";
  const seconds=Number(get("hour"))*3600+Number(get("minute"))*60+Number(get("second")),pct=seconds/86400*100;
  const fill=pTimeline.querySelector(".timeline-rail-fill"),dot=pTimeline.querySelector(".timeline-rail-dot");
  if(fill)fill.style.width=pct+"%";if(dot)dot.style.left=pct+"%";
  const time=get("hour")+":"+get("minute")+":"+get("second")+" JST";
  pTimeline.querySelector("[data-timeline-now]").textContent=time;
  pTimeline.querySelector("[data-elapsed]").textContent=pct.toFixed(1)+"%";
  pTimeline.querySelector("[data-remaining]").textContent=(100-pct).toFixed(1)+"%";
 }
 updateTimeline();setInterval(updateTimeline,1000);
 let initial="clock";try{const saved=localStorage.getItem("dayline_active_page");if(pagesOrder.includes(saved))initial=saved;}catch(e){}
 showPage(initial);
})();