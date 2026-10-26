export type GeoFeature = { type: 'Feature'; id?: string; properties: { codarea: string; nome: string; sigla?: string }; geometry: GeoJSON.Geometry };
export type GeoCollection = { type: 'FeatureCollection'; features: GeoFeature[] };
export type CandidateResult = { candidateId: string; name: string; party: string; votes: number; percentage: number; color: string; photoUrl?: string };
export type ElectionResult = { localityCode: string; electionYear: number; office: string; round: number; totalizedSections?: number; totalSections?: number; validVotes?: number; blankVotes?: number; nullVotes?: number; abstentions?: number; turnout?: number; candidates: CandidateResult[]; updatedAt?: string; source: string; fellBack?: boolean };

export type Outcome = { color: string; turnout?: number; candidateId?: string; name?: string; sigla?: string; percentage?: number; lead?: number };
