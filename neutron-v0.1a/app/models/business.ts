
export type BusinessState = {
    address_line_1?: string,
    address_line_2?: string,
    business_name?: string,
    city?: string,
    customers: string[],
    receivables: string[],
    description?: string,
    gst?: string,
    industryType?: string,
    integration?: string,
    pan?: string,
    pincode?: string,
    team?: Array<TeamMember>
    state?: string,
    website?: string,
    last_outstanding?: {
        '30d': number,
        '60d': number,
        '90d': number,
        'excess': number,
        'total': number
    },
    last_dso?: {
        '30d': number,
        '60d': number,
        '90d': number,
        'excess': number,
        'total': number
    },
    last_revenue?: {
        '30d': number,
        '60d': number,
        '90d': number,
        'excess': number,
        'total': number
    },
    outstanding: {
        '30d': number,
        '60d': number,
        '90d': number,
        'excess': number,
        'total': number
    },
    dso: {
        '30d': number,
        '60d': number,
        '90d': number,
        'excess': number,
        'total': number
    },
    revenue: {
        '30d': number,
        '60d': number,
        '90d': number,
        'excess': number,
        'total': number
    },
    creds?: {
        [x: string]: any
    }
};


export const DEFAULT_BUSINESS_DATA_STATE: BusinessState = {
    customers: [],
    receivables: [],
    outstanding: {
        '30d': 0,
        '60d': 0,
        '90d': 0,
        'excess': 0,
        'total': 0
    }, dso: {
        '30d': 0,
        '60d': 0,
        '90d': 0,
        'excess': 0,
        'total': 0
    }, revenue: {
        '30d': 0,
        '60d': 0,
        '90d': 0,
        'excess': 0,
        'total': 0
    },
    last_outstanding: {
        '30d': 0,
        '60d': 0,
        '90d': 0,
        'excess': 0,
        'total': 0
    }, last_dso: {
        '30d': 0,
        '60d': 0,
        '90d': 0,
        'excess': 0,
        'total': 0
    }, last_revenue: {
        '30d': 0,
        '60d': 0,
        '90d': 0,
        'excess': 0,
        'total': 0
    }
}



export type TeamMember = {
    name: string,
    email: string,
    role: string
}