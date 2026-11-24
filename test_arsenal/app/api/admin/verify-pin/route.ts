import { NextResponse } from 'next/server';
import { z } from 'zod';

const pinSchema = z.object({
  pin: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pin } = pinSchema.parse(body);

    // Leemos la variable del servidor
    const serverPin = process.env.ADMIN_PIN;

    if (!serverPin) {
      return NextResponse.json({ error: 'PIN no configurado en el servidor' }, { status: 500 });
    }

    if (pin === serverPin) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Petición inválida' }, { status: 400 });
  }
}