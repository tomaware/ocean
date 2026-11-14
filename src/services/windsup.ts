// Liens vers les pages spot de Winds-Up (Tom, 14/11). Les CGV de Winds-Up interdisent de reproduire ou diffuser leurs
// relevés sans autorisation écrite : le public n'a qu'un lien vers leur site (relevés décalés de 2 h sans abonnement).
// Les relevés eux-mêmes ne s'affichent que dans le mode perso de Tom (son abonnement, sur son appareil).
const PAGE: Record<string, string> = {
  'la-franqui': '1554-la-franqui-poste-des-coussoules',
  'la-grande-motte': '135-la-grande-motte',
  'le-ponant': '81-le-ponant',
  'port-camargue': '22-port-camargue',
  beauduc: '61-beauduc',
  'le-jai': '26-le-jai',
  almanarre: '2-almanarre-salin-des-pesquiers',
};
export const windsUpUrl = (spot: string): string | null => (PAGE[spot] ? `https://www.winds-up.com/spot/${PAGE[spot]}` : null);
