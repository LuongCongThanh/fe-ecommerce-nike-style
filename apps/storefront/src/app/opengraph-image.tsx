import { ImageResponse } from 'next/og';

export const alt = 'ANTIGRAVITY.STORE';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111111',
        color: '#ffffff',
      }}
    >
      <div style={{ display: 'flex', fontSize: 96, fontWeight: 900, letterSpacing: -4 }}>
        ANTIGRAVITY<span style={{ color: '#a3a3a3' }}>.STORE</span>
      </div>
      <div style={{ display: 'flex', fontSize: 32, color: '#a3a3a3', marginTop: 16 }}>Mua sắm trực tuyến nhanh chóng, tiện lợi</div>
    </div>,
    { ...size },
  );
}
