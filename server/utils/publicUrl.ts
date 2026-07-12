// origin สาธารณะสำหรับสร้างลิงก์/QR — เติม https:// ให้เองถ้า env ไม่มี scheme (กันลิงก์เพี้ยน)
export function publicOrigin(event: any): string {
  let s = useRuntimeConfig(event).public.siteUrl?.toString().trim().replace(/\/+$/, '')
  if (s) {
    if (!/^https?:\/\//i.test(s)) s = 'https://' + s
    return s
  }
  return getRequestURL(event, { xForwardedHost: true, xForwardedProto: true }).origin
}
