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
    tier?: string;
}

export const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal', 'Delhi'
];
