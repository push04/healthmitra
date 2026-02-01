export type Region = 'North' | 'South' | 'East' | 'West' | 'Central';

export interface ServiceCenter {
    id: string;
    name: string;
    address: string;
    contact: string;
    pincode: string;
}

export interface City {
    id: string;
    name: string;
    state: string;
    region: Region;
    pincodes: string[];
    isServiceable: boolean;
    status: 'active' | 'inactive';
    serviceCenters: ServiceCenter[];
}

export const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal', 'Delhi'
];

export const MOCK_CITIES: City[] = [
    {
        id: 'city_amd',
        name: 'Ahmedabad',
        state: 'Gujarat',
        region: 'West',
        pincodes: ['380001', '380015', '380054', '380058', '380059'],
        isServiceable: true,
        status: 'active',
        serviceCenters: [
            { id: 'sc_amd_1', name: 'HealthMitra Navrangpura', address: '101, Aaryan Workspaces, Navrangpura', contact: '9876543210', pincode: '380009' }
        ]
    },
    {
        id: 'city_mum',
        name: 'Mumbai',
        state: 'Maharashtra',
        region: 'West',
        pincodes: ['400001', '400020', '400050', '400051', '400053'],
        isServiceable: true,
        status: 'active',
        serviceCenters: []
    },
    {
        id: 'city_del',
        name: 'New Delhi',
        state: 'Delhi',
        region: 'North',
        pincodes: ['110001', '110011', '110020'],
        isServiceable: true,
        status: 'active',
        serviceCenters: []
    },
    {
        id: 'city_blr',
        name: 'Bangalore',
        state: 'Karnataka',
        region: 'South',
        pincodes: ['560001', '560025', '560034'],
        isServiceable: true,
        status: 'active',
        serviceCenters: []
    }
];
