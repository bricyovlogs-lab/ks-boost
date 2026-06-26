import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req: NextRequest){
  const {searchParams}=new URL(req.url)
  const email=searchParams.get('email') || ''
  const key=searchParams.get('key') || ''
  const product_type=searchParams.get('product_type') as any
  const device_id=searchParams.get('device_id') || undefined
  const license=await prisma.license.findUnique({where:{code:key},include:{user:true,product:true}})
  if(!license || license.user.email!==email || license.product.type!==product_type) return NextResponse.json({valid:false,canOpen:false,reason:'KEY_INVALIDA'},{status:401})
  if(license.status!=='ACTIVE' || license.user.status!=='ACTIVE') return NextResponse.json({valid:false,canOpen:false,status:license.status},{status:403})
  if(license.deviceId && device_id && license.deviceId!==device_id) return NextResponse.json({valid:false,canOpen:false,reason:'HWID_DIFERENTE'},{status:403})
  if(!license.deviceId && device_id) await prisma.license.update({where:{id:license.id},data:{deviceId:device_id}})
  return NextResponse.json({valid:true,canOpen:true,product:license.product.type,licenseType:license.lifetime?'LIFETIME':'TEMPORARY',accountStatus:license.user.status,status:license.status})
}
