const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
const brl=n=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n).replace(/\u00a0/g,' ');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const st={g(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},s(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}};
const IMG={promo:"assets/img/banner-promocional_v2.webp",p1:"assets/img/produto-01-isqueiro-obsidian.webp",p2:"assets/img/produto-02-cinzeiro-monolith.webp",p3:"assets/img/produto-03-triturador-orbit.webp",p4:"assets/img/produto-04-estojo-night-case.webp",p5:"assets/img/produto-05-piteira-aero.webp",p6:"assets/img/produto-07-bolsa-street-pouch.webp",p7:"assets/img/produto-08-kit-midnight-set.webp"};
const PH="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'%3E%3Crect width='4' height='3' fill='%231e1e21'/%3E%3C/svg%3E";
const P=(id,nome,cat,desc,preco,promo,estoque,o={})=>({id,nome,cat,desc,preco,promo,estoque,img:id,destaque:false,s1:false,s2:false,promoArea:false,ativo:true,...o});
const SEED=[
P('p1','Isqueiro Obsidian','Isqueiros','Metal preto fosco com detalhe laranja e acabamento resistente.',129.9,0,12,{s1:1,destaque:1}),
P('p2','Cinzeiro Monolith','Cinzeiros','Cerâmica preta com interior terracota e apoios nas bordas.',89.9,0,8,{s1:1}),
P('p3','Triturador Orbit','Trituradores','Alumínio grafite em quatro partes, com relevo geométrico na tampa.',119.9,99.9,3,{s1:1}),
P('p4','Estojo Night Case','Estojos','Estojo rígido texturizado com zíper laranja.',79.9,0,15,{s2:1}),
P('p5','Piteira Aero','Piteiras','Piteira em metal grafite, leve e fácil de limpar.',49.9,0,20,{s2:1,destaque:1}),
P('p6','Bolsa Street Pouch','Bolsas','Necessaire compacta em tecido resistente, com puxador laranja.',99.9,0,0,{s2:1}),
P('p7','Kit Midnight Set','Kits','Isqueiro, cinzeiro e estojo juntos em caixa para presente.',389.9,299.9,6,{promoArea:1,destaque:1})];
const BLANK={nome:'',cat:'',desc:'',preco:'',promo:'',estoque:10,img:'',destaque:false,s1:true,s2:false,promoArea:false,ativo:true};
let prods=st.g('tb_prods',null);if(!Array.isArray(prods))prods=SEED;
const sc=st.g('tb_cfg',{});let cfg={wa:'11980963126',ig:'sua_tabacaria',hor:'',end:'',senha:'admin123',fim:new Date(Date.now()+6048e5-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,16),...sc};if(!('fim' in sc))st.s('tb_cfg',cfg);
let cups=st.g('tb_cup',null);if(!Array.isArray(cups))cups=[{cod:'BEMVINDO10',tipo:'%',valor:10,min:0,ativo:true}];
let aplic=st.g('tb_ap','');
let cart=st.g('tb_cart',[]);if(!Array.isArray(cart))cart=[];
let q='',cat='',authed=false,edit=null,draft='',tt;
const pr=p=>p.promo>0&&p.promo<p.preco?p.promo:p.preco;
const src=p=>IMG[p.img]||p.img||PH;
const sp=()=>st.s('tb_prods',prods);
function toast(m,e){const t=$('#toast');t.textContent=m;t.className='show'+(e?' err':'');clearTimeout(tt);tt=setTimeout(()=>t.className='',2800)}
function ask(txt,fn){$('#cft').textContent=txt;$('#cfy').onclick=()=>{$('#cf').close();fn()};$('#cf').showModal()}
const waNum=()=>{const d=String(cfg.wa).replace(/\D/g,'');return d.length<10?'':d.length<=11?'55'+d:d};

