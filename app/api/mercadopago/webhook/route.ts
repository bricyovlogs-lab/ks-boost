import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createKey } from '@/lib/license'
export async function POST(req: Request){
  const body=await req.json()
  // Produção: consultar o pagamento no Mercado Pago pelo ID recebido antes de aprovar.
  const paymentId=body?.data?.id?.toString() || body?.paymentId
  const localPayment=await prisma.payment.findFirst({where:{mercadoPagoId:paymentId},include:{product:true,user:true}})
  if(!localPayment) return NextResponse.json({ok:true,ignored:true})
  const updated=await prisma.payment.update({where:{id:localPayment.id},data:{status:'APPROVED'}})
  const exists=await prisma.license.findFirst({where:{userId:localPayment.userId,productId:localPayment.productId,status:'ACTIVE'}})
  if(!exists){await prisma.license.create({data:{code:createKey(localPayment.product.type==='OPTIMIZER'?'VKS-OPT':'VKS-PF'),userId:localPayment.userId,productId:localPayment.productId,lifetime:true}})}
  return NextResponse.json({ok:true,payment:updated.id})
}
