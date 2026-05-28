'use client'

import { useEffect, useRef } from 'react'
import { QuoteCostInput, QuoteDayInput } from '@/types'
import { PACKAGE_INCLUDED, PACKAGE_EXCLUDED } from '@/constants'
import { formatCurrency, calcPricePerPerson } from '@/lib/utils'

interface PreviewData {
  clientName: string
  tourName: string
  startDate: string   // formatted "09 May 2026"
  endDate: string
  routeFrom: string
  routeTo: string
  paxCount: number
  costs: QuoteCostInput[]
  days: QuoteDayInput[]
}

interface Props {
  data: PreviewData
}

export default function QuotePreview({ data }: Props) {
  const frameRef = useRef<HTMLDivElement>(null)

  const totalCost = data.costs.reduce((s, c) => s + (c.amount || 0), 0)
  const ppp = calcPricePerPerson(totalCost, 0)
  const total = ppp * (data.paxCount || 1)

  const html = buildPreviewHtml(data, totalCost, ppp, total)

  // Update via innerHTML (safe — all data is from controlled form inputs)
  useEffect(() => {
    if (frameRef.current) frameRef.current.innerHTML = html
  }, [html])

  return (
    <div
      ref={frameRef}
      className="w-full"
      style={{ fontFamily: 'sans-serif' }}
    />
  )
}

// ── PDF print function ──────────────────────────────────────────────────────
export function printQuotePdf(data: PreviewData) {
  const totalCost = data.costs.reduce((s, c) => s + (c.amount || 0), 0)
  const ppp = calcPricePerPerson(totalCost, 0)
  const total = ppp * (data.paxCount || 1)
  const html = buildPreviewHtml(data, totalCost, ppp, total)
  const styleContent = Array.from(document.querySelectorAll('style')).map((s) => s.textContent ?? '').join('\n')

  const w = window.open('', '_blank', 'width=900,height=1100')
  if (!w) { alert('Allow popups for this page'); return }

  const doc = w.document
  doc.open()
  doc.write('<!DOCTYPE html><html><head><meta charset="UTF-8">')
  doc.write('<link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Playfair+Display:wght@700&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">')
  doc.write('<style>')
  doc.write(styleContent)
  doc.write('@page{size:A4;margin:10mm 12mm;}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}html,body{margin:0;padding:0;background:#F5EDE0;}')
  doc.write('</style></head><body>')
  doc.write(html)
  doc.write('</body></html>')
  doc.close()

  w.addEventListener('load', () => { setTimeout(() => w.print(), 800) })
}

