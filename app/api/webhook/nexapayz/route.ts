import { NextResponse } from "next/server";
export async function POST(request:Request){
  // TODO production: verify provider signature/authentication before trusting the payload.
  // Do not mark orders as paid until the NexaPayz webhook contract is confirmed.
  const contentType=request.headers.get("content-type")||"";
  if(!contentType.includes("application/json")) return NextResponse.json({error:"Content-Type must be application/json"},{status:415});
  let payload:unknown;
  try{payload=await request.json()}catch{return NextResponse.json({error:"Invalid JSON"},{status:400})}
  const p=payload as {invoice_id?:unknown;status?:unknown};
  if(typeof p.invoice_id!=="string"||typeof p.status!=="string") return NextResponse.json({error:"Invalid webhook payload"},{status:400});
  // A 2xx response acknowledges receipt only. No order state is changed in this starter.
  return NextResponse.json({received:true,invoice_id:p.invoice_id,notice:"Webhook received; payment processing is not enabled until verification is configured."},{status:200});
}