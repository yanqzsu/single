(()=>{"use strict";const e=(e,t=!1)=>(e=>{let t=new MessageChannel;return window.nativeCallBack=function(e){t.port1.postMessage(e)},e(),new Promise((e=>{t.port2.onmessage=function(n){const o=n.data;e(o),t=null,window.nativeCallBack=null}}))})((()=>{var n;n={type:"INIT_DOMAIN",payload:{domain:e,ping:t}},window.webkit&&window.webkit.messageHandlers&&window.webkit.messageHandlers.Sketch?window.webkit.messageHandlers.Sketch.postMessage(encodeURIComponent(JSON.stringify(n))):console.info("postMessage: ",n)})),t=!0,n={tip:"请输入您的私有部署域名",placeholder:"如：on-premise.modao.cc",error:"域名错误，请确认后重试",submit:"确定"};window.onload=function(){const o=document.querySelector(".domain-tip"),i=document.querySelector(".domain-input"),r=document.querySelector(".domain-submit"),s=document.querySelector(".domain-error"),d=n;o.innerHTML=d.tip,i.setAttribute("placeholder",d.placeholder),s.innerHTML=d.error,r.innerHTML=d.submit,r.addEventListener("click",(async function(n){n.preventDefault(),console.log(i.value);let o=i.value;if(!(e=>/^\w+[^\s]+(\.[^\s]+){1,}$/.test(e))(o))return void s.removeAttribute("hidden");const r=t;!/^https:\/\/.+/.test(o)&&r&&(o=`https://${o}`);const d=await e(o,r);if(console.log(d),"DOMAIN_SET_SUCCEED"===d)return location.href=`${o}/redirect/sketch`,void s.setAttribute("hidden","hidden");s.removeAttribute("hidden","hidden")})),document.body.removeAttribute("hidden")}})();