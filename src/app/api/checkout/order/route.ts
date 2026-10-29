import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
export const runtime = "nodejs";
const schema=z.object({name:z.string().trim().min(2).max(100),website:z.string().trim().min(3).max(300)}).strict();
function normalizeWebsite(raw:string):string|null{try{const u=new URL(/^https?:\/\//i.test(raw.trim())?raw.trim():`https://${raw.trim()}`);if(u.protocol!=="https:"||u.username||u.password||(u.port&&u.port!=="443")||!u.hostname.includes(".")||u.hostname.endsWith(".")||u.hostname.includes(" ")||["localhost"].includes(u.hostname)||/\.(local|internal|localhost)$/.test(u.hostname))return null;return u.origin;}catch{return null;}}
export async function POST(request:Request){
 const url=process.env.SUPABASE_URL_FIRST, dbKey=process.env.SUPABASE_SECRET_KEY1, keyId=process.env.RAZORPAY_KEY_ID, secret=process.env.RAZORPAY_KEY_SECRET;
 const missing:string[]=[]; if(!url)missing.push("SUPABASE_URL_FIRST"); if(!dbKey)missing.push("SUPABASE_SECRET_KEY1"); if(!keyId)missing.push("RAZORPAY_KEY_ID"); if(!secret)missing.push("RAZORPAY_KEY_SECRET"); if(missing.length)return Response.json({message:`Checkout configuration is missing: ${missing.join(", ")}. Check Vercel Production variables and redeploy.`},{status:503});
 if(!url||!dbKey||!keyId||!secret)return Response.json({message:"Checkout configuration is incomplete."},{status:503});
 let body:unknown;try{body=await request.json();}catch{return Response.json({message:"Enter your company name and website."},{status:400});}
 const p=schema.safeParse(body);if(!p.success)return Response.json({message:"Enter a company name and website URL."},{status:400});
 const website=normalizeWebsite(p.data.website);if(!website)return Response.json({message:"Enter a valid public HTTPS website URL."},{status:400});
 const amount=Number.parseInt(process.env.DAAV_LISTING_FEE_PAISE||"19900",10);if(!Number.isSafeInteger(amount)||amount<100)return Response.json({message:"Listing fee configuration is invalid."},{status:500});
 const slugBase=p.data.name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,70)||"product",slug=`${slugBase}-${crypto.randomUUID().slice(0,8)}`;
 const db=createClient(url,dbKey,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:intent,error}=await db.from("registration_intents").insert({name:p.data.name,website_url:website,slug,amount_paise:amount,status:"pending"}).select("id").single();
 if(error||!intent)return Response.json({message:"Couldn't prepare checkout. Apply the DAAV payment migration and try again."},{status:500});
 const auth=Buffer.from(`${keyId}:${secret}`).toString("base64");
 const response=await fetch("https://api.razorpay.com/v1/orders",{method:"POST",headers:{Authorization:`Basic ${auth}`,"Content-Type":"application/json"},body:JSON.stringify({amount,currency:"INR",receipt:intent.id,notes:{daav_intent_id:intent.id,product_name:p.data.name}}),cache:"no-store"});
 const data=await response.json().catch(()=>({}));
 if(!response.ok||typeof data.id!=="string"){await db.from("registration_intents").delete().eq("id",intent.id);return Response.json({message:"Razorpay couldn't create the order. Check your keys."},{status:502});}
 const {error:updateError}=await db.from("registration_intents").update({razorpay_order_id:data.id}).eq("id",intent.id);
 if(updateError)return Response.json({message:"Could not save checkout order. Contact DAAV support before retrying."},{status:500});
 return Response.json({keyId,orderId:data.id,amount,currency:"INR",description:"DAAV listing fee"});
}