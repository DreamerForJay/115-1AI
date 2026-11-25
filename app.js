'use strict';

const scenes = [
  {id:'country', title:'城郊初見', zone:'郊外', x:34100, y:780,
    copy:'畫卷右端沒有高樓，也還聽不見街市的喧鬧。疏疏落落的樹、低矮的屋舍和小徑，帶我們從汴京城外慢慢出發。',
    clue:'找找樹叢後的屋頂，它們和後段密集的屋頂有什麼不同？', alt:'樹林和小徑間的城郊低矮屋舍'},
  {id:'travelers', title:'小路行旅', zone:'郊外', x:31500, y:1170,
    copy:'路上開始有人和牲口經過。大樹、坡地與彎曲的小路，把零散的人影串在一起，也讓畫面從安靜的城郊逐漸熱鬧起來。',
    clue:'沿著小路找人物。有人徒步，也有人與牲口同行。', alt:'小路上經過樹叢和坡地的行旅'},
  {id:'river', title:'汴河船隊', zone:'汴河', x:24150, y:950,
    copy:'視線移到汴河，會看見大小不一的船停靠或行進。這些船讓我們看懂一件事，對當時的城市而言，河道也是一條運貨的大路。',
    clue:'比較船身的大小，再找找哪些船貼著岸、哪些在河中央。', alt:'汴河上大小不一的船隻與沿岸屋舍'},
  {id:'bridge', title:'虹橋過船', zone:'汴河', x:19440, y:450,
    copy:'虹橋是水路和陸路交會的地方。橋上有人過橋與做買賣，橋下一艘漕船準備穿過橋孔，船工正放倒桅杆，岸邊和橋上的人紛紛望向船隻。',
    clue:'先看拱橋，再找準備穿過橋孔的船。哪些人正在圍觀？', alt:'拱形虹橋、橋面行人和準備過橋的漕船'},
  {id:'gate', title:'穿過城門', zone:'城內', x:6950, y:640,
    copy:'高高的門樓在密集屋舍間特別醒目。北京故宮博物院將它辨識為東角子門。順著城牆和門洞的方向，可以繼續往更密集的街市看。',
    clue:'看看城門附近的車馬和行人，畫家怎麼讓你感覺門樓很高？', alt:'高大的城門樓、城牆與旁邊的人群'},
  {id:'market', title:'市井百業', zone:'城內', x:4850, y:1030,
    copy:'店面、棚攤和行人把街道填得滿滿的。大店和小攤挨得很近，路上還有車馬和各行各業的人。再放大一點，就能看見忙碌和悠閒的身影同時出現。',
    clue:'找找有門面的店與臨街棚攤，想像今天哪一種街景最像這裡。', alt:'街市上密集的屋舍、店鋪與來往的行人'}
];

const questions = [
  {q:'一開始要從畫卷的哪一側展開？', options:['從左側的街市開始','從右側的城郊開始','從中間的虹橋開始'], correct:1, why:'手卷通常從右向左逐段打開。這一卷也從城郊出發，經過汴河，再進入街市。'},
  {q:'虹橋下，船工為什麼要放倒桅杆？', options:['為了穿過橋孔','為了讓船停在岸邊','為了方便橋上販售貨物'], correct:0, why:'漕船正在穿過虹橋。放倒桅杆，才有足夠空間通過橋孔。'},
  {q:'哪一組細節，最能看出城內街市的日常？', options:['空曠河面和停泊船隻','樹林、小徑和低矮屋舍','沿街店鋪、棚攤和往來車馬'], correct:2, why:'沿街的大小店鋪與來往人物、車馬，共同描繪了熱鬧的汴京市區。'}
];