// ── HTML builder (shared between preview + print) ──────────────────────────
function buildPreviewHtml(data: PreviewData, totalCost: number, ppp: number, total: number): string {
  const esc = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  const deposit = Math.round(total / 2)

  const daysHtml = data.days.length === 0
    ? `<div style="text-align:center;padding:32px;color:#9ca38f;font-size:13px;font-style:italic;">Add itinerary days using the form on the left...</div>`
    : data.days.map((d) => `
        <div>
          <div style="background:#1A5B6A;color:white;padding:9px 18px;display:flex;justify-content:space-between;align-items:center;">
            <div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:.8px;">
              📞 DAY ${d.dayNumber}${d.location ? ' — ' + d.location.toUpperCase() : ''}
            </div>
            ${d.dateLabel ? `<span style="font-size:10px;opacity:.6;">${esc(d.dateLabel)}</span>` : ''}
          </div>
          <div style="display:flex;background:#F5EDE0;border-bottom:1px solid rgba(0,0,0,.07);">
            <div style="flex:1;padding:14px 18px;min-width:0;display:flex;flex-direction:column;gap:10px;">
              ${d.sights ? `
                <div>
                  <div style="color:#C4613A;font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;display:flex;align-items:center;gap:4px;">✦ SIGHTSEEING & ACTIVITIES</div>
                  <div style="border-left:2px dotted rgba(196,97,58,.4);padding-left:10px;margin-left:3px;">
                    ${d.sights.split(/[,\n]+/).map(s=>s.trim()).filter(Boolean).map(s=>`<div style="font-size:13px;color:#3a3028;line-height:1.65;margin-bottom:2px;word-break:break-word;">• ${esc(s)}</div>`).join('')}
                  </div>
                </div>` : ''}
              ${d.hotel ? `
                <div>
                  <div style="color:#C4613A;font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">✦ ACCOMMODATION</div>
                  <div style="border-left:2px dotted rgba(196,97,58,.4);padding-left:10px;margin-left:3px;">
                    ${d.hotel.split('\n').map((line,i)=>`<div style="font-size:13px;color:#3a3028;line-height:1.65;${i>0?'padding-left:14px;':''}">${i===0?'🏨 ':''}${esc(line)}</div>`).join('')}
                  </div>
                </div>` : ''}
              ${!d.sights && !d.hotel ? `<div style="font-size:12px;color:#c8bfb0;font-style:italic;padding:6px 0;">Fill in sightseeing &amp; accommodation...</div>` : ''}
            </div>
            ${d.imageUrl ? `<div style="width:210px;min-height:180px;max-height:280px;flex-shrink:0;overflow:hidden;align-self:stretch;"><img src="${d.imageUrl}" style="width:100%;height:100%;object-fit:cover;display:block;" /></div>` : ''}
          </div>
        </div>`).join('')

  const costsHtml = data.costs.length ? `
    <div style="background:#F5EDE0;padding:14px 18px 10px;border-top:1px dashed rgba(0,0,0,.12);">
      <div style="font-size:10px;font-weight:700;color:#1A5B6A;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;">Package Inclusions</div>
      <div style="display:grid;grid-template-columns:1fr auto;gap:0;">
        ${data.costs.map(c=>`
          <div style="font-size:12.5px;color:#555;padding:4px 0;border-bottom:1px solid rgba(0,0,0,.06);">${esc(c.label||'—')}</div>
          <div style="font-size:12.5px;color:#333;font-weight:600;padding:4px 0 4px 16px;border-bottom:1px solid rgba(0,0,0,.06);text-align:right;">${formatCurrency(c.amount||0)}</div>`).join('')}
        <div style="font-size:13px;font-weight:700;color:#1A5B6A;padding:8px 0 2px;border-top:1.5px solid #1A5B6A;margin-top:4px;">Total Cost per Person</div>
        <div style="font-size:13px;font-weight:700;color:#1A5B6A;padding:8px 0 2px 16px;border-top:1.5px solid #1A5B6A;margin-top:4px;text-align:right;">${formatCurrency(totalCost)}</div>
      </div>
    </div>` : `<div style="height:6px;background:#F5EDE0;"></div>`

  const included = PACKAGE_INCLUDED.map(i => `<div style="font-size:11px;color:#374151;padding:3px 0;display:flex;align-items:flex-start;gap:6px;border-bottom:1px solid #F9FAFB;"><span style="color:#059669;flex-shrink:0;font-size:9px;">✓</span><span>${esc(i)}</span></div>`).join('')
  const excluded = PACKAGE_EXCLUDED.map(i => `<div style="font-size:11px;color:#374151;padding:3px 0;display:flex;align-items:flex-start;gap:6px;border-bottom:1px solid #FEF2F2;"><span style="color:#DC2626;flex-shrink:0;font-size:9px;">✗</span><span>${esc(i)}</span></div>`).join('')

  return `
<div style="background:#F5EDE0;font-family:'Inter',sans-serif;">

  <!-- Header -->
  <div style="text-align:center;padding:22px 22px 16px;position:relative;">
    <div style="position:absolute;top:10px;right:14px;font-size:22px;opacity:.1;user-select:none;">✈</div>
    <span style="font-family:'Dancing Script',cursive;font-size:62px;color:#C4613A;line-height:1;display:inline-block;transform:rotate(-2deg);">Travel</span>
    <div style="font-family:'Playfair Display',serif;font-size:46px;font-weight:700;color:#1A5B6A;letter-spacing:8px;text-transform:uppercase;line-height:1;margin-top:3px;">ITINERARY</div>
    <div style="display:flex;align-items:center;gap:10px;margin:14px 16px;">
      <div style="flex:1;height:1px;background:rgba(26,91,106,.2);"></div>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="#C9A84C"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
      <div style="flex:1;height:1px;background:rgba(26,91,106,.2);"></div>
    </div>
    <div style="font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:#1A5B6A;line-height:1.25;letter-spacing:.3px;padding:0 8px;">${esc(data.tourName || 'Your Tour Name')}</div>
    <div style="display:flex;align-items:center;gap:10px;margin:14px 16px;">
      <div style="flex:1;height:1px;background:rgba(26,91,106,.2);"></div>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="#C9A84C"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
      <div style="flex:1;height:1px;background:rgba(26,91,106,.2);"></div>
    </div>
    <div style="font-size:11.5px;color:#7a6a58;">Prepared exclusively for</div>
    <div style="font-size:26px;font-weight:800;color:#1A5B6A;font-family:'Playfair Display',serif;margin-top:4px;line-height:1.15;">${esc(data.clientName || 'Valued Guest')}</div>
    ${(data.startDate||data.endDate) ? `<div style="font-size:13px;color:#9a8a78;margin-top:5px;font-weight:500;">${esc(data.startDate||'')}${data.startDate&&data.endDate?' → ':''}${esc(data.endDate||'')}</div>` : ''}
    ${(data.routeFrom||data.routeTo) ? `<div style="font-size:15px;color:#C4613A;font-weight:700;margin-top:6px;">🌐 ${esc(data.routeFrom||'')}${data.routeFrom&&data.routeTo?' → ':''}${esc(data.routeTo||'')}</div>` : ''}
  </div>

  <!-- Days -->
  ${daysHtml}

  <!-- Costs -->
  ${costsHtml}

  <!-- Package Details -->
  <div style="background:#F5EDE0;border-top:2px solid rgba(26,91,106,.15);padding:18px 20px 16px;">
    <div style="font-size:9.5px;font-weight:700;color:#1A5B6A;text-transform:uppercase;letter-spacing:1.8px;margin-bottom:14px;display:flex;align-items:center;gap:10px;">
      <div style="flex:1;height:1px;background:rgba(26,91,106,.2);"></div><span>Package Details</span>
      <div style="flex:1;height:1px;background:rgba(26,91,106,.2);"></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div style="background:white;border-radius:8px;padding:14px;border:1px solid rgba(5,150,105,.2);border-top:3px solid #059669;">
        <div style="font-size:9.5px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">✓ Package Included</div>
        ${included}
      </div>
      <div style="background:white;border-radius:8px;padding:14px;border:1px solid rgba(220,38,38,.2);border-top:3px solid #DC2626;">
        <div style="font-size:9.5px;font-weight:700;color:#DC2626;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">✗ Not Included</div>
        ${excluded}
      </div>
    </div>
  </div>

  <!-- Policies -->
  <div style="background:#F5EDE0;border-top:1px dashed rgba(0,0,0,.1);padding:16px 20px 18px;">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
      <div style="background:white;border-radius:8px;padding:14px;border:1px solid rgba(26,91,106,.15);border-top:3px solid #1A5B6A;">
        <div style="font-size:9.5px;font-weight:700;color:#1A5B6A;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">💳 Payment Policy</div>
        <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:8px;font-size:11.5px;color:#374151;"><div style="background:#1A5B6A;color:white;border-radius:50%;width:17px;height:17px;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;flex-shrink:0;margin-top:1px;">1</div>Pay 50% token to confirm &amp; hold package</div>
        <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:10px;font-size:11.5px;color:#374151;"><div style="background:#1A5B6A;color:white;border-radius:50%;width:17px;height:17px;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;flex-shrink:0;margin-top:1px;">2</div>Remaining 50% due 30 days before travel</div>
        <div style="background:#FEF9EC;border:1px solid #F6C94E;border-radius:6px;padding:8px 10px;font-size:10.5px;color:#78350F;"><strong>Accepted:</strong> Bank transfer · Online payment · QR code</div>
      </div>
      <div style="background:white;border-radius:8px;padding:14px;border:1px solid rgba(220,38,38,.15);border-top:3px solid #DC2626;">
        <div style="font-size:9.5px;font-weight:700;color:#DC2626;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">⚠ Cancellation Policy</div>
        ${[['Holding amount','Non-refundable'],['Before 1 month','50% charged'],['Before 15 days','70% + flight/visa'],['Before 10 days','100% charged']].map(([when,charge],i)=>`<div style="display:flex;justify-content:space-between;font-size:11px;padding:5px 0;${i<3?'border-bottom:1px solid #FEF2F2;':''}"><span style="color:#6B7280;">${when}</span><span style="font-weight:700;color:#DC2626;">${charge}</span></div>`).join('')}
        <div style="margin-top:8px;font-size:10px;color:#9CA3AF;font-style:italic;">Cancellations must be notified via email only.</div>
      </div>
    </div>
    <div style="background:white;border-radius:8px;padding:14px;border:1px solid rgba(0,0,0,.07);">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
        <div>
          <div style="font-size:9.5px;font-weight:700;color:#1A5B6A;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">💰 Refund Policy</div>
          <div style="font-size:11.5px;color:#374151;display:flex;gap:7px;align-items:flex-start;margin-bottom:5px;"><span style="color:#DC2626;font-size:10px;margin-top:2px;">✗</span>Token amount is non-refundable</div>
          <div style="font-size:11.5px;color:#374151;display:flex;gap:7px;align-items:flex-start;"><span style="color:#059669;font-size:10px;margin-top:2px;">✓</span>Approved refunds within 15 working days</div>
        </div>
        <div>
          <div style="font-size:9.5px;font-weight:700;color:#C4613A;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">📋 Important Note</div>
          <div style="font-size:11px;color:#6B7280;line-height:1.65;"><strong style="color:#DC2626;">NOTE:</strong> Anything not listed in inclusions is excluded. Amendments within 2–3 days before travel may incur additional charges.</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div style="background:#1A5B6A;color:white;padding:15px 20px;">
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-size:9.5px;color:rgba(255,255,255,.55);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:5px;">Rate Per Person</div>
        <div style="font-size:28px;font-weight:900;color:#F5EDE0;line-height:1;">${formatCurrency(ppp)}</div>
        <div style="font-size:9.5px;color:rgba(255,255,255,.4);margin-top:3px;">${data.paxCount} pax</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:9.5px;color:rgba(255,255,255,.55);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:5px;">Group Total</div>
        <div style="font-size:24px;font-weight:800;color:#C9A84C;line-height:1;">${formatCurrency(total)}</div>
        <div style="font-size:9.5px;color:rgba(255,255,255,.4);margin-top:3px;">50% deposit: ${formatCurrency(deposit)}</div>
      </div>
    </div>
    <div style="margin-top:10px;padding-top:9px;border-top:1px solid rgba(255,255,255,.12);text-align:center;font-size:9.5px;color:rgba(255,255,255,.3);">help@touristleader.com · +91 080 6218-2211 · www.touristleader.com</div>
  </div>
</div>`
}
