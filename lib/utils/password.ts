/**
 * Client-safe password utility — no server imports.
 */

export function generatePassword(): string {
    const upper   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower   = 'abcdefghijklmnopqrstuvwxyz';
    const digits  = '0123456789';
    const special = '@#$!';
    const all     = upper + lower + digits + special;
    const rand    = (s: string) => s[Math.floor(Math.random() * s.length)];
    const pass    = [
        rand(upper), rand(lower), rand(digits), rand(special),
        ...Array.from({ length: 6 }, () => rand(all)),
    ];
    return pass.sort(() => Math.random() - 0.5).join('');
}