/* Vitrine */
const vis=p=>p.ativo&&(!cat||p.cat===cat)&&(!q||norm(`${p.nome} ${p.cat} ${p.desc}`).includes(norm(q)));
function card(p){const off=pr(p)<p.preco,out=p.estoque<1;return `<article class="card"><div class="ph"><img src="${src(p)}" alt="${esc(p.nome)}, categoria ${esc(p.cat)}" loading="lazy">${off?'<span class="tag">Oferta</span>':p.destaque?'<span class="tag t2">Destaque</span>':''}</div><div class="cb"><small>${esc(p.cat)}</small><h3>${esc(p.nome)}</h3><p>${esc(p.desc)}</p><div class="pp">${off?`<s>${brl(p.preco)}</s>`:''}<b>${brl(pr(p))}</b></div><div class="stk ${out?'no':p.estoque<=3?'lo':'ok'}">${out?'Esgotado':p.estoque<=3?`Últimas ${p.estoque} unidades`:'Em estoque'}</div><button class="btn" data-add="${p.id}" ${out?'disabled':''}>${out?'Indisponível':'Adicionar ao carrinho'}</button></div></article>`}
function promo(p){const off=pr(p)<p.preco,out=p.estoque<1,pc=off?Math.round((1-pr(p)/p.preco)*100):0;
$('#promo').innerHTML=`<div class="pb2"><img class="pi" src="${src(p)}" alt="${esc(p.nome)}"><div class="pt"><span class="tag">Oferta</span><h2>${esc(p.nome)}</h2><p>${esc(p.desc)}</p></div><div class="pr">${off?`<s>De ${brl(p.preco)}</s>`:''}<span class="big">${brl(pr(p))}</span>${pc?`<span class="tag">Economize ${pc}%</span>`:''}<div id="cd" class="cd" role="timer" aria-label="Tempo restante da oferta"></div><button class="btn" data-add="${p.id}" ${out?'disabled':''}>${out?'Indisponível':'Adicionar ao carrinho'}</button></div></div>`;tick()}
function tick(){const e=$('#cd');if(!e)return;const t=new Date(cfg.fim).getTime()-Date.now();if(!cfg.fim||isNaN(t)){e.hidden=true;return}e.hidden=false;if(t<=0){e.textContent='Oferta encerrada';return}
e.innerHTML=[[Math.floor(t/864e5),'dias'],[Math.floor(t%864e5/36e5),'h'],[Math.floor(t%36e5/6e4),'min'],[Math.floor(t%6e4/1e3),'s']].map(([v,l])=>`<span><b>${String(v).padStart(2,'0')}</b>${l}</span>`).join('')}
let hi=0;function hs(n){const im=$$('.hs>img'),ds=$$('.dots button');hi=(n+im.length)%im.length;im.forEach((x,i)=>x.classList.toggle('on',i===hi));ds.forEach((x,i)=>x.classList.toggle('on',i===hi))}
function shop(){const L=prods.filter(vis),on=prods.some(p=>p.ativo),pm=L.find(p=>p.promoArea);let n=0;
[['1','s1'],['2','s2']].forEach(([i,k])=>{const l=L.filter(p=>p[k]);n+=l.length;$('#g'+i).innerHTML=l.map(card).join('');$('#s'+i).hidden=!l.length});
$('#promo').hidden=!pm;if(pm){n++;promo(pm)}
const e=$('#empty');e.hidden=n>0;
e.innerHTML=!on?`<div class="em"><h2>Catálogo vazio</h2><p>Nenhum produto ativo. Cadastre itens na <a href="#admin">área administrativa</a>.</p></div>`:`<div class="em"><h2>Nenhum resultado</h2><p>Não encontramos nada para ${q?`“${esc(q)}”`:'esse filtro'}. Tente outro termo ou categoria.</p><button class="btn" data-clear>Limpar pesquisa</button></div>`}
function skel(){$('#g1').innerHTML=$('#g2').innerHTML='<div class="sk"></div>'.repeat(4)}
function cats(){const c=[...new Set(prods.filter(p=>p.ativo).map(p=>p.cat))].sort();if(cat&&!c.includes(cat))cat='';$('#cat').innerHTML='<option value="">Todas as categorias</option>'+c.map(x=>`<option ${x===cat?'selected':''}>${esc(x)}</option>`).join('')}
function contact(){const ig=String(cfg.ig||''),iu=/^https?:/.test(ig)?ig:'https://instagram.com/'+ig.replace(/^@/,''),n=waNum();
$('#contato').innerHTML=`<h2>Contato</h2><p class="sub">Tire dúvidas, consulte disponibilidade ou fale direto com a loja.</p><div class="row" style="margin-top:20px">${n?`<a class="btn" target="_blank" rel="noopener" href="https://wa.me/${n}?text=${encodeURIComponent('Olá! Vim pelo catálogo online.')}">Falar no WhatsApp</a>`:'<span class="err">WhatsApp ainda não configurado.</span>'}${ig?`<a class="btn g" target="_blank" rel="noopener" href="${esc(iu)}">Instagram</a>`:''}</div>${cfg.hor?`<p class="sub">Horário: ${esc(cfg.hor)}</p>`:''}${cfg.end?`<p class="sub">Endereço: ${esc(cfg.end)}</p>`:''}`}

