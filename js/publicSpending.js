/**
 * Public Sector Spending Data
 * How money actually flows through the Danish public sector.
 *
 * Sources: Statsregnskabet, Økonomistyrelsen, Finansministeriet,
 * Moderniseringsstyrelsen, Rigsrevisionen reports.
 */

/**
 * Budget vs. Actual Spending by sector (most recent complete year: 2024)
 * Finansloven (budget) vs. Statsregnskabet (actual accounts)
 * All figures in billions DKK.
 *
 * Danish appropriation rules (bevillingsregler):
 * - State institutions may carry forward up to 2% of their appropriation
 *   to the next year (opsparing)
 * - Regions and municipalities have strict balanced-budget rules (kassekreditregel)
 *   but can carry reserves quarter to quarter within a fiscal year
 * - Unused appropriations above the 2% limit lapse (bortfalder)
 */
const BUDGET_VS_ACTUAL = [
    {
        sector: "Sundhedsvæsen",
        icon: "🏥",
        budgetBn: 203.5,
        actualBn: 199.8,
        color: "#ef4444",
        note: "Underforbrug skyldes primært forsinkede anlægsprojekter (sygehusbyggerier) og ubesatte stillinger."
    },
    {
        sector: "Social beskyttelse",
        icon: "🤝",
        budgetBn: 325.0,
        actualBn: 318.6,
        color: "#f97316",
        note: "Overførsler følger automatisk konjunktur. Lavere ledighed end forventet = lavere dagpengeudgifter."
    },
    {
        sector: "Uddannelse",
        icon: "🎓",
        budgetBn: 160.0,
        actualBn: 155.2,
        color: "#3b82f6",
        note: "Underforbrug pga. færre SU-modtagere end budgetteret og forsinkede universitetsprojekter."
    },
    {
        sector: "Forsvar",
        icon: "🛡️",
        budgetBn: 49.0,
        actualBn: 43.7,
        color: "#6366f1",
        note: "Kronisk underforbrug. Forsinkede materielanskaffelser og problemer med at rekruttere."
    },
    {
        sector: "Transport & infrastruktur",
        icon: "🛤️",
        budgetBn: 65.7,
        actualBn: 58.9,
        color: "#06b6d4",
        note: "Store anlægsprojekter forsinkes regelmæssigt. Femern-forbindelsen og Signalprogrammet bag tidsplan."
    },
    {
        sector: "Miljø & klima",
        icon: "🌿",
        budgetBn: 61.8,
        actualBn: 56.4,
        color: "#22c55e",
        note: "Grøn omstilling er budgetteret ambitiøst, men implementeringen halter. CO₂-fangst-projekter forsinkede."
    },
    {
        sector: "Politi & retsvæsen",
        icon: "⚖️",
        budgetBn: 25.8,
        actualBn: 25.1,
        color: "#8b5cf6",
        note: "Relativt tæt match. Politi bruger næsten hele bevillingen."
    },
    {
        sector: "Offentlig administration",
        icon: "🏛️",
        budgetBn: 82.5,
        actualBn: 80.8,
        color: "#78716c",
        note: "IT-systemer og digitaliseringsprojekter driver det meste af underforbruget."
    },
];

/**
 * Operational cost breakdown — how money is actually spent INSIDE the public sector.
 * When a sector receives its budget, here's the typical split.
 * Based on aggregated data from Statsregnskabet and Moderniseringsstyrelsen.
 */
