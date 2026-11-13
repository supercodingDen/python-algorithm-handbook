'use strict';
(() => {
const DATA = window.HANDBOOK_DATA || {en: [], zh: []};
const META = window.HANDBOOK_META || {};
const CHAPTERS = ['数组','链表','哈希表','字符串','双指针法','栈与队列','二叉树','回溯算法','贪心算法','动态规划','单调栈','图论'];
const EN_CHAPTERS = ['Arrays','Linked lists','Hash tables','Strings','Two pointers','Stacks & queues','Binary trees','Backtracking','Greedy algorithms','Dynamic programming','Monotonic stacks','Graphs'];
const TEXT = {
 en: {title:'Python Algorithm Handbook',brand:'Python Algorithms',brandSub:'THE HANDBOOK',note:'Step by step · Python 3',skip:'Skip to tutorial',directory:'Tutorial directory',openMenu:'Open tutorial directory',search:'Find a tutorial',placeholder:'Problem, number, or technique',expand:'Expand all',collapse:'Collapse all',empty:'No tutorials found. Try a problem number or topic.',lessons:'tutorials',topics:'topics',matches:'matching entries',sidebar:'Understand the idea. Then write it yourself.<br><span>Original tutorials · Python 3</span>',toc:'On this page',reading:'Understand why.<br>Then practice how.',example:'Work through an example',input:'Input',output:'Output',walkthrough:'Worked example',code:'Python solution',copy:'Copy code',copied:'Code copied',copyFailed:'Could not copy. Select the code and copy it manually.',complexity:'Complexity analysis',time:'Time complexity',space:'Auxiliary space',pitfalls:'Common pitfalls',pitfallsShort:'Pitfalls',previous:'Previous',next:'Next',pagination:'Previous and next tutorials',footer:'Independently written explanations, examples, and Python implementations. Topic coverage is inspired by the public <a href="https://github.com/youngyangyang04/leetcode-master" target="_blank" rel="noopener noreferrer">Code Caprice learning directory</a>. Visit <a href="https://programmercarl.com/algo/" target="_blank" rel="noopener noreferrer">the original author’s website</a> for the original articles. Problem requirements are defined by their respective practice platforms.',error:'Tutorials could not be loaded',retry:'Please reload the page to try again.',kind:{'题解':'Solution','理论':'Concept','总结':'Review','复盘':'Review'}},
 zh: {title:'Python 算法学习手册',brand:'Python 算法',brandSub:'学习手册',note:'中文讲解 · Python 3',skip:'跳到教程',directory:'教程目录',openMenu:'打开专题目录',search:'查找教程',placeholder:'题目、编号或算法',expand:'展开目录',collapse:'收起目录',empty:'没有找到教程。试试题目编号或专题名称。',lessons:'篇',topics:'个专题',matches:'条匹配目录',sidebar:'按专题读懂思路，再自己写一遍。<br><span>原创教程 · Python 3</span>',toc:'本页内容',reading:'先理解为什么，<br>再记住怎么写。',example:'跟着示例走一遍',input:'输入',output:'输出',walkthrough:'示例推演',code:'Python 实现',copy:'复制代码',copied:'代码已复制',copyFailed:'复制未成功，请选中代码手动复制',complexity:'复杂度分析',time:'时间复杂度',space:'额外空间',pitfalls:'容易出错的地方',pitfallsShort:'易错点',previous:'上一篇',next:'下一篇',pagination:'前后教程',footer:'本手册的讲解、示例与 Python 实现独立编写。专题与题目范围参考<a href="https://github.com/youngyangyang04/leetcode-master" target="_blank" rel="noopener noreferrer">代码随想录公开目录</a>，原站文章请前往<a href="https://programmercarl.com/algo/" target="_blank" rel="noopener noreferrer">作者网站</a>阅读。题目要求以对应练习平台为准。',error:'教程暂时无法加载',retry:'请刷新页面重试。',kind:{'题解':'题解','理论':'理论','总结':'总结','复盘':'复盘'}}
};
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// English is always the initial language, independent of browser settings or previous visits.
let language = 'en', active = null, query = '', expanded = new Set(), allExpanded = false;
let grouped = [], flat = [], byId = new Map(), toastTimer;
const t = () => TEXT[language];
const chapterName = chapter => language === 'en' ? EN_CHAPTERS[CHAPTERS.indexOf(chapter)] || chapter : chapter;
const kindName = kind => t().kind[kind] || kind;
const prettyTitle = lesson => lesson.title.replace(/^\d+[.．、]\s*/, '');
function indexLessons() {
 const lessons = DATA[language] || [];
 grouped = CHAPTERS.map(name=>({name,items:lessons.filter(x=>x.chapter===name)})).filter(c=>c.items.length);
 flat = grouped.flatMap(c=>c.items);
 byId = new Map(flat.map(x=>[x.id,x]));
}
function localizeChrome() {
 document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
 for (const [id,key] of Object.entries({'skip':'skip','brand-title':'brand','brand-sub':'brandSub','top-note':'note','search-label':'search','toc-label':'toc'})) $(id).textContent=t()[key];
 $('search').placeholder=t().placeholder;
 $('sidebar').setAttribute('aria-label',t().directory);
 $('menu').setAttribute('aria-label',t().openMenu);
 $('page-nav').setAttribute('aria-label',t().toc);
 $('pagination').setAttribute('aria-label',t().pagination);
 $('sidebar-footer').innerHTML=t().sidebar;
 $('reading-note').innerHTML=t().reading;
 $('page-footer').innerHTML=t().footer;
 $('expand').textContent=allExpanded?t().collapse:t().expand;
 $('language').textContent=language==='en'?'中文':'English';
 $('language').lang=language==='en'?'zh-CN':'en';
 $('language').setAttribute('aria-label',language==='en'?'Switch to Chinese':'切换到英文');
}
function highlight(code) {
 const pattern=/(#[^\n]*|"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:def|class|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|import|from|as|try|except|raise|break|continue|pass|yield|with|lambda|nonlocal|global|assert|del)\b|\b\d+(?:\.\d+)?\b)/g;
 let result='',offset=0;
 for(const m of code.matchAll(pattern)){
  result+=esc(code.slice(offset,m.index));const token=m[0];
  const cls=token.startsWith('#')?'comment':/^['"]/.test(token)?'string':/^\d/.test(token)?'number':'key';
  result+=`<span class="tok-${cls}">${esc(token)}</span>`;offset=m.index+token.length;
 }
 return result+esc(code.slice(offset));
}
function drawCatalog() {
 let count=0;
 $('catalog').innerHTML=grouped.map((chapter,index)=>{
  const items=chapter.items.filter(x=>!query||(`${x.title} ${x.problem} ${x.summary} ${chapterName(x.chapter)}`).toLowerCase().includes(query));
  if(!items.length)return '';count+=items.length;
  const open=Boolean(query)||expanded.has(chapter.name);
  return `<section class="chapter"><button type="button" class="chapter-title" data-chapter="${esc(chapter.name)}" aria-expanded="${open}"><span class="chevron" aria-hidden="true">▸</span><span class="ordinal">${String(index+1).padStart(2,'0')}</span><span class="chapter-name">${esc(chapterName(chapter.name))}</span><span class="chapter-count">${items.length}</span></button><div class="chapter-items" ${open?'':'hidden'}>${items.map(x=>`<a class="lesson-link ${active?.id===x.id?'active':''}" ${active?.id===x.id?'aria-current="page"':''} href="#${encodeURIComponent(x.id)}">${x.problem?`<span class="lesson-number">${esc(x.problem)}</span>`:''}${esc(prettyTitle(x))}</a>`).join('')}</div></section>`;
 }).join('')||`<p class="empty">${t().empty}</p>`;
 $('count').textContent=query?`${count} ${t().matches}`:`${META.originalCount||flat.length} ${t().lessons} · ${grouped.length} ${t().topics}`;
}
function drawLesson(lesson, scroll = true) {
 active=lesson;expanded.add(lesson.chapter);
 document.title=`${lesson.title} · ${t().title}`;
 $('breadcrumb').innerHTML=`${esc(t().brand)} <span>/</span> ${esc(chapterName(lesson.chapter))} <span>/</span> ${esc(kindName(lesson.kind))}`;
 const sections=lesson.sections.map((s,i)=>({id:`section-${i}`,heading:s.heading,html:`<section aria-labelledby="section-${i}"><h2 id="section-${i}">${esc(s.heading)}</h2>${(s.paragraphs||[]).map(p=>`<p>${esc(p)}</p>`).join('')}${s.bullets?.length?`<ul>${s.bullets.map(b=>`<li>${esc(b)}</li>`).join('')}</ul>`:''}</section>`}));
 const example=lesson.example?`<section><h2 id="example">${t().example}</h2><div class="example"><div class="example-line"><strong>${t().input}</strong><code>${esc(lesson.example.input)}</code></div><div class="example-line"><strong>${t().output}</strong><code>${esc(lesson.example.output)}</code></div>${lesson.example.walkthrough?.length?`<ol class="walkthrough">${lesson.example.walkthrough.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>`:''}</div></section>`:'';
 const code=lesson.code?`<section><h2 id="python-code">${t().code}</h2><div class="code-block"><div class="code-toolbar"><span>Python 3</span><button type="button" id="copy" class="copy">${t().copy}</button></div><pre><code>${highlight(lesson.code)}</code></pre></div></section>`:'';
 const complexity=`<section><h2 id="complexity">${t().complexity}</h2><div class="complexity"><div><strong>${t().time}</strong><p>${esc(lesson.time)}</p></div><div><strong>${t().space}</strong><p>${esc(lesson.space)}</p></div></div></section>`;
 const pitfalls=lesson.pitfalls?.length?`<section class="pitfalls"><h2 id="pitfalls">${t().pitfalls}</h2><ul>${lesson.pitfalls.map(p=>`<li>${esc(p)}</li>`).join('')}</ul></section>`:'';
 $('article').innerHTML=`<div class="article-kicker">${esc(chapterName(lesson.chapter))}${lesson.problem?` · ${esc(lesson.problem)}`:''}<span class="kind">${esc(kindName(lesson.kind))}</span></div><h1>${esc(prettyTitle(lesson))}</h1><p class="lead">${esc(lesson.summary)}</p>${sections.map(s=>s.html).join('')}${example}${code}${complexity}${pitfalls}`;
 const toc=[...sections.map(s=>[s.id,s.heading]),...(lesson.example?[['example',t().walkthrough]]:[]),...(lesson.code?[['python-code',t().code]]:[]),['complexity',t().complexity],...(lesson.pitfalls?.length?[['pitfalls',t().pitfallsShort]]:[])];
 $('toc').innerHTML=toc.map(([id,title])=>`<a href="#${encodeURIComponent(lesson.id)}" data-scroll="${id}">${esc(title)}</a>`).join('');
 const index=flat.findIndex(x=>x.id===lesson.id),prev=flat[index-1],next=flat[index+1];
 $('pagination').innerHTML=(prev?`<a href="#${encodeURIComponent(prev.id)}"><small>${t().previous} · ${esc(chapterName(prev.chapter))}</small>${esc(prettyTitle(prev))}</a>`:'<span></span>')+(next?`<a href="#${encodeURIComponent(next.id)}"><small>${t().next} · ${esc(chapterName(next.chapter))}</small>${esc(prettyTitle(next))}</a>`:'<span></span>');
 drawCatalog();closeMenu();if(scroll)window.scrollTo(0,0);
 if($('copy'))$('copy').addEventListener('click',copyCode);
}
function route(force=false) {
 let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{id='';}
 const lesson=byId.get(id)||flat.find(x=>x.problem==='704')||flat[0];
 if(!lesson){$('article').innerHTML=`<h1>${t().error}</h1><p>${t().retry}</p>`;return;}
 if(force||active?.id!==lesson.id)drawLesson(lesson);
}
function toast(text){clearTimeout(toastTimer);$('toast').textContent=text;$('toast').classList.add('show');toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2300);}
async function copyCode(){let copied=false;try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(active.code);copied=true;}}catch{}if(!copied){const area=document.createElement('textarea');area.value=active.code;area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();try{copied=document.execCommand('copy');}catch{}area.remove();}toast(copied?t().copied:t().copyFailed);}
function closeMenu(){document.body.classList.remove('nav-open');$('overlay').hidden=true;$('menu').setAttribute('aria-expanded','false');}
$('language').addEventListener('click',()=>{
 const id=active?.id;language=language==='en'?'zh':'en';query='';$('search').value='';
 indexLessons();localizeChrome();const lesson=byId.get(id);if(lesson)drawLesson(lesson,false);else route(true);
});
$('menu').addEventListener('click',()=>{const open=document.body.classList.toggle('nav-open');$('overlay').hidden=!open;$('menu').setAttribute('aria-expanded',String(open));});
$('overlay').addEventListener('click',closeMenu);
$('search').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();drawCatalog();});
$('catalog').addEventListener('click',e=>{const b=e.target.closest('button[data-chapter]');if(b){const name=b.dataset.chapter;expanded.has(name)?expanded.delete(name):expanded.add(name);drawCatalog();}if(e.target.closest('a.lesson-link'))closeMenu();});
$('expand').addEventListener('click',()=>{allExpanded=!allExpanded;expanded=allExpanded?new Set(CHAPTERS):new Set(active?[active.chapter]:[]);$('expand').textContent=allExpanded?t().collapse:t().expand;drawCatalog();});
$('toc').addEventListener('click',e=>{const link=e.target.closest('[data-scroll]');if(link){e.preventDefault();document.getElementById(link.dataset.scroll)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
window.addEventListener('hashchange',()=>route());indexLessons();localizeChrome();route();
})();
