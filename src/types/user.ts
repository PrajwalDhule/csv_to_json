export interface User {
    name: string;
    age: number;
    address?: object;
    additional_info?: {[key: string]: any};
}

export interface UserDistribution {
    age_group: string;
    distribution: number;
}