const OPERATIONAL_BREAKDOWN = {
    // Average across all public sector
    overall: {
        label: "Gennemsnit for hele den offentlige sektor",
        salaries: 52.0,        // Lønninger
        transfers: 22.0,       // Overførsler til borgere (i relevante sektorer)
        buildings: 6.5,        // Bygninger, husleje, vedligeholdelse
        equipment: 4.0,        // Udstyr, materialer, inventar
        it: 5.5,               // IT-systemer, licenser, drift
        consultants: 4.5,      // Konsulenter & eksterne rådgivere
        other: 5.5,            // Transport, rejser, diverse
    },

    // Per sector - where the money goes inside each
    healthcare: {
        label: "Sundhedsvæsen",
        icon: "🏥",
        salaries: 64.0,
        medicine: 12.0,
        buildings: 8.0,
        equipment: 7.0,
        it: 4.0,
        consultants: 1.5,
        other: 3.5,
        customLabels: {
            medicine: "Medicin & behandlingsudstyr",
        }
    },
    education: {
        label: "Uddannelse",
        icon: "🎓",
        salaries: 72.0,
        su: 8.0,
        buildings: 7.0,
        equipment: 3.5,
        it: 5.0,
        consultants: 1.5,
        other: 3.0,
        customLabels: {
            su: "SU-udbetalinger",
        }
    },
    administration: {
        label: "Offentlig administration",
        icon: "🏛️",
        salaries: 48.0,
        buildings: 8.0,
        equipment: 2.5,
        it: 18.0,
        consultants: 14.0,
        other: 9.5,
    },
    defense: {
        label: "Forsvar",
        icon: "🛡️",
        salaries: 42.0,
        materiel: 25.0,
        buildings: 10.0,
        equipment: 8.0,
        it: 5.0,
        consultants: 3.0,
        other: 7.0,
        customLabels: {
            materiel: "Militært materiel & våben",
        }
    },
};

/**
 * Default operational cost labels (Danish)
 */
const COST_LABELS = {
    salaries: "Lønninger til ansatte",
    transfers: "Overførsler til borgere",
    buildings: "Bygninger & vedligeholdelse",
    equipment: "Udstyr & materialer",
    it: "IT-systemer & digitalisering",
    consultants: "Konsulenter & ekstern rådgivning",
    other: "Øvrige driftsudgifter",
    medicine: "Medicin & behandlingsudstyr",
    su: "SU-udbetalinger",
    materiel: "Militært materiel & våben",
};

const COST_COLORS = {
    salaries: "#3b82f6",
    transfers: "#f97316",
    buildings: "#8b5cf6",
    equipment: "#06b6d4",
    it: "#eab308",
    consultants: "#ef4444",
    other: "#94a3b8",
    medicine: "#22c55e",
    su: "#ec4899",
    materiel: "#6366f1",
};

/**
 * Quarterly spending flow — how money moves through the fiscal year.
 * Danish public sector has a predictable pattern:
 * Q1-Q3 underspend, Q4 rush to use remaining budgets.
 *
 * Data pattern based on Økonomistyrelsen quarterly reports.
 * Percentages show what portion of annual budget is spent per quarter.
 */
const QUARTERLY_FLOW = {
    pattern: [
        {
            quarter: "Q1 (jan-mar)",
            percentSpent: 22,
            cumulative: 22,
            note: "Langsom start. Nye bevillinger skal fordeles, ansættelsesprocesser kører, udbud igangsættes.",
            status: "under"
        },
        {
            quarter: "Q2 (apr-jun)",
            percentSpent: 24,
            cumulative: 46,
            note: "Drift normaliserer sig. Anlægsprojekter kommer i gang. Stadig under gennemsnit.",
            status: "under"
        },
        {
            quarter: "Q3 (jul-sep)",
            percentSpent: 23,
            cumulative: 69,
            note: "Sommerperiode. Lavere aktivitet pga. ferie. Projekter bag tidsplan begynder at presse.",
            status: "under"
        },
        {
            quarter: "Q4 (okt-dec)",
            percentSpent: 31,
            cumulative: 100,
            note: "\"Brug-det-eller-mist-det\" kvartal. Hastige indkøb, kontraktunderskrifter og konsulenthonorarer stiger markant. 2%-reglen presser institutioner til at bruge restbudget.",
            status: "over"
        }
    ],
    carryoverExplanation: "Staten tillader institutioner at overføre op til 2% af deres bevilling til næste år. Beløb derudover bortfalder. Det skaber et perverst incitament til at bruge penge i Q4 — også selvom der ikke er et reelt behov. Regionerne og kommunerne har kassekreditreglen, som kræver at de har likviditet nok ved årets udgang, men kan svinge kvartal for kvartal.",
    totalCarryoverBn: 18.5, // Estimated annual carryover in billions
};

