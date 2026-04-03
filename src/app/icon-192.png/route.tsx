import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#16a34a',
          color: 'white',
          fontSize: 64,
          fontWeight: 'bold',
          borderRadius: 40,
        }}
      >
        IA
      </div>
    ),
    { width: 192, height: 192 }
  );
}
