import { ImageResponse } from 'next/og'

export const alt = 'Beyond Campus — Off-campus placements for non-tech students'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0B0B0F',
          padding: '64px 72px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -180,
            right: -120,
            width: 560,
            height: 560,
            borderRadius: 9999,
            background:
              'radial-gradient(circle, rgba(79,124,255,0.45) 0%, rgba(123,97,255,0.25) 45%, rgba(11,11,15,0) 70%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -200,
            left: -140,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background:
              'radial-gradient(circle, rgba(123,97,255,0.35) 0%, rgba(79,124,255,0.18) 45%, rgba(11,11,15,0) 70%)',
            display: 'flex',
          }}
        />
        <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, color: '#ffffff' }}>
          Beyond
          <span
            style={{
              background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Campus
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: -2,
              maxWidth: 950,
            }}
          >
            Land your dream role without campus placements
          </div>
          <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.55)', maxWidth: 880 }}>
            Consulting · Finance · Marketing · Founder&apos;s Office — off-campus, for non-tech students
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            paddingTop: 28,
          }}
        >
          <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.5)', letterSpacing: 4 }}>
            BEYOND-CAMPUS.IN
          </div>
          <div
            style={{
              fontSize: 22,
              color: '#ffffff',
              background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)',
              padding: '12px 28px',
              borderRadius: 9999,
              display: 'flex',
            }}
          >
            Start free →
          </div>
        </div>
      </div>
    ),
    size
  )
}