const $ = id => document.getElementById(id);
const viewport = $('viewport');
const track = $('track');
const range = $('pan');
const mini = $('mini-map');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const zooms = [.76, 1, 1.25, 1.55, 1.9];
let zoom = 1, active = 0, rendered = false, frame = 0;
const maxScroll = () => Math.max(0, viewport.scrollWidth - viewport.clientWidth);
const number = index => String(index + 1).padStart(2,'0');
function positionMap(){
  const w = viewport.scrollWidth;
  if (!w) return;
  const max = maxScroll(), x = Math.max(0, Math.min(max,viewport.scrollLeft));
  mini.style.setProperty('--map-left', x / w * 100 + '%');
  mini.style.setProperty('--map-width', viewport.clientWidth / w * 100 + '%');
  range.value = max ? Math.round(x / max * 1000) : 0;
  range.setAttribute('aria-valuetext', '從右端出發，已移動全卷約 ' + (max ? Math.round((1 - x / max) * 100) : 0) + '%');
}
function centerAt(index, smooth = false){
  const x = scenes[index].x / 38414 * track.offsetWidth;
  viewport.scrollTo({left:x - viewport.clientWidth / 2, behavior:smooth && !motion.matches ? 'smooth':'auto'});
  positionMap();
}
function setZoom(index){
  const next = Math.max(0,Math.min(zooms.length - 1,index));
  if (next === zoom) return;
  const center = (viewport.scrollLeft + viewport.clientWidth / 2) / track.offsetWidth;
  zoom = next;
  track.style.setProperty('--magnification', zooms[zoom]);
  viewport.scrollLeft = center * track.offsetWidth - viewport.clientWidth / 2;
  updateZoom();
  positionMap();
}
function updateZoom(){
  $('zoom-label').textContent = Math.round(zooms[zoom] * 100) + '%';
  $('zoom-out').disabled = zoom === 0;
  $('zoom-in').disabled = zoom === zooms.length - 1;
}
function choose(index, smooth = true){
  if (index < 0 || index >= scenes.length) return;
  const scene = scenes[index];
  active = index;
  for (const button of document.querySelectorAll('[data-stop]')){
    button.setAttribute('aria-pressed', Number(button.dataset.stop) === index ? 'true':'false');
  }
  $('detail-label').textContent = '第 ' + number(index) + ' 站 / ' + scene.zone;
  $('detail-title').textContent = scene.title;
  $('detail-copy').textContent = scene.copy;
  $('detail-clue').textContent = scene.clue;
  $('detail-img').src = './assets/' + scene.id + '.webp';
  $('detail-img').alt = scene.alt;
  $('detail-caption').textContent = '原畫局部 · ' + scene.title;
  if (rendered) $('scene-status').textContent = '第 ' + (index + 1) + ' 站，' + scene.title;
  $('prev').disabled = index === 0;
  $('next').disabled = index === scenes.length - 1;
  $('detail').hidden = false;
  centerAt(index,smooth);
  rendered = true;
}
for (const [index,s] of scenes.entries()){
  for (const [target, kind] of [[$('stops'),'stop'],[track,'pin']]){
    const b = document.createElement('button');
    b.type = 'button';
    b.className = kind;
    b.dataset.stop = index;
    b.setAttribute('aria-label','第 ' + number(index) + ' 站，' + s.title);
    if (kind === 'pin'){
      b.style.left = s.x / 38414 * 100 + '%';
      b.style.top = s.y / 1800 * 100 + '%';
      b.textContent = number(index);
    }else{
      const n = document.createElement('b');
      n.textContent = number(index);
      b.append(n, ' ' + s.title);
    }
    b.addEventListener('click', () => choose(index));
    target.append(b);
  }
}
$('zoom-out').addEventListener('click',()=>setZoom(zoom-1));
$('zoom-in').addEventListener('click',()=>setZoom(zoom+1));
$('zoom-reset').addEventListener('click',()=>{setZoom(1); centerAt(active);});
$('prev').addEventListener('click',()=>choose(active-1));
$('next').addEventListener('click',()=>choose(active+1));
viewport.addEventListener('scroll', () => {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(positionMap);
},{passive:true});
range.addEventListener('input', () => {
  viewport.scrollLeft = Number(range.value) / 1000 * maxScroll();
  positionMap();
});
viewport.addEventListener('keydown', e => {
  if (e.target !== viewport) return;
  if (['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){
    e.preventDefault();
    if (e.key === 'Home') viewport.scrollLeft = maxScroll();
    else if (e.key === 'End') viewport.scrollLeft = 0;
    else viewport.scrollLeft += (e.key === 'ArrowLeft' ? -1 : 1) * Math.max(65, viewport.clientWidth / 5);
  }
});
let drag = null;
viewport.addEventListener('pointerdown',e=>{
  if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('button') || e.target === viewport) return;
  drag = {id:e.pointerId, x:e.clientX, start:viewport.scrollLeft, moved:false};
});
viewport.addEventListener('pointermove',e=>{
  if (!drag || e.pointerId !== drag.id) return;
  const dx = e.clientX - drag.x;
  if (!drag.moved && Math.abs(dx) < 4) return;
  if (!drag.moved){
    viewport.setPointerCapture(e.pointerId);
    viewport.classList.add('grabbing');
    drag.moved = true;
  }
  viewport.scrollLeft = drag.start - dx;
});
function endDrag(e){
  if (drag && e.pointerId === drag.id){
    drag = null;
    viewport.classList.remove('grabbing');
  }
}
viewport.addEventListener('lostpointercapture',endDrag);
window.addEventListener('pointerup',endDrag);
window.addEventListener('pointercancel',endDrag);
document.querySelectorAll('[data-scene]').forEach(link => link.addEventListener('click',()=>{
  choose(scenes.findIndex(scene=>scene.id===link.dataset.scene),false);
}));
window.addEventListener('resize',positionMap);
updateZoom();
choose(0,false);

