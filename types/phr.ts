export type PHRCategory = 'Prescriptions' | 'Bills' | 'Test Reports' | 'General Records' | 'Discharge Summaries' | 'Vaccination Records';

export interface PHRDocument {
    id: string;
    name: string;
    type: string; // pdf, jpg
    size: string;
    date: string;
    category: PHRCategory;
    memberId: string;
    memberName: string;
    tags?: string[];
    url: string; // secure url
}

export interface PHRFolder {
    id: string;
    name: PHRCategory;
    count: number;
    icon: string; // Lucide icon name usually, simplified to string for now
}

export const MOCK_PHR_DOCS: PHRDocument[] = [
    {
        id: 'd1',
        name: 'prescription_jan18.pdf',
        type: 'pdf',
        size: '1.2 MB',
        date: 'Jan 18, 2025',
        category: 'Prescriptions',
        memberId: 'm1',
        memberName: 'Rajesh Kumar (Self)',
        tags: ['cardiologist', 'chest pain'],
        url: '#'
    },
    {
        id: 'd2',
        name: 'blood_report.jpg',
        type: 'jpg',
        size: '856 KB',
        date: 'Jan 15, 2025',
        category: 'Test Reports',
        memberId: 'm1',
        memberName: 'Rajesh Kumar (Self)',
        tags: ['full body checkup'],
        url: '#'
    }
];

export const MOCK_FOLDERS: PHRFolder[] = [
    { id: 'f1', name: 'Prescriptions', count: 24, icon: 'FileText' },
    { id: 'f2', name: 'Bills', count: 18, icon: 'Receipt' },
    { id: 'f3', name: 'Test Reports', count: 15, icon: 'Activity' },
    { id: 'f4', name: 'General Records', count: 8, icon: 'Folder' },
    { id: 'f5', name: 'Discharge Summaries', count: 2, icon: 'Building2' },
    { id: 'f6', name: 'Vaccination Records', count: 6, icon: 'Syringe' },
];
