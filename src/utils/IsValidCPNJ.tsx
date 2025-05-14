export default function isValidCNPJ(cnpj: string): boolean {
    // Remove caracteres não numéricos
    cnpj = cnpj.replace(/[^\d]+/g, '');

    if (cnpj.length !== 14) return false;

    // Elimina CNPJs inválidos conhecidos
    if (/^(.)\1+$/.test(cnpj)) return false;

    let t = cnpj.length - 2,
        d = cnpj.substring(t),
        d1 = parseInt(d.charAt(0)),
        d2 = parseInt(d.charAt(1)),
        calc = (x: number) => {
            let n = 0;
            for (let i = 0, j = x; i < t; i++, j--) {
                n += parseInt(cnpj.charAt(i)) * j;
                if (j === 2) j = 10;
            }
            return (n % 11 < 2 ? 0 : 11 - (n % 11));
        };
    return calc(t + 1) === d1 && calc(t + 2) === d2;
}