let questionIndex = 0, score = 0, answered = false;
const progress = $('q-progress'), tally = $('q-score'), title = $('q-title'),
  options = $('q-options'), feedback = $('q-feedback'), advance = $('q-next');
function showQuestion(){
  answered = false;
  const item = questions[questionIndex];
  progress.textContent = '第 ' + (questionIndex + 1) + ' / ' + questions.length + ' 題';
  tally.textContent = '答對 ' + score + ' 題';
  title.textContent = item.q;
  feedback.hidden = true;
  advance.hidden = true;
  options.replaceChildren();
  item.options.forEach((value,index)=>{
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer';
    button.textContent = String.fromCharCode(65+index) + '　' + value;
    button.addEventListener('click',()=>answer(index));
    options.append(button);
  });
  title.focus({preventScroll:true});
}
function answer(selected){
  if (answered) return;
  answered = true;
  const item = questions[questionIndex], correct = selected === item.correct;
  if (correct) score++;
  tally.textContent = '答對 ' + score + ' 題';
  Array.from(options.children).forEach((button,index)=>{
    button.disabled = true;
    if (index === item.correct) button.classList.add('correct');
    else if (index === selected) button.classList.add('wrong');
  });
  feedback.hidden = false;
  feedback.textContent = (correct?'答對了！':'這題的正確答案是「' + item.options[item.correct] + '」。') + ' ' + item.why;
  advance.textContent = questionIndex === questions.length-1 ? '看結果 →':'下一題 →';
  advance.hidden = false;
  advance.focus({preventScroll:true});
}
function start(){
  questionIndex = 0;
  score = 0;
  showQuestion();
}
function finish(){
  progress.textContent = '完成展卷';
  tally.textContent = '';
  title.textContent = '你答對了 ' + score + ' / ' + questions.length + ' 題！';
  feedback.hidden = false;
  feedback.textContent = score === questions.length ? '下次展卷時，試著找一個本站沒標記的角色，觀察他正在做什麼。' : '不妨再逛一次郊外、虹橋與街市，看看哪個細節剛才被你略過。';
  advance.hidden = true;
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.className = 'btn primary';
  retry.textContent = '再試一次 ↻';
  retry.addEventListener('click',start);
  options.replaceChildren(retry);
  title.focus({preventScroll:true});
}
$('q-start').addEventListener('click',start);
advance.addEventListener('click',()=>{
  if (!answered) return;
  questionIndex++;
  if (questionIndex < questions.length) showQuestion();
  else finish();
});
