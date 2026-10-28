// ===== Chat and name moderation =====
// cleanWords(text): masks swear words and slurs with *** (also catches simple disguises like f*ck, sh1t, a$$).
// cleanName(name):  strips anything that could break the page (<, >, quotes...), shortens it, and filters it.
// Used for player names, room names and chat, both what you send and what you receive.
(function(){
 // whole-word matches (short words that also appear inside normal words, e.g. "ass" in "class")
 const WORD=['ass','asses','arse','fag','fags','tit','tits','titty','titties','cum','cums','cumming','hoe','hoes','rape','raped','raping','rapist',
  'nazi','nazis','kys','sex','sexy','porn','porno','penis','vagina','boob','boobs','dildo','jizz','anal','anus','spic','spics','chink','chinks',
  'gook','gooks','kike','kikes','coon','coons','wop','dyke','dykes','tranny','trannies','hitler','nig','nigs','negro','negroes','homo','homos',
  'milf','smut','thot','thots','pube','pubes','scrotum','testicle','testicles','skank','wtf','stfu','gtfo','lmfao','dick','dicks','cock','cocks','prick','pricks','pedo','pedos','paedo'];
 // matched anywhere in a word (no normal English words contain these)
 const PART=['fuck','fuk','fck','phuck','shit','sht','bitch','biatch','cunt','nigger','nigga','niggah','faggot','fagot','retard','whore','slut',
  'pussy','pussies','asshole','arsehole','bastard','motherfuck','dickhead','cocksuck','twat','wank','douche','jackass','dumbass',
  'bullshit','horny','orgasm','blowjob','handjob','rimjob','boner','clit','cumshot','dildo','shemale','molest','incest'];
 const SUB={a:'[a@4*]',e:'[e3]',i:'[i1!|l*]',o:'[o0*]',s:'[s$5z]',t:'[t7+]',g:'[g9]',b:'[b8]',l:'[l1|i]',u:'[uv*]',c:'[ck]',k:'[kc]'};
 const pat=w=>[...w].map(ch=>(SUB[ch]||ch.replace(/[^a-z0-9]/g,'\\$&'))+'+[._\\-]*').join('').replace(/\[\._\\-\]\*$/,'');
 const reWord=new RegExp('(^|[^a-z0-9])('+WORD.map(pat).join('|')+')(?=$|[^a-z0-9])','gi');
 const rePart=new RegExp('('+PART.map(pat).join('|')+')','gi');
 const mask=s=>s.replace(/[^\s]/g,'*');
 window.cleanWords=function(t){t=String(t==null?'':t);
  return t.replace(rePart,m=>mask(m)).replace(reWord,(m,pre,w)=>pre+mask(w))};
 window.cleanName=function(n,max){n=String(n==null?'':n).replace(/[\u0000-\u001f\u007f-\u009f<>&"'`\\]/g,'').replace(/\s+/g,' ').trim().slice(0,max||16);
  n=window.cleanWords(n);return n.replace(/\*/g,'').trim()?n:'Player'};
})();
