import{r as l,j as e,t as n}from"./index-njSLLFE1.js";function M({onNavigateToSignUp:y,onLoginSuccess:m,onBack:p}){const[a,u]=l.useState("password"),[f,v]=l.useState(""),[g,d]=l.useState(!1),[x,b]=l.useState(0),[w,j]=l.useState("+86"),[s,c]=l.useState({username:"",password:"",captcha:"",phone:"",verificationCode:""}),h=()=>{const t="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";let o="";for(let r=0;r<4;r++)o+=t[Math.floor(Math.random()*t.length)];v(o)};l.useEffect(()=>{h()},[]);const N=()=>{if(!s.phone){n.error("전화번호를 입력해주세요.");return}let t=60;b(t);const o=setInterval(()=>{t--,b(t),t<=0&&clearInterval(o)},1e3);n.success("인증 코드가 전송되었습니다!")},C=t=>{t.preventDefault(),d(!0),setTimeout(()=>{const o=JSON.parse(localStorage.getItem("registeredUsers")||"[]");if(a==="password"){if(s.captcha.toLowerCase()!==f.toLowerCase()){d(!1),n.error("인증 코드가 올바르지 않습니다."),h();return}const r=o.find(i=>i.username===s.username&&i.password===s.password);if(!r){d(!1),n.error("아이디 또는 비밀번호가 올바르지 않습니다.");return}localStorage.setItem("currentUser",JSON.stringify(r)),n.success(`환영합니다, ${r.username}님!`)}else{const r=w+s.phone,i=o.find(L=>L.phone===r);if(!i){d(!1),n.error("등록되지 않은 전화번호입니다.");return}localStorage.setItem("currentUser",JSON.stringify(i)),n.success(`환영합니다, ${i.username}님!`)}d(!1),m&&m()},1e3)},k=Math.floor(Math.random()*20)-10,S="#"+Math.floor(Math.random()*16777215).toString(16).padStart(6,"0");return e.jsxs("div",{className:"min-h-screen relative overflow-hidden",style:{background:"linear-gradient(135deg, #4FC3F7 0%, #29B6F6 100%)"},children:[e.jsx("style",{children:`
        @keyframes floatCloud {
          0% { transform: translateX(0); }
          50% { transform: translateX(20px); }
          100% { transform: translateX(0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
          from { opacity: 0; transform: translateY(20px); }
        }

        @keyframes slideInRight {
          to { opacity: 1; transform: translateX(0); }
        }

        .cloud {
          position: absolute;
          opacity: 0.6;
          animation: floatCloud 20s linear infinite;
          z-index: 0;
          color: rgba(255, 255, 255, 0.4);
        }

        .cloud-1 { top: 5%; left: 10%; font-size: 4rem; animation-duration: 25s; }
        .cloud-2 { top: 15%; right: 15%; font-size: 6rem; animation-duration: 30s; animation-direction: reverse; }
        .cloud-3 { bottom: 10%; left: 20%; font-size: 3rem; animation-duration: 20s; }

        .hero-title {
          opacity: 0;
          animation: fadeInUp 0.8s ease forwards;
        }

        .hero-subtitle {
          opacity: 0;
          animation: fadeInUp 0.8s ease 0.3s forwards;
        }

        .hero-illustration {
          animation: float 6s ease-in-out infinite;
        }

        .form-section {
          transform: translateX(50px);
          opacity: 0;
          animation: slideInRight 0.8s ease 0.5s forwards;
        }

        .social-btn:hover {
          transform: scale(1.1) rotate(10deg);
          filter: brightness(1.1);
        }
      `}),e.jsx("div",{className:"cloud cloud-1",children:"☁"}),e.jsx("div",{className:"cloud cloud-2",children:"☁"}),e.jsx("div",{className:"cloud cloud-3",children:"☁"}),p&&e.jsx("button",{onClick:p,className:"absolute top-4 left-4 z-20 bg-white/80 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all hover:scale-110",title:"돌아가기",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M10 19l-7-7m0 0l7-7m-7 7h18"})})}),e.jsxs("div",{className:"flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto px-4 sm:px-5 py-6 sm:py-10 gap-6 lg:gap-10 relative z-10 min-h-screen overflow-y-auto",children:[e.jsxs("div",{className:"flex-1 text-white text-center px-3 sm:px-5 hidden lg:block",children:[e.jsx("h1",{className:"hero-title text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 drop-shadow-md",children:"Practice Makes Perfect."}),e.jsx("p",{className:"hero-subtitle text-lg sm:text-xl lg:text-2xl mb-10 opacity-90",children:"Knowledge Advances by Steps Not by Leaps."}),e.jsx("div",{className:"hero-illustration w-64 sm:w-80 h-40 sm:h-52 bg-white/20 border-4 border-white rounded-2xl mx-auto flex items-center justify-center backdrop-blur-sm",children:e.jsx("div",{className:"text-6xl sm:text-8xl",children:"💻"})})]}),e.jsxs("div",{className:"form-section w-full max-w-md bg-white/25 backdrop-blur-lg p-5 sm:p-8 lg:p-10 rounded-2xl shadow-2xl border border-white/20 my-auto",children:[e.jsx("h2",{className:"text-center text-2xl sm:text-3xl text-gray-800 mb-4 sm:mb-6 font-bold tracking-wide",children:"User Login"}),e.jsxs("div",{className:"flex gap-1 sm:gap-2 mb-4 sm:mb-6 bg-white/40 p-1 rounded-lg",children:[e.jsx("button",{type:"button",onClick:()=>u("password"),className:"flex-1 py-2 rounded-md transition-all",style:{backgroundColor:a==="password"?"white":"transparent",color:a==="password"?"#1F2937":"#4B5563",fontWeight:a==="password"?"bold":"normal",boxShadow:a==="password"?"0 2px 4px rgba(0,0,0,0.1)":"none"},children:"Password Login"}),e.jsx("button",{type:"button",onClick:()=>u("phone"),className:"flex-1 py-2 rounded-md transition-all",style:{backgroundColor:a==="phone"?"white":"transparent",color:a==="phone"?"#1F2937":"#4B5563",fontWeight:a==="phone"?"bold":"normal",boxShadow:a==="phone"?"0 2px 4px rgba(0,0,0,0.1)":"none"},children:"Phone Login"})]}),e.jsxs("form",{onSubmit:C,className:"space-y-5",children:[a==="password"?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"relative",children:[e.jsx("input",{type:"text",placeholder:"Username",required:!0,value:s.username,onChange:t=>c({...s,username:t.target.value}),className:"w-full px-4 py-4 pl-12 rounded-md bg-white shadow-sm text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition-all"}),e.jsx("div",{className:"absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl",children:"👤"})]}),e.jsxs("div",{className:"relative",children:[e.jsx("input",{type:"password",placeholder:"Password",required:!0,value:s.password,onChange:t=>c({...s,password:t.target.value}),className:"w-full px-4 py-4 pl-12 rounded-md bg-white shadow-sm text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition-all"}),e.jsx("div",{className:"absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl",children:"🔒"})]}),e.jsxs("div",{className:"flex bg-white rounded-md shadow-sm overflow-hidden relative",children:[e.jsx("div",{className:"absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl z-10",children:"🛡️"}),e.jsx("input",{type:"text",placeholder:"Verification Code",required:!0,value:s.captcha,onChange:t=>c({...s,captcha:t.target.value}),className:"flex-1 px-4 py-4 pl-12 bg-transparent focus:outline-none text-gray-800"}),e.jsx("div",{onClick:h,className:"w-32 bg-gray-100 flex items-center justify-center font-mono font-bold text-2xl tracking-widest text-gray-600 cursor-pointer border-l border-gray-300 select-none hover:bg-gray-200 transition-colors",style:{backgroundImage:"repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)",transform:`rotate(${k}deg)`,color:S},title:"Click to refresh",children:f})]})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"relative",children:[e.jsxs("select",{value:w,onChange:t=>j(t.target.value),className:"absolute left-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-gray-700 font-semibold focus:outline-none z-10 cursor-pointer",style:{width:"80px"},children:[e.jsx("option",{value:"+86",children:"🇨🇳 +86"}),e.jsx("option",{value:"+1",children:"🇺🇸 +1"}),e.jsx("option",{value:"+82",children:"🇰🇷 +82"}),e.jsx("option",{value:"+81",children:"🇯🇵 +81"}),e.jsx("option",{value:"+44",children:"🇬🇧 +44"})]}),e.jsx("input",{type:"tel",placeholder:"Phone Number",required:!0,value:s.phone,onChange:t=>c({...s,phone:t.target.value}),className:"w-full px-4 py-4 pl-28 rounded-md bg-white shadow-sm text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition-all"}),e.jsx("div",{className:"absolute left-24 top-1/2 -translate-y-1/2 text-gray-300",children:"|"})]}),e.jsxs("div",{className:"relative",children:[e.jsx("input",{type:"text",placeholder:"Verification Code",required:!0,value:s.verificationCode,onChange:t=>c({...s,verificationCode:t.target.value}),className:"w-full px-4 py-4 pl-12 pr-24 rounded-md bg-white shadow-sm text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition-all"}),e.jsx("div",{className:"absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl",children:"🛡️"}),e.jsx("button",{type:"button",onClick:N,disabled:x>0,className:"absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 text-white font-semibold px-3 py-2 rounded cursor-pointer hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm",children:x>0?`${x}s`:"Get Code"})]})]}),e.jsx("button",{type:"submit",disabled:g,className:"w-full py-4 bg-blue-500 text-white rounded-md text-lg font-bold cursor-pointer hover:bg-blue-600 hover:-translate-y-1 active:translate-y-0 transition-all shadow-lg disabled:opacity-70 mt-3",children:g?"Verifying...":"Login"}),e.jsxs("div",{className:"flex items-center text-center my-6",children:[e.jsx("div",{className:"flex-1 border-b-2 border-black/10 mr-4"}),e.jsx("span",{className:"text-gray-700 text-sm font-semibold",children:"Other Login Methods"}),e.jsx("div",{className:"flex-1 border-b-2 border-black/10 ml-4"})]}),e.jsxs("div",{className:"flex justify-center gap-8 mb-8",children:[e.jsx("div",{className:"social-btn w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl cursor-pointer shadow-lg transition-all",title:"Login with Mobile",onClick:()=>u("phone"),children:"📱"}),e.jsx("div",{className:"social-btn w-14 h-14 rounded-full text-white flex items-center justify-center text-2xl cursor-pointer shadow-lg transition-all",style:{backgroundColor:"#07c160"},title:"Login with WeChat",onClick:()=>alert("WeChat login coming soon!"),children:"💬"})]}),e.jsxs("div",{className:"flex justify-between text-sm px-2",children:[e.jsx("a",{href:"#",onClick:t=>{t.preventDefault(),y?.()},className:"text-blue-600 font-bold hover:text-blue-800 hover:underline transition-colors",children:"Register Now"}),e.jsx("a",{href:"#",onClick:t=>{t.preventDefault(),alert("Password recovery feature coming soon!")},className:"text-blue-600 font-bold hover:text-blue-800 hover:underline transition-colors",children:"Forgot Password?"})]})]})]})]})]})}export{M as WeChatLoginPage};