/* Carrinho */
const lines=()=>cart.map(c=>{const p=prods.find(x=>x.id===c.id&&x.ativo);return p?{p,q:Math.min(c.q,p.estoque),u:pr(p)}:null}).filter(l=>l&&l.q>0);
const sv=()=>{st.s('tb_cart',cart);cartUI()};
function add(id,b){const p=prods.find(x=>x.id===id);if(!p||p.estoque<1)return toast('Produto indisponível.',1);const c=cart.find(x=>x.id===id);
if(c){if(c.q>=p.estoque)return toast('Você já adicionou todo o estoque disponível.',1);c.q++}else cart.push({id,q:1});
sv();toast(`${p.nome} adicionado ao carrinho`);if(b){b.textContent='Adicionado ✓';setTimeout(()=>b.textContent='Adicionar ao carrinho',900)}}
function chg(id,d){const c=cart.find(x=>x.id===id),p=prods.find(x=>x.id===id);if(!c||!p)return;const n=c.q+d;if(n<1)return rm(id);if(n>p.estoque)return toast('Limite de estoque atingido.',1);c.q=n;sv()}
function rm(id){cart=cart.filter(x=>x.id!==id);sv()}
const sub=()=>lines().reduce((a,l)=>a+l.u*l.q,0);
function disc(t){const c=cups.find(x=>x.ativo&&x.cod===aplic);if(!c||t<c.min)return{c:null,v:0};return{c,v:Math.round((c.tipo==='%'?t*c.valor/100:Math.min(c.valor,t))*100)/100}}
function msg(){const L=lines(),t=sub(),D=disc(t),v=id=>$(id).value.trim();
return 'Olá! Gostaria de solicitar:\n'+L.map(l=>`- ${l.p.nome} — ${l.q} un. × ${brl(l.u)} = ${brl(l.u*l.q)}`).join('\n')+(D.c?`\nSubtotal: ${brl(t)}\nCupom ${D.c.cod}: −${brl(D.v)}`:'')+`\nTotal estimado: ${brl(t-D.v)}\nNome: ${v('#nm')||'[nome]'}\n`+(v('#ad')?`Endereço/entrega: ${v('#ad')}\n`:'')+`Observações: ${v('#ob')||'—'}\nAguardo confirmação. Obrigado!`}
function cartUI(){const L=lines(),t=sub(),D=disc(t),ap=cups.find(x=>x.ativo&&x.cod===aplic);
$('#cn').textContent=L.reduce((a,l)=>a+l.q,0);
$('#cl').innerHTML=L.length?L.map(({p,q,u})=>`<li class="ci"><img src="${src(p)}" alt=""><div><b>${esc(p.nome)}</b><small>${brl(u)} por unidade</small><div class="q"><button data-m="${p.id}" aria-label="Diminuir quantidade de ${esc(p.nome)}">−</button><output aria-label="Quantidade">${q}</output><button data-p="${p.id}" aria-label="Aumentar quantidade de ${esc(p.nome)}">+</button><button class="rm" data-r="${p.id}">Remover</button></div></div><strong>${brl(u*q)}</strong></li>`).join(''):`<li class="em">Seu carrinho está vazio.<br><button class="btn" data-go="s1">Explorar produtos</button></li>`;
$('#ck').hidden=!L.length;$('#sb').textContent=brl(t);$('#dsr').hidden=!D.c;$('#dv').textContent='−'+brl(D.v);$('#tt').textContent=brl(t-D.v);
$('#cpi').innerHTML=D.c?`Cupom <b>${esc(D.c.cod)}</b> aplicado. <button class="cpi" data-cr="1">Remover cupom</button>`:ap?`O cupom ${esc(ap.cod)} exige pedido mínimo de ${brl(ap.min)}.`:'';
$('#pre').textContent=L.length?msg():''}

