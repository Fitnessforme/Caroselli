# Foto di repertorio

La libreria fotografica usa fotografie reali servite da Unsplash, non immagini generate con AI. Fonte e licenza: https://unsplash.com/license . Le foto sono di repertorio: non presentarle come dimostrazioni tecniche dei movimenti descritti, né come testimonianze o endorsement.

- Yoga e mobilità: https://images.unsplash.com/photo-1544367567-0f2fcb009e0b
- Allenamento in studio: https://images.unsplash.com/photo-1518611012118-696072aa579a
- Forza e allenamento: https://images.unsplash.com/photo-1517836357463-d25dfeac3438
- Respiro e benessere: https://images.unsplash.com/photo-1506126613408-eca07ce68773

Le foto vengono caricate via HTTPS con CORS per consentire l'esportazione canvas. L'app segnala gli errori e impedisce il download di slide fotografiche senza le immagini caricate. Le scelte, l'inquadratura e lo zoom sono salvati localmente insieme al progetto.

## Verifica ancora necessaria

Il caricamento dalle fonti reali e la disponibilità attuale delle foto non sono ancora stati verificati in questo ambiente: il proxy di rete restituisce 403 per images.unsplash.com. Le aggiunte ai domini consentiti sono state salvate nella bozza di configurazione. Dopo l'applicazione, verificare il caricamento di ogni foto, il ritaglio e lo ZIP esportato prima della pubblicazione di questa funzionalità.
