import{c as r,r as n,j as e}from"./index-njSLLFE1.js";import{C as p}from"./card-ChVWMAfG.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=[["path",{d:"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242",key:"1pljnt"}],["path",{d:"M16 14v6",key:"1j4efv"}],["path",{d:"M8 14v6",key:"17c4r9"}],["path",{d:"M12 16v6",key:"c8a4gj"}]],g=r("cloud-rain",y);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=[["path",{d:"M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z",key:"p7xjir"}]],v=r("cloud",j);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]],c=r("sun",N);function f(){const[i,l]=n.useState(0),[d,h]=n.useState(!0),a=[{name:"강릉",subName:"구름조금",temp:23,high:24,low:15,icon:c,iconColor:"text-yellow-500",dust:"미세 - 초미세 -"},{name:"베이징",subName:"맑음",temp:18,high:21,low:12,icon:c,iconColor:"text-yellow-500",dust:"미세 좋음 초미세 보통"},{name:"상하이",subName:"비",temp:16,high:19,low:13,icon:g,iconColor:"text-gray-500",dust:"미세 나쁨 초미세 나쁨"},{name:"광저우",subName:"흐림",temp:25,high:28,low:22,icon:v,iconColor:"text-gray-400",dust:"미세 보통 초미세 좋음"},{name:"선전",subName:"구름조금",temp:27,high:30,low:24,icon:c,iconColor:"text-yellow-500",dust:"미세 좋음 초미세 좋음"}];n.useEffect(()=>{if(!d)return;const o=setInterval(()=>{l(s=>(s+1)%a.length)},3e3);return()=>clearInterval(o)},[a.length,d]);const m=o=>{l(o),h(!1),setTimeout(()=>{h(!0)},5e3)},t=a[i],u=t.icon;return e.jsxs(p,{className:"p-4 bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx(u,{className:`w-8 h-8 ${t.iconColor}`}),e.jsxs("div",{children:[e.jsxs("div",{className:"text-base font-medium text-black",children:[t.name," ",t.subName]}),e.jsx("div",{className:"text-xs text-gray-500 mt-0.5",children:t.dust})]})]}),e.jsxs("div",{className:"text-right",children:[e.jsxs("div",{className:"text-2xl font-normal text-black",children:[t.temp,"°"]}),e.jsxs("div",{className:"text-xs text-gray-500 mt-0.5",children:[t.high,"° / ",t.low,"°"]})]})]}),e.jsx("div",{className:"flex justify-center space-x-1 mt-3",children:a.map((o,s)=>e.jsx("button",{onClick:x=>{x.stopPropagation(),m(s)},className:`w-1.5 h-1.5 rounded-full transition-all duration-300 hover:scale-150 ${s===i?"bg-gray-600":"bg-gray-300 hover:bg-gray-400"}`,"aria-label":`${a[s].name} 날씨 보기`},s))})]})}export{f as WeatherWidget};
