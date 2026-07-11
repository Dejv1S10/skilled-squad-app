// Definice objednávkových formulářů pro všechny kategorie.
// Každá kategorie má podkategorie (pilulky na úvodní stránce)
// a sadu klikacích otázek — z nich se automaticky poskládá stránka objednávky.
// Cíl: zákazník skoro nic nepíše, jen kliká (styl TaskRabbit).

export interface TaskOption {
  id: string;
  label: string;
  desc?: string; // krátký popisek pod hlavním textem volby
}

export interface TaskQuestion {
  id: string;
  label: string;      // znění otázky
  yesNo?: boolean;    // true = otázka Ano/Ne (zelená fajfka / červený křížek)
  options: TaskOption[];
}

export interface TaskSubcategory {
  id: string;
  name: string;
}

export interface TaskFormConfig {
  subcategories: TaskSubcategory[];
  questions: TaskQuestion[];
}

// Připravené opakující se otázky, ať se nemusí psát pořád dokola.
const ANO_NE: TaskOption[] = [
  { id: 'yes', label: 'Ano' },
  { id: 'no', label: 'Ne' },
];

const JAK_DLOUHO: TaskQuestion = {
  id: 'duration',
  label: 'Jak dlouho?',
  options: [
    { id: '0-2', label: '0–2 hodiny', desc: 'Drobná práce' },
    { id: '3-4', label: '3–4 hodiny', desc: 'Střední práce' },
    { id: '4+', label: '4+ hodin', desc: 'Velká práce' },
  ],
};

const JAK_CASTO: TaskQuestion = {
  id: 'frequency',
  label: 'Jak často?',
  options: [
    { id: 'once', label: 'Jednorázově' },
    { id: 'regular', label: 'Pravidelně' },
  ],
};

// Formuláře jednotlivých kategorií.
// (Stěhování tu není — má svou vlastní stránku s trasou na mapě.)
export const taskForms: Record<string, TaskFormConfig> = {
  handyman: {
    subcategories: [
      { id: 'montaz-nabytku', name: 'Montáž nábytku' },
      { id: 'malovani', name: 'Malování' },
      { id: 'opravy', name: 'Opravy v domácnosti' },
      { id: 'instalater', name: 'Instalatérské práce' },
      { id: 'elektrikar', name: 'Elektrikářské práce' },
    ],
    questions: [
      { id: 'tools', label: 'Má Šikula přinést vlastní nářadí?', yesNo: true, options: ANO_NE },
      JAK_DLOUHO,
    ],
  },

  cleaning: {
    subcategories: [
      { id: 'bezny', name: 'Běžný úklid' },
      { id: 'generalni', name: 'Generální úklid' },
      { id: 'po-stavbe', name: 'Úklid po stavbě' },
      { id: 'okna', name: 'Mytí oken' },
    ],
    questions: [
      {
        id: 'size',
        label: 'Jak velký prostor?',
        options: [
          { id: 'small', label: '1+kk až 2+kk' },
          { id: 'medium', label: '3+kk až 4+kk' },
          { id: 'house', label: 'Dům' },
        ],
      },
      { id: 'supplies', label: 'Má Šikula přinést úklidové prostředky?', yesNo: true, options: ANO_NE },
      JAK_CASTO,
    ],
  },

  garden: {
    subcategories: [
      { id: 'sekani', name: 'Sekání trávy' },
      { id: 'ploty', name: 'Stříhání živých plotů' },
      { id: 'udrzba', name: 'Údržba zahrady' },
      { id: 'vysadba', name: 'Výsadba' },
    ],
    questions: [
      {
        id: 'size',
        label: 'Jak velká zahrada?',
        options: [
          { id: 'small', label: 'Malá', desc: 'do 200 m²' },
          { id: 'medium', label: 'Střední', desc: '200–1000 m²' },
          { id: 'large', label: 'Velká', desc: 'nad 1000 m²' },
        ],
      },
      { id: 'tools', label: 'Má Šikula přinést vlastní nářadí?', yesNo: true, options: ANO_NE },
    ],
  },

  craft: {
    subcategories: [
      { id: 'truhlar', name: 'Truhlářské práce' },
      { id: 'zamecnik', name: 'Zámečnictví' },
      { id: 'svarovani', name: 'Svařování' },
      { id: 'podlahy', name: 'Pokládka podlah' },
    ],
    questions: [
      { id: 'material', label: 'Máte už materiál?', yesNo: true, options: ANO_NE },
      JAK_DLOUHO,
    ],
  },

  tech: {
    subcategories: [
      { id: 'wifi', name: 'Nastavení Wi-Fi' },
      { id: 'pc', name: 'Servis PC' },
      { id: 'smart-home', name: 'Smart home' },
      { id: 'tv', name: 'Montáž TV' },
    ],
    questions: [
      {
        id: 'place',
        label: 'Kde má pomoc proběhnout?',
        options: [
          { id: 'home', label: 'U mě doma' },
          { id: 'remote', label: 'Na dálku', desc: 'po telefonu / online' },
        ],
      },
      JAK_DLOUHO,
    ],
  },

  care: {
    subcategories: [
      { id: 'seniori', name: 'Péče o seniory' },
      { id: 'deti', name: 'Hlídání dětí' },
      { id: 'domacnost', name: 'Pomoc v domácnosti' },
      { id: 'doucovani', name: 'Doučování' },
    ],
    questions: [JAK_CASTO],
  },

  auto: {
    subcategories: [
      { id: 'myti', name: 'Mytí auta' },
      { id: 'pneu', name: 'Přezutí pneumatik' },
      { id: 'diagnostika', name: 'Diagnostika' },
      { id: 'opravy', name: 'Drobné opravy' },
    ],
    questions: [
      { id: 'come-to-me', label: 'Má Šikula přijet k vám?', yesNo: true, options: ANO_NE },
    ],
  },

  events: {
    subcategories: [
      { id: 'organizace', name: 'Organizace akcí' },
      { id: 'home-staging', name: 'Home staging' },
      { id: 'dekorace', name: 'Dekorace' },
      { id: 'catering', name: 'Catering' },
    ],
    questions: [
      {
        id: 'guests',
        label: 'Kolik hostů?',
        options: [
          { id: 'small', label: 'Do 20' },
          { id: 'medium', label: '20–50' },
          { id: 'large', label: '50+' },
        ],
      },
    ],
  },

  b2b: {
    subcategories: [
      { id: 'facility', name: 'Facility management' },
      { id: 'udrzba', name: 'Firemní údržba' },
      { id: 'uklid', name: 'Kancelářský úklid' },
      { id: 'it-sprava', name: 'IT správa' },
    ],
    questions: [JAK_CASTO],
  },
};
