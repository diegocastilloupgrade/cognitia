export interface Stimulus {
  id: string;
  itemCode: string;
  assetPath: string;
  label?: string;
}

export const STIMULI_DEMO: Stimulus[] = [
  // --- 3.1 Memoria visual ---
  {
    id: 'mv-01',
    itemCode: '3.1',
    assetPath: 'assets/stimuli/item-3.1-memory-visual/01_guitarra.png',
    label: 'Guitarra'
  },
  {
    id: 'mv-02',
    itemCode: '3.1',
    assetPath: 'assets/stimuli/item-3.1-memory-visual/02_zapato.png',
    label: 'Zapato'
  },
  {
    id: 'mv-03',
    itemCode: '3.1',
    assetPath: 'assets/stimuli/item-3.1-memory-visual/03_moto.png',
    label: 'Moto'
  },
  {
    id: 'mv-04',
    itemCode: '3.1',
    assetPath: 'assets/stimuli/item-3.1-memory-visual/04_jirafa.png',
    label: 'Jirafa'
  },

  // --- 3.4.1 Interferencia numérica ---
  {
    id: 'ni-01',
    itemCode: '3.4.1',
    assetPath: 'assets/stimuli/item-3.4.1-number-interference/carta 1-1.png',
    label: 'Carta 1-1'
  },
  {
    id: 'ni-02',
    itemCode: '3.4.1',
    assetPath: 'assets/stimuli/item-3.4.1-number-interference/carta 2-1.png',
    label: 'Carta 2-1'
  },
  {
    id: 'ni-03',
    itemCode: '3.4.1',
    assetPath: 'assets/stimuli/item-3.4.1-number-interference/carta 3-1.png',
    label: 'Carta 3-1'
  },

  // --- 3.4.2 Go / No-Go ---
  {
    id: 'gng-01',
    itemCode: '3.4.2',
    assetPath: 'assets/stimuli/item-3.4.2-go-no-go/diapositiva1.png',
    label: 'Diapositiva 1'
  },
  {
    id: 'gng-02',
    itemCode: '3.4.2',
    assetPath: 'assets/stimuli/item-3.4.2-go-no-go/diapositiva2.png',
    label: 'Diapositiva 2'
  },
  {
    id: 'gng-03',
    itemCode: '3.4.2',
    assetPath: 'assets/stimuli/item-3.4.2-go-no-go/diapositiva3.png',
    label: 'Diapositiva 3'
  }
];
