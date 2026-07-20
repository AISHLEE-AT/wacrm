(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,436721,e=>{"use strict";var t,n,s,i,a,o,r,l,c,d,u,h,g,f,p,m,E,y,C,T,O,I,A,_,w=e.i(247167);(t=g||(g={})).STRING="string",t.NUMBER="number",t.INTEGER="integer",t.BOOLEAN="boolean",t.ARRAY="array",t.OBJECT="object",(n=f||(f={})).LANGUAGE_UNSPECIFIED="language_unspecified",n.PYTHON="python",(s=p||(p={})).OUTCOME_UNSPECIFIED="outcome_unspecified",s.OUTCOME_OK="outcome_ok",s.OUTCOME_FAILED="outcome_failed",s.OUTCOME_DEADLINE_EXCEEDED="outcome_deadline_exceeded";let v=["user","model","function","system"];(i=m||(m={})).HARM_CATEGORY_UNSPECIFIED="HARM_CATEGORY_UNSPECIFIED",i.HARM_CATEGORY_HATE_SPEECH="HARM_CATEGORY_HATE_SPEECH",i.HARM_CATEGORY_SEXUALLY_EXPLICIT="HARM_CATEGORY_SEXUALLY_EXPLICIT",i.HARM_CATEGORY_HARASSMENT="HARM_CATEGORY_HARASSMENT",i.HARM_CATEGORY_DANGEROUS_CONTENT="HARM_CATEGORY_DANGEROUS_CONTENT",i.HARM_CATEGORY_CIVIC_INTEGRITY="HARM_CATEGORY_CIVIC_INTEGRITY",(a=E||(E={})).HARM_BLOCK_THRESHOLD_UNSPECIFIED="HARM_BLOCK_THRESHOLD_UNSPECIFIED",a.BLOCK_LOW_AND_ABOVE="BLOCK_LOW_AND_ABOVE",a.BLOCK_MEDIUM_AND_ABOVE="BLOCK_MEDIUM_AND_ABOVE",a.BLOCK_ONLY_HIGH="BLOCK_ONLY_HIGH",a.BLOCK_NONE="BLOCK_NONE",(o=y||(y={})).HARM_PROBABILITY_UNSPECIFIED="HARM_PROBABILITY_UNSPECIFIED",o.NEGLIGIBLE="NEGLIGIBLE",o.LOW="LOW",o.MEDIUM="MEDIUM",o.HIGH="HIGH",(r=C||(C={})).BLOCKED_REASON_UNSPECIFIED="BLOCKED_REASON_UNSPECIFIED",r.SAFETY="SAFETY",r.OTHER="OTHER",(l=T||(T={})).FINISH_REASON_UNSPECIFIED="FINISH_REASON_UNSPECIFIED",l.STOP="STOP",l.MAX_TOKENS="MAX_TOKENS",l.SAFETY="SAFETY",l.RECITATION="RECITATION",l.LANGUAGE="LANGUAGE",l.BLOCKLIST="BLOCKLIST",l.PROHIBITED_CONTENT="PROHIBITED_CONTENT",l.SPII="SPII",l.MALFORMED_FUNCTION_CALL="MALFORMED_FUNCTION_CALL",l.OTHER="OTHER",(c=O||(O={})).TASK_TYPE_UNSPECIFIED="TASK_TYPE_UNSPECIFIED",c.RETRIEVAL_QUERY="RETRIEVAL_QUERY",c.RETRIEVAL_DOCUMENT="RETRIEVAL_DOCUMENT",c.SEMANTIC_SIMILARITY="SEMANTIC_SIMILARITY",c.CLASSIFICATION="CLASSIFICATION",c.CLUSTERING="CLUSTERING",(d=I||(I={})).MODE_UNSPECIFIED="MODE_UNSPECIFIED",d.AUTO="AUTO",d.ANY="ANY",d.NONE="NONE",(u=A||(A={})).MODE_UNSPECIFIED="MODE_UNSPECIFIED",u.MODE_DYNAMIC="MODE_DYNAMIC";class N extends Error{constructor(e){super(`[GoogleGenerativeAI Error]: ${e}`)}}class b extends N{constructor(e,t){super(e),this.response=t}}class R extends N{constructor(e,t,n,s){super(e),this.status=t,this.statusText=n,this.errorDetails=s}}class S extends N{}class M extends N{}(h=_||(_={})).GENERATE_CONTENT="generateContent",h.STREAM_GENERATE_CONTENT="streamGenerateContent",h.COUNT_TOKENS="countTokens",h.EMBED_CONTENT="embedContent",h.BATCH_EMBED_CONTENTS="batchEmbedContents";class x{constructor(e,t,n,s,i){this.model=e,this.task=t,this.apiKey=n,this.stream=s,this.requestOptions=i}toString(){var e,t;let n=(null==(e=this.requestOptions)?void 0:e.apiVersion)||"v1beta",s=(null==(t=this.requestOptions)?void 0:t.baseUrl)||"https://generativelanguage.googleapis.com",i=`${s}/${n}/${this.model}:${this.task}`;return this.stream&&(i+="?alt=sse"),i}}async function $(e){var t,n;let s,i=new Headers;i.append("Content-Type","application/json"),i.append("x-goog-api-client",(n=e.requestOptions,s=[],(null==n?void 0:n.apiClient)&&s.push(n.apiClient),s.push("genai-js/0.24.1"),s.join(" "))),i.append("x-goog-api-key",e.apiKey);let a=null==(t=e.requestOptions)?void 0:t.customHeaders;if(a){if(!(a instanceof Headers))try{a=new Headers(a)}catch(e){throw new S(`unable to convert customHeaders value ${JSON.stringify(a)} to Headers: ${e.message}`)}for(let[e,t]of a.entries()){if("x-goog-api-key"===e)throw new S(`Cannot set reserved header name ${e}`);if("x-goog-api-client"===e)throw new S(`Header name ${e} can only be set using the apiClient field`);i.append(e,t)}}return i}async function L(e,t,n,s,i,a){let o=new x(e,t,n,s,a);return{url:o.toString(),fetchOptions:Object.assign(Object.assign({},function(e){let t={};if((null==e?void 0:e.signal)!==void 0||(null==e?void 0:e.timeout)>=0){let n=new AbortController;(null==e?void 0:e.timeout)>=0&&setTimeout(()=>n.abort(),e.timeout),(null==e?void 0:e.signal)&&e.signal.addEventListener("abort",()=>{n.abort()}),t.signal=n.signal}return t}(a)),{method:"POST",headers:await $(o),body:i})}}async function D(e,t,n,s,i,a={},o=fetch){let{url:r,fetchOptions:l}=await L(e,t,n,s,i,a);return k(r,l,o)}async function k(e,t,n=fetch){let s;try{s=await n(e,t)}catch(n){var i=n,a=e;let t=i;throw"AbortError"===t.name?(t=new M(`Request aborted when fetching ${a.toString()}: ${i.message}`)).stack=i.stack:i instanceof R||i instanceof S||((t=new N(`Error fetching from ${a.toString()}: ${i.message}`)).stack=i.stack),t}return s.ok||await F(s,e),s}async function F(e,t){let n,s="";try{let t=await e.json();s=t.error.message,t.error.details&&(s+=` ${JSON.stringify(t.error.details)}`,n=t.error.details)}catch(e){}throw new R(`Error fetching from ${t.toString()}: [${e.status} ${e.statusText}] ${s}`,e.status,e.statusText,n)}function Y(e){return e.text=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning text from the first candidate only. Access response.candidates directly to use the other candidates.`),U(e.candidates[0]))throw new b(`${G(e)}`,e);return function(e){var t,n,s,i;let a=[];if(null==(n=null==(t=e.candidates)?void 0:t[0].content)?void 0:n.parts)for(let t of null==(i=null==(s=e.candidates)?void 0:s[0].content)?void 0:i.parts)t.text&&a.push(t.text),t.executableCode&&a.push("\n```"+t.executableCode.language+"\n"+t.executableCode.code+"\n```\n"),t.codeExecutionResult&&a.push("\n```\n"+t.codeExecutionResult.output+"\n```\n");return a.length>0?a.join(""):""}(e)}if(e.promptFeedback)throw new b(`Text not available. ${G(e)}`,e);return""},e.functionCall=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),U(e.candidates[0]))throw new b(`${G(e)}`,e);return console.warn("response.functionCall() is deprecated. Use response.functionCalls() instead."),H(e)[0]}if(e.promptFeedback)throw new b(`Function call not available. ${G(e)}`,e)},e.functionCalls=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),U(e.candidates[0]))throw new b(`${G(e)}`,e);return H(e)}if(e.promptFeedback)throw new b(`Function call not available. ${G(e)}`,e)},e}function H(e){var t,n,s,i;let a=[];if(null==(n=null==(t=e.candidates)?void 0:t[0].content)?void 0:n.parts)for(let t of null==(i=null==(s=e.candidates)?void 0:s[0].content)?void 0:i.parts)t.functionCall&&a.push(t.functionCall);return a.length>0?a:void 0}let P=[T.RECITATION,T.SAFETY,T.LANGUAGE];function U(e){return!!e.finishReason&&P.includes(e.finishReason)}function G(e){var t,n,s;let i="";if((!e.candidates||0===e.candidates.length)&&e.promptFeedback)i+="Response was blocked",(null==(t=e.promptFeedback)?void 0:t.blockReason)&&(i+=` due to ${e.promptFeedback.blockReason}`),(null==(n=e.promptFeedback)?void 0:n.blockReasonMessage)&&(i+=`: ${e.promptFeedback.blockReasonMessage}`);else if(null==(s=e.candidates)?void 0:s[0]){let t=e.candidates[0];U(t)&&(i+=`Candidate was blocked due to ${t.finishReason}`,t.finishMessage&&(i+=`: ${t.finishMessage}`))}return i}function j(e){return this instanceof j?(this.v=e,this):new j(e)}"function"==typeof SuppressedError&&SuppressedError;let B=/^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;async function K(e){let t=[],n=e.getReader();for(;;){let{done:e,value:s}=await n.read();if(e)return Y(function(e){let t=e[e.length-1],n={promptFeedback:null==t?void 0:t.promptFeedback};for(let t of e){if(t.candidates){let e=0;for(let s of t.candidates)if(n.candidates||(n.candidates=[]),n.candidates[e]||(n.candidates[e]={index:e}),n.candidates[e].citationMetadata=s.citationMetadata,n.candidates[e].groundingMetadata=s.groundingMetadata,n.candidates[e].finishReason=s.finishReason,n.candidates[e].finishMessage=s.finishMessage,n.candidates[e].safetyRatings=s.safetyRatings,s.content&&s.content.parts){n.candidates[e].content||(n.candidates[e].content={role:s.content.role||"user",parts:[]});let t={};for(let i of s.content.parts)i.text&&(t.text=i.text),i.functionCall&&(t.functionCall=i.functionCall),i.executableCode&&(t.executableCode=i.executableCode),i.codeExecutionResult&&(t.codeExecutionResult=i.codeExecutionResult),0===Object.keys(t).length&&(t.text=""),n.candidates[e].content.parts.push(t)}e++}t.usageMetadata&&(n.usageMetadata=t.usageMetadata)}return n}(t));t.push(s)}}async function q(e,t,n,s){return function(e){let t,[n,s]=(t=e.body.pipeThrough(new TextDecoderStream("utf8",{fatal:!0})).getReader(),new ReadableStream({start(e){let n="";return function s(){return t.read().then(({value:t,done:i})=>{let a;if(i)return n.trim()?void e.error(new N("Failed to parse stream")):void e.close();let o=(n+=t).match(B);for(;o;){try{a=JSON.parse(o[1])}catch(t){e.error(new N(`Error parsing JSON response: "${o[1]}"`));return}e.enqueue(a),o=(n=n.substring(o[0].length)).match(B)}return s()}).catch(e=>{let t=e;throw t.stack=e.stack,t="AbortError"===t.name?new M("Request aborted when reading from the stream"):new N("Error reading from the stream")})}()}})).tee();return{stream:function(e){return function(e,t,n){if(!Symbol.asyncIterator)throw TypeError("Symbol.asyncIterator is not defined.");var s,i=n.apply(e,t||[]),a=[];return s={},o("next"),o("throw"),o("return"),s[Symbol.asyncIterator]=function(){return this},s;function o(e){i[e]&&(s[e]=function(t){return new Promise(function(n,s){a.push([e,t,n,s])>1||r(e,t)})})}function r(e,t){try{var n;(n=i[e](t)).value instanceof j?Promise.resolve(n.value.v).then(l,c):d(a[0][2],n)}catch(e){d(a[0][3],e)}}function l(e){r("next",e)}function c(e){r("throw",e)}function d(e,t){e(t),a.shift(),a.length&&r(a[0][0],a[0][1])}}(this,arguments,function*(){let t=e.getReader();for(;;){let{value:e,done:n}=yield j(t.read());if(n)break;yield yield j(Y(e))}})}(n),response:K(s)}}(await D(t,_.STREAM_GENERATE_CONTENT,e,!0,JSON.stringify(n),s))}async function W(e,t,n,s){let i=await D(t,_.GENERATE_CONTENT,e,!1,JSON.stringify(n),s);return{response:Y(await i.json())}}function J(e){if(null!=e){if("string"==typeof e)return{role:"system",parts:[{text:e}]};if(e.text)return{role:"system",parts:[e]};if(e.parts)if(!e.role)return{role:"system",parts:e.parts};else return e}}function Q(e){let t=[];if("string"==typeof e)t=[{text:e}];else for(let n of e)"string"==typeof n?t.push({text:n}):t.push(n);var n=t;let s={role:"user",parts:[]},i={role:"function",parts:[]},a=!1,o=!1;for(let e of n)"functionResponse"in e?(i.parts.push(e),o=!0):(s.parts.push(e),a=!0);if(a&&o)throw new N("Within a single message, FunctionResponse cannot be mixed with other type of part in the request for sending chat message.");if(!a&&!o)throw new N("No content is provided for sending chat message.");return a?s:i}function z(e){let t;return t=e.contents?e:{contents:[Q(e)]},e.systemInstruction&&(t.systemInstruction=J(e.systemInstruction)),t}let V=["text","inlineData","functionCall","functionResponse","executableCode","codeExecutionResult"],X={user:["text","inlineData"],function:["functionResponse"],model:["text","functionCall","executableCode","codeExecutionResult"],system:["text"]};function Z(e){var t;if(void 0===e.candidates||0===e.candidates.length)return!1;let n=null==(t=e.candidates[0])?void 0:t.content;if(void 0===n||void 0===n.parts||0===n.parts.length)return!1;for(let e of n.parts)if(void 0===e||0===Object.keys(e).length||void 0!==e.text&&""===e.text)return!1;return!0}let ee="SILENT_ERROR";class et{constructor(e,t,n,s={}){this.model=t,this.params=n,this._requestOptions=s,this._history=[],this._sendPromise=Promise.resolve(),this._apiKey=e,(null==n?void 0:n.history)&&(!function(e){let t=!1;for(let n of e){let{role:e,parts:s}=n;if(!t&&"user"!==e)throw new N(`First content should be with role 'user', got ${e}`);if(!v.includes(e))throw new N(`Each item should include role field. Got ${e} but valid roles are: ${JSON.stringify(v)}`);if(!Array.isArray(s))throw new N("Content should have 'parts' property with an array of Parts");if(0===s.length)throw new N("Each Content should have at least one part");let i={text:0,inlineData:0,functionCall:0,functionResponse:0,fileData:0,executableCode:0,codeExecutionResult:0};for(let e of s)for(let t of V)t in e&&(i[t]+=1);let a=X[e];for(let t of V)if(!a.includes(t)&&i[t]>0)throw new N(`Content with role '${e}' can't contain '${t}' part`);t=!0}}(n.history),this._history=n.history)}async getHistory(){return await this._sendPromise,this._history}async sendMessage(e,t={}){var n,s,i,a,o,r;let l;await this._sendPromise;let c=Q(e),d={safetySettings:null==(n=this.params)?void 0:n.safetySettings,generationConfig:null==(s=this.params)?void 0:s.generationConfig,tools:null==(i=this.params)?void 0:i.tools,toolConfig:null==(a=this.params)?void 0:a.toolConfig,systemInstruction:null==(o=this.params)?void 0:o.systemInstruction,cachedContent:null==(r=this.params)?void 0:r.cachedContent,contents:[...this._history,c]},u=Object.assign(Object.assign({},this._requestOptions),t);return this._sendPromise=this._sendPromise.then(()=>W(this._apiKey,this.model,d,u)).then(e=>{var t;if(Z(e.response)){this._history.push(c);let n=Object.assign({parts:[],role:"model"},null==(t=e.response.candidates)?void 0:t[0].content);this._history.push(n)}else{let t=G(e.response);t&&console.warn(`sendMessage() was unsuccessful. ${t}. Inspect response object for details.`)}l=e}).catch(e=>{throw this._sendPromise=Promise.resolve(),e}),await this._sendPromise,l}async sendMessageStream(e,t={}){var n,s,i,a,o,r;await this._sendPromise;let l=Q(e),c={safetySettings:null==(n=this.params)?void 0:n.safetySettings,generationConfig:null==(s=this.params)?void 0:s.generationConfig,tools:null==(i=this.params)?void 0:i.tools,toolConfig:null==(a=this.params)?void 0:a.toolConfig,systemInstruction:null==(o=this.params)?void 0:o.systemInstruction,cachedContent:null==(r=this.params)?void 0:r.cachedContent,contents:[...this._history,l]},d=Object.assign(Object.assign({},this._requestOptions),t),u=q(this._apiKey,this.model,c,d);return this._sendPromise=this._sendPromise.then(()=>u).catch(e=>{throw Error(ee)}).then(e=>e.response).then(e=>{if(Z(e)){this._history.push(l);let t=Object.assign({},e.candidates[0].content);t.role||(t.role="model"),this._history.push(t)}else{let t=G(e);t&&console.warn(`sendMessageStream() was unsuccessful. ${t}. Inspect response object for details.`)}}).catch(e=>{e.message!==ee&&console.error(e)}),u}}async function en(e,t,n,s){return(await D(t,_.COUNT_TOKENS,e,!1,JSON.stringify(n),s)).json()}async function es(e,t,n,s){return(await D(t,_.EMBED_CONTENT,e,!1,JSON.stringify(n),s)).json()}async function ei(e,t,n,s){let i=n.requests.map(e=>Object.assign(Object.assign({},e),{model:t}));return(await D(t,_.BATCH_EMBED_CONTENTS,e,!1,JSON.stringify({requests:i}),s)).json()}class ea{constructor(e,t,n={}){this.apiKey=e,this._requestOptions=n,t.model.includes("/")?this.model=t.model:this.model=`models/${t.model}`,this.generationConfig=t.generationConfig||{},this.safetySettings=t.safetySettings||[],this.tools=t.tools,this.toolConfig=t.toolConfig,this.systemInstruction=J(t.systemInstruction),this.cachedContent=t.cachedContent}async generateContent(e,t={}){var n;let s=z(e),i=Object.assign(Object.assign({},this._requestOptions),t);return W(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:null==(n=this.cachedContent)?void 0:n.name},s),i)}async generateContentStream(e,t={}){var n;let s=z(e),i=Object.assign(Object.assign({},this._requestOptions),t);return q(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:null==(n=this.cachedContent)?void 0:n.name},s),i)}startChat(e){var t;return new et(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:null==(t=this.cachedContent)?void 0:t.name},e),this._requestOptions)}async countTokens(e,t={}){let n=function(e,t){var n;let s={model:null==t?void 0:t.model,generationConfig:null==t?void 0:t.generationConfig,safetySettings:null==t?void 0:t.safetySettings,tools:null==t?void 0:t.tools,toolConfig:null==t?void 0:t.toolConfig,systemInstruction:null==t?void 0:t.systemInstruction,cachedContent:null==(n=null==t?void 0:t.cachedContent)?void 0:n.name,contents:[]},i=null!=e.generateContentRequest;if(e.contents){if(i)throw new S("CountTokensRequest must have one of contents or generateContentRequest, not both.");s.contents=e.contents}else if(i)s=Object.assign(Object.assign({},s),e.generateContentRequest);else{let t=Q(e);s.contents=[t]}return{generateContentRequest:s}}(e,{model:this.model,generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:this.cachedContent}),s=Object.assign(Object.assign({},this._requestOptions),t);return en(this.apiKey,this.model,n,s)}async embedContent(e,t={}){let n="string"==typeof e||Array.isArray(e)?{content:Q(e)}:e,s=Object.assign(Object.assign({},this._requestOptions),t);return es(this.apiKey,this.model,n,s)}async batchEmbedContents(e,t={}){let n=Object.assign(Object.assign({},this._requestOptions),t);return ei(this.apiKey,this.model,e,n)}}class eo{constructor(e){this.apiKey=e}getGenerativeModel(e,t){if(!e.model)throw new N("Must provide a model name. Example: genai.getGenerativeModel({ model: 'my-model-name' })");return new ea(this.apiKey,e,t)}getGenerativeModelFromCachedContent(e,t,n){if(!e.name)throw new S("Cached content must contain a `name` field.");if(!e.model)throw new S("Cached content must contain a `model` field.");for(let n of["model","systemInstruction"])if((null==t?void 0:t[n])&&e[n]&&(null==t?void 0:t[n])!==e[n]){if("model"===n&&(t.model.startsWith("models/")?t.model.replace("models/",""):t.model)===(e.model.startsWith("models/")?e.model.replace("models/",""):e.model))continue;throw new S(`Different value for "${n}" specified in modelParams (${t[n]}) and cachedContent (${e[n]})`)}let s=Object.assign(Object.assign({},t),{model:e.model,tools:e.tools,toolConfig:e.toolConfig,systemInstruction:e.systemInstruction,cachedContent:e});return new ea(this.apiKey,s,n)}}e.s(["geminiService",0,{_cachedModels:null,async getValidModels(e){if(this._cachedModels)return this._cachedModels;try{let t=await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${e}`);if(t.ok){let e=(await t.json()).models.filter(e=>e.supportedGenerationMethods&&e.supportedGenerationMethods.includes("generateContent")).map(e=>e.name.replace("models/","")),n=["gemini-2.5-flash","gemini-2.0-flash","gemini-flash-latest","gemini-1.5-flash"];return e.sort((e,t)=>{let s=n.indexOf(e),i=n.indexOf(t);return -1===s&&-1===i?0:-1===s?1:-1===i?-1:s-i}),this._cachedModels=e.length>0?e:["gemini-2.5-flash","gemini-2.0-flash","gemini-flash-latest","gemini-1.5-flash"],this._cachedModels}}catch(e){console.warn("Failed to fetch models dynamically",e)}return this._cachedModels=["gemini-2.5-flash","gemini-2.0-flash","gemini-flash-latest","gemini-1.5-flash"],this._cachedModels},async executeWithFallback(e,t={}){let n=t.userApiKey||null,s=t.attachments||[],i=n&&""!==n.trim()?n:w.default.env.NEXT_PUBLIC_GEMINI_API_KEY;if(!i||""===i.trim())throw Error("No Gemini API Key found. Please add your key in the AI Settings.");let a=await this.getValidModels(i),o=new eo(i),r=null;for(let n of a)try{let i=o.getGenerativeModel({model:n,tools:[{googleSearch:{}}],generationConfig:{maxOutputTokens:8192,...t?.responseMimeType?{responseMimeType:t.responseMimeType}:{}}}),a=[e];s&&s.length>0&&s.forEach(e=>{a.push({inlineData:{data:e.data,mimeType:e.mimeType}})});let r=await i.generateContent(a);return await r.response}catch(e){console.warn(`Model ${n} failed. Retrying... Error: ${e.message}`),r=e}throw Error(`All available AI models failed (Quota Exceeded or Unavailable). Last error: ${r?.message}`)},async askInformationHub(e,t,n=""){let s=`
      You are an expert, highly accurate AI Assistant for THAMIZHAN, a Tamil Nadu Digital platform.
      Provide the best, most structured answer to the following query.
      ${"Tamil"===t?"Respond ONLY in Tamil language.":"Respond ONLY in English language."}
      Format your response beautifully with Markdown, using bullet points and clear headings.
      
      Query: ${e}
    `;return(await this.executeWithFallback(s,{userApiKey:n})).text()},async askESevaiAssistant(e,t,n,s=""){let i=`
      You are an expert "Virtual E-Sevai & Govt Schemes Assistant" for the Tamil Nadu Digital platform.
      Your goal is to help citizens navigate TN Government schemes and E-Sevai services.
      
      User Profile: ${t}
      User Query: ${e}
      
      Instructions:
      1. Suggest the most relevant Tamil Nadu Government Schemes for this profile/query.
      2. If they are asking about a specific document (e.g. Patta, Community Certificate, Ration Card), list EXACTLY what documents they need to take to the E-Sevai center.
      3. Keep the tone helpful, clear, and official.
      4. ${"Tamil"===n?"Respond ONLY in Tamil language.":"Respond ONLY in English language."}
      5. Format using beautiful Markdown with clear headings and bullet points.
    `;return(await this.executeWithFallback(i,{userApiKey:s})).text()},async askAgriculturalExpert(e,t,n="",s=[]){let i=`
      You are an expert Agricultural Advisor and Botanist specializing in farming, crop diseases, and modern agricultural practices (especially relevant to Indian/Tamil Nadu agriculture).
      Your goal is to help farmers diagnose crop issues, recommend fertilizers/pesticides (preferably organic if applicable), and provide weather/market advice.
      
      User Query: ${e}
      
      Instructions:
      1. If the user provides an image, analyze it closely for any signs of diseases, pests, or nutrient deficiencies.
      2. Provide actionable, practical advice that a rural farmer can implement.
      3. Keep the tone respectful and helpful.
      4. ${"Tamil"===t?"Respond ONLY in Tamil language.":"Respond ONLY in English language."}
      5. Format using beautiful Markdown with clear headings and bullet points.
    `;return(await this.executeWithFallback(i,{userApiKey:n,attachments:s})).text()},async generateQuiz(e,t,n,s=""){let i=`
      You are an expert Educator AI for THAMIZHAN. 
      Generate a Multiple Choice Quiz (MCQ) based on the following content.
      Target Audience: ${n} students/candidates.
      ${"Tamil"===t?"Respond ONLY in Tamil language.":"Respond ONLY in English language."}
      
      Requirements:
      1. Generate 5 highly relevant Multiple Choice Questions.
      2. Provide 4 options for each question (A, B, C, D).
      3. At the very end, provide the Answer Key.
      4. Ensure the difficulty matches the ${n} level.
      5. Format using Markdown.

      Source Content:
      ${e}
    `;return(await this.executeWithFallback(i,{userApiKey:s})).text()},async generateInteractiveQuiz(e,t,n,s=5,i="Multiple Choice",a="Medium",o="",r="",l=[]){let c="";"Multiple Choice"===i?c=`
        {
          "question": "What is...?",
          "type": "Multiple Choice",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "A",
          "explanation": "Because..."
        }`:"Fill in the Blanks"===i||"One Line Answer"===i?c=`
        {
          "question": "The capital of India is ____.",
          "type": "${i}",
          "correctAnswer": "New Delhi",
          "explanation": "Because..."
        }`:"Mixed"===i&&(c=`
        {
          "question": "Question text...",
          "type": "Multiple Choice | Fill in the Blanks | One Line Answer",
          "options": ["A", "B", "C", "D"], // ONLY include 'options' array if type is 'Multiple Choice'
          "correctAnswer": "Correct answer string",
          "explanation": "Because..."
        }`);let d=o?`
      Custom Instructions: ${o}
`:"",u=`
      You are an expert Educator.
      Generate a quiz for the topic: "${e}".
      Target Audience: ${t} students/candidates.
      Difficulty Level: ${a}
      Quiz Type: ${i}
      ${"Tamil"===n?"Translate all questions and options into Tamil.":"Keep all text in English."}${d}
      
      You must respond ONLY with a valid, parsable JSON array of objects. Do not include markdown formatting like \`\`\`json.
      
      Structure per item:
      [${c}
      ]
      
      Requirements:
      1. Generate EXACTLY ${s} highly relevant questions.
      2. No conversational text.
    `,h=(await this.executeWithFallback(u,{userApiKey:r,attachments:l,responseMimeType:"application/json"})).text().trim(),g=(h=h.replace(/^```json/i,"").replace(/^```/i,"").replace(/```$/i,"").trim()).indexOf("["),f=h.lastIndexOf("]");return -1!==g&&-1!==f&&f>g&&(h=h.substring(g,f+1)),h},async generateTopicQuiz(e,t,n,s,i,a=10,o="Medium",r="",l=""){let c=n&&n.length>0?` Ensure full coverage of these subtopics: ${n.join(", ")}.`:"",d=`This quiz is specifically for the topic '${t}' which is part of the broader course '${e}'.${c} The questions must directly test the student's knowledge on this specific topic within the context of the course in full coverage. Make sure the questions are highly relevant and match the requested ${o} difficulty level.`;return r&&(d+=`

ADDITIONAL INSTRUCTOR CONTEXT/REQUIREMENTS: ${r}`),this.generateInteractiveQuiz(t,s,i,a,"Multiple Choice",o,d,l)},async generateNotes(e,t,n,s="",i=[]){let a=`
      You are an expert Educator AI for THAMIZHAN.
      Create highly structured, easy-to-read Study Notes based on the following content.
      Target Audience: ${n} students/candidates.
      ${"Tamil"===t?"Respond ONLY in Tamil language.":"Respond ONLY in English language."}
      
      Requirements:
      1. Use clear Headings, Subheadings, and Bullet points.
      2. Highlight key terms and important definitions in bold.
      3. Add a "Summary" section at the end.
      4. Ensure the depth matches the ${n} level.
      5. Format using Markdown.

      Source Content:
      ${e}
    `;return(await this.executeWithFallback(a,{userApiKey:s,attachments:i})).text()},async generateCourseSyllabus(e,t,n,s=""){let i=`
      You are an expert EdTech Curriculum Designer.
      Generate a complete, structured Syllabus for the following subject.
      Subject/Exam: ${e}
      Target Audience: ${t}
      ${"Tamil"===n?"Translate all Module Titles and Topic Titles into Tamil.":"Keep all text in English."}
      
      You must respond ONLY with a valid, parsable JSON array of modules. Do not include markdown formatting like \`\`\`json.
      
      Structure:
      [
        {
          "module_title": "Module 1: Introduction",
          "topics": [
            { "title": "Topic 1.1", "content": null, "video_url": null, "pdf_url": null },
            { "title": "Topic 1.2", "content": null, "video_url": null, "pdf_url": null }
          ]
        },
        ...
      ]
      
      Make it highly comprehensive, containing at least 3 modules, with 2-4 topics per module.
    `,a=(await this.executeWithFallback(i,{userApiKey:s,responseMimeType:"application/json"})).text().trim(),o=(a=a.replace(/^```json/i,"").replace(/^```/i,"").replace(/```$/i,"").trim()).indexOf("["),r=a.lastIndexOf("]");-1!==o&&-1!==r&&r>o&&(a=a.substring(o,r+1));try{return JSON.parse(a)}catch(t){console.error("Failed to parse Gemini syllabus JSON:",a,t);let e=a.replace(/[\u0000-\u001F\u007F-\u009F]/g,"");try{return JSON.parse(e)}catch(e){throw Error(`Failed to parse AI response. Try again. Error: ${t.message}`)}}},async generateMicroContent(e,t,n,s,i=""){let a=`
      You are an expert Educator.
      Write highly detailed, structured, and easy-to-understand study material for a specific micro-topic.
      
      Broad Course: ${e}
      Specific Topic to Write About: ${t}
      Target Audience: ${n}
      ${"Tamil"===s?"Respond ONLY in Tamil language.":"Respond ONLY in English language."}
      
      Requirements:
      1. Write an in-depth lesson using Markdown. The content must be highly detailed and comprehensive, containing at least 1000 words.
      2. Use clear headings, subheadings, and bullet points.
      3. At the very top, add a section called "References & Further Learning" containing 3-5 highly relevant web links or YouTube search queries for students to learn more.
      4. Explain concepts clearly with examples relevant to the target audience.
      5. Add a "Key Takeaways" summary at the end.
    `;return(await this.executeWithFallback(a,{userApiKey:i})).text()},async generateCompleteTopicContent(e,t,n,s,i,a,o=""){let[r,l]=await Promise.all([this.generateMicroContent(e,t,n,s,o),this.generateTopicQuiz(e,t,n,s,i,o)]);return{content:r,ai_quiz:l}},async generateLetter(e,t,n,s,i=""){let a=`
      You are an expert professional letter writer.
      Your task is to generate a beautifully crafted, formal, and flawless official letter in HTML format.
      
      Details:
      - Core Need / Aim of the Letter: ${e}
      - To Address: ${t}
      - From Address: ${n}
      
      Instructions:
      1. Write a complete, ready-to-print letter.
      2. The output MUST be raw HTML (no markdown code blocks like \`\`\`html). Do NOT wrap in markdown backticks.
      3. Use standard official letter formatting using inline CSS. STRICTLY follow this structure:
         <div style="text-align: right; margin-bottom: 20px;">
           <strong>From:</strong><br/>
           [Format the From Address here]<br/>
           Date: [Today's Date]
         </div>
         <div style="text-align: left; margin-bottom: 20px;">
           <strong>To,</strong><br/>
           [Format the To Address here]
         </div>
         <div style="text-align: center; margin-bottom: 20px; font-weight: bold; font-size: 1.1em;">
           Subject: [Write a concise subject here]
         </div>
         <div style="text-align: left; margin-bottom: 15px;">
           Respected Sir/Madam,
         </div>
         <div style="text-align: justify; line-height: 1.6; margin-bottom: 20px; text-indent: 40px;">
           [Write the beautifully crafted body of the letter here, split into proper paragraphs separated by <br><br> or <p> tags]
         </div>
         <div style="text-align: right; margin-top: 40px;">
           Yours faithfully,<br/><br/>
           <strong>[Name from 'From Address']</strong>
         </div>
      4. Do not include <html>, <head>, or <body> tags. Just the content wrapper <div>s.
      5. ${"Tamil"===s?"Write the letter ONLY in Tamil language. Ensure formal and respectful Tamil tone.":"Write the letter ONLY in English language. Ensure formal and respectful tone."}
    `,o=(await this.executeWithFallback(a,{userApiKey:i})).text().trim();return o.replace(/^```html/i,"").replace(/^```/i,"").replace(/```$/i,"").trim()}}],436721)}]);