import { QuizCategory, Question } from '../types/quiz';

export const quizCategories: QuizCategory[] = [
    {
        id: 'legislative-basics',
        title: 'Bazele Legislative',
        description: 'Cunoștințe fundamentale despre legislația electorală din Republica Moldova',
        icon: '📚',
        questionCount: 10,
        estimatedTime: 15,
        difficulty: 'beginner'
    },
    {
        id: 'procedures',
        title: 'Proceduri Electorale',
        description: 'Proceduri și protocoale pentru desfășurarea alegerilor',
        icon: '📋',
        questionCount: 12,
        estimatedTime: 20,
        difficulty: 'intermediate'
    },
    {
        id: 'ethics',
        title: 'Etică și Integritate',
        description: 'Principii etice și standarde de integritate pentru funcționarii electorali',
        icon: '⚖️',
        questionCount: 8,
        estimatedTime: 12,
        difficulty: 'beginner'
    },
    {
        id: 'technology',
        title: 'Tehnologii Electorale',
        description: 'Utilizarea tehnologiilor moderne în procesul electoral',
        icon: '💻',
        questionCount: 10,
        estimatedTime: 15,
        difficulty: 'intermediate'
    }
];

// Question banks for each category
export const questionBanks: Record<string, Question[]> = {
    'legislative-basics': [
        {
            id: 'lb-1',
            text: 'Care este vârsta minimă pentru a vota în alegerile parlamentare din Republica Moldova?',
            options: ['16 ani', '18 ani', '21 ani', '25 ani'],
            correctAnswer: 1,
            explanation: 'Conform Constituției Republicii Moldova, dreptul de vot se exercită de la vârsta de 18 ani.'
        },
        {
            id: 'lb-2',
            text: 'Cine organizează și conduce alegerile în Republica Moldova?',
            options: ['Guvernul', 'Comisia Electorală Centrală', 'Parlamentul', 'Președintele'],
            correctAnswer: 1,
            explanation: 'Comisia Electorală Centrală este autoritatea centrală care organizează și conduce alegerile.'
        },
        {
            id: 'lb-3',
            text: 'Care este durata mandatului pentru deputații în Parlamentul Republicii Moldova?',
            options: ['2 ani', '3 ani', '4 ani', '5 ani'],
            correctAnswer: 2,
            explanation: 'Deputații sunt aleși pentru un mandat de 4 ani.'
        },
        {
            id: 'lb-4',
            text: 'Ce tip de sistem electoral este utilizat pentru alegerile parlamentare?',
            options: ['Majoritar', 'Proporțional', 'Mixt', 'Uninominal'],
            correctAnswer: 1,
            explanation: 'Republica Moldova utilizează sistemul proporțional pentru alegerile parlamentare.'
        },
        {
            id: 'lb-5',
            text: 'Care este pragul electoral pentru partidele politice în alegerile parlamentare?',
            options: ['3%', '4%', '5%', '6%'],
            correctAnswer: 2,
            explanation: 'Pragul electoral pentru partidele politice este de 5%.'
        },
        {
            id: 'lb-6',
            text: 'Cine poate candida pentru funcția de Președinte al Republicii Moldova?',
            options: ['Orice cetățean', 'Cetățeni cu vârsta de minimum 35 ani', 'Cetățeni cu vârsta de minimum 40 ani', 'Doar deputați'],
            correctAnswer: 2,
            explanation: 'Pentru a candida la funcția de Președinte, cetățeanul trebuie să aibă minimum 40 de ani.'
        },
        {
            id: 'lb-7',
            text: 'Care este durata campaniei electorale pentru alegerile parlamentare?',
            options: ['15 zile', '30 zile', '45 zile', '60 zile'],
            correctAnswer: 1,
            explanation: 'Campania electorală pentru alegerile parlamentare durează 30 de zile.'
        },
        {
            id: 'lb-8',
            text: 'Când este interzisă publicarea sondajelor de opinie?',
            options: ['Cu 5 zile înainte de alegeri', 'Cu 7 zile înainte de alegeri', 'Cu 10 zile înainte de alegeri', 'Cu 15 zile înainte de alegeri'],
            correctAnswer: 1,
            explanation: 'Publicarea sondajelor de opinie este interzisă cu 7 zile înainte de ziua alegerilor.'
        },
        {
            id: 'lb-9',
            text: 'Care este numărul minim de semnături necesare pentru înregistrarea unui candidat independent?',
            options: ['5,000', '10,000', '15,000', '20,000'],
            correctAnswer: 2,
            explanation: 'Un candidat independent trebuie să colecteze minimum 15,000 de semnături.'
        },
        {
            id: 'lb-10',
            text: 'Cine poate solicita anularea rezultatelor alegerilor?',
            options: ['Orice cetățean', 'Doar candidații', 'Partidele politice și candidații', 'Doar observatorii'],
            correctAnswer: 2,
            explanation: 'Partidele politice și candidații pot contesta rezultatele alegerilor.'
        }
    ],
    'procedures': [
        {
            id: 'pr-1',
            text: 'La ce oră se deschid secțiile de votare în ziua alegerilor?',
            options: ['06:00', '07:00', '08:00', '09:00'],
            correctAnswer: 1,
            explanation: 'Secțiile de votare se deschid la ora 07:00 dimineața.'
        },
        {
            id: 'pr-2',
            text: 'La ce oră se închid secțiile de votare?',
            options: ['19:00', '20:00', '21:00', '22:00'],
            correctAnswer: 2,
            explanation: 'Secțiile de votare se închid la ora 21:00.'
        },
        {
            id: 'pr-3',
            text: 'Câți membri trebuie să aibă o secție de votare pentru a funcționa legal?',
            options: ['Minimum 3', 'Minimum 5', 'Minimum 7', 'Minimum 9'],
            correctAnswer: 1,
            explanation: 'O secție de votare trebuie să aibă minimum 5 membri pentru a funcționa.'
        },
        {
            id: 'pr-4',
            text: 'Ce document este necesar pentru a vota?',
            options: ['Certificat de naștere', 'Buletin de identitate', 'Pașaport sau buletin', 'Permis de conducere'],
            correctAnswer: 2,
            explanation: 'Pentru a vota este necesar pașaportul sau buletinul de identitate.'
        },
        {
            id: 'pr-5',
            text: 'Cum se marchează votul pe buletinul de vot?',
            options: ['Cu o bifă', 'Cu o ștampilă', 'Cu o cruce în pătrat', 'Cu semnătura'],
            correctAnswer: 2,
            explanation: 'Votul se marchează prin aplicarea unei cruci în pătratul corespunzător.'
        },
        {
            id: 'pr-6',
            text: 'Ce se întâmplă dacă un alegător greșește buletinul de vot?',
            options: ['Nu poate vota', 'Poate cere un buletin nou', 'Trebuie să corecteze', 'Votul este anulat'],
            correctAnswer: 1,
            explanation: 'Alegătorul poate solicita un buletin de vot nou dacă a greșit.'
        },
        {
            id: 'pr-7',
            text: 'Cine poate asista la numărarea voturilor?',
            options: ['Doar membrii secției', 'Membrii și observatorii acreditați', 'Orice cetățean', 'Doar reprezentanții partidelor'],
            correctAnswer: 1,
            explanation: 'La numărarea voturilor pot asista membrii secției și observatorii acreditați.'
        },
        {
            id: 'pr-8',
            text: 'Când începe numărarea voturilor?',
            options: ['La ora 21:00', 'Imediat după închiderea secției', 'A doua zi dimineața', 'După ce pleacă toți alegătorii'],
            correctAnswer: 1,
            explanation: 'Numărarea voturilor începe imediat după închiderea secției de votare.'
        },
        {
            id: 'pr-9',
            text: 'Ce se face cu buletinele de vot nefolosite?',
            options: ['Se distrug', 'Se anulează prin ștampilare', 'Se păstrează pentru viitor', 'Se returnează CEC'],
            correctAnswer: 1,
            explanation: 'Buletinele de vot nefolosite se anulează prin ștampilare și se păstrează în procesul-verbal.'
        },
        {
            id: 'pr-10',
            text: 'Cât timp se păstrează documentele electorale după alegeri?',
            options: ['1 lună', '3 luni', '6 luni', '1 an'],
            correctAnswer: 2,
            explanation: 'Documentele electorale se păstrează timp de 6 luni după alegeri.'
        },
        {
            id: 'pr-11',
            text: 'Ce se întâmplă dacă un alegător nu se află în lista electorală?',
            options: ['Nu poate vota', 'Poate vota cu o cerere specială', 'Poate vota cu actul de identitate', 'Trebuie să meargă la altă secție'],
            correctAnswer: 1,
            explanation: 'Alegătorul poate vota cu o cerere specială dacă nu se află în lista electorală a secției respective.'
        },
        {
            id: 'pr-12',
            text: 'Cine semnează procesul-verbal al secției de votare?',
            options: ['Doar președintele', 'Președintele și secretarul', 'Toți membrii secției', 'Președintele și observatorii'],
            correctAnswer: 2,
            explanation: 'Procesul-verbal trebuie să fie semnat de toți membrii secției de votare.'
        }
    ],
    'ethics': [
        {
            id: 'et-1',
            text: 'Care este principiul fundamental al unui funcționar electoral?',
            options: ['Loialitate politică', 'Neutralitate și imparțialitate', 'Eficiență', 'Popularitate'],
            correctAnswer: 1,
            explanation: 'Neutralitatea și imparțialitatea sunt principiile fundamentale ale unui funcționar electoral.'
        },
        {
            id: 'et-2',
            text: 'Poate un membru al secției de votare să poarte simboluri ale unui partid politic?',
            options: ['Da, dacă este discret', 'Nu, este strict interzis', 'Da, în afara orelor de program', 'Depinde de secție'],
            correctAnswer: 1,
            explanation: 'Este strict interzis ca membrii secției să poarte simboluri ale partidelor politice.'
        },
        {
            id: 'et-3',
            text: 'Ce trebuie să facă un funcționar electoral dacă observă o neregulă?',
            options: ['Să ignore', 'Să raporteze imediat', 'Să aștepte sfârșitul zilei', 'Să discute cu colegii'],
            correctAnswer: 1,
            explanation: 'Orice neregulă trebuie raportată imediat conform procedurilor stabilite.'
        },
        {
            id: 'et-4',
            text: 'Poate un funcționar electoral să influențeze votul unui alegător?',
            options: ['Da, prin sfaturi', 'Nu, niciodată', 'Da, dacă este întrebat', 'Depinde de situație'],
            correctAnswer: 1,
            explanation: 'Este strict interzis ca funcționarii electorali să influențeze votul alegătorilor.'
        },
        {
            id: 'et-5',
            text: 'Ce trebuie să facă un funcționar electoral în caz de conflict de interese?',
            options: ['Să continue munca', 'Să se retragă', 'Să ceară sfatul colegilor', 'Să voteze'],
            correctAnswer: 1,
            explanation: 'În caz de conflict de interese, funcționarul trebuie să se retragă din procesul respectiv.'
        },
        {
            id: 'et-6',
            text: 'Cum trebuie să se comporte un funcționar electoral cu alegătorii?',
            options: ['Autoritar', 'Respectuos și politicos', 'Indiferent', 'Prietenos'],
            correctAnswer: 1,
            explanation: 'Funcționarii electorali trebuie să fie respectuoși și politicoși cu toți alegătorii.'
        },
        {
            id: 'et-7',
            text: 'Poate un funcționar electoral să divulge informații confidențiale?',
            options: ['Da, după alegeri', 'Nu, niciodată', 'Da, presei', 'Depinde de informație'],
            correctAnswer: 1,
            explanation: 'Informațiile confidențiale nu pot fi divulgate sub nicio formă.'
        },
        {
            id: 'et-8',
            text: 'Ce sancțiuni pot fi aplicate pentru încălcarea eticii electorale?',
            options: ['Avertisment verbal', 'Excludere și sancțiuni legale', 'Amendă mică', 'Nicio sancțiune'],
            correctAnswer: 1,
            explanation: 'Încălcările grave pot duce la excludere și sancțiuni legale.'
        }
    ],
    'technology': [
        {
            id: 'te-1',
            text: 'Ce este Registrul de Stat al Alegătorilor?',
            options: ['O aplicație mobilă', 'O bază de date electronică', 'Un document fizic', 'Un site web'],
            correctAnswer: 1,
            explanation: 'Registrul de Stat al Alegătorilor este o bază de date electronică centralizată.'
        },
        {
            id: 'te-2',
            text: 'Care este scopul principal al sistemului informațional electoral?',
            options: ['Divertisment', 'Transparență și eficiență', 'Publicitate', 'Comunicare socială'],
            correctAnswer: 1,
            explanation: 'Sistemul informațional electoral asigură transparența și eficiența procesului electoral.'
        },
        {
            id: 'te-3',
            text: 'Ce tehnologie se folosește pentru verificarea alegătorilor?',
            options: ['Recunoaștere facială', 'Scanare documente și baze de date', 'Amprentă digitală', 'Cod QR'],
            correctAnswer: 1,
            explanation: 'Se folosește scanarea documentelor și verificarea în bazele de date electronice.'
        },
        {
            id: 'te-4',
            text: 'Cum se transmit rezultatele preliminare ale alegerilor?',
            options: ['Prin poștă', 'Electronic, prin sistem securizat', 'Prin telefon', 'Prin curier'],
            correctAnswer: 1,
            explanation: 'Rezultatele preliminare se transmit electronic prin sistem securizat.'
        },
        {
            id: 'te-5',
            text: 'Ce măsuri de securitate sunt implementate în sistemele electorale?',
            options: ['Parole simple', 'Criptare și autentificare multiplă', 'Nicio măsură', 'Doar antivirus'],
            correctAnswer: 1,
            explanation: 'Sistemele electorale folosesc criptare avansată și autentificare multiplă.'
        },
        {
            id: 'te-6',
            text: 'Ce rol au observatorii în monitorizarea tehnologiilor electorale?',
            options: ['Niciun rol', 'Verifică conformitatea și transparența', 'Operează sistemele', 'Instalează software'],
            correctAnswer: 1,
            explanation: 'Observatorii verifică conformitatea și transparența utilizării tehnologiilor.'
        },
        {
            id: 'te-7',
            text: 'Cum se asigură integritatea datelor în sistemele electorale?',
            options: ['Nu se asigură', 'Prin backup-uri și verificări', 'Prin ștergere', 'Prin publicare'],
            correctAnswer: 1,
            explanation: 'Integritatea datelor se asigură prin backup-uri regulate și verificări multiple.'
        },
        {
            id: 'te-8',
            text: 'Ce informații sunt disponibile public pe portalul electoral?',
            options: ['Date personale', 'Rezultate și statistici', 'Parole', 'Adrese'],
            correctAnswer: 1,
            explanation: 'Portalul electoral publică rezultate, statistici și informații generale.'
        },
        {
            id: 'te-9',
            text: 'Cum se protejează sistemele electorale de atacuri cibernetice?',
            options: ['Nu se protejează', 'Firewall, monitorizare și actualizări', 'Doar cu parole', 'Prin deconectare'],
            correctAnswer: 1,
            explanation: 'Se folosesc firewall-uri, monitorizare constantă și actualizări de securitate.'
        },
        {
            id: 'te-10',
            text: 'Ce trebuie să facă un funcționar în caz de defecțiune tehnică?',
            options: ['Să repare singur', 'Să raporteze și să urmeze procedurile', 'Să ignore', 'Să închidă secția'],
            correctAnswer: 1,
            explanation: 'Orice defecțiune tehnică trebuie raportată imediat și rezolvată conform procedurilor.'
        }
    ]
};

