export const palettes = [
  { name: 'Lime studio', bg: '#192b25', accent: '#d5fa62', text: '#f7f8ed' },
  { name: 'Terracotta', bg: '#422d2b', accent: '#ffae8f', text: '#fff6ee' },
  { name: 'Blu elettrico', bg: '#19294c', accent: '#a8c8ff', text: '#f3f7ff' },
  { name: 'Lavanda', bg: '#30273f', accent: '#d6b9ff', text: '#faf5ff' },
];
export function generateSlides(topic, count = 5) {
  const subject = topic.trim();
  if (!subject) throw new Error('Inserisci un argomento per iniziare.');
  const ideas = [
    ['Parti dalle basi', `Per esplorare “${subject}”, scegli un obiettivo concreto e sostenibile. Il primo passo è capire da dove parti, senza confrontarti con gli altri.`],
    ['La tecnica viene prima', 'Dedica tempo a imparare i movimenti. Parti con un’intensità gestibile e chiedi supporto a un professionista quando hai dubbi.'],
    ['Costanza, senza fretta', 'Crea una routine compatibile con le tue giornate. Piccoli passi ripetuti nel tempo sono più utili di una partenza troppo intensa.'],
    ['Il recupero conta', 'Alterna attività e riposo. Ascolta le tue sensazioni e ricorda che sonno, alimentazione e recupero fanno parte del percorso.'],
    ['Osserva e adatta', 'Annota come ti senti e i progressi che noti. Adatta gradualmente la routine alle tue esigenze, senza inseguire risultati immediati.'],
    ['Evita il tutto o niente', 'Una giornata diversa dal previsto non cancella il percorso. Riparti dal prossimo piccolo passo possibile.'],
  ];
  const specific = /mobilit|stretch|scrivania|flessibil/i.test(subject) ? [
    ['Muoviti con controllo', 'Scegli movimenti lenti per spalle, anche e caviglie. Rimani in un’ampiezza confortevole, senza forzare le posizioni.'],
    ['Fai spazio alle pause', 'Se rimani a lungo alla scrivania, inserisci brevi pause per alzarti e cambiare posizione durante la giornata.'],
    ['Respira e ascoltati', 'Accompagna il movimento con una respirazione tranquilla. In presenza di dolore, interrompi e confrontati con un professionista.'],
  ] : /forza|pesi|muscol|palestra/i.test(subject) ? [
    ['Prepara il movimento', 'Inizia con un riscaldamento graduale e qualche ripetizione leggera degli esercizi che eseguirai.'],
    ['Scegli un carico gestibile', 'Usa un carico che ti permetta di controllare ogni ripetizione. Cura la tecnica prima di aumentare la difficoltà.'],
    ['Lascia spazio al recupero', 'Programma pause adeguate tra le sedute e adatta il volume di lavoro al tuo livello e alle tue sensazioni.'],
  ] : /corsa|cardio|cammin|resistenza/i.test(subject) ? [
    ['Trova il tuo ritmo', 'Parti a un’intensità comoda. Per le uscite facili, cerca un ritmo che ti permetta di parlare senza affanno.'],
    ['Aumenta gradualmente', 'Costruisci la durata delle uscite con piccoli incrementi. Se sei all’inizio, alterna tratti di cammino e attività più intensa.'],
    ['Varia il percorso', 'Scegli percorsi adatti al tuo livello e condizioni confortevoli. Prevedi tempo per recuperare tra le uscite.'],
  ] : /aliment|nutriz|protein|dieta/i.test(subject) ? [
    ['Punta sulla varietà', 'Alterna alimenti diversi e costruisci pasti adatti alle tue esigenze. Evita regole rigide basate su singoli alimenti.'],
    ['Organizza la settimana', 'Pianifica qualche pasto semplice e una lista della spesa realistica. La praticità aiuta a mantenere le abitudini.'],
    ['Scegli un supporto qualificato', 'Per un piano alimentare personale, rivolgiti a un professionista abilitato, soprattutto in presenza di esigenze cliniche.'],
  ] : null;
  if (specific) ideas.splice(0, specific.length, ...specific);
  return [{title: subject, body: 'Una guida semplice per muoverti meglio.\nUn passo alla volta.', label: 'LA TUA GUIDA FITNESS'}, ...ideas.slice(0, count - 2).map(([title, body])=>({title, body, label: 'METTILO IN PRATICA'})), {title: 'Il prossimo passo\ninizia da te.', body: `Qual è la tua esperienza con ${subject.toLocaleLowerCase('it')}?\nSalva questa guida e raccontacelo nei commenti.`, label: 'SALVA · PROVA · CONDIVIDI'}];
}
export function wrapText(ctx, text, maxWidth) {
  return text.split('\n').flatMap(paragraph => {
    const lines = []; let line = '';
    for (const word of paragraph.split(/\s+/)) {
      if (line && ctx.measureText(`${line} ${word}`).width > maxWidth) { lines.push(line); line = ''; }
      if (line) line += ' ';
      for (const char of word) {
        if (line && ctx.measureText(line + char).width > maxWidth) { lines.push(line); line = ''; }
        line += char;
      }
    }
    lines.push(line); return lines;
  });
}