/* Admin */
function admin(){const a=$('#adm');
if(!authed){a.innerHTML=`<div class="sec"><button class="btn g" data-go="top">Voltar à loja</button><h2 style="margin-top:20px">Admin</h2><form id="lg" class="panel" style="max-width:420px"><label for="pw">Senha de acesso</label><input id="pw" type="password" autocomplete="off" required><div class="row" style="margin-top:14px"><button class="btn">Entrar</button></div><p class="note">Login de demonstração (senha inicial: <code>admin123</code>). Em produção, use autenticação real no servidor.</p></form></div>`;return}
const e=edit&&(edit==='new'?BLANK:prods.find(p=>p.id===edit)),n=v=>v===''||v==null?'':v,ck=v=>v?'checked':'';
a.innerHTML=`<div class="sec"><div class="row" style="justify-content:space-between"><h2>Admin</h2><div class="row"><button class="btn g" data-go="top">Voltar à loja</button><button class="btn g" data-out>Sair</button></div></div>
<p class="sub">Dados salvos só neste navegador (protótipo). Em produção: backend, armazenamento de imagens e autenticação reais.</p>
<div class="row" style="margin-top:20px"><button class="btn" data-ed="new">Novo produto</button><button class="btn g" data-reset>Restaurar dados de demonstração</button></div>
<div class="tw"><table><thead><tr><th>Imagem</th><th>Produto</th><th>Preço atual</th><th>Estoque</th><th>Status</th><th>Ações</th></tr></thead><tbody>${prods.map(p=>`<tr><td><img src="${src(p)}" alt="" width="44" height="44"></td><td>${esc(p.nome)}<br><small>${esc(p.cat)}</small></td><td>${brl(pr(p))}</td><td>${p.estoque}</td><td>${p.ativo?'Ativo':'Inativo'}</td><td><button class="btn g" data-ed="${p.id}">Editar</button> <button class="btn g" data-del="${p.id}">Excluir</button></td></tr>`).join('')||'<tr><td colspan="6">Nenhum produto cadastrado.</td></tr>'}</tbody></table></div>
${e?`<form id="pf" class="panel" novalidate><h3>${edit==='new'?'Novo produto':'Editar produto'}</h3><div class="fg">
<div><label for="fn">Nome *</label><input id="fn" name="nome" value="${esc(e.nome)}"></div>
<div><label for="fc">Categoria *</label><input id="fc" name="cat" list="cl2" value="${esc(e.cat)}"><datalist id="cl2">${[...new Set(prods.map(p=>p.cat))].map(c=>`<option value="${esc(c)}">`).join('')}</datalist></div>
<div><label for="fp">Preço (R$) *</label><input id="fp" name="preco" type="number" min="0" step="0.01" value="${n(e.preco)}"></div>
<div><label for="fo">Preço promocional (R$)</label><input id="fo" name="promo" type="number" min="0" step="0.01" value="${e.promo?e.promo:''}"></div>
<div><label for="fe">Estoque *</label><input id="fe" name="estoque" type="number" min="0" step="1" value="${n(e.estoque)}"></div>
<div><label for="ff">Imagem (envie um arquivo)</label><input id="ff" type="file" accept="image/*"></div></div>
<img id="pv" class="pv" src="${src({img:draft})}" alt="Prévia da imagem do produto">
<label for="fd">Descrição</label><textarea id="fd" name="desc" rows="2">${esc(e.desc)}</textarea>
<div class="row chk"><label><input type="checkbox" name="ativo" ${ck(e.ativo)}>Ativo</label><label><input type="checkbox" name="destaque" ${ck(e.destaque)}>Destaque</label><label><input type="checkbox" name="s1" ${ck(e.s1)}>Vitrine 1</label><label><input type="checkbox" name="s2" ${ck(e.s2)}>Vitrine 2</label><label><input type="checkbox" name="promoArea" ${ck(e.promoArea)}>Área promocional</label></div>
<p id="fer" class="err" role="alert"></p><div class="row"><button class="btn">Salvar produto</button><button type="button" class="btn g" data-ed="">Cancelar</button></div></form>`:''}
<div class="panel"><h3>Cupons de desconto</h3><p class="sub">Cadastre uma palavra-passe. O cliente digita no carrinho para aplicar o desconto.</p><div class="tw"><table><thead><tr><th>Cupom</th><th>Desconto</th><th>Pedido mínimo</th><th>Status</th><th>Ações</th></tr></thead><tbody>${cups.map(c=>`<tr><td><code>${esc(c.cod)}</code></td><td>${c.tipo==='%'?c.valor+'%':brl(c.valor)}</td><td>${c.min?brl(c.min):'—'}</td><td>${c.ativo?'Ativo':'Inativo'}</td><td><button class="btn g" data-ct="${esc(c.cod)}">${c.ativo?'Desativar':'Ativar'}</button> <button class="btn g" data-cd="${esc(c.cod)}">Excluir</button></td></tr>`).join('')||'<tr><td colspan="5">Nenhum cupom cadastrado.</td></tr>'}</tbody></table></div>
<form id="cpf" novalidate><div class="fg"><div><label for="k1">Palavra-passe do cupom *</label><input id="k1" name="cod" placeholder="Ex.: VERAO15" autocomplete="off"></div><div><label for="k2">Tipo de desconto</label><select id="k2" name="tipo"><option value="%">Porcentagem (%)</option><option value="R$">Valor fixo (R$)</option></select></div><div><label for="k3">Valor *</label><input id="k3" name="valor" type="number" min="0" step="0.01"></div><div><label for="k4">Pedido mínimo (R$, opcional)</label><input id="k4" name="min" type="number" min="0" step="0.01"></div></div><p id="ker" class="err" role="alert"></p><button class="btn">Cadastrar cupom</button></form></div>
<form id="cf2" class="panel"><h3>Contato e configurações</h3><div class="fg">
<div><label for="c1">WhatsApp da loja (DDD + número)</label><input id="c1" name="wa" value="${esc(cfg.wa)}" placeholder="11999999999"></div>
<div><label for="c2">Instagram (usuário ou link)</label><input id="c2" name="ig" value="${esc(cfg.ig)}"></div>
<div><label for="c3">Horário (opcional)</label><input id="c3" name="hor" value="${esc(cfg.hor)}"></div>
<div><label for="c4">Endereço (opcional)</label><input id="c4" name="end" value="${esc(cfg.end)}"></div>
<div><label for="c5">Senha do admin</label><input id="c5" name="senha" type="text" value="${esc(cfg.senha)}"></div>
<div><label for="c6">Fim da oferta (contagem regressiva)</label><input id="c6" name="fim" type="datetime-local" value="${esc(cfg.fim)}"></div></div>
<div class="row" style="margin-top:14px"><button class="btn">Salvar configurações</button></div></form></div>`}
function saveCup(f){const d=new FormData(f),cod=d.get('cod').trim().toUpperCase().replace(/\s+/g,''),tipo=d.get('tipo'),valor=parseFloat(d.get('valor')),min=d.get('min')===''?0:parseFloat(d.get('min'));
const er=!cod?'Informe a palavra-passe do cupom.':!/^[A-Z0-9_-]{3,20}$/.test(cod)?'Use de 3 a 20 letras sem acento, números, hífen ou sublinhado.':cups.some(c=>c.cod===cod)?'Já existe um cupom com esse nome.':!(valor>0)?'Informe um valor maior que zero.':tipo==='%'&&valor>100?'A porcentagem máxima é 100.':!(min>=0)?'O pedido mínimo é inválido.':'';
if(er){$('#ker').textContent=er;toast(er,1);return}
cups.push({cod,tipo,valor,min,ativo:true});st.s('tb_cup',cups);toast(`Cupom ${cod} cadastrado.`);admin()}
function openEd(v){edit=v||null;draft=v&&v!=='new'?prods.find(p=>p.id===v).img:'';admin();if(v)$('#pf').scrollIntoView({behavior:RM?'auto':'smooth'})}
function saveP(f){const d=new FormData(f),nome=d.get('nome').trim(),c=d.get('cat').trim(),preco=parseFloat(d.get('preco')),promo=d.get('promo')===''?0:parseFloat(d.get('promo')),est=parseInt(d.get('estoque'),10);
const er=!nome?'Informe o nome do produto.':!c?'Informe a categoria.':!(preco>=0)?'Informe um preço válido (0 ou mais).':!(promo>=0)?'O preço promocional é inválido.':promo>0&&promo>=preco?'O preço promocional deve ser menor que o preço.':!(est>=0)?'Informe o estoque (0 ou mais).':'';
if(er){$('#fer').textContent=er;toast(er,1);return}
const o={nome,cat:c,desc:d.get('desc').trim(),preco,promo,estoque:est,img:draft,destaque:!!d.get('destaque'),s1:!!d.get('s1'),s2:!!d.get('s2'),promoArea:!!d.get('promoArea'),ativo:!!d.get('ativo')};
if(edit==='new')prods.push({id:'p'+Date.now(),...o});else Object.assign(prods.find(p=>p.id===edit),o);
sp()?toast('Produto salvo e atualizado na vitrine.'):toast('Não foi possível gravar: armazenamento cheio. Use uma imagem menor.',1);
edit=null;cats();shop();cartUI();admin()}
async function shrink(f){const b=await createImageBitmap(f),k=Math.min(1,700/Math.max(b.width,b.height)),c=document.createElement('canvas');c.width=Math.round(b.width*k);c.height=Math.round(b.height*k);c.getContext('2d').drawImage(b,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.82)}

