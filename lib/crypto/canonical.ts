// lib/crypto/canonical.ts

export function canonicalize(obj:any){
  return JSON.stringify(sortObject(obj))
}

function sortObject(obj:any):any{
  if(typeof obj !== "object" || obj === null) return obj

  return Object.keys(obj)
    .sort()
    .reduce((acc:any, key)=>{
      acc[key] = sortObject(obj[key])
      return acc
    },{})
}