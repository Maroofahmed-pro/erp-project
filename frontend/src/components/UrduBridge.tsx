import {useEffect} from "react";
import i18n from "../i18n";

const originals=new WeakMap<Node,string>();
const attributeOriginals=new WeakMap<Element,Map<string,string>>();
const internalWrites=new WeakSet<Node>();
const attributes=["placeholder","title","aria-label"] as const;
const urduValues=new Set(Object.values(i18n.getResourceBundle("ur","translation")||{}));

function translateText(node:Text){
 const original=originals.get(node)??node.data;
 if(!originals.has(node))originals.set(node,original);
 const trimmed=original.trim();
 if(!trimmed)return;
 const translated=i18n.exists(trimmed,{lng:"ur"})?i18n.t(trimmed,{lng:"ur"}):trimmed;
 const next=i18n.language==="ur"?original.replace(trimmed,translated):original;
 if(node.data!==next){internalWrites.add(node);node.data=next}
}
function translateElement(element:Element){
 if(element.matches("script,style,[data-no-translate]"))return;
 let saved=attributeOriginals.get(element);
 if(!saved){saved=new Map();attributeOriginals.set(element,saved)}
 for(const name of attributes){
  const current=element.getAttribute(name);
  if(current&&!saved.has(name))saved.set(name,current);
  const original=saved.get(name);
  if(!original)continue;
  element.setAttribute(name,i18n.language==="ur"&&i18n.exists(original,{lng:"ur"})?i18n.t(original,{lng:"ur"}):original);
 }
 for(const child of element.childNodes)translateTree(child);
}
function translateTree(node:Node){
 if(node.nodeType===Node.TEXT_NODE)translateText(node as Text);
 else if(node.nodeType===Node.ELEMENT_NODE)translateElement(node as Element);
}
export default function UrduBridge(){
 useEffect(()=>{
  let queued=false;
  const pending=new Set<Node>();
  const apply=()=>{queued=false;const nodes=[...pending];pending.clear();for(const node of nodes)translateTree(node)};
  const schedule=(node:Node=document.body)=>{pending.add(node);if(!queued){queued=true;queueMicrotask(apply)}};
  const observer=new MutationObserver(records=>{
   for(const record of records){
    if(record.type==="characterData"){
     if(internalWrites.has(record.target)){internalWrites.delete(record.target);continue}
     const text=(record.target as Text).data.trim();
     if(i18n.language!=="ur"||!urduValues.has(text))originals.set(record.target,(record.target as Text).data);
     schedule(record.target);
    }else{
     for(const node of record.addedNodes)schedule(node);
    }
   }
  });
  observer.observe(document.body,{childList:true,characterData:true,subtree:true});
  const languageChanged=()=>schedule(document.body);
  i18n.on("languageChanged",languageChanged);
  schedule();
  return()=>{observer.disconnect();i18n.off("languageChanged",languageChanged)};
 },[]);
 return null;
}