export const getQuestionsByCategory = (categoryId: string): Question[] => {
    const adminBank = getAdminQuestionBank();
    if (adminBank[categoryId]) {
        return adminBank[categoryId];
    }

    return questionBanks[categoryId] || [];
};

export const getCategoryById = (categoryId: string): QuizCategory | undefined => {
    return getQuizCategories().find(cat => cat.id === categoryId);
};

type StoredAdminQuestion = {
    id?: string;
    text?: string;
    options?: string[];
    correctAnswer?: number;
};

type StoredAdminTest = {
    id?: string;
    title?: string;
    description?: string;
    durationMinutes?: number;
    questions?: StoredAdminQuestion[];
};

const ADMIN_TESTS_STORAGE_KEY = "adminTests";

const toDifficulty = (questionCount: number): QuizCategory["difficulty"] => {
    if (questionCount <= 8) return "beginner";
    if (questionCount <= 12) return "intermediate";
    return "advanced";
};

const getAdminTests = (): StoredAdminTest[] => {
    const raw = localStorage.getItem(ADMIN_TESTS_STORAGE_KEY);
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw) as StoredAdminTest[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const getAdminQuestionBank = (): Record<string, Question[]> => {
    const tests = getAdminTests();
    if (tests.length === 0) return {};

    return tests.reduce<Record<string, Question[]>>((acc, test, testIndex) => {
        const testId = test.id || `admin-test-${testIndex + 1}`;
        const questions = Array.isArray(test.questions)
            ? test.questions.map((question, questionIndex) => ({
                  id: question.id || `${testId}-q-${questionIndex + 1}`,
                  text: question.text || "",
                  options: Array.isArray(question.options) ? question.options : [],
                  correctAnswer:
                      typeof question.correctAnswer === "number" ? question.correctAnswer : 0,
              }))
            : [];

        acc[testId] = questions;
        return acc;
    }, {});
};

export const getQuizCategories = (): QuizCategory[] => {
    const tests = getAdminTests();
    if (tests.length === 0) return quizCategories;

    return tests.map((test, index) => {
        const id = test.id || `admin-test-${index + 1}`;
        const questionCount = Array.isArray(test.questions) ? test.questions.length : 0;
        const estimatedTime =
            typeof test.durationMinutes === "number" && test.durationMinutes > 0
                ? test.durationMinutes
                : 15;

        return {
            id,
            title: test.title || "Test",
            description: test.description || "Test disponibil in platforma",
            icon: "📝",
            questionCount,
            estimatedTime,
            difficulty: toDifficulty(questionCount),
        };
    });
};
