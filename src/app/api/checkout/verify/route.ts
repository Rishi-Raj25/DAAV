import {createHmac,timingSafeEqual} from "node:crypto";
import {createClient} from "@supabase/supabase-js";
import {z} from "zod";
export const runtime="nodejs";
const schema=z.object({razorpay_order_id:z.string().min(1),razorpay_payment_id:z.string().min(1),razorpay_signature:z.string().min(1)}).strict();
export async function POST(request:Request){
 const url=process.env.SUPABASE_URL_FIRST,dbKey=process.env.SUPABASE_SECRET_KEY1,keyId=process.env.RAZORPAY_KEY_ID,secret=process.env.RAZORPAY_KEY_SECRET;
 if(!url||!dbKey||!keyId||!secret)return Response.json({message:"Payment verification isn't configured."},{status:503});
 let body:unknown;try{body=await request.json();}catch{return Response.json({message:"Invalid payment response."},{status:400});}
 const p=schema.safeParse(body);if(!p.success)return Response.json({message:"Invalid payment response."},{status:400});
 const {razorpay_order_id:orderId,razorpay_payment_id:paymentId,razorpay_signature:signature}=p.data;
 const expected=createHmac("sha256",secret).update(`${orderId}|${paymentId}`).digest(),provided=Buffer.from(signature,"hex");
 if(provided.length!==expected.length||!timingSafeEqual(provided,expected))return Response.json({message:"Payment signature verification failed."},{status:400});
 const db=createClient(url,dbKey,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:intent,error}=await db.from("registration_intents").select("*").eq("razorpay_order_id",orderId).single();
 if(error||!intent)return Response.json({message:"Checkout order not found."},{status:404});
 if(intent.status==="paid"&&intent.listing_id)return Response.json({success:true,listingId:intent.listing_id,message:"Your DAAV is ready."});
 const auth=Buffer.from(`${keyId}:${secret}`).toString("base64");
 const pr=await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`,{headers:{Authorization:`Basic ${auth}`},cache:"no-store"}),payment=await pr.json().catch(()=>({}));
 if(!pr.ok||payment.order_id!==orderId||payment.status!=="captured"||payment.amount!==intent.amount_paise||payment.currency!=="INR")return Response.json({message:"Razorpay hasn't confirmed a captured payment yet. If charged, contact support before paying again."},{status:402});
 const {data:listing,error:le}=await db.from("listings").insert({owner_id:null,name:intent.name,slug:intent.slug,website_url:intent.website_url,description:null,category:null,entity_type:"independent_product",registration_identifier:null,verification_status:"approved",approved_at:new Date().toISOString()}).select("id,name,slug,website_url").single();
 if(le||!listing)return Response.json({message:"Payment verified, but publishing failed. Contact support; do not pay again."},{status:500});
 const now=new Date().toISOString();
 const {error:pe}=await db.from("payments").insert({listing_id:listing.id,payer_id:null,amount_paise:intent.amount_paise,currency:"INR",status:"paid",razorpay_order_id:orderId,razorpay_payment_id:paymentId,signature_verified_at:now,paid_at:now});
 if(pe){await db.from("listings").delete().eq("id",listing.id);return Response.json({message:"Payment verified but recording failed. Contact support; do not pay again."},{status:500});}
 const {error:ie}=await db.from("registration_intents").update({status:"paid",razorpay_payment_id:paymentId,listing_id:listing.id,paid_at:now}).eq("id",intent.id).eq("status","pending");
 if(ie)return Response.json({message:"Payment recorded; contact support to finish publishing."},{status:500});
 return Response.json({success:true,listingId:listing.id,listing,message:"Payment verified. Your DAAV is ready."});
}