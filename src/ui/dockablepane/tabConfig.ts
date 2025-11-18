export type PrimaryTabType = 'maintainability' | 'security' | 'openSourceHealth';
export type MaintainabilitySubTabType =
    | 'duplication'
    | 'unitSize'
    | 'unitComplexity'
    | 'unitInterfacing'
    | 'moduleCoupling'
    | 'componentIndependence'
    | 'componentEntanglement';

export const PRIMARY_TABS: PrimaryTabType[] = ['maintainability', 'security', 'openSourceHealth'];

const PRIMARY_TAB_LABELS: Record<PrimaryTabType, string> = {
    maintainability: 'Maintainability',
    security: 'Security',
    openSourceHealth: 'Open Source Health'
};

export const getPrimaryTabLabel = (tab: PrimaryTabType): string => PRIMARY_TAB_LABELS[tab];

export const MAINTAINABILITY_TABS: MaintainabilitySubTabType[] = [
    'duplication',
    'unitSize',
    'unitComplexity',
    'unitInterfacing',
    'moduleCoupling',
    'componentIndependence',
    'componentEntanglement'
];

const MAINTAINABILITY_TAB_LABELS: Record<MaintainabilitySubTabType, string> = {
    duplication: 'Duplication',
    unitSize: 'Unit size',
    unitComplexity: 'Unit complexity',
    unitInterfacing: 'Unit interfacing',
    moduleCoupling: 'Module coupling',
    componentIndependence: 'Component independence',
    componentEntanglement: 'Component entanglement'
};

export const getMaintainabilityTabLabel = (tab: MaintainabilitySubTabType): string =>
    MAINTAINABILITY_TAB_LABELS[tab];
