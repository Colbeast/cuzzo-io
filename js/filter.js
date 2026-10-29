// ===== Chat and name moderation =====
// hasBadWords(text): true if the text contains a swear word or slur, including disguised ones:
//   f*ck, sh1t, a$$, fuuuck, f.u.c.k, "f u c k", accented or look-alike letters (fück, Cyrillic "а"),
//   full-width letters, and invisible characters hidden inside words.
// cleanWords(text):  the text with any bad words masked as ***, or the text unchanged if it's clean.
// cleanName(name):   a safe player name: strips anything that could break the page (<, >, quotes...),
//                    shortens it, and turns any name with a bad word in it into "Player".
// Used everywhere text from players shows up: names, CrazyGames usernames, chat, room names and room codes.
// Chat and names with bad words are blocked before they're sent; anything that still arrives from someone
// else (a modified game) is masked or renamed on your screen.
(function(){
 // whole words only (these also appear inside normal words, e.g. "ass" in "class", "tit" in "title")
 const WORD=['ass','asses','arse','arses','azz','fag','fags','faggy','tit','tits','titty','titties','tiddies','cum','cums','cumming','hoe','hoes',
  'rape','raped','raping','rapes','rapist','rapists','nazi','nazis','kys','sex','sexy','porn','porno','penis','penises','vagina','vaginas','boob','boobs',
  'boobies','jizz','anal','anus','spic','spics','chink','chinks','gook','gooks','kike','kikes','coon','coons','wop','wops','dyke','dykes','tranny',
  'trannies','hitler','nig','nigs','=kkk','negro','negroes','homo','homos','milf','smut','thot','thots','pube','pubes','scrotum','testicle','testicles',
  'skank','skanks','wtf','stfu','gtfo','lmfao','dick','dicks','cock','cocks','prick','pricks','pedo','pedos','paedo','paedos','horny','wank','wanks',
  'wanker','wankers','wanking','retard','retards','retarded','tard','tards','piss','pissed','pissing','pisses','pisser','pecker','bollock','bollocks',
  'bellend','tosser','slag','slags','nude','nudes','nsfw','hentai','xxx','paki','pakis','jap','japs','dago','dagos','honky','honkies','squaw',
  'redskin','redskins','kaffir','gypo','gyppo','pikey','lesbo','lesbos','spaz','spastic','sperm','semen','dildos','vibrator',
  'chinaman','beaner','beaners','wetback','wetbacks','towelhead','raghead','incel','simp','incest','incestuous','kunt','kock','kocks','dik','diks'];
 // anywhere inside a word (no normal English words contain these)
 const PART=['fuck','=fuk','=fuc','=fck','phuck','fvck','shit','bitch','biatch','cunt','nigger','nigga','niggah','nigguh','niglet','nignog','faggot','fagot','whore',
  'slut','pussy','pussies','asshole','arsehole','asshat','asswipe','assclown','bastard','motherf','dickhead','cocksuck','twat','douche','jackass',
  'dumbass','bullshit','orgasm','blowjob','handjob','rimjob','boner','=clit','cumshot','dildo','shemale','molest','pedophil','paedophil','shlt','cnut',
  'onlyfans','zipperhead','jigaboo','porchmonkey','junglebunny'];
 // real words that contain a blocked word by accident
 const ALLOW=new Set(['assess','assesses','assessed','assessing','assessment','assessments','assessor','assessors','reassess','reassessment',
  'shiite','shiites','shiitake','shiitakes','shitake','shitakes','scunthorpe','woops','rapped','rapping','rappel','rappeled','kickee','fuchsia','fuchsias',
  'confucius','confucian','confucians','confucianism','confucianist','backlit','cocktail','cocktails','peacock','peacocks','hancock','hitchcock','dickens','dickinson','cockpit','cockpits',
  'cockroach','cockroaches','shuttlecock','scrapbook','therapist','therapists','grape','grapes','drape','drapes','scrape','scraped','raccoon','cocoon',
  'tycoon','analysis','analyst','analysts','analyze','analyzed','canal','canals','banal','pecan','pecans','spice','spices','spicy','sextet','sussex',
  'essex','middlesex','classic','classes','bass','glass','grass','mass','pass','compass','assassin','assassins','assassinate','embassy','ambassador']);
 // phrases (any spacing)
 const PHRASE=['k[i1!l]+l+\\s*(?:yo)?u?r?\\s*s[e3]lf','s[i1]eg\\s*h[e3][i1]l','h[e3][i1]l\\s*h[i1]tl[e3]r','wh[i1]te\\s*p[o0]w[e3]r'];
 // letters people swap in to dodge filters
 const SUB={a:'[a@4*]',e:'[e3*]',i:'[i1!|*]',o:'[o0*]',s:'[s$5z]',t:'[t7+]',g:'[g9]',b:'[b8]',l:'[l1|]',u:'[uv*]'};
 const pat=w=>{const lit=w[0]==='=';if(lit)w=w.slice(1);return[...w].map(ch=>((!lit&&SUB[ch])||ch.replace(/[^a-z0-9]/g,'\\$&'))+'+[._\\-]*').join('').replace(/\[\._\\-\]\*$/,'')};
 const W=WORD.map(pat).join('|'),P=PART.map(pat).join('|'),PH=PHRASE.join('|');
 const reWord=new RegExp('(^|[^a-z0-9])('+W+')(?=$|[^a-z0-9])','gi');
 const rePart=new RegExp('('+P+')','gi');
 const rePhrase=new RegExp('('+PH+')','gi');
 const P4=PART.filter(w=>w.replace('=','').length>=4).map(pat).join('|'),SUF='(?:s|es|y|ing|ed|er|ers|in)?';
 const isWord=new RegExp('^(?:'+W+')$','i'),hasPart4=new RegExp(P4,'i'),isPart=new RegExp('^(?:'+P+')'+SUF+'$','i'),isPart4=new RegExp('^(?:'+P4+')'+SUF+'$','i');
 // runs of 1-2 letter pieces split by spaces or dots, like "f u c k" or "sh it"
 const RC='a-z0-9@$!|*+';
 const reRun=new RegExp('(^|[^'+RC+'])((?:['+RC+']{1,2}[\\s._,~\'"`-]+)+['+RC+']{1,2})(?=$|[^'+RC+'])','gi');
 // invisible characters and look-alike letters from other alphabets
 const ZW=/[­͏؜ᅟᅠ឴឵᠋-᠎​-‏‪-‮⁠-⁤⁦-⁯ㅤ︀-️﻿ﾠ]/g;
 const HOMO={'а':'a','е':'e','ё':'e','о':'o','р':'p','с':'c','у':'y','х':'x','і':'i','ї':'i','ј':'j','ѕ':'s','к':'k','м':'m','т':'t','в':'b','н':'h',
  'ԁ':'d','ԛ':'q','ԝ':'w','ɡ':'g','α':'a','β':'b','ε':'e','η':'n','ι':'i','κ':'k','ν':'v','ο':'o','ρ':'p','τ':'t','υ':'u','χ':'x','ω':'w','ϲ':'c',
  'ı':'i','ł':'l','ø':'o','đ':'d','ß':'ss','æ':'ae','œ':'oe','€':'e','£':'l','¢':'c','¥':'y','§':'s','µ':'u','×':'x'};
 const mask=s=>s.replace(/[^\s]/g,'*');
 function norm(t){t=String(t==null?'':t).replace(ZW,'');try{t=t.normalize('NFKD')}catch(e){}t=t.replace(/[̀-ͯ]/g,'');
  let o='';for(const ch of t){const l=ch.toLowerCase();o+=HOMO[l]!==undefined?HOMO[l]:ch}return o}
 function scan(t){const n=norm(t);let bad=false;const keep=[];
  let s=n.replace(/[a-z0-9]+/gi,(w,i)=>{if(ALLOW.has(w.toLowerCase())){keep.push([i,w]);return '\u0001'.repeat(w.length)}return w});
  s=s.replace(rePhrase,m=>{bad=true;return mask(m)});
  s=s.replace(reRun,(m,pre,run)=>{const pcs=run.split(/[\s._,~'"`-]+/).filter(Boolean),sq=pcs.join('');if(ALLOW.has(sq.toLowerCase()))return m;
   if(pcs.length>=3?(sq.length>=3&&(isWord.test(sq)||isPart.test(sq)||hasPart4.test(sq))):hasPart4.test(sq)){bad=true;return pre+mask(run)}return m});
  // a bad word split in two, like "bi tch" or "fu ck" (only when the halves spell it exactly, so "his hit" is fine)
  {const toks=[];s.replace(/[a-z0-9@$!|*+]+/gi,(w,i)=>{toks.push([i,w]);return w});
   for(let k=0;k+1<toks.length;k++){const[a,w1]=toks[k],[b,w2]=toks[k+1];if(w1.length>5||w2.length>5)continue;const gap=s.slice(a+w1.length,b);
    if(!/^[\s._,~'"`-]+$/.test(gap))continue;const sq=w1+w2;if(ALLOW.has(sq.toLowerCase()))continue;
    if(isPart4.test(sq)){bad=true;s=s.slice(0,a)+mask(s.slice(a,b+w2.length))+s.slice(b+w2.length)}}}
  s=s.replace(rePart,m=>{bad=true;return mask(m)});
  s=s.replace(reWord,(m,pre,w)=>{bad=true;return pre+mask(w)});
  for(const[i,w]of keep)s=s.slice(0,i)+w+s.slice(i+w.length);
  return{bad,out:s}}
 window.hasBadWords=t=>scan(t).bad;
 window.cleanWords=function(t){const r=scan(t);return r.bad?r.out:String(t==null?'':t)};
 window.cleanName=function(n,max){n=norm(n).replace(/[\u0000-\u001f\u007f-\u009f<>&"'`\\]/g,'').replace(/\s+/g,' ').trim().slice(0,max||16);
  return n&&!scan(n).bad?n:'Player'};
})();