/**
 * Known spending issues — concrete examples of waste, overhead and inefficiency.
 * Based on Rigsrevisionen reports, media coverage, and public audits.
 */
const SPENDING_ISSUES = [
    {
        icon: "💻",
        title: "IT-skandaler",
        amount: "Over 10 mia. kr. de seneste 10 år",
        examples: [
            "Polsag/POLSAS: Politiets nye sagsbehandlingssystem — flere milliarder kr. i budget-overskridelser og forsinkelser.",
            "Sundhedsplatformen (Region Hovedstaden): Ca. 3,8 mia. kr. Stærkt kritiseret af læger og sygeplejersker for dårlig brugervenlighed.",
            "EFI (Et Fælles Inddrivelsessystem): Skats inddrivelsessystem fejlede totalt. Kostede ca. 600 mio. kr. og blev skrottet. Tab på >100 mia. kr. i uinddrevet gæld.",
            "Rejsekortet: Kostede over 2 mia. kr. — langt over det oprindelige budget."
        ],
        severity: "high"
    },
    {
        icon: "🧑‍💼",
        title: "Konsulentforbrug",
        amount: "Ca. 12-15 mia. kr./år på eksterne konsulenter",
        examples: [
            "Staten bruger årligt 4-5 mia. kr. på konsulenter (McKinsey, Deloitte, PwC, Accenture m.fl.).",
            "Kommunerne bruger yderligere 8-10 mia. kr.",
            "Rigsrevisionen har gentagne gange kritiseret manglende konkurrenceudsættelse og for lange kontrakter.",
            "Mange konsulenthonorarer ligger 3-5x over hvad en fastansat ville koste for samme arbejde."
        ],
        severity: "high"
    },
    {
        icon: "🏗️",
        title: "Anlægsoverskridelser",
        amount: "Typisk 20-40% budgetoverskridelse",
        examples: [
            "Signalprogrammet (DSB/Banedanmark): Fra 22 mia. til over 30 mia. kr. og forsinket med 7+ år.",
            "Supersygehuse: Nyt Aalborg Universitetshospital, Nyt OUH og andre — alle overskredet budget med milliarder.",
            "Femern-forbindelsen: Oprindeligt budget 55 mia. kr., nu estimeret til 80+ mia. kr.",
            "Cityringen (M3): Fra 15 mia. til 24+ mia. kr."
        ],
        severity: "high"
    },
    {
        icon: "📊",
        title: "Administrativ vækst",
        amount: "Antallet af offentlige ledere steget 30% på 15 år",
        examples: [
            "Danmark har ca. 800.000 offentligt ansatte — en af de højeste rater i verden pr. indbygger.",
            "Antallet af chefer og mellemledere er steget langt hurtigere end antallet af frontmedarbejdere.",
            "Dokumentationskrav og kontrol er steget markant — mere tid bruges på at rapportere end på kerneopgaven.",
            "Strukturreformen i 2007 lovede færre administratorer — resultatet blev det modsatte."
        ],
        severity: "medium"
    },
    {
        icon: "📅",
        title: "Q4-forbrug (\"december-feber\")",
        amount: "30-31% af årsbudgettet bruges i Q4",
        examples: [
            "Offentlige institutioner bruger uforholdsmæssigt meget i årets sidste kvartal.",
            "2%-overførselsreglen skaber incitament til at 'bruge op' for ikke at miste bevillingen.",
            "Konsulentkøb stiger markant i oktober-december.",
            "Rigsrevisionen har gentagne gange påpeget at indkøb i Q4 ofte har lavere kvalitet."
        ],
        severity: "medium"
    },
    {
        icon: "🔄",
        title: "Dobbeltadministration",
        amount: "Stat, regioner og 98 kommuner duplikerer opgaver",
        examples: [
            "Samme borger registreres i flere systemer der ikke taler sammen.",
            "Sundheds-IT: Regionerne har forskellige systemer der ikke er kompatible.",
            "Beskæftigelsesindsatsen: Kommuner, A-kasser og Jobnet overlapper.",
            "Kontrolinstanser kontrollerer hinanden — lag-på-lag af tilsyn."
        ],
        severity: "medium"
    },
];
