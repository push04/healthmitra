import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    // MOCK DATA MODE: Do absolutely nothing, just pass through
    return NextResponse.next({
        request,
    });
}
