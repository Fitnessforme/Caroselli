# Foto di repertorio

La libreria fotografica usa fotografie reali servite da Unsplash, non immagini generate con AI. Fonte e licenza: https://unsplash.com/license . Le foto sono di repertorio: non presentarle come dimostrazioni tecniche dei movimenti descritti, né come testimonianze o endorsement.

- Yoga e mobilità: https://images.unsplash.com/photo-1544367567-0f2fcb009e0b
- Allenamento in studio: https://images.unsplash.com/photo-1518611012118-696072aa579a
- Forza e allenamento: https://images.unsplash.com/photo-1517836357463-d25dfeac3438
- Respiro e benessere: https://images.unsplash.com/photo-1506126613408-eca07ce68773

Le foto sono incluse nel repository e servite dallo stesso sito dell'app. Il caricamento e l'esportazione non dipendono dall'accesso del browser a Unsplash o da CORS di terze parti. L'app segnala gli errori e impedisce il download di slide fotografiche incomplete. Le scelte, l'inquadratura e lo zoom sono salvati localmente insieme al progetto.

## Verifica

Tutte e sei le fonti hanno restituito immagini scaricabili via HTTPS con verifica TLS attiva. Le foto sono state ispezionate visivamente e incluse come asset JPEG in `src/assets/photos/`. Sono state verificate nel browser: caricamento delle sei foto, ritaglio, zoom, persistenza, cambio stile e ZIP con sei PNG che corrispondono all'anteprima. Nessuna foto è stata generata con AI.

- Mobilità sul tappetino: https://images.unsplash.com/photo-1599901860904-17e6ed7083a0
- Equilibrio e movimento: https://images.unsplash.com/photo-1599447421416-3414500d18a5

## Immagini fotorealistiche AI

Le sei voci AI (Stretching, Respirazione, Spalle, Anche, Caviglie, Energia) sono state generate con AI su richiesta dell’utente, non sono fotografie di persone reali. Sono incluse in `src/assets/ai-photos/` e identificate come AI sia nel selettore sia sulle slide esportate. Sono immagini editoriali, non dimostrazioni tecniche certificate. Le fotografie di repertorio restano disponibili nelle altre voci.