/* Navegação e eventos */
function route(){const a=location.hash==='#admin';$('#site').hidden=a;$('#adm').hidden=!a;if(a)admin()}
function go(k){const c=$('#cart');if(c.open)c.close();if(location.hash==='#admin'){location.hash='';route()}
if(k==='cart'){c.showModal();return}
if(k==='top')return scrollTo({top:0,behavior:RM?'auto':'smooth'});
const el=$('#'+k);el&&!el.hidden&&el.scrollIntoView({behavior:RM?'auto':'smooth'})}
addEventListener('hashchange',route);
document.addEventListener('click',e=>{const t=e.target.closest('[data-go],[data-add],[data-m],[data-p],[data-r],[data-ed],[data-del],[data-clear],[data-reset],[data-out],[data-clear],[data-cr],[data-sl],[data-cs],[data-ct],[data-cd],[data-hs]');if(!t)return;const d=t.dataset;
if(d.go)go(d.go);else if(d.add)add(d.add,t);else if(d.m)chg(d.m,-1);else if(d.p)chg(d.p,1);else if(d.r)rm(d.r);
else if(d.ed!==undefined)openEd(d.ed);
else if(d.del){const p=prods.find(x=>x.id===d.del);ask(`Excluir “${p.nome}”? Esta ação não pode ser desfeita.`,()=>{prods=prods.filter(x=>x.id!==p.id);cart=cart.filter(x=>x.id!==p.id);sp();sv();cats();shop();admin();toast('Produto excluído.')})}
else if(d.reset!==undefined)ask('Restaurar o catálogo de demonstração? Suas alterações serão perdidas.',()=>{prods=JSON.parse(JSON.stringify(SEED));cart=[];edit=null;sp();sv();cats();shop();admin();toast('Dados de demonstração restaurados.')});
else if(d.out!==undefined){authed=false;admin()}
else if(d.cr){aplic='';st.s('tb_ap','');cartUI()}
else if(d.sl){const[i,n]=d.sl.split(':'),r=$('#'+i);r.scrollBy({left:n*r.clientWidth*.8})}
else if(d.cs){q=d.cs;cat='';$('#q').value=q;$('#cat').value='';shop();go('s1')}
else if(d.hs)hs(d.hs==='p'?hi-1:d.hs==='n'?hi+1:+d.hs)
else if(d.ct){const c=cups.find(x=>x.cod===d.ct);c.ativo=!c.ativo;st.s('tb_cup',cups);cartUI();admin();toast(`Cupom ${c.cod} ${c.ativo?'ativado':'desativado'}.`)}
else if(d.cd){const k=d.cd;ask(`Excluir o cupom ${k}?`,()=>{cups=cups.filter(x=>x.cod!==k);if(aplic===k)aplic='';st.s('tb_cup',cups);st.s('tb_ap',aplic);cartUI();admin();toast('Cupom excluído.')})}
else if(d.clear!==undefined){q=cat='';$('#q').value='';$('#cat').value='';shop()}});
document.addEventListener('submit',e=>{e.preventDefault();const f=e.target;
if(f.id==='lg'){if($('#pw').value===cfg.senha){authed=true;admin()}else toast('Senha incorreta.',1)}
else if(f.id==='pf')saveP(f);
else if(f.id==='cpf')saveCup(f);
else if(f.id==='cf2'){const d=new FormData(f);cfg={wa:d.get('wa').trim(),ig:d.get('ig').trim(),hor:d.get('hor').trim(),end:d.get('end').trim(),senha:d.get('senha')||cfg.senha,fim:d.get('fim')||''};st.s('tb_cfg',cfg);contact();shop();cartUI();toast('Configurações salvas.')}});
document.addEventListener('change',async e=>{if(e.target.id!=='ff'||!e.target.files[0])return;
try{draft=await shrink(e.target.files[0]);$('#pv').src=draft;toast('Imagem carregada.')}catch(x){toast('Arquivo de imagem inválido.',1)}});
$('#q').addEventListener('input',e=>{q=e.target.value.trim();shop();if(q&&scrollY<300){const t=$$('#s1,#s2,#promo,#empty').find(x=>!x.hidden);t&&t.scrollIntoView({behavior:RM?'auto':'smooth'})}});
$('#cat').addEventListener('change',e=>{cat=e.target.value;shop()});
['#nm','#ob','#ad'].forEach(i=>$(i).addEventListener('input',()=>{$('#pre').textContent=msg();$('#ce').textContent=''}));
$('#wa').addEventListener('click',e=>{const L=lines();let er='';
if(!L.length)er='Adicione itens ao carrinho.';else if(!$('#nm').value.trim()){er='Informe seu nome para finalizar.';$('#nm').focus()}else if(!waNum())er='O WhatsApp da loja ainda não foi configurado no Admin.';
if(er){e.preventDefault();$('#ce').textContent=er;toast(er,1);return}
e.currentTarget.href=`https://wa.me/${waNum()}?text=${encodeURIComponent(msg())}`;toast('Abrindo o WhatsApp da loja…')});
$('#cx').onclick=()=>$('#cart').close();$('#cfn').onclick=()=>$('#cf').close();
['#cart','#cf'].forEach(i=>$(i).addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.close()}));
$('#age').addEventListener('cancel',e=>e.preventDefault());
$('#ay').onclick=()=>{st.s('tb_age',1);$('#age').close()};

/* Início */
$('#cpb').onclick=()=>{const k=$('#cp').value.trim().toUpperCase(),c=cups.find(x=>x.ativo&&x.cod===k);if(!k)return toast('Digite o cupom.',1);if(!c)return toast('Cupom inválido ou inativo.',1);if(sub()<c.min)return toast(`Este cupom exige pedido mínimo de ${brl(c.min)}.`,1);aplic=c.cod;st.s('tb_ap',aplic);$('#cp').value='';cartUI();toast(`Cupom ${c.cod} aplicado!`)};
$('#cp').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('#cpb').click()}});
$$('[data-i]').forEach(i=>i.src=IMG[i.dataset.i]);setInterval(tick,1000);
skel();cats();contact();cartUI();route();setTimeout(shop,550);
if(!st.g('tb_age',0))$('#age').showModal();
