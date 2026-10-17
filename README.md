# Forma — Caroselli fitness

Studio web in italiano per creare caroselli Instagram: argomento, 3–8 slide, modifica di testi e colori, firma del profilo e anteprima identica al PNG esportato. Download di singoli PNG 1080×1350 o di un archivio ZIP ordinato. Il progetto viene salvato automaticamente nel localStorage del browser.

La bozza nasce da modelli locali con suggerimenti per mobilità, forza, cardio e alimentazione; non usa un modello AI. I contenuti sono spunti editoriali generali da rivedere prima della pubblicazione. Non servono account o chiavi API. Il salvataggio locale non sincronizza dispositivi e viene perso cancellando i dati del sito. Font web opzionali da Google Fonts, con fallback di sistema.

## Sviluppo

Richiede Node.js 20.19+ o 22.12+ (verificato con Node 24).

```sh
cd /workspace/Caroselli
npm ci --cache /workspace/.npm --no-audit --no-fund
npm run dev -- --port 5173
```

```sh
npm test
npm run build
```

La build statica è in `dist/`, pubblicabile su un hosting statico. `npm run preview -- --port 4173` permette di verificarla localmente.

## Verifiche eseguite

- Test Node su numero di slide e impaginazione del testo.
- Build di produzione Vite.
- Browser Chromium: generazione di 8 slide, modifica, palette, persistenza dopo reload, navigazione e assenza di overflow su viewport mobile da 390 px.
- Download ZIP con 8 immagini PNG valide, ognuna da 1080×1350 px, e download singolo.

Nessun backend, database o servizio esterno è necessario per usare l’editor e scaricare le immagini.

## Pubblicazione su GitHub Pages

In GitHub, apri **Settings → Pages → Build and deployment → Source** e scegli **GitHub Actions**. Il workflow `.github/workflows/pages.yml` verifica e pubblica l'app a ogni push su `main`; è anche avviabile da **Actions → Pubblica Forma su GitHub Pages → Run workflow**. La configurazione Vite usa percorsi relativi per supportare il percorso `/Caroselli/`.

L'indirizzo previsto dopo una pubblicazione riuscita è `https://fitnessforme.github.io/Caroselli/`. Per repository privati, la disponibilità di Pages dipende dal piano GitHub. La pubblicazione dell'ambiente Codex e quella del sito GitHub Pages sono operazioni separate.

## Grafica illustrata

L'editor usa ora un modello con sfondi alternati, titoli grandi e sei illustrazioni fitness locali. La palette **Fucsia e bianco** è quella iniziale per i nuovi progetti; i progetti già salvati mantengono colori e testi. Nel pannello **Falla tua → Illustrazione** puoi scegliere una posa oppure lasciare la selezione automatica. Le illustrazioni sono asset generati inclusi nel repository, non richiedono chiamate AI durante l'uso. L'esportazione attende il caricamento degli asset e usa lo stesso renderer dell'anteprima. Anche le sei slide e lo ZIP nella galleria `mobilita/` sono stati aggiornati con questo modello.

### Edizione grafica

Il modello illustrato è stato ridisegnato con figure editoriali grandi, frecce e decorazioni, forme sovrapposte, riquadri di lettura e firma a contrasto. I testi rimangono modificabili. La dicitura in alto nell'app **CAROSELLI ILLUSTRATI · EDIZIONE GRAFICA** permette di distinguere la versione aggiornata. Le illustrazioni includono una palette rosa fissa; i controlli colore modificano sfondi, titoli e dettagli del layout.
