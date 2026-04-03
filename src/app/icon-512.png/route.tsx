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
          fontSize: 180,
          fontWeight: 'bold',
          borderRadius: 100,
        }}
      >
        IA
      </div>
    ),
    { width: 512, height: 512 }
  );
